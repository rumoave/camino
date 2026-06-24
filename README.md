# Camino — naturalization journey coach (iOS prototype)

"Duolingo for the path to U.S. citizenship." A daily-loop coach that combines
streak-based engagement, a stage-aware legal journey, and bilingual civics learning.

## Run it

It's a single self-contained HTML file — **no build step, no dependencies.**

- **Fastest:** double-click `index.html` (opens in your browser).
- **In VS Code with live reload:**
  1. Install the recommended **Live Preview** extension (VS Code will prompt you).
  2. Right-click `index.html` → **Show Preview** (or **Open with Live Server**).
  3. Edit and save — the preview reloads automatically.

## What's in build 1

- **Today** — the daily loop: *Where am I → one next step → 5-min lesson* + streak/XP.
- **Journey** — the legal path: Green card → 5-yr → File N-400 → Interview → Oath.
- **Learn** — Duolingo-style civics path (units, locked/current/done nodes).
- **Lesson** — question player with correct/incorrect feedback.
- **EN ⇄ ES** toggle that re-renders every string live.

## Project layout

```
camino/
├── index.html        ← the whole app (HTML + CSS + JS inline)
├── README.md
└── .vscode/
    └── extensions.json   ← recommends Live Preview
```

## Roadmap

See the feature outline in chat. Phase 1 = prove the loop (onboarding + node-completion).
Next decision: stay single-file as a clickable spec, or split into modules when the
flows lock (then SwiftUI for native iOS, or Capacitor/React Native for TestFlight).
