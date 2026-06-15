# Word Golf ⛳

A daily word-ladder game for your phone. Get from the start word to the goal
word by changing **one letter at a time** — every step must be a real word.
Each hole has a **par**; finish in fewer strokes to go under, then share your
scorecard as a spoiler-free emoji grid. (Lewis Carroll invented the mechanic in
1877 — puzzle #1 is his classic COLD → WARM.)

There are two daily rounds: **4-letter** and **5-letter**, switchable with the
toggle in the header. Each mode has its own puzzle schedule, saved progress,
streak, and stats.

```
WARM   🟩🟩🟩🟩
WARD   🟩🟩🟩⬜
CARD   ⬜🟩🟩⬜
CORD   ⬜⬜🟩⬜
COLD   start
```

## Play

It's a static site — serve this directory and open it:

```sh
npx http-server word-golf -p 8080
# or deploy anywhere static (GitHub Pages, Netlify, …)
```

No build step, no dependencies, no accounts. Progress, streaks, and stats live
in `localStorage`.

## How it works

- **`data4.js` / `data5.js`** — per-length dictionary + puzzles. Dictionaries
  are common words only (ENABLE ∩ subtitle-frequency top 50k,
  profanity-screened): 2,368 four-letter and 3,769 five-letter words. The
  dictionary is both the move validator and the graph that par is computed on,
  so par is always honest: it equals the true shortest path **+ 1**, meaning a
  perfect game beats par by exactly one. Each mode ships 730 pre-verified
  daily puzzles `[start, goal, optimal]`, difficulty rotating through optimal
  distances of 4–7 moves; the daily index is derived from the local date
  relative to the epoch.
- **`game.js` / `index.html` / `style.css`** — the whole app. Tap a tile, tap a
  letter, hit ENTER. Wordle-style coloring against the goal word, undo,
  give-up (reveals an optimal path via client-side BFS), practice mode,
  streak stats, and Web Share with clipboard fallback.

## Regenerating puzzles

```sh
curl -so /tmp/enable1.txt https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt
curl -so /tmp/en_50k.txt  https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/en/en_50k.txt
curl -so /tmp/g10k.txt    https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-usa.txt
node tools/generate-puzzles.mjs   # writes data4.js + data5.js
node tools/test-integrity.mjs     # BFS-verifies every puzzle's par
```
