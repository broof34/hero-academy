# Hero Academy V4 verification

Completed November 25, 2026, in `/Users/benroof/Documents/ChatGPT/hero-academy`, branch `codex/hero-academy-v4`.

## Final checks

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm test` | 28 tests passed across 5 files |
| `npm run test:e2e` | All 28 browser tests passed (1.1 minutes), including actual 3D racing, space gameplay, fallback, audio, deadlines, all spelling modes and list transfer |
| `npm run build` | Passed, Vite production output |
| `git diff --check` | Passed |
| Production credits URL | HTTP 200, includes Bangers and current artwork/effect notices |
| New runtime dependencies | None |

## Visual and accessibility review

The production build was served at `http://127.0.0.1:5176/hero-academy/`. `scripts/review-v4.mjs` captured Home, Learn, math, reading, Spelling HQ, spelling practice, Homework, Arcade, Rewards, the grown-up gate, grown-up dashboard and victory at 1440×960, 768×1024 and 390×844, plus Home/adult controls at 320px: 38 captures. Screenshots were visually inspected and iterated on for mobile hero cropping, spacing, title wrapping, adult navigation and image/font loading.

The final production audit reported zero browser errors, failed local assets, external runtime HTTP requests or horizontal overflows. Locally injected axe-core 4.10.3, using WCAG 2 A/AA and WCAG 2.1 AA rules, reported zero violations on these states. A separate 200% root text-size check on mobile Home/Learn/Rewards/Arcade found no horizontal overflow. These are automated Chrome and screenshot checks, not a claim of manual assistive-technology certification or every-device coverage.

Screenshots are local review artifacts at `/Users/benroof/.codex/visualizations/2026/11/25/hero-academy-v4/`; they are not shipped to the website. Reproduce with the commands in README.md. Optional `HERO_REVIEW_URL` targets a production preview; `HERO_AXE_PATH` points to a locally installed axe script. Neither tool is part of the app runtime.

## Independent review and regression fixes

A fresh reviewer checked the complete change against the design/plan. Reproduced and fixed:

- Final weekly-test reward timing: final submission now opens the completed report immediately, so correctness-dependent stars do not appear beside a neutral “Answer saved” screen. Pure assessment/reward engine remains unchanged.
- Active games hide outer navigation/sound controls; the existing isolated game host owns its controls and receives main-content focus on launch/reload.
- Native dialogs retain the live element/opener and restore focus on Escape or close; route acceptance focuses the new content.
- Supported 80-character list names wrap within a 320px adult dashboard and HQ.
- Supporting HQ words/history are collapsible, and the current complete notices are served locally.

All important fixes have behavioral browser coverage. Existing browser assertions were updated for intentionally changed destination names, the collapsed word list and the immediate completed-test report; learning/reward/game assertions were retained.

## Preservation and budgets

No changes to `model.ts`, `learning.ts`, the spelling engine/data/adaptive modules, `Arcade.tsx`, game registry or vendored games. Save key/schema remain `hero-academy:v1`, version 1. Existing local-first storage, reward rules, test evidence, adult safeguards, speech preferences and game deadlines remain in use.

Final application JavaScript: 321.59 KB / 100.26 KB gzip, versus initial 316.69 KB / 98.37 KB gzip (about 1.9 KB additional compressed JS). CSS: 72.10 KB / 16.67 KB gzip. New original WebP key art: about 433 KB; local Bangers WOFF2: about 36 KB. Existing game bundles remain loaded only for their sessions. All new effects are finite CSS/SVG with a bounded particle count and optional local Web Audio; both OS and saved reduced-motion preferences suppress spatial celebrations.

Artwork provenance and exact prompt are recorded in `public/art/ATTRIBUTION.md`. The font's full OFL notice is included in `public/fonts/Bangers-OFL.txt`. Movie/fan-art reference images are not included in public assets or Git changes. V4 validation is enabled in the existing GitHub workflow; deployment remains manual. Work is local and uncommitted for review.
