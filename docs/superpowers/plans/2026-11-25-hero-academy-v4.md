# Hero Academy V4 Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task by task. User selected the illustrated approach and requested continued implementation.

**Goal:** Deliver the approved cinematic illustrated redesign, with the user's additional punk-comic collage direction.
**Architecture:** Preserve pure learning/save/reward logic. Replace the presentation shell and Home, add dedicated Learn and Rewards destinations, apply a shared comic design system, and mount a finite presentation-only celebration layer.
**Tech Stack:** Existing React, TypeScript, Vite, Lucide, CSS/SVG, local original WebP artwork. No new animation runtime.
**Spec:** ../specs/2026-11-25-hero-academy-v4-design.md

## Global Constraints

- Keep save key/schema, learning evidence, test privacy, games, ticket deadlines and reward safeguards unchanged.
- Five primary destinations: Home, Learn, Arcade, Rewards, Grown-ups.
- Original artwork; no deployed franchise reference images.
- Both saved and OS reduced-motion preferences suppress spatial effects. Existing sound setting controls optional locally generated sound.
- Static GitHub Pages base `/hero-academy/`, no external runtime services or tracking.

## Review Focus

- Disabled subjects: Home/Learn do not expose them.
- Assessment privacy: no effects or live rewards leak test correctness.
- Narrow/zoomed layouts: labeled controls remain usable without horizontal overflow.
- Navigation focus: route changes reach main content without breaking active spelling input focus.
- Reload/exit: reward state and game deadlines retain existing behavior.

### Task 1: Navigation and rewards
Files: modify src/App.tsx; create src/Menu.tsx; test e2e/v4.spec.ts.
Interfaces: Menu consumes State and callbacks for subject, spelling HQ, homework, arcade and break; Rewards consumes State and Change. Reuse redeemTicket.
- [x] Write browser checks for five destinations, Learn/Homework reachability, Rewards exchange and disabled subjects.
- [x] Run new checks against V3 and confirm expected missing-navigation failures.
- [x] Replace sidebar with labeled horizontal/bottom navigation, compact balances, skip link and page-change focus; implement Home/Learn/Rewards.
- [x] Run new navigation checks and existing behavioral suite; preserve old accessible subject/start names where practical.

### Task 2: Artwork and full visual system
Files: create public/art/multiverse-city.webp and src/v4.css; modify src/main.tsx, src/Art.tsx, public/art/ATTRIBUTION.md.
- [x] Generate and inspect original panoramic punk-comic hero/city artwork, encode local WebP, record prompt.
- [x] Build navy/ink palette, red/cyan/violet/orange subject panels, torn-paper branding, halftone/collage textures and responsive menu.
- [x] Style all existing major screens consistently; preserve conventional lesson typography and adult forms.
- [x] Capture desktop/tablet/mobile screenshots after fonts/art settle; inspect and correct composition, contrast, spacing and overflow.

### Task 3: Finite effects
Files: create src/Effects.tsx; modify src/Activities.tsx, src/spelling/WeeklyHQ.tsx, src/App.tsx and src/v4.css; extend e2e/v4.spec.ts.
Interface: celebrate(kind: 'correct'|'victory'|'reward', combo?: number): void; EffectLayer consumes current sound/reducedMotion and quiet/adult screen flags. Presentation never grants rewards.
- [x] Add behavioral checks for OS/saved reduced motion and no test-mode effects before results.
- [x] Implement bounded impact, combo flame, electric accomplishment, stars targeted to actual balance, finite confetti, original hero reaction and optional Web Audio tone with cleanup.
- [x] Wire only general correct answers, verified non-test spelling feedback/completion and successful ticket exchange.
- [x] Confirm mute/reduced-motion and test privacy behavior.

### Task 4: Verification and delivery
Files: update README.md, THIRD_PARTY.md, docs/v4-tool-research.md; screenshots in local review output.
- [x] Run typecheck, lint, all unit tests, all browser tests and production build.
- [x] Review screenshots of Home, Learn, HQ, lesson, Homework, Arcade, Rewards, adult settings and dialogs across three viewport sizes; include 320px and keyboard-focus checks.
- [x] Check local asset loading, runtime requests, exact notices and bundle sizes. Update documentation and report actual results and remaining limitations.
- [x] Leave changes reviewable locally; no deployment requested.

## Delivery verification

Completed November 25, 2026. Typecheck, lint, 28 unit tests, 28 browser tests and production build passed. Production review captured 38 screens across desktop/tablet/mobile and 320px, with zero browser/asset/external-request/overflow or automated WCAG A/AA findings. Independent review findings were fixed and covered by regression checks. See ../../v4-verification.md. Changes remain local on codex/hero-academy-v4; no deployment performed.
