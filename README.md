# Hero Academy V2

A first-grade learning adventure with short missions, encouraging retries, effort rewards, an original comic-book superhero interface, and an earned arcade. React + Vite + TypeScript + plain CSS. No backend, account, subscription, advertising, or analytics.

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
3. In Arcade, exchange **10 stars for a ticket** by default. Choose a game and read its control briefing; no ticket is spent while browsing. **Launch game** spends one ticket and starts a **three-minute** session. A visible countdown warns during the final 30 seconds. At zero, the iframe is removed and the dashboard returns.
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
- Arcade: **Super Kart 3D**, imported from Feco Linhares’s MIT Three.js racer: two tracks, five AI rivals, six drivers, drifting, power-ups, auto-go/steering assists, keyboard and touch controls. Starts on the Neon City circuit at 50cc with assists enabled.
- **Galactic Patrol**, adapted from Jafnee Jesmee’s MIT Generic Space Shooter: varied enemies, waves, collision/shield systems, weapon upgrades, CC0 Kenney ship sprites, auto-fire, keyboard and touch flight.
- Both games have real gameplay previews, a pre-launch control briefing, host pause/mute controls, expanded play, voluntary exit, a countdown, and automatic unloading. Pause **does not stop the ticket deadline**. Switching browser tabs pauses gameplay until you resume.
- “Switch to 2D” loads a lightweight classic fallback **inside the same paid session**, preserving its deadline. Star Defender and Cosmic Rally remain as these fallback adapters. 3D needs WebGL; fallback games work without it.
- Original generated masked-hero city key art, geometric SVG mission illustrations, large answer buttons, calm learning screens, responsive layouts, optional local-device read aloud.

## Tests

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Browser tests use installed Google Chrome (`channel: chrome`). For CI without Chrome, install it with `npx playwright install chrome` or change the channel to an installed Playwright browser. Tests cover a full five-question mission, retry behavior, reload persistence, ticket spending, live game adapters, expiry/unloading, adult homework confirmation, custom prompts, export, and tablet layout. Unit tests cover reward boundaries, full V1 save compatibility with either legacy game ID, local game registration/assets, settings normalization, and every learning skill at both math levels. The new browser suite actually drives the 3D kart against five AI opponents, flies/fires the space fighter, checks pause/fallback/expiry and unchanged ticket balances, verifies there are no missing game assets or external requests, and returns to learning.

## Project layout

- `src/model.ts`: versioned save schema, star/ticket rules, session deadlines, hydration.
- `src/learning.ts`: small original question generator and content bank.
- `src/Activities.tsx`: one-question missions and homework/break timers.
- `src/Arcade.tsx`: control briefings, real screenshot previews, isolated game host, pause/mute/expanded mode and deadline enforcement.
- `src/Parent.tsx`: adult gate, settings, custom questions, progress, export/reset.
- `src/games.ts`: modular game registry. Add a self-contained local game and register its title/path here.
- `public/games/`: vendored/adapted game engines and preserved MIT license texts.
- `src/Art.tsx`: geometric SVG mission badges. `public/art/` contains original city art and screenshots captured from the actual imported games.
- `vendor/`: pinned, selectively vendored game sources and Academy adapters. `scripts/build-games.mjs` and `build-space.mjs` produce the checked-in self-contained distributions. No external fonts, music files, CDNs or game APIs are needed.

To rebuild the imported games after editing their source:

```sh
npm run build:games
npm run build
```

The application does not import Three.js into its own runtime. The approximately 1 MB kart bundle loads only when a kart session is launched.

## Deployment

GitHub Actions validates pushes to `codex/hero-academy-v2`; **deployment requires a manual workflow dispatch after validation**. This keeps the previous live version safe during development. Select “Validate and deploy Hero Academy” → “Run workflow” → `codex/hero-academy-v2`, or:

```sh
gh workflow run pages.yml --ref codex/hero-academy-v2
```

Repository Settings → Pages must use **GitHub Actions**. The `github-pages` environment must allow the V2 branch. `vite.config.ts` retains base `/hero-academy/`. Source game bundles are rebuilt and verified against the committed distribution in CI.

## Privacy, storage, and limits

- Progress uses only `localStorage['hero-academy:v1']` on the current origin/browser/device. No child names or personal details are requested. Do not put sensitive personal information in custom prompts or shared exports.
- The app makes no analytics, advertising, backend, external-font, or game-asset requests. GitHub Pages receives ordinary hosting requests. Read aloud only selects an English voice marked local by the browser; availability varies by OS/browser. Game audio is generated locally with Web Audio and starts muted unless enabled. The host mute control remains authoritative; no third-party recordings are shipped.
- Saves with unknown versions or invalid progress are left untouched and can be exported for recovery. Unavailable/full browser storage produces a warning and export option.
- A game deadline survives reloads and time in background tabs. The game is removed at the next browser tick after expiry; suspended pages cannot run until the OS resumes them. A ticket is consumed on launch, including early exits. In-progress learning missions and homework focus rounds reset when you leave their screen/reload; stars already earned stay saved. Use one tab at a time to avoid competing local saves.
- This is practice content, not a full curriculum or adaptive assessment. Reading/phonics content is a compact starter bank. No cross-device sync, cloud backup, JSON import, secure parent PIN, or installable offline cache. The 3D game auto-selects a conservative quality profile; weaker devices can use the 2D fallback.
- Text answers match one adult-defined answer, not equivalent math expressions or alternative spellings.

## Licensing

Original code, content, and SVG illustrations: MIT. See public/art/ATTRIBUTION.md for key-art generation provenance and gameplay screenshot credits. Third-party notices, source revisions, changes, and the repository investigation are documented in [THIRD_PARTY.md](THIRD_PARTY.md). Preserved full notices are in `public/games/*/LICENSE.txt`.
