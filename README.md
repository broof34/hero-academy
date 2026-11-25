# Hero Academy V4.1: Multiverse Edition

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
4. Open **Grown-ups** in the main navigation and solve the multiplication check to edit subjects, math difficulty, stars per ticket, focus/break/game durations, speech, and reduced motion. At least one subject stays enabled.
5. Add custom math/spelling prompts and their exact answers; choose **My grown-up’s questions** in a new mission. Answers ignore leading/trailing spaces and letter case.
6. Homework supports focus, pause/resume, adult-confirmed effort, and a non-screen break. An adult can also reward persistence before the timer ends. A focus round awards three stars once, then enters break time.
7. Export progress as JSON before clearing browser data. Reset requires a separate explicit confirmation.

The grown-up check is a friendly gate, **not a secure parental control**. Browser-local software cannot prevent a technically knowledgeable user from editing their save, clock, or opening game files directly.

## Weekly spelling (V3)

In **Grown-ups → Weekly Spelling Lists**, name a list, paste comma/newline-separated words, and optionally set its test date. Edit individual words and example sentences, choose the active week, archive/reuse lists, and inspect mastery, commonly missed words and recent practice results. Export a spelling list as JSON and import it on another device; this transfers words, sentences and date only, never rewards or learning evidence. Full progress export remains available separately.

**Spelling HQ** offers Flashcards, Word Builder, Missing Letters, Look/Cover/Spell/Check, Listen and Spell, Practice Test, Tricky Word Review, and Mixed Training. The existing general spelling missions remain separate. Every school word generates its own activities, including repeated letters, accents, spaces, apostrophes and hyphens. Use physical keys, large screen keys or indexed letter tiles.

Recognition, assisted spelling, independent spelling and test evidence are tracked separately per normalized word across lists. Mastery requires **three consecutive independent successes in distinct sessions**; study, tiles, missing letters, cover practice and adult help cannot establish mastery. Misses are prioritized, mastered words become due again, and Mixed Training can revisit due words from other unarchived lists. Ordinary training uses up to eight words; a randomized test covers the entire list. Tests stage answers privately until completion: no correctness feedback, progress or correctness-based stars appear mid-test. A completed test awards two effort stars plus one per correct spelling; other completed sessions award one effort star plus one per correctly spelled answer. Flashcard views earn no per-word stars. Mistakes never subtract stars.

Local English text-to-speech reuses the existing speech setting. If unavailable, a grown-up can unlock a private reading card, read it aloud and hide it before spelling. Such turns remain marked assisted after a reload. Example sentences appear during study and tile building, or in that private card; they stay hidden during covered, missing-letter and independent turns. Spelling inputs disable autocorrect, autocomplete and spellcheck where the device permits.

Weekly sessions resume after reload and each turn is committed once. Save & leave pauses a session; ending an unfinished test discards its staged answers without test rewards. Editing a list affects future sessions; an existing session keeps its original word snapshot. Lists support up to 100 words, 100 lists and 50 recent completed sessions. Progress belongs to the same normalized word across weeks; archiving does not erase evidence. List import is limited to the documented version-1 spelling-list JSON format, 200 KB. These are practice indicators, not a validated assessment. There is no cloud sync; transfer a list to practice it elsewhere with separate device progress.

Reused MIT SchoolWordList's three-success mastery/revision logic and Brightleap's due/unseen/future ordering and shuffle in a compact local engine; the parent interface, eight modes, save integration and reward handling are new. Exact pinned revisions, modifications and full notices are in [THIRD_PARTY.md](THIRD_PARTY.md).

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

Browser tests use installed Google Chrome (`channel: chrome`). For CI without Chrome, install it with `npx playwright install chrome` or change the channel to an installed Playwright browser. Weekly tests additionally cover all eight modes, repeated-letter tiles, one-letter tablet practice, parent editing/actual JSON transfer, hidden assessment answers/rewards, adult-assisted reloads, mastery and review queues, old-save hydration and duplicate submission protection. Tests cover a full five-question mission, retry behavior, reload persistence, ticket spending, live game adapters, expiry/unloading, adult homework confirmation, custom prompts, export, and tablet layout. Unit tests cover reward boundaries, full V1 save compatibility with either legacy game ID, local game registration/assets, settings normalization, and every learning skill at both math levels. The new browser suite actually drives the 3D kart against five AI opponents, flies/fires the space fighter, checks pause/fallback/expiry and unchanged ticket balances, verifies there are no missing game assets or external requests, and returns to learning.

## Permanent design workflow

Read [AGENTS.md](AGENTS.md) and [DESIGN.md](DESIGN.md) before visual work. Three
project-scoped design skills live in `.agents/skills/` and travel with this repo.
[Design workflow and resource review](docs/design-workflow.md) records installation,
pinned licenses, local adaptations, discovery verification and update instructions.

## Project layout

- `src/spelling/`: list schema/validation, pure adaptive engine, parent manager and eight-mode HQ.
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

Pages **Settings → Build and deployment → Source must be GitHub Actions**
(`build_type: workflow`). Publishing the repository root from a branch serves
the uncompiled Vite entrypoint and produces a blank screen. The workflow checks
this setting, validates compiled assets and runs production browser tests before
publishing, then verifies the public site and its commit marker after deployment.

```sh
npm run build
npm run check:build
npm run test:production
HERO_TEST_URL=https://broof34.github.io/hero-academy/ HERO_EXPECTED_SHA=<deployed-commit> npm run test:production
```

The production tests assert visible homepage/navigation, answer a math question,
reload persisted progress, and exercise missing-module/runtime/storage recovery.
They use isolated browser storage and never alter another browser's saved data.
Startup recovery can reload or export a save; it never automatically resets it.

GitHub Actions validates pushes to `codex/hero-academy-v3` and `codex/hero-academy-v4`; **deployment requires a manual workflow dispatch after validation**. This keeps the previous live version safe during development. Select “Validate and deploy Hero Academy” → “Run workflow” → `codex/hero-academy-v4`, or:

```sh
gh workflow run pages.yml --ref codex/hero-academy-v4
```

Repository Settings → Pages must use **GitHub Actions**. The `github-pages` environment must allow the V4 branch. `vite.config.ts` retains base `/hero-academy/`. Source game bundles are rebuilt and verified against the committed distribution in CI.

## Privacy, storage, and limits

- Progress uses only `localStorage['hero-academy:v1']` on the current origin/browser/device. No child names or personal details are requested. Do not put sensitive personal information in custom prompts or shared exports.
- The app makes no analytics, advertising, backend, external-font, or game-asset requests. GitHub Pages receives ordinary hosting requests. Read aloud only selects an English voice marked local by the browser; availability varies by OS/browser. Game audio is generated locally with Web Audio and starts muted unless enabled. The host mute control remains authoritative; no third-party recordings are shipped.
- Saves with unknown versions or invalid progress are left untouched and can be exported for recovery. Unavailable/full browser storage produces a warning and export option.
- A game deadline survives reloads and time in background tabs. The game is removed at the next browser tick after expiry; suspended pages cannot run until the OS resumes them. A ticket is consumed on launch, including early exits. In-progress learning missions and homework focus rounds reset when you leave their screen/reload; stars already earned stay saved. Use one tab at a time to avoid competing local saves.
- This is practice content, not a full curriculum or adaptive assessment. Reading/phonics content is a compact starter bank. No cross-device sync, cloud backup, full-save JSON import, secure parent PIN, or installable offline cache. The 3D game auto-selects a conservative quality profile; weaker devices can use the 2D fallback.
- Text answers match one adult-defined answer, not equivalent math expressions or alternative spellings.

## Licensing

Original code, content, and SVG illustrations: MIT. See public/art/ATTRIBUTION.md for key-art generation provenance and gameplay screenshot credits. Third-party notices, source revisions, changes, and the repository investigation are documented in [THIRD_PARTY.md](THIRD_PARTY.md). Preserved full notices are in `public/games/*/LICENSE.txt`, `vendor/*/LICENSE` and `public/licenses/`.

## V4 illustrated interface

Home, Learn, Arcade, Rewards and Grown-ups are the five main destinations. Home uses original punk-comic key art, angled halftone subject panels and a single Continue learning action. Resume learning returns directly to a saved weekly spelling activity. General spelling and weekly Spelling HQ remain separate; Learn also includes Homework and screen-free breaks. Rewards exchanges the existing stars/tickets using unchanged safeguards. Grown-ups keeps conventional type and forms, with direct section links.

Correct answers trigger short comic impacts and stars flying toward the balance. Three first-attempt successes in a row add a brief flame pulse; this is a visual effect, not a new score. Completion and ticket exchange get finite electricity/confetti and an original hero portrait reaction. Weekly tests never show correctness effects before results. Both OS and saved reduced-motion preferences suppress decorative motion. The existing sound toggle now also controls quiet locally synthesized celebration tones; sound remains off by default. The final spelling-test answer opens its completed report immediately so the saved reward cannot reveal correctness ahead of the report. Supporting HQ word/history sections are collapsible; dialogs restore keyboard focus and long list names wrap on narrow screens.

All new art and fonts are local. No new runtime packages, tracking, network service or save migration was added. The app remains a static GitHub Pages site. Art provenance and the local Bangers font license are documented in `public/art/ATTRIBUTION.md`, `public/fonts/Bangers-OFL.txt` and `THIRD_PARTY.md`. Research: `docs/v4-tool-research.md`.

To reproduce the desktop/tablet/mobile visual capture using the development server on port 5174:

```sh
npm run dev -- --port 5174
HERO_REVIEW_DIR=/tmp/hero-academy-v4-review node scripts/review-v4.mjs
```

The capture script checks browser errors, failed local assets and horizontal overflow. Optional `HERO_AXE_PATH=/absolute/path/to/axe.min.js` enables a locally injected axe-core accessibility audit; axe is a review tool and is not included in the application runtime.

## V4.1 — Visual polish, sound design and usability

Correct answers now use original vector comic bursts with halftone shading, heavy ink outlines and varied lettering. Three consecutive first-attempt practice successes trigger fire, five electricity and ten a larger celebration. This is an ephemeral practice streak across existing activities, not another currency or stored assessment metric; mistakes reset it without losing stars, tests do not update it, and reloading resets it. Advancing clears old effects. Progress bars and press states animate briefly, with both reduced-motion preferences honored.

The header's **Audio settings** opens an independent effects, kart music and spoken-instruction mixer. Master mute preserves the selected channels. Volume, speech speed, automatic instructions and spoken encouragement save locally. The grown-up form uses the same live audio preferences; saving learning settings does not overwrite them. Kart music is independently muted by default. The game's own mute/pause controls remain available in a session.

Speaker buttons replay menu/activity instructions, math questions, reading passages, homework/break guidance and game briefings. Optional auto-read uses an installed local English voice; it stays silent while dialogs are open or the page is hidden. It never automatically reads a hidden spelling word/sentence. **Hear word** deliberately speaks the dictation target; study/builder modes may include its example sentence, while test/listen/cover/missing modes do not. If no local voice exists, the page offers a clear message and existing adult reading assistance remains available.

New modules: `src/ComicBurst.tsx`, `feedback.ts`, `audio.ts`, `speech.ts`, `ReadAloud.tsx`, `AudioControls.tsx`, `useAudio.ts` and `v41.css`. No new runtime package or service was added. Version-1 saves hydrate new settings with safe defaults; old sound-enabled saves retain both speech and effects.

Review tools:

```sh
HERO_TEST_URL=http://127.0.0.1:5176/hero-academy/ npm run test:e2e
HERO_REVIEW_DIR=/tmp/hero-academy-v41-review node scripts/record-v41.mjs
HERO_REVIEW_DIR=/tmp/hero-academy-v41-review node scripts/sample-audio-v41.mjs
```

The first command targets a running production preview. The recording script captures real Chrome frames through two five-question activities; the audio sampler uses the actual exported synthesis recipes in an OfflineAudioContext and requires the development server on port 5174. Review media stays outside public assets.
