'use strict';

/* ---------- data & mode ---------- */

const WORD_LENS = [4, 5];

const DICTS = {};
for (const l of WORD_LENS) {
  DICTS[l] = new Set();
  const raw = WC_DATA[l].dict;
  for (let i = 0; i < raw.length; i += l) DICTS[l].add(raw.slice(i, i + l));
}

const LS_LEN = 'wordgolf.len.v1';
const LS_SEEN_HELP = 'wordgolf.seenhelp.v1';
const lsState = () => `wordgolf.state.v1.${LEN}`;
const lsStats = () => `wordgolf.stats.v1.${LEN}`;

let LEN = +(localStorage.getItem(LS_LEN) || 4);
if (!WC_DATA[LEN]) LEN = 4;

function dict() {
  return DICTS[LEN];
}

/* ---------- daily puzzle selection ---------- */

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function todayNumber() {
  const epoch = startOfDay(new Date(WC_DATA[LEN].epoch + 'T12:00:00'));
  const n = Math.round((startOfDay(new Date()) - epoch) / 864e5) + 1;
  return Math.max(1, n);
}

function puzzleFor(n) {
  const list = WC_DATA[LEN].puzzles;
  const [start, target, best] = list[(n - 1) % list.length];
  return { start, target, best, par: best + 1 };
}

/* ---------- game state ---------- */

const state = {
  mode: 'daily', // or 'practice'
  day: 0,
  start: '',
  target: '',
  best: 0,
  par: 0,
  chain: [],
  cur: '',
  sel: null,
  done: false,
  gaveUp: false,
};

function lastWord() {
  return state.chain[state.chain.length - 1];
}

function moves() {
  return state.chain.length - 1;
}

function loadDaily() {
  const day = todayNumber();
  const p = puzzleFor(day);
  Object.assign(state, {
    mode: 'daily', day, ...p,
    chain: [p.start], cur: p.start, sel: null, done: false, gaveUp: false,
  });
  try {
    const saved = JSON.parse(localStorage.getItem(lsState()));
    if (saved && saved.day === day && Array.isArray(saved.chain) && saved.chain[0] === p.start) {
      state.chain = saved.chain;
      state.done = !!saved.done;
      state.gaveUp = !!saved.gaveUp;
      state.cur = lastWord();
    }
  } catch (e) { /* corrupt save — start fresh */ }
}

function loadPractice() {
  const list = WC_DATA[LEN].puzzles;
  let i;
  do { i = Math.floor(Math.random() * list.length); } while (i === (todayNumber() - 1) % list.length);
  const p = puzzleFor(i + 1);
  Object.assign(state, {
    mode: 'practice', day: i + 1, ...p,
    chain: [p.start], cur: p.start, sel: null, done: false, gaveUp: false,
  });
  renderAll();
  markGoalKeys();
}

function saveDaily() {
  if (state.mode !== 'daily') return;
  localStorage.setItem(lsState(), JSON.stringify({
    day: state.day, chain: state.chain, done: state.done, gaveUp: state.gaveUp,
  }));
}

/* ---------- stats (kept separately per word length) ---------- */

function loadStats() {
  try {
    return Object.assign(
      { played: 0, solved: 0, streak: 0, maxStreak: 0, lastSolvedDay: 0, under: 0, atPar: 0, over: 0 },
      JSON.parse(localStorage.getItem(lsStats())) || {}
    );
  } catch (e) {
    return { played: 0, solved: 0, streak: 0, maxStreak: 0, lastSolvedDay: 0, under: 0, atPar: 0, over: 0 };
  }
}

function recordResult(solved) {
  if (state.mode !== 'daily') return;
  const s = loadStats();
  s.played++;
  if (solved) {
    s.solved++;
    s.streak = s.lastSolvedDay === state.day - 1 ? s.streak + 1 : 1;
    s.maxStreak = Math.max(s.maxStreak, s.streak);
    s.lastSolvedDay = state.day;
    const m = moves();
    if (m < state.par) s.under++;
    else if (m === state.par) s.atPar++;
    else s.over++;
  } else {
    s.streak = 0;
  }
  localStorage.setItem(lsStats(), JSON.stringify(s));
}

/* ---------- word helpers ---------- */

// Wordle-style coloring of `word` against the goal, duplicate-aware.
function colorRow(word, target) {
  const res = new Array(LEN).fill('absent');
  const remaining = {};
  for (let i = 0; i < LEN; i++) {
    if (word[i] === target[i]) res[i] = 'correct';
    else remaining[target[i]] = (remaining[target[i]] || 0) + 1;
  }
  for (let i = 0; i < LEN; i++) {
    if (res[i] !== 'correct' && remaining[word[i]] > 0) {
      res[i] = 'present';
      remaining[word[i]]--;
    }
  }
  return res;
}

// BFS shortest path start->target through the dictionary; "give up" reveal.
function shortestPath(from, to) {
  const parent = new Map([[from, null]]);
  let frontier = [from];
  while (frontier.length) {
    const next = [];
    for (const w of frontier) {
      for (let i = 0; i < LEN; i++) {
        for (let c = 97; c < 123; c++) {
          const cand = w.slice(0, i) + String.fromCharCode(c) + w.slice(i + 1);
          if (cand === w || parent.has(cand) || !dict().has(cand)) continue;
          parent.set(cand, w);
          if (cand === to) {
            const path = [cand];
            let p = w;
            while (p) { path.unshift(p); p = parent.get(p); }
            return path;
          }
          next.push(cand);
        }
      }
    }
    frontier = next;
  }
  return null;
}

/* ---------- rendering ---------- */

const $ = (id) => document.getElementById(id);
const ladder = $('ladder');

function tileRow(word, classes, tileClasses) {
  const row = document.createElement('div');
  row.className = 'row ' + (classes || '');
  for (let i = 0; i < LEN; i++) {
    const t = document.createElement('div');
    t.className = 'tile ' + (tileClasses ? tileClasses[i] : '');
    t.textContent = word[i];
    t.dataset.pos = i;
    row.appendChild(t);
  }
  return row;
}

function tag(row, text) {
  const el = document.createElement('span');
  el.className = 'row-tag';
  el.textContent = text;
  row.appendChild(el);
  return row;
}

function renderLadder(pop) {
  ladder.innerHTML = '';

  // Goal row pinned at the top; once done the chain itself ends on the goal,
  // so the separate dashed row would be redundant.
  if (!state.done) {
    const goal = tileRow(state.target, '', new Array(LEN).fill('goal'));
    tag(goal, 'goal');
    ladder.appendChild(goal);

    const gap = document.createElement('div');
    gap.className = 'gap-line';
    gap.textContent = '· · ·';
    ladder.appendChild(gap);

    // Editable row the player is composing.
    const last = lastWord();
    const tileClasses = [];
    for (let i = 0; i < LEN; i++) {
      let c = '';
      if (state.sel === i) c += ' sel';
      if (state.cur[i] !== last[i]) c += ' edited';
      tileClasses.push(c);
    }
    const input = tileRow(state.cur, 'input' + (pop === 'shake' ? ' shake' : ''), tileClasses);
    input.id = 'input-row';
    input.addEventListener('click', (e) => {
      const pos = e.target.dataset && e.target.dataset.pos;
      if (pos !== undefined) {
        state.sel = +pos;
        renderLadder();
      }
    });
    ladder.appendChild(input);
  }

  // The chain so far, newest on top, start at the bottom.
  for (let i = state.chain.length - 1; i >= 0; i--) {
    const w = state.chain[i];
    const isTop = i === state.chain.length - 1;
    const row = tileRow(
      w,
      isTop && pop === 'pop' ? 'pop' : '',
      i === 0 ? null : colorRow(w, state.target)
    );
    if (i === 0) tag(row, 'start');
    ladder.appendChild(row);
  }

  ladder.scrollTop = 0;
}

function renderHud() {
  const label = state.mode === 'practice' ? `Practice #${state.day}` : `Puzzle #${state.day}`;
  $('puzzle-label').textContent = label;
  $('par-label').textContent = `Par ${state.par}`;
  $('moves-label').textContent = `${moves()} stroke${moves() === 1 ? '' : 's'}`;
  $('btn-results').classList.toggle('hidden', !state.done);
  $('btn-giveup').classList.toggle('hidden', state.done);
  document.querySelectorAll('#len-toggle button').forEach((b) => {
    b.classList.toggle('on', +b.dataset.len === LEN);
  });
}

function renderAll(pop) {
  renderLadder(pop);
  renderHud();
}

/* ---------- keyboard ---------- */

const KB_ROWS = ['qwertyuiop', 'asdfghjkl', '*zxcvbnm<'];

function buildKeyboard() {
  const kb = $('keyboard');
  kb.innerHTML = '';
  for (const rowDef of KB_ROWS) {
    const row = document.createElement('div');
    row.className = 'kb-row';
    for (const ch of rowDef) {
      const key = document.createElement('button');
      if (ch === '*') {
        key.className = 'key wide';
        key.textContent = 'ENTER';
        key.addEventListener('click', submit);
      } else if (ch === '<') {
        key.className = 'key wide';
        key.textContent = '⌫';
        key.addEventListener('click', undo);
      } else {
        key.className = 'key';
        key.textContent = ch;
        key.dataset.letter = ch;
        key.addEventListener('click', () => typeLetter(ch));
      }
      row.appendChild(key);
    }
    kb.appendChild(row);
  }
}

function markGoalKeys() {
  document.querySelectorAll('.key[data-letter]').forEach((k) => {
    k.classList.toggle('in-goal', state.target.includes(k.dataset.letter));
  });
}

/* ---------- actions ---------- */

let toastTimer = null;
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  el.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.style.opacity = '0'; }, 1400);
}

function typeLetter(ch) {
  if (state.done) return;
  if (state.sel === null) {
    toast('Tap a tile to change it');
    return;
  }
  const last = lastWord();
  const w = state.cur.split('');
  // Only one letter may differ from the previous rung: revert other edits.
  for (let i = 0; i < LEN; i++) if (i !== state.sel && w[i] !== last[i]) w[i] = last[i];
  w[state.sel] = ch;
  state.cur = w.join('');
  renderAll();
}

function undo() {
  if (state.done) return;
  if (state.cur !== lastWord()) {
    state.cur = lastWord();
    state.sel = null;
  } else if (state.chain.length > 1) {
    state.chain.pop();
    state.cur = lastWord();
    state.sel = null;
    saveDaily();
  }
  renderAll();
}

function submit() {
  if (state.done) return;
  const w = state.cur;
  if (w === lastWord()) {
    toast('Change one letter first');
    return renderAll('shake');
  }
  if (!dict().has(w)) {
    toast('Not in word list');
    return renderAll('shake');
  }
  if (state.chain.includes(w)) {
    toast('Already on your ladder');
    return renderAll('shake');
  }
  state.chain.push(w);
  state.cur = w;
  state.sel = null;
  if (w === state.target) {
    finish();
  } else {
    saveDaily();
    renderAll('pop');
  }
}

function giveUp() {
  if (state.done) return;
  if (!confirm('Reveal the best line? This ends today’s round and resets your streak.')) return;
  const path = shortestPath(state.start, state.target);
  state.done = true;
  state.gaveUp = true;
  recordResult(false);
  state.chain = path || state.chain;
  saveDaily();
  renderAll();
  showResult();
}

function finish() {
  state.done = true;
  recordResult(true);
  saveDaily();
  renderAll('pop');
  setTimeout(showResult, 650);
}

function setLen(l) {
  if (l === LEN || !WC_DATA[l]) return;
  LEN = l;
  localStorage.setItem(LS_LEN, l);
  document.body.classList.toggle('len5', LEN === 5);
  closeModals();
  loadDaily();
  renderAll();
  markGoalKeys();
}

/* ---------- results & sharing ---------- */

const EMOJI = { correct: '\u{1F7E9}', present: '\u{1F7E8}', absent: '⬜' };

function emojiGrid() {
  return state.chain
    .slice(1)
    .map((w) => colorRow(w, state.target).map((c) => EMOJI[c]).join(''))
    .join('\n');
}

function resultLabel() {
  // par = best + 1, so the optimal line lands exactly one under par (a birdie),
  // and nothing can beat it. Everything else is par or a string of bogeys.
  const over = moves() - state.par;
  if (moves() === state.best) return 'Birdie — perfect line! \u{1F426}';
  if (over === 0) return 'Par ⛳';
  if (over === 1) return 'Bogey · +1';
  if (over === 2) return 'Double bogey · +2';
  return `+${over} over par`;
}

function shareText() {
  const tagTxt = LEN === 5 ? ' · 5-letter' : '';
  const head = state.mode === 'practice'
    ? `Word Golf (practice${tagTxt}) ⛳`
    : `Word Golf #${state.day}${tagTxt} ⛳`;
  return `${head}\n${state.start.toUpperCase()} → ${state.target.toUpperCase()} in ${moves()} (par ${state.par})\n${emojiGrid()}`;
}

let countdownTimer = null;

function showResult() {
  const m = moves();
  if (state.gaveUp) {
    $('result-title').textContent = 'Conceded \u{1F3F3}️';
    $('result-sub').textContent = `Best line shown on the board — ${state.best} strokes.`;
    $('result-grid').textContent = '';
    $('btn-share').classList.add('hidden');
  } else {
    $('result-title').textContent = resultLabel();
    $('result-sub').textContent =
      `${state.start.toUpperCase()} → ${state.target.toUpperCase()} in ${m} strokes · par ${state.par}`;
    $('result-grid').textContent = emojiGrid();
    $('btn-share').classList.remove('hidden');
  }

  clearInterval(countdownTimer);
  if (state.mode === 'daily') {
    const tick = () => {
      const now = new Date();
      const next = startOfDay(now) + 864e5;
      const s = Math.max(0, Math.floor((next - now.getTime()) / 1000));
      const pad = (x) => String(x).padStart(2, '0');
      $('countdown').textContent =
        `Next round in ${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
    };
    tick();
    countdownTimer = setInterval(tick, 1000);
  } else {
    $('countdown').textContent = '';
  }
  openModal('modal-result');
}

async function share() {
  const text = shareText();
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    toast('Copied to clipboard');
  } catch (e) {
    prompt('Copy your result:', text);
  }
}

/* ---------- modals & stats UI ---------- */

function openModal(id) {
  $(id).classList.remove('hidden');
}

function closeModals() {
  document.querySelectorAll('.modal-backdrop').forEach((m) => m.classList.add('hidden'));
  clearInterval(countdownTimer);
}

function showStats() {
  const s = loadStats();
  $('stats-title').textContent = `Statistics · ${LEN}-letter`;
  $('st-played').textContent = s.played;
  $('st-solved').textContent = s.played ? Math.round((100 * s.solved) / s.played) + '%' : '0%';
  $('st-streak').textContent = s.streak;
  $('st-max').textContent = s.maxStreak;
  const rows = [['Under par', s.under], ['At par', s.atPar], ['Over par', s.over]];
  const max = Math.max(1, ...rows.map((r) => r[1]));
  $('par-bars').innerHTML = rows
    .map(
      ([lbl, n]) =>
        `<div class="par-bar${n === 0 ? ' zero' : ''}">` +
        `<span class="lbl">${lbl}</span>` +
        `<span class="bar" style="width:${Math.max(9, (88 * n) / max)}%">${n}</span></div>`
    )
    .join('');
  openModal('modal-stats');
}

/* ---------- physical keyboard ---------- */

document.addEventListener('keydown', (e) => {
  if (!document.querySelector('.modal-backdrop:not(.hidden)')) {
    if (e.key === 'Enter') return submit();
    if (e.key === 'Backspace') return undo();
    if (e.key === 'ArrowLeft') { state.sel = state.sel === null ? 0 : (state.sel + LEN - 1) % LEN; return renderAll(); }
    if (e.key === 'ArrowRight') { state.sel = state.sel === null ? 0 : (state.sel + 1) % LEN; return renderAll(); }
    if (/^[a-zA-Z]$/.test(e.key)) {
      if (state.sel === null) state.sel = 0;
      return typeLetter(e.key.toLowerCase());
    }
  } else if (e.key === 'Escape') {
    closeModals();
  }
});

/* ---------- wiring ---------- */

$('btn-help').addEventListener('click', () => openModal('modal-help'));
$('btn-stats').addEventListener('click', showStats);
$('btn-results').addEventListener('click', showResult);
$('btn-giveup').addEventListener('click', giveUp);
$('btn-share').addEventListener('click', share);
$('btn-practice').addEventListener('click', () => { closeModals(); loadPractice(); });
$('btn-practice-stats').addEventListener('click', () => { closeModals(); loadPractice(); });

document.querySelectorAll('#len-toggle button').forEach((b) => {
  b.addEventListener('click', () => setLen(+b.dataset.len));
});

document.querySelectorAll('.modal-backdrop').forEach((bd) => {
  bd.addEventListener('click', (e) => {
    if (e.target === bd || e.target.hasAttribute('data-close')) closeModals();
  });
});

// New day while the tab was open: switch to the new puzzle.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && state.mode === 'daily' && state.day !== todayNumber()) {
    closeModals();
    loadDaily();
    renderAll();
    markGoalKeys();
  }
});

/* ---------- boot ---------- */

document.body.classList.toggle('len5', LEN === 5);
buildKeyboard();
loadDaily();
renderAll();
markGoalKeys();

if (!localStorage.getItem(LS_SEEN_HELP)) {
  localStorage.setItem(LS_SEEN_HELP, '1');
  openModal('modal-help');
} else if (state.done) {
  showResult();
}
