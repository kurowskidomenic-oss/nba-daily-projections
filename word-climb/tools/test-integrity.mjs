// Integrity test for the shipped data files: every daily puzzle must be
// solvable through the shipped dictionary, and the stored optimal move count
// must equal the true BFS shortest path (so par is always honest).
//
// Usage: node word-climb/tools/test-integrity.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = {};
for (const f of ['words.js', 'puzzles.js']) {
  // The files are plain `const X = ...;` scripts; evaluate them into ctx.
  const src = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\bconst\b/g, 'ctx.');
  new Function('ctx', src.replace(/ctx\.(\w+) =/g, 'ctx.$1 ='))(ctx);
}
const { WC_DICT_RAW, WC_PUZZLES, WC_EPOCH } = ctx;

const dict = new Set();
for (let i = 0; i < WC_DICT_RAW.length; i += 4) dict.add(WC_DICT_RAW.slice(i, i + 4));

let fail = 0;
const assert = (cond, msg) => { if (!cond) { console.error('FAIL:', msg); fail++; } };

assert(WC_DICT_RAW.length % 4 === 0, 'dict raw length divisible by 4');
assert(dict.size === WC_DICT_RAW.length / 4, 'no duplicate dict words');
for (const w of dict) assert(/^[a-z]{4}$/.test(w), `bad dict word ${w}`);
assert(/^\d{4}-\d{2}-\d{2}$/.test(WC_EPOCH), 'epoch format');

function bfsDist(from, to) {
  const seen = new Set([from]);
  let frontier = [from];
  let d = 0;
  while (frontier.length) {
    d++;
    const next = [];
    for (const w of frontier) {
      for (let i = 0; i < 4; i++) {
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

assert(WC_PUZZLES.length >= 365, `at least a year of puzzles (got ${WC_PUZZLES.length})`);
assert(WC_PUZZLES[0][0] === 'cold' && WC_PUZZLES[0][1] === 'warm', 'puzzle #1 is the Carroll homage');

const seenPairs = new Set();
for (const [start, target, best] of WC_PUZZLES) {
  assert(dict.has(start) && dict.has(target), `${start}/${target} in dict`);
  assert(start !== target, `${start} != ${target}`);
  assert(best >= 4 && best <= 7, `${start}->${target} difficulty in range (${best})`);
  const key = [start, target].sort().join(':');
  assert(!seenPairs.has(key), `duplicate pair ${key}`);
  seenPairs.add(key);
  const d = bfsDist(start, target);
  assert(d === best, `${start}->${target} stored best ${best} but BFS says ${d}`);
}

if (fail) {
  console.error(`\n${fail} failure(s)`);
  process.exit(1);
}
console.log(`OK: ${WC_PUZZLES.length} puzzles verified against ${dict.size}-word dictionary`);
