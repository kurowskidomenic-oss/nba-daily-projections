// ============================================================
// NBA Daily Projections — Application Logic
// ============================================================

(function () {
  "use strict";

  // ---------- State ----------
  let currentView = "games";      // "games" | "all"
  let playerWeight = 50;          // 0-100  (% weight on player avg)
  let useL10 = false;
  let filterTeam = "";
  let filterPos = "";
  let filterGame = "";
  let minMinutes = 0;
  let sortBy = "projPts";

  // Mutable data (can be replaced via upload)
  let games = TODAYS_GAMES;
  let players = PLAYERS;
  let defense = TEAM_DEFENSE_VS_POSITION;
  let leagueAvg = LEAGUE_AVERAGES;
  let defRankings = DEFENSIVE_RANKINGS;

  // ---------- Helpers ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  function ordinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  function fmt(n) { return n.toFixed(1); }

  function getTeamsInGames() {
    const teams = new Set();
    games.forEach(g => { teams.add(g.away); teams.add(g.home); });
    return [...teams].sort();
  }

  function getPlayersForTeam(team) {
    return players.filter(p => p.team === team);
  }

  // Simulate L10 by adding small random variance (deterministic per player name)
  function getL10Stats(player) {
    if (!useL10) return { pts: player.pts, reb: player.reb, ast: player.ast };
    let seed = 0;
    for (let i = 0; i < player.name.length; i++) seed += player.name.charCodeAt(i);
    const variance = (stat) => {
      const v = ((seed * 7 + stat * 13) % 30 - 15) / 10;
      return Math.max(0, stat + v);
    };
    return { pts: variance(player.pts), reb: variance(player.reb), ast: variance(player.ast) };
  }

  // ---------- Projection Engine ----------
  function projectPlayer(player, opponentTeam) {
    const w = playerWeight / 100;
    const dw = 1 - w;
    const oppDef = defense[opponentTeam]?.[player.pos];
    if (!oppDef) return null;

    const stats = useL10 ? getL10Stats(player) : player;
    const projPts = stats.pts * w + oppDef.pts * dw;
    const projReb = stats.reb * w + oppDef.reb * dw;
    const projAst = stats.ast * w + oppDef.ast * dw;

    // Matchup differential (positive = favorable)
    const avg = leagueAvg[player.pos];
    const defDiffPts = oppDef.pts - avg.pts;
    const defDiffReb = oppDef.reb - avg.reb;
    const defDiffAst = oppDef.ast - avg.ast;
    const totalDiff = defDiffPts + defDiffReb + defDiffAst;

    return {
      player,
      opponent: opponentTeam,
      oppDef,
      projPts,
      projReb,
      projAst,
      defDiffPts,
      defDiffReb,
      defDiffAst,
      totalDiff,
      defRank: defRankings[opponentTeam]?.[player.pos] || {},
    };
  }

  function matchupClass(diff, threshold) {
    if (diff > threshold) return "good";
    if (diff < -threshold) return "bad";
    return "avg";
  }

  function matchupBadge(rank, total) {
    total = total || 30;
    if (rank <= 10) return `<span class="badge badge-green">${ordinal(rank)}</span>`;
    if (rank >= 21) return `<span class="badge badge-red">${ordinal(rank)}</span>`;
    return `<span class="badge badge-yellow">${ordinal(rank)}</span>`;
  }

  // ---------- Build All Projections ----------
  function buildAllProjections() {
    const results = [];
    for (const game of games) {
      // Away team plays against home team's defense
      for (const p of getPlayersForTeam(game.away)) {
        const proj = projectPlayer(p, game.home);
        if (proj) { proj.gameId = game.id; proj.gameLabel = `${game.away} @ ${game.home}`; results.push(proj); }
      }
      // Home team plays against away team's defense
      for (const p of getPlayersForTeam(game.home)) {
        const proj = projectPlayer(p, game.away);
        if (proj) { proj.gameId = game.id; proj.gameLabel = `${game.away} @ ${game.home}`; results.push(proj); }
      }
    }
    return results;
  }

  function applyFilters(projections) {
    return projections.filter(p => {
      if (filterTeam && p.player.team !== filterTeam) return false;
      if (filterPos && p.player.pos !== filterPos) return false;
      if (filterGame && p.gameId !== parseInt(filterGame)) return false;
      if (p.player.min < minMinutes) return false;
      return true;
    });
  }

  function applySorting(projections) {
    const key = sortBy;
    return projections.sort((a, b) => {
      if (key === "projPts") return b.projPts - a.projPts;
      if (key === "projReb") return b.projReb - a.projReb;
      if (key === "projAst") return b.projAst - a.projAst;
      if (key === "diff") return b.totalDiff - a.totalDiff;
      if (key === "pts") return b.player.pts - a.player.pts;
      return 0;
    });
  }

  // ---------- Render: Top Picks Sidebar ----------
  function renderTopPicks(projections) {
    const sorted = [...projections]
      .filter(p => p.player.starter && p.player.min >= 20)
      .sort((a, b) => b.totalDiff - a.totalDiff)
      .slice(0, 10);

    const container = $("#topPicks");
    if (sorted.length === 0) {
      container.innerHTML = '<p style="color:var(--text-muted);font-size:0.8rem;">No data available</p>';
      return;
    }

    container.innerHTML = sorted.map((p, i) => `
      <div class="top-pick-card">
        <div class="top-pick-rank">${i + 1}</div>
        <div class="top-pick-info">
          <div class="top-pick-name">${p.player.name}</div>
          <div class="top-pick-meta">${p.player.pos} — ${NBA_TEAMS[p.player.team] || p.player.team} vs ${NBA_TEAMS[p.opponent] || p.opponent}</div>
          <div class="top-pick-proj">Proj: ${fmt(p.projPts)} / ${fmt(p.projReb)} / ${fmt(p.projAst)}</div>
          <div class="top-pick-diff">Matchup Advantage: +${fmt(p.totalDiff)}</div>
        </div>
      </div>
    `).join("");
  }

  // ---------- Render: Player Row ----------
  function playerRow(p, showGame) {
    const mc = matchupClass(p.defDiffPts, 1.0);
    const rowClass = mc === "good" ? "matchup-good" : mc === "bad" ? "matchup-bad" : "matchup-avg";
    const roleBadge = p.player.starter
      ? '<span class="starter-badge">START</span>'
      : '<span class="bench-badge">BENCH</span>';

    const diffPts = p.projPts - p.player.pts;
    const diffClass = diffPts >= 0 ? "diff-positive" : "diff-negative";
    const diffSign = diffPts >= 0 ? "+" : "";

    return `<tr class="${rowClass}">
      ${showGame ? `<td>${p.gameLabel}</td>` : ""}
      <td><strong>${p.player.name}</strong>${roleBadge}</td>
      <td>${p.player.pos}</td>
      <td>${matchupBadge(p.defRank.pts || 15)}</td>
      <td class="rank-cell">${fmt(p.oppDef.pts)} / ${fmt(p.oppDef.reb)} / ${fmt(p.oppDef.ast)}</td>
      <td>${fmt(p.player.pts)} / ${fmt(p.player.reb)} / ${fmt(p.player.ast)}</td>
      <td>${fmt(p.player.min)}</td>
      <td>${p.player.gp}</td>
      <td class="proj-value">${fmt(p.projPts)}</td>
      <td class="proj-value">${fmt(p.projReb)}</td>
      <td class="proj-value">${fmt(p.projAst)}</td>
      <td class="${diffClass}">${diffSign}${fmt(diffPts)}</td>
      <td class="notes-cell"><input class="notes-input" data-player="${p.player.name}" value="${p.player.notes || ""}" placeholder="Add note..." /></td>
    </tr>`;
  }

  // ---------- Render: Game-by-Game View ----------
  function renderGamesView(projections) {
    const container = $("#gamesView");
    let html = "";

    for (const game of games) {
      if (filterGame && game.id !== parseInt(filterGame)) continue;

      const awayProj = projections.filter(p => p.player.team === game.away && p.gameId === game.id);
      const homeProj = projections.filter(p => p.player.team === game.home && p.gameId === game.id);

      // Sort each team by position order then starter
      const posOrder = { PG: 0, SG: 1, SF: 2, PF: 3, C: 4 };
      const sortTeam = (arr) => arr.sort((a, b) => {
        if (a.player.starter !== b.player.starter) return a.player.starter ? -1 : 1;
        return (posOrder[a.player.pos] || 5) - (posOrder[b.player.pos] || 5);
      });
      sortTeam(awayProj);
      sortTeam(homeProj);

      const tableHead = `<table class="proj-table">
        <thead><tr>
          <th>Player</th><th>Pos</th><th>Def Rank</th>
          <th>Opp Allows (P/R/A)</th><th>Season Avg (P/R/A)</th>
          <th>MPG</th><th>GP</th>
          <th>Proj PTS</th><th>Proj REB</th><th>Proj AST</th>
          <th>Diff</th><th>Notes</th>
        </tr></thead><tbody>`;

      html += `
        <div class="game-card">
          <div class="game-header">
            <div class="game-teams">
              ${NBA_TEAMS[game.away] || game.away}<span class="at">@</span>${NBA_TEAMS[game.home] || game.home}
            </div>
            <div class="game-meta">${game.time} &middot; ${game.arena}</div>
          </div>
          <div class="team-section">
            <div class="team-label">${NBA_TEAMS[game.away] || game.away} (vs ${NBA_TEAMS[game.home] || game.home} Defense)</div>
            ${tableHead}${awayProj.map(p => playerRow(p, false)).join("")}</tbody></table>
          </div>
          <div class="team-section">
            <div class="team-label">${NBA_TEAMS[game.home] || game.home} (vs ${NBA_TEAMS[game.away] || game.away} Defense)</div>
            ${tableHead}${homeProj.map(p => playerRow(p, false)).join("")}</tbody></table>
          </div>
        </div>`;
    }

    container.innerHTML = html || '<p style="padding:24px;color:var(--text-muted);">No games match your filters.</p>';
    attachNotesListeners();
  }

  // ---------- Render: All Players View ----------
  function renderAllView(projections) {
    const sorted = applySorting([...projections]);
    const container = $("#allView");

    const html = `
      <table class="proj-table">
        <thead><tr>
          <th data-sort="gameLabel">Game</th>
          <th>Player</th>
          <th data-sort="pos">Pos</th>
          <th>Def Rank</th>
          <th>Opp Allows (P/R/A)</th>
          <th>Season Avg (P/R/A)</th>
          <th data-sort="min">MPG</th>
          <th data-sort="gp">GP</th>
          <th data-sort="projPts">Proj PTS</th>
          <th data-sort="projReb">Proj REB</th>
          <th data-sort="projAst">Proj AST</th>
          <th data-sort="diff">Diff</th>
          <th>Notes</th>
        </tr></thead>
        <tbody>
          ${sorted.map(p => playerRow(p, true)).join("")}
        </tbody>
      </table>`;

    container.innerHTML = html || '<p style="padding:24px;color:var(--text-muted);">No players match your filters.</p>';
    attachNotesListeners();

    // Column sorting
    container.querySelectorAll("th[data-sort]").forEach(th => {
      th.addEventListener("click", () => {
        const key = th.dataset.sort;
        if (key === "projPts" || key === "projReb" || key === "projAst" || key === "diff") {
          sortBy = key;
          $("#sortBy").value = key;
          render();
        }
      });
    });
  }

  // ---------- Notes persistence (in-memory) ----------
  function attachNotesListeners() {
    $$(".notes-input").forEach(input => {
      input.addEventListener("change", (e) => {
        const name = e.target.dataset.player;
        const player = players.find(p => p.name === name);
        if (player) player.notes = e.target.value;
      });
    });
  }

  // ---------- Master Render ----------
  function render() {
    const all = buildAllProjections();
    const filtered = applyFilters(all);

    renderTopPicks(all);

    if (currentView === "games") {
      $("#gamesView").classList.remove("hidden");
      $("#allView").classList.add("hidden");
      renderGamesView(filtered);
    } else {
      $("#gamesView").classList.add("hidden");
      $("#allView").classList.remove("hidden");
      renderAllView(filtered);
    }
  }

  // ---------- Populate Dropdowns ----------
  function populateDropdowns() {
    const teamSel = $("#filterTeam");
    const gameSel = $("#filterGame");

    // Clear existing options (keep first)
    while (teamSel.options.length > 1) teamSel.remove(1);
    while (gameSel.options.length > 1) gameSel.remove(1);

    getTeamsInGames().forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = NBA_TEAMS[t] || t;
      teamSel.appendChild(opt);
    });

    games.forEach(g => {
      const opt = document.createElement("option");
      opt.value = g.id;
      opt.textContent = `${g.away} @ ${g.home}`;
      gameSel.appendChild(opt);
    });
  }

  // ---------- CSV Export ----------
  function exportCSV() {
    const all = applyFilters(buildAllProjections());
    const sorted = applySorting([...all]);

    const headers = ["Game", "Player", "Team", "Pos", "Starter", "MPG", "GP",
      "Season PTS", "Season REB", "Season AST",
      "Opp Allows PTS", "Opp Allows REB", "Opp Allows AST",
      "Proj PTS", "Proj REB", "Proj AST", "Matchup Diff", "Notes"];

    const rows = sorted.map(p => [
      p.gameLabel, p.player.name, p.player.team, p.player.pos,
      p.player.starter ? "Y" : "N", fmt(p.player.min), p.player.gp,
      fmt(p.player.pts), fmt(p.player.reb), fmt(p.player.ast),
      fmt(p.oppDef.pts), fmt(p.oppDef.reb), fmt(p.oppDef.ast),
      fmt(p.projPts), fmt(p.projReb), fmt(p.projAst),
      fmt(p.totalDiff), `"${(p.player.notes || "").replace(/"/g, '""')}"`
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nba_projections_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---------- Data Upload ----------
  function handleUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.games) games = data.games;
        if (data.players) players = data.players;
        if (data.defense) {
          defense = data.defense;
          // Recompute league averages and rankings
          const teams = Object.keys(defense);
          const avgs = {};
          for (const pos of POSITIONS) {
            let pts = 0, reb = 0, ast = 0;
            for (const t of teams) {
              pts += defense[t][pos].pts;
              reb += defense[t][pos].reb;
              ast += defense[t][pos].ast;
            }
            avgs[pos] = { pts: pts / teams.length, reb: reb / teams.length, ast: ast / teams.length };
          }
          leagueAvg = avgs;

          const rankings = {};
          for (const pos of POSITIONS) {
            for (const stat of ["pts", "reb", "ast"]) {
              const sorted = [...teams].sort((a, b) => defense[b][pos][stat] - defense[a][pos][stat]);
              sorted.forEach((t, i) => {
                if (!rankings[t]) rankings[t] = {};
                if (!rankings[t][pos]) rankings[t][pos] = {};
                rankings[t][pos][stat] = i + 1;
              });
            }
          }
          defRankings = rankings;
        }
        populateDropdowns();
        render();
        closeModal();
        alert("Data loaded successfully!");
      } catch (err) {
        alert("Error parsing file: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  function openModal() { $("#modalBackdrop").classList.remove("hidden"); }
  function closeModal() { $("#modalBackdrop").classList.add("hidden"); }

  // ---------- Recompute league averages & rankings from current defense data ----------
  function recomputeDefenseMetrics() {
    const teams = Object.keys(defense);
    const avgs = {};
    for (const pos of POSITIONS) {
      let pts = 0, reb = 0, ast = 0;
      for (const t of teams) {
        if (!defense[t]?.[pos]) continue;
        pts += defense[t][pos].pts;
        reb += defense[t][pos].reb;
        ast += defense[t][pos].ast;
      }
      avgs[pos] = { pts: pts / teams.length, reb: reb / teams.length, ast: ast / teams.length };
    }
    leagueAvg = avgs;

    const rankings = {};
    for (const pos of POSITIONS) {
      for (const stat of ["pts", "reb", "ast"]) {
        const sorted = [...teams].sort((a, b) =>
          (defense[b]?.[pos]?.[stat] || 0) - (defense[a]?.[pos]?.[stat] || 0)
        );
        sorted.forEach((t, i) => {
          if (!rankings[t]) rankings[t] = {};
          if (!rankings[t][pos]) rankings[t][pos] = {};
          rankings[t][pos][stat] = i + 1;
        });
      }
    }
    defRankings = rankings;
  }

  // ---------- API Modal ----------
  function openApiModal() {
    const modal = $("#apiModalBackdrop");
    modal.classList.remove("hidden");
    const keyInput = $("#apiKeyInput");
    keyInput.value = NbaApi.getKey();
    // Default date to today
    const today = new Date().toISOString().slice(0, 10);
    $("#apiDate").value = today;
    $("#apiStatus").classList.add("hidden");
  }
  function closeApiModal() { $("#apiModalBackdrop").classList.add("hidden"); }

  function showApiStatus(msg, type) {
    const el = $("#apiStatus");
    el.classList.remove("hidden", "api-status-ok", "api-status-err", "api-status-loading");
    el.classList.add(`api-status-${type}`);
    el.textContent = msg;
  }

  async function handleApiFetch() {
    const key = $("#apiKeyInput").value.trim();
    if (!key) { showApiStatus("Please enter an API key.", "err"); return; }
    NbaApi.setKey(key);

    const dateVal = $("#apiDate").value || new Date().toISOString().slice(0, 10);
    const btn = $("#apiFetchGo");
    btn.disabled = true;
    btn.textContent = "Fetching...";

    try {
      const result = await NbaApi.fetchTodayData(dateVal, (msg) => {
        showApiStatus(msg, "loading");
      });

      // Apply fetched data
      games = result.games;
      players = result.players;
      defense = result.defense;
      recomputeDefenseMetrics();
      populateDropdowns();

      // Update date badge
      const d = new Date(dateVal + "T12:00:00");
      $("#todayDate").textContent = d.toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
      });

      render();
      showApiStatus(`Loaded ${games.length} games, ${players.length} players.`, "ok");
      setTimeout(closeApiModal, 1500);
    } catch (err) {
      showApiStatus("Error: " + err.message, "err");
    } finally {
      btn.disabled = false;
      btn.textContent = "Fetch Data";
    }
  }

  // ---------- Event Wiring ----------
  function init() {
    // Date
    const today = new Date();
    $("#todayDate").textContent = today.toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });

    populateDropdowns();

    // Dark mode
    const savedTheme = localStorage.getItem("nba-theme");
    if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);

    $("#darkToggle").addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("nba-theme", next);
    });

    // View tabs
    $$(".tab").forEach(tab => {
      tab.addEventListener("click", () => {
        $$(".tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentView = tab.dataset.view;
        render();
      });
    });

    // Filters
    $("#filterTeam").addEventListener("change", (e) => { filterTeam = e.target.value; render(); });
    $("#filterPos").addEventListener("change", (e) => { filterPos = e.target.value; render(); });
    $("#filterGame").addEventListener("change", (e) => { filterGame = e.target.value; render(); });
    $("#minMinutes").addEventListener("input", (e) => { minMinutes = parseFloat(e.target.value) || 0; render(); });
    $("#sortBy").addEventListener("change", (e) => { sortBy = e.target.value; render(); });

    // Weight slider
    $("#weightSlider").addEventListener("input", (e) => {
      playerWeight = parseInt(e.target.value);
      $("#weightLabel").textContent = playerWeight;
      $("#weightLabelDef").textContent = 100 - playerWeight;
      render();
    });

    // L10 toggle
    $("#useL10").addEventListener("change", (e) => { useL10 = e.target.checked; render(); });

    // Export
    $("#exportBtn").addEventListener("click", exportCSV);

    // API modal
    $("#fetchApiBtn").addEventListener("click", openApiModal);
    $("#apiModalClose").addEventListener("click", closeApiModal);
    $("#apiModalBackdrop").addEventListener("click", (e) => { if (e.target === e.currentTarget) closeApiModal(); });
    $("#apiFetchGo").addEventListener("click", handleApiFetch);

    // Upload modal
    $("#uploadBtn").addEventListener("click", openModal);
    $("#modalClose").addEventListener("click", closeModal);
    $("#modalBackdrop").addEventListener("click", (e) => { if (e.target === e.currentTarget) closeModal(); });

    const dropZone = $("#dropZone");
    dropZone.addEventListener("click", () => $("#fileInput").click());
    dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("dragover"); });
    dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
      if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files[0]);
    });
    $("#fileInput").addEventListener("change", (e) => {
      if (e.target.files.length) handleUpload(e.target.files[0]);
    });

    // Initial render
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
