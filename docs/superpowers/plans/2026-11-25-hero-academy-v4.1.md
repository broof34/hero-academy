# Hero Academy V4.1 Implementation Plan

> Use superpowers:executing-plans inline. User explicitly authorizes independent decisions and implementation without another design gate.

**Goal:** Polish existing V4 with original graphic comic feedback, varied local audio, independent audio preferences, safe optional speech and usability refinements.
**Architecture:** Keep learning/reward engines intact. Add a presentation-only feedback policy and reusable SVG burst art; centralize Web Audio and local speech; extend the existing version-1 settings with normalized backward-compatible defaults. No new music soundtrack, game mode, curriculum, currency or network service.
**Tech stack:** Existing React/TypeScript/CSS/SVG, native Web Audio and local browser speech synthesis. No added runtime library.
**Spec:** User's pasted V4.1 request dated November 25, 2026, plus existing V4 design. Attached comic images are visual references, never deployed assets.

## Global constraints

- Keep hero-academy:v1, reward safeguards, games/deadlines, spelling evidence and test privacy.
- Effects are finite, nonblocking, canceled before next question and suppressed for OS/saved reduced motion.
- Local English speech only, cancel on navigation/hidden/mute, never auto-speak a hidden spelling target or its sentence.
- Keep legacy sound meaning for speech; independent effects mute/volume, speech volume/rate, auto-read and encouragement preferences. Migrate older sound=true saves to both channels enabled. Existing kart music has its own persisted mute/volume; all other activities stay music-free.
- Streaks are ephemeral presentation state across existing practice activities, reset on mistakes/reload, never a new score/reward. Test turns do not update public streaks.

## Review focus

- Old saves and invalid audio values normalize without lost rewards.
- Silent/speech-only/effects-only settings behave independently and survive reload.
- Cover/missing/test modes never expose hidden target/sentence through automatic or instruction speech; explicit Hear word remains the legitimate dictation stimulus.
- Audio context unlock/cleanup and late voice availability do not overlap or resurrect canceled speech.
- 320px/touch, long words, reduced motion, and clear adult save confirmation.

### Task 1 — Audio preferences and services
- [x] Add failing unit tests for legacy migration, independent channels, bounds and streak/effect selection.
- [x] Add browser speech adapter tests for local-only voice, cancellation, safe assessment instructions, independent mute and saved controls.
- [x] Extend normalized settings; implement bounded sound engine and local speech with clean lifecycle; shared adult/dialog controls.

### Task 2 — Graphic celebrations
- [x] Test varied correct labels, 3/5/10 thresholds, reset, reduced motion and unchanged star awards.
- [x] Draw original SVG comic bursts for POW/BOOM/ZAP/AWESOME/SMASH/NICE/SUPER/ON FIRE/POWER UP, with explosion shapes, outlines, halftone, ink splashes and impact lines.
- [x] Replace old text effects, add finite shockwaves/electricity/star travel, live flame/electric streak badge and cinematic completion; clear on question advance.

### Task 3 — Speech and usability throughout
- [x] Add replay/optional auto instruction speech to menus, briefing, lessons, homework/break, HQ and spelling turns/results.
- [x] Speak math operators conventionally; include reading passage but no answer choices/hidden spelling answer. Explicit spelling word replay uses word + sentence only in study/builder modes; dictation speaks target only.
- [x] Improve lesson next-action focus, gentle retry feedback, press/progress states, adult settings order and save confirmation.

### Task 4 — Review and verification
- [x] Research tool/license decisions and record original art/audio provenance.
- [x] Run unit/browser/typecheck/lint/build. Audit production screenshots desktop/tablet/mobile/320px; touch and preference checks; record representative animations and synthesized audio if practical.
- [x] Fresh independent final review, fix actionable issues, rerun relevant/full checks, report limitations and local preview.

## Completion record

Completed November 25, 2026. 36 unit tests, 35 production browser tests, typecheck, lint and build passed. 44 production screen captures audited with no issues; touch, real Web Audio, master/channel settings, production auto-read and assessment privacy checked. 52 actual browser animation frames sampled into a GIF; an original synthesis palette rendered as WAV. Independent review findings were fixed and regression-tested. See ../../v41-verification.md.
