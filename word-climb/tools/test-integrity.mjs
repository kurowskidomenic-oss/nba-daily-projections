// Integrity test for the shipped data files: every daily puzzle must be
// solvable through the shipped dictionary, and the stored optimal move count
// must equal the true BFS shortest path (so par is always honest).
//
// Usage: node word-climb/tools/test-integrity.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// The data files are plain scripts assigning into a global WC_DATA.
globalThis.WC_DATA = {};
for (const f of ['data4.js', 'data5.js']) {
  const src = fs.readFileSync(path.join(dir, f), 'utf8').replace('var WC_DATA = WC_DATA || {};', '');
  new Function('WC_DATA', src)(globalThis.WC_DATA);
}

let fail = 0;
const assert = (cond, msg) => { if (!cond) { console.error('FAIL:', msg); fail++; } };

for (const LEN of [4, 5]) {
  const { dict: raw, puzzles, epoch } = WC_DATA[LEN];

  const dict = new Set();
  for (let i = 0; i < raw.length; i += LEN) dict.add(raw.slice(i, i + LEN));

  assert(raw.length % LEN === 0, `${LEN}: dict raw length divisible by ${LEN}`);
  assert(dict.size === raw.length / LEN, `${LEN}: no duplicate dict words`);
  for (const w of dict) assert(new RegExp(`^[a-z]{${LEN}}$`).test(w), `${LEN}: bad dict word ${w}`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(epoch), `${LEN}: epoch format`);

  function bfsDist(from, to) {
    const seen = new Set([from]);
    let frontier = [from];
    let d = 0;
    while (frontier.length) {
      d++;
      const next = [];
      for (const w of frontier) {
        for (let i = 0; i < LEN; i++) {
          for (let c = 97; c < 123; c++) {
            const cand = w.slice(0, i) + String.fromCharCode(c) + w.slice(i + 1);
            if (cand === w || seen.has(cand) || !dict.has(cand)) continue;
            if (cand === to) return d;
            seen.add(cand);
            next.push(cand);
          }
        }
      }
      frontier = next;
    }
    return Infinity;
  }

  assert(puzzles.length >= 365, `${LEN}: at least a year of puzzles (got ${puzzles.length})`);
  if (LEN === 4) {
    assert(puzzles[0][0] === 'cold' && puzzles[0][1] === 'warm', 'puzzle #1 is the Carroll homage');
  }

  const seenPairs = new Set();
  for (const [start, target, best] of puzzles) {
    assert(dict.has(start) && dict.has(target), `${LEN}: ${start}/${target} in dict`);
    assert(start !== target, `${LEN}: ${start} != ${target}`);
    assert(best >= 4 && best <= 7, `${LEN}: ${start}->${target} difficulty in range (${best})`);
    const key = [start, target].sort().join(':');
    assert(!seenPairs.has(key), `${LEN}: duplicate pair ${key}`);
    seenPairs.add(key);
    const d = bfsDist(start, target);
    assert(d === best, `${LEN}: ${start}->${target} stored best ${best} but BFS says ${d}`);
  }

  console.log(`length ${LEN}: ${puzzles.length} puzzles checked against ${dict.size}-word dictionary`);
}

if (fail) {
  console.error(`\n${fail} failure(s)`);
  process.exit(1);
}
console.log('OK');
