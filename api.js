// ============================================================
// NBA Daily Projections — BallDontLie API Integration
// ============================================================
// Free API: https://app.balldontlie.io
// Docs: https://docs.balldontlie.io
//
// FREE TIER LIMITS:
//   - 5 requests/minute
//   - Endpoints: teams, players, games ONLY
//   - Season averages & game stats require paid tiers ($10-$40/mo)
//
// This module fetches today's real schedule and rosters (free),
// then matches players against existing sample stats or uploaded data.

const NbaApi = (() => {
  "use strict";

  const BASE = "https://api.balldontlie.io/v1";
  let apiKey = localStorage.getItem("nba-api-key") || "";

  function setKey(key) {
    apiKey = key.trim();
    localStorage.setItem("nba-api-key", apiKey);
  }
  function getKey() { return apiKey; }

  // Delay helper
  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  // Global progress callback (set by fetchTodayData)
  let _onProgress = null;

  // Fetch with automatic retry on 429 rate-limit errors
  // Free tier = 5 req/min, so we use aggressive backoff
  async function apiFetch(endpoint, params = {}, retries = 5) {
    if (!apiKey) throw new Error("API key not set");
    const url = new URL(`${BASE}${endpoint}`);
    Object.entries(params).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach(val => url.searchParams.append(k, val));
      else if (v !== undefined && v !== null && v !== "") url.searchParams.append(k, v);
    });

    for (let attempt = 0; attempt <= retries; attempt++) {
      const res = await fetch(url.toString(), {
        headers: { Authorization: apiKey }
      });

      if (res.status === 429) {
        const wait = Math.min(15000 * (attempt + 1), 90000); // 15s, 30s, 45s, 60s, 75s
        const secs = Math.round(wait / 1000);
        const msg = `Rate limited by API (free tier = 5 req/min). Waiting ${secs}s before retry (${attempt + 1}/${retries})...`;
        console.log(msg);
        if (_onProgress) _onProgress(msg);
        await delay(wait);
        continue;
      }

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`API ${res.status}: ${body || res.statusText}`);
      }
      return res.json();
    }
    throw new Error("Rate limited after multiple retries. Please wait 2 minutes and try again.");
  }

  // ---------- Map BallDontLie position string to our 5-position system ----------
  function mapPosition(posStr) {
    if (!posStr) return "SF"; // fallback
    const p = posStr.toUpperCase().trim();
    if (p === "G" || p === "PG") return "PG";
    if (p === "SG") return "SG";
    if (p === "SF") return "SF";
    if (p === "PF") return "PF";
    if (p === "C") return "C";
    if (p === "G-F" || p === "F-G") return "SG";
    if (p === "F-C" || p === "C-F") return "PF";
    if (p === "F") return "SF";
    return "SF";
  }

  // ---------- Master Fetch: Pull Today's Games + Rosters (Free Tier) ----------
  async function fetchTodayData(dateStr, onProgress) {
    const log = onProgress || (() => {});
    _onProgress = log;

    // 1. Fetch today's games
    log("Fetching today's schedule...");
    const gamesData = await apiFetch("/games", { "dates[]": dateStr });
    const gamesList = gamesData.data || [];

    if (gamesList.length === 0) {
      throw new Error(`No games found for ${dateStr}. Try a different date.`);
    }

    const fetchedGames = gamesList.map((g, i) => ({
      id: i + 1,
      apiId: g.id,
      away: g.visitor_team?.abbreviation || "???",
      home: g.home_team?.abbreviation || "???",
      time: g.status || "TBD",
      arena: g.home_team?.full_name ? `${g.home_team.full_name} Arena` : "TBD",
      awayTeamId: g.visitor_team?.id,
      homeTeamId: g.home_team?.id,
    }));

    log(`Found ${fetchedGames.length} games. Fetching rosters...`);

    // Collect unique team IDs
    const teamIds = [...new Set(
      fetchedGames.flatMap(g => [g.awayTeamId, g.homeTeamId]).filter(Boolean)
    )];
    const teamAbbrs = new Set(fetchedGames.flatMap(g => [g.away, g.home]));

    // 2. Fetch players for each team (one request per team, paced for free tier)
    const allPlayers = [];
    for (let i = 0; i < teamIds.length; i++) {
      if (i > 0) await delay(13000); // 13s between requests to stay under 5/min
      log(`Fetching roster ${i + 1} of ${teamIds.length} (team ID ${teamIds[i]})...`);
      const data = await apiFetch("/players", {
        "team_ids[]": [teamIds[i]],
        per_page: 100,
      });
      allPlayers.push(...(data.data || []));
    }

    log(`Found ${allPlayers.length} players across ${teamIds.length} teams.`);

    // 3. Build player objects — use sample stats if available, else defaults
    // The free API tier does NOT include season averages or game stats.
    // We match players by name to any existing sample/uploaded data.
    const existingSamplePlayers = (typeof SAMPLE_PLAYERS !== "undefined") ? SAMPLE_PLAYERS : [];
    const sampleLookup = {};
    existingSamplePlayers.forEach(p => {
      sampleLookup[p.name.toLowerCase()] = p;
    });

    const builtPlayers = [];
    let matchCount = 0;
    let defaultCount = 0;

    for (const rp of allPlayers) {
      const fullName = `${rp.first_name} ${rp.last_name}`;
      const nameLower = fullName.toLowerCase();
      const teamAbbr = rp.team?.abbreviation || "???";
      const pos = mapPosition(rp.position);

      // Try to find this player in sample/uploaded data
      const sample = sampleLookup[nameLower];

      if (sample) {
        matchCount++;
        builtPlayers.push({
          ...sample,
          name: fullName,
          team: teamAbbr,
          pos: pos,
        });
      } else {
        defaultCount++;
        // No stats available — add with zeroed stats (filtered out by min threshold)
        builtPlayers.push({
          name: fullName,
          team: teamAbbr,
          pos: pos,
          pts: 0,
          reb: 0,
          ast: 0,
          min: 0,
          gp: 0,
          starter: false,
          notes: "No stats — upload player data or use paid API tier",
        });
      }
    }

    log(`Matched ${matchCount} players to stats. ${defaultCount} players need stats data.`);

    // 4. Use existing defense data (defense-vs-position requires paid tier)
    const builtDefense = (typeof TEAM_DEFENSE_VS_POSITION !== "undefined")
      ? JSON.parse(JSON.stringify(TEAM_DEFENSE_VS_POSITION))
      : {};

    // Ensure all active teams have defense entries
    for (const team of teamAbbrs) {
      if (!builtDefense[team]) {
        builtDefense[team] = {};
        for (const pos of POSITIONS) {
          builtDefense[team][pos] = { pts: 20, reb: 6, ast: 3.5 };
        }
      }
    }

    const statsNote = matchCount > 0
      ? `Loaded ${fetchedGames.length} games, ${builtPlayers.length} players (${matchCount} with stats).`
      : `Loaded ${fetchedGames.length} games and ${builtPlayers.length} players. Stats are using sample data — upload a JSON/CSV for real stats.`;

    log(statsNote);

    return {
      games: fetchedGames,
      players: builtPlayers,
      defense: builtDefense,
    };
  }

  return { setKey, getKey, fetchTodayData };
})();
