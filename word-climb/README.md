# Word Climb 🧗

A daily word-ladder game for your phone. Climb from the start word to the goal
word by changing **one letter at a time** — every rung must be a real word.
Each day has a **par**; beat it and share your climb as a spoiler-free emoji
grid. (Lewis Carroll invented the mechanic in 1877 — puzzle #1 is his classic
COLD → WARM.)

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
npx http-server word-climb -p 8080
# or deploy anywhere static (GitHub Pages, Netlify, …)
```

No build step, no dependencies, no accounts. Progress, streaks, and stats live
in `localStorage`.

## How it works

- **`words.js`** — 2,368 common four-letter words (ENABLE ∩ subtitle-frequency
  top 50k, profanity-screened). This is both the move validator and the graph
  that par is computed on, so par is always honest: it equals the true shortest
  path **+ 1**, meaning a perfect game beats par by exactly one.
- **`puzzles.js`** — 730 pre-verified daily puzzles `[start, goal, optimal]`,
  difficulty rotating through optimal distances of 4–7 moves. The daily index
  is derived from the local date relative to `WC_EPOCH`.
- **`game.js` / `index.html` / `style.css`** — the whole app. Tap a tile, tap a
  letter, hit ENTER. Wordle-style coloring against the goal word, undo,
  give-up (reveals an optimal path via client-side BFS), practice mode,
  streak stats, and Web Share with clipboard fallback.

## Regenerating puzzles

```sh
curl -so /tmp/enable1.txt https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt
curl -so /tmp/en_50k.txt  https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/en/en_50k.txt
curl -so /tmp/g10k.txt    https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-usa.txt
node tools/generate-puzzles.mjs   # writes words.js + puzzles.js
node tools/test-integrity.mjs     # BFS-verifies every puzzle's par
```
