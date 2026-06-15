// Generates word-golf/data4.js and word-golf/data5.js
//
// Inputs (download before running):
//   /tmp/enable1.txt      https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt
//   /tmp/en_50k.txt       https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/en/en_50k.txt
//   /tmp/g10k.txt         https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-usa.txt
//
// ENABLE has no proper nouns (Scrabble-style), so intersecting it with the
// frequency lists keeps the dictionary to real, reasonably common words.
//
// Usage: node word-golf/tools/generate-puzzles.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const OUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const EPOCH = '2026-06-10'; // puzzle #1
const TARGET_PUZZLES = 730; // two years
const MIN_DIST = 4;
const MAX_DIST = 7;

// Never in the dictionary at all (slurs, strong profanity).
const HARD_BLOCK = new Set([
  // 4 letters
  'fuck', 'shit', 'cunt', 'cock', 'dick', 'twat', 'wank', 'jizz', 'kike',
  'spic', 'gook', 'dyke', 'fags', 'coon', 'paki', 'chink', 'shag', 'smeg',
  'milf', 'porn', 'anal', 'anus', 'cums', 'scat',
  // 5 letters
  'fucks', 'shits', 'cunts', 'cocks', 'dicks', 'twats', 'wanks', 'kikes',
  'spics', 'gooks', 'dykes', 'coons', 'pakis', 'shags', 'milfs', 'porno',
  'porns', 'negro', 'bitch', 'pussy', 'whore', 'penis', 'semen', 'sperm',
  'queef', 'fanny', 'prick', 'spunk', 'shite', 'turds',
]);

// Allowed as ladder steps, but never as puzzle start/end words.
const SOFT_BLOCK = new Set([
  // 4 letters
  'damn', 'hell', 'piss', 'arse', 'butt', 'tits', 'homo', 'nazi', 'rape',
  'sexy', 'slut', 'nude', 'dead', 'died', 'dies', 'kill', 'gays', 'jews',
  'arab', 'thug', 'dumb', 'fats', 'hoes', 'pimp', 'crap', 'turd', 'barf',
  'suck', 'dung', 'gash', 'hump', 'knob', 'dork',
  // 5 letters
  'damns', 'hells', 'arses', 'butts', 'homos', 'nazis', 'rapes', 'raped',
  'sluts', 'nudes', 'deads', 'kills', 'death', 'dying', 'thugs', 'pimps',
  'craps', 'sucks', 'humps', 'knobs', 'dorks', 'queer', 'boobs', 'booby',
  'idiot', 'moron', 'bimbo', 'fatty', 'drunk', 'drugs', 'booze', 'vomit',
  'urine', 'feces', 'enema', 'rectum',
]);

function readLines(file) {
  return fs.readFileSync(file, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean);
}

// Deterministic PRNG so regeneration is reproducible.
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const enableAll = readLines('/tmp/enable1.txt');
const g10kAll = readLines('/tmp/g10k.txt');
const en50kAll = readLines('/tmp/en_50k.txt');

function generateFor(LEN) {
  console.log(`\n=== ${LEN}-letter words ===`);
  const isLen = (w) => w.length === LEN && /^[a-z]+$/.test(w);
  const enable = new Set(enableAll.filter(isLen));
  const g10k = new Set(g10kAll.filter(isLen));

  // en_50k lines are "word count", ordered by descending frequency.
  const freqRank = new Map();
  for (const line of en50kAll) {
    const w = line.split(' ')[0];
    if (isLen(w) && !freqRank.has(w)) freqRank.set(w, freqRank.size + 1);
  }

  // Validation dictionary: common enough to appear in subtitles top-50k AND a
  // real word per ENABLE. Players' moves are checked against this, and par is
  // the shortest path through this same graph.
  const dict = [...freqRank.keys()]
    .filter((w) => enable.has(w) && !HARD_BLOCK.has(w))
    .sort();
  const dictSet = new Set(dict);
  console.log(`dictionary: ${dict.length} words`);

  // One-letter-substitution adjacency via wildcard buckets (c_ld etc).
  const buckets = new Map();
  for (const w of dict) {
    for (let i = 0; i < LEN; i++) {
      const k = w.slice(0, i) + '_' + w.slice(i + 1);
      if (!buckets.has(k)) buckets.set(k, []);
      buckets.get(k).push(w);
    }
  }
  const adj = new Map(dict.map((w) => [w, []]));
  for (const group of buckets.values()) {
    for (const a of group) for (const b of group) if (a !== b) adj.get(a).push(b);
  }

  function bfs(start) {
    const dist = new Map([[start, 0]]);
    let frontier = [start];
    while (frontier.length) {
      const next = [];
      for (const w of frontier) {
        for (const n of adj.get(w)) {
          if (!dist.has(n)) {
            dist.set(n, dist.get(w) + 1);
            next.push(n);
          }
        }
      }
      frontier = next;
    }
    return dist;
  }

  // Endpoint pool: very common words only, so the daily goal always feels
  // fair. The 5-letter graph is sparser, so it gets a looser frequency cut.
  const poolCut = LEN === 4 ? 6000 : 12000;
  const pool = dict.filter(
    (w) =>
      !SOFT_BLOCK.has(w) &&
      (g10k.has(w) || freqRank.get(w) <= poolCut / 3) &&
      freqRank.get(w) <= poolCut &&
      adj.get(w).length > 0
  );
  console.log(`endpoint pool: ${pool.length} words`);

  function samePos(a, b) {
    let n = 0;
    for (let i = 0; i < LEN; i++) if (a[i] === b[i]) n++;
    return n;
  }

  // All viable pairs, bucketed by optimal distance.
  const byDist = new Map();
  for (let d = MIN_DIST; d <= MAX_DIST; d++) byDist.set(d, []);
  for (const a of pool) {
    const dist = bfs(a);
    for (const b of pool) {
      if (b <= a) continue; // dedupe unordered pairs
      const d = dist.get(b);
      if (d === undefined || d < MIN_DIST || d > MAX_DIST) continue;
      if (samePos(a, b) > 1) continue; // endpoints should look unrelated
      byDist.get(d).push([a, b, d]);
    }
  }
  for (const [d, list] of byDist) console.log(`distance ${d}: ${list.length} candidate pairs`);

  const rand = mulberry32(20260610 + LEN);
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  for (const list of byDist.values()) shuffle(list);

  // Round-robin across difficulties so consecutive days vary; cap how often
  // any single word appears as an endpoint across the whole schedule.
  const used = new Map();
  const puzzles = [];
  const cycle = [4, 5, 4, 6, 5, 4, 7]; // weekly-ish difficulty rhythm
  const cursors = new Map([...byDist.keys()].map((d) => [d, 0]));
  const useCap = LEN === 4 ? 2 : 3;
  function takeFrom(d) {
    const list = byDist.get(d);
    let i = cursors.get(d);
    while (i < list.length) {
      const [a, b, dd] = list[i++];
      if ((used.get(a) || 0) < useCap && (used.get(b) || 0) < useCap) {
        cursors.set(d, i);
        used.set(a, (used.get(a) || 0) + 1);
        used.set(b, (used.get(b) || 0) + 1);
        // Randomize direction so it isn't always alphabetical.
        return rand() < 0.5 ? [a, b, dd] : [b, a, dd];
      }
    }
    cursors.set(d, i);
    return null;
  }

  // Homage to Lewis Carroll: 4-letter puzzle #1 is COLD → WARM.
  if (LEN === 4) {
    const d = bfs('cold').get('warm');
    if (d !== undefined && d >= MIN_DIST && d <= MAX_DIST) {
      puzzles.push(['cold', 'warm', d]);
      used.set('cold', useCap).set('warm', useCap);
      console.log(`cold -> warm optimal distance: ${d}`);
    } else {
      console.warn('cold -> warm not viable, skipping homage');
    }
  }

  let ci = 0;
  while (puzzles.length < TARGET_PUZZLES) {
    const d = cycle[ci++ % cycle.length];
    const p = takeFrom(d) || takeFrom(4) || takeFrom(5) || takeFrom(6) || takeFrom(7);
    if (!p) break;
    puzzles.push(p);
  }
  console.log(`generated ${puzzles.length} puzzles`);
  if (puzzles.length < TARGET_PUZZLES) {
    throw new Error(`only ${puzzles.length}/${TARGET_PUZZLES} puzzles for length ${LEN}`);
  }

  // Sanity check: recomputed distance must match what we stored.
  for (const [a, b, d] of puzzles.slice(0, 50)) {
    const check = bfs(a).get(b);
    if (check !== d) throw new Error(`distance mismatch ${a}->${b}: ${check} != ${d}`);
    if (!dictSet.has(a) || !dictSet.has(b)) throw new Error(`endpoint not in dict: ${a}/${b}`);
  }

  fs.writeFileSync(
    path.join(OUT_DIR, `data${LEN}.js`),
    `// Generated by tools/generate-puzzles.mjs — do not edit by hand.\n` +
      `// ${dict.length} common ${LEN}-letter words + ${puzzles.length} puzzles\n` +
      `// [start, target, optimal number of moves].\n` +
      `var WC_DATA = WC_DATA || {};\n` +
      `WC_DATA[${LEN}] = {\n` +
      `  epoch: '${EPOCH}',\n` +
      `  dict: '${dict.join('')}',\n` +
      `  puzzles: ${JSON.stringify(puzzles).replace(/\],\[/g, '],\n[')},\n` +
      `};\n`
  );
  console.log(`wrote data${LEN}.js`);
}

generateFor(4);
generateFor(5);
