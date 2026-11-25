# Hero Academy

A first-grade learning adventure with short missions, encouraging retries, effort rewards, and a small earned arcade. React + Vite + TypeScript + plain CSS. No backend, account, subscription, advertising, or analytics.

**Play:** https://broof34.github.io/hero-academy/

## Run locally

Use Node.js 22.12+ (Node 24 recommended).

```sh
npm ci
npm run dev
```

Open the printed URL, including `/hero-academy/`. To check a production build:

```sh
npm run build
npm run preview
```

## For a grown-up

1. Start a five-question math, spelling, or reading mission. Choose a specific skill or a mix.
2. Each solved question earns **one star**. Mistakes cost nothing. Hints and retries are always available; there is no response deadline.
3. In Arcade, exchange **10 stars for a ticket** by default. A ticket starts a **three-minute** game session. A visible countdown warns during the final 30 seconds. At zero, the iframe is removed and the dashboard returns.
4. Open **Grown-up zone** (sidebar on desktop/tablet, shield button in the mobile header) and solve the multiplication check to edit subjects, math difficulty, stars per ticket, focus/break/game durations, speech, and reduced motion. At least one subject stays enabled.
5. Add custom math/spelling prompts and their exact answers; choose **My grown-up’s questions** in a new mission. Answers ignore leading/trailing spaces and letter case.
6. Homework supports focus, pause/resume, adult-confirmed effort, and a non-screen break. An adult can also reward persistence before the timer ends. A focus round awards three stars once, then enters break time.
7. Export progress as JSON before clearing browser data. Reset requires a separate explicit confirmation.

The grown-up check is a friendly gate, **not a secure parental control**. Browser-local software cannot prevent a technically knowledgeable user from editing their save, clock, or opening game files directly.

## Included activities

- Math: addition/subtraction within 10 or 20; object counting; comparisons; missing numbers; patterns; simple story problems; optional counting aids.
- Spelling/phonics: CVC words; missing letters; letter tiles; beginning/ending sounds; rhymes; contextual sight words.
- Reading: six original mini-passages with comprehension; picture matching; sentence completion.
- Homework: configurable focus and break timers, pause/resume, adult confirmation and effort rewards.
- Arcade: **Star Defender**, adapted from Dave Kerr’s MIT Space Invaders engine; **Cosmic Rally**, adapted from Jake Gordon’s MIT straight-road racer. Both use keyboard and touch controls and run locally in sandboxed iframes. No upstream music or image assets are distributed.
- Original SVG hero/space illustrations, large answer buttons, calm learning screens, responsive layouts, optional local-device read aloud.

## Tests

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Browser tests use installed Google Chrome (`channel: chrome`). For CI without Chrome, install it with `npx playwright install chrome` or change the channel to an installed Playwright browser. Tests cover a full five-question mission, retry behavior, reload persistence, ticket spending, live game adapters, expiry/unloading, adult homework confirmation, custom prompts, export, and tablet layout. Unit tests cover reward boundaries, saved-state hydration, settings normalization, and generation of every learning skill at both math levels.

## Project layout

- `src/model.ts`: versioned save schema, star/ticket rules, session deadlines, hydration.
- `src/learning.ts`: small original question generator and content bank.
- `src/Activities.tsx`: one-question missions, homework/break timers, sandboxed game host.
- `src/Parent.tsx`: adult gate, settings, custom questions, progress, export/reset.
- `src/games.ts`: modular game registry. Add a self-contained local game and register its title/path here.
- `public/games/`: vendored/adapted game engines and preserved MIT license texts.
- `src/Art.tsx`: original SVG artwork; no external art or fonts required.

## Deployment

GitHub Actions validates and deploys pushes on `codex/hero-academy-mvp` to GitHub Pages. Repository Settings → Pages must use **GitHub Actions** as the build source. `vite.config.ts` uses base `/hero-academy/`. Change the base when deploying under a different repository path.

## Privacy, storage, and MVP limits

- Progress uses only `localStorage['hero-academy:v1']` on the current origin/browser/device. No child names or personal details are requested. Do not put sensitive personal information in custom prompts or shared exports.
- The app makes no analytics, advertising, backend, external-font, or game-asset requests. GitHub Pages receives ordinary hosting requests. Read aloud only selects an English voice marked local by the browser; availability varies by OS/browser. Games are intentionally silent.
- Saves with unknown versions or invalid progress are left untouched and can be exported for recovery. Unavailable/full browser storage produces a warning and export option.
- A game deadline survives reloads and time in background tabs. The game is removed at the next browser tick after expiry; suspended pages cannot run until the OS resumes them. A ticket is consumed on launch, including early exits. In-progress learning missions and homework focus rounds reset when you leave their screen/reload; stars already earned stay saved. Use one tab at a time to avoid competing local saves.
- This is practice content, not a full curriculum or adaptive assessment. Reading/phonics content is a compact starter bank. No cross-device sync, cloud backup, JSON import, secure parent PIN, installable offline cache, or 3D racing rivals in the MVP. The race is a simple road/lap challenge.
- Text answers match one adult-defined answer, not equivalent math expressions or alternative spellings.

## Licensing

Original code, content, and SVG illustrations: MIT. Third-party notices, source revisions, changes, and the repository investigation are documented in [THIRD_PARTY.md](THIRD_PARTY.md). Preserved full notices are in `public/games/*/LICENSE.txt`.
