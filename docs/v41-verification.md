# V4.1 verification and delivery

November 25, 2026. Prepublication verification of version 4.1.0 on `codex/hero-academy-v4`. Publication uses the repository’s GitHub Pages workflow after these checks.

## Results

| Check | Result |
| --- | --- |
| TypeScript | `npm run typecheck` passed |
| Lint | `npm run lint` passed |
| Unit tests | 36 passed across 9 files |
| Production browser tests | All 35 passed against the production preview (1.3 minutes) |
| Game distributions | Rebuilt both existing bundles with `npm run build:games` |
| Production build | Passed; JS 342.03 KB / 106.79 KB gzip, CSS 81.95 KB / 18.77 KB gzip |
| Runtime dependencies | No additions |
| Whitespace / notices | `git diff --check` passed; public current credits match THIRD_PARTY.md |

V4's compressed app JS was 100.26 KB; V4.1 adds about 6.5 KB compressed app code. Existing art/font assets are unchanged. Game-bundle changes concern audio routing only; gameplay and ticket/deadline rules remain intact.

## Visual, motion and accessibility review

Reviewed actual production Home, Learn, math, reading, Spelling HQ, spelling practice, Homework, Arcade, Rewards, victory, grown-up dashboard, expanded adult audio settings, audio dialog and grown-up gate at desktop 1440×960, tablet 768×1024 and phone 390×844, plus Home/adult settings at 320px: 44 captures. Iterated on phone header spacing, icon-only Home replay control, vector explosion placement, question/next-action focus, and the mixer's always-visible Done footer.

The final audit reported zero failed assets, browser errors, external runtime HTTP requests, horizontal overflows or axe-core WCAG 2/2.1 A/AA findings on these states. A real touch-enabled Chrome context tapped the mixer, answered and advanced a question without overflow. Both saved and OS reduced-motion preferences remain covered by browser tests.

Real Chrome frames through two existing five-question activities demonstrate ordinary impacts, 3-answer fire, 5-answer electricity, a 10-answer celebration and mission completion. A 52-frame sampled reel is encoded as `celebration-reel.gif` (9 fps capture reel; actual runtime animations use CSS/browser frame scheduling). A separate RAF sample during effects measured a mean 16.67 ms and p95 16.8 ms between frames, roughly 60 fps on this desktop. No effect layers remained afterward. These measurements do not certify performance on every phone.

Review artifacts: `/Users/benroof/.codex/visualizations/2026/11/25/hero-academy-v41/`. The original synth palette is `sound-palette.wav`; order: navigation, tap, correct, gentle retry, fire, electricity, star, ticket, legendary, victory. It was rendered from the actual exported recipes with OfflineAudioContext for review; it is not a new runtime asset. UI recordings and audio examples stay outside public assets.

## Speech and audio evidence

Real Web Audio context tests verify running/suspended behavior, and unit tests cover deferred resume/stop ordering. Channel/volume/rate, master mute, legacy save hydration, hidden-target instructions, explicit word stimulus and production route narration are tested. The production tests inject a controlled browser speech adapter to inspect actual utterance text, voice choice, rate, volume and cancellation at the browser boundary.

The native automated Chrome environment reports speech synthesis support but **zero installed local English voices**. Human pronunciation/listening was therefore not verified with a real OS voice here. On the user's device, voice quality/availability depends on installed local English voices and browser autoplay rules. There is no remote-voice fallback, paid API or network speech service. If unavailable, the UI gives a message and retains adult reading assistance. Explicit replay remains available when automatic playback is blocked.

Automatic spelling instructions never receive target words or example sentences. Explicit Hear word is the legitimate dictation stimulus. Only study/builder playback includes the sentence; covered/missing/listen/test modes speak the word alone. No correctness audio, streak, stars or visual effects reveal unfinished test answers; final report and reward appear together as in V4.

## Independent review and fixes

A fresh reviewer found and reproduced production-only early speech cancellation, muted kart music raised by victory ducking, stale adult draft overwriting live audio changes, narration behind a modal, duplicate HQ/turn replay buttons, missing asynchronous dictation error feedback, and a pending resume/mute race. Fixes:

- Route speech cancellation happens in layout before new reader effects schedule; generation guards still protect explicit word playback. Hidden documents/open dialogs suppress auto narration.
- Zero/quiet kart music remains zero/quiet during victory ducking; a dedicated effects bus separates engine/effect/crowd audio from music.
- Adult Save applies only learning/timing/reward/motion fields; audio controls edit the shared live preferences. Master mute preserves selected channels.
- HQ menu and activity each have one context-appropriate replay control. Speech errors reach visible status and adult-help guidance.
- Suspension is queued even while resume is pending; engine quiet state prevents stale event handlers from restarting audio. Explicit adult previews can audition the draft safely.

Regression tests cover these behaviors and all original learning/spelling/game suites pass. One old external-request assertion was generalized from a hardcoded development port to the configured same origin so it also validates production requests.

## Tools and scope

Original React SVG/CSS artwork and native Web Audio/speech synthesis were used. React Bits, Motion, Effekseer, Canvas Confetti, Paper Shaders, tsParticles, Howler, Kenney, JFXR and Bfxr were evaluated; sources and reasons are in `docs/v4-tool-research.md`. No new library, external recording or supplied reference image was imported.

The version-1 save format/key stays compatible. New preferences are additive and normalized. The practice streak resets on mistakes/reload, does not affect rewards/mastery and excludes test turns. No hero customization, new currency, adventure mode, subject or arcade game was added. Public notices and README cover new original graphics/synthesis and changes to the existing MIT game audio adapters.
