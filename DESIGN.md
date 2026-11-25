# Hero Academy — Multiverse Edition

## Intent and audience

Opening the app should feel like opening an original superhero video game.
Use cinematic city key art and a punk comic collage vocabulary inspired by the
energy of Across the Spider-Verse and Spider-Punk: halftone, ink, torn paper,
misregistered chromatic outlines, dramatic lighting and angled compositions.
Create distinct characters and symbols; do not reproduce franchise costumes,
logos, movie frames or reference illustrations. The learner is a first grader;
the grown-up may be a grandmother who needs familiar, readable controls.

## Foundations

The implementation sources of truth are `src/v4.css`, `src/v41.css` and shared
components. Extend existing semantic variables instead of inventing a new palette.

| Role | Current value / use |
| --- | --- |
| Canvas | `#060812`, near black |
| Navy | `--navy: #0b1021` |
| Panel | `--panel: #111827` |
| Borders | `--line: #35425b` |
| Text / muted | `#f6f7fc` / `--muted: #b9c4d9` |
| Electric red | `--red: #ff3856` |
| Cyan | `--blue: #55dfff` |
| Warm reward accent | `--yellow: #ffcf62`; orange for fire |
| Violet | Established portal/reward/reading accent; retain matching existing styles |
| Headings | Local Bangers (`Academy Display`), OFL; brief comic display text |
| Body / instructions / grown-ups | Arial, Helvetica Neue, system sans-serif |

Use bold hierarchy, deliberate negative space and consistent alignment. Make
navigation and main actions large and recognizable. Decorative panel edges may
angle; text, hit areas and focus outlines must remain readable and usable.
Avoid pastel dashboards, excessive rounded cards, childish mascots, dense home
copy, generic gradients and unrelated brand templates. Textures belong behind
artwork or margins, never across instructions or answer fields.

## Screen rules

- **Home:** original layered city/hero artwork, one obvious continue action,
  clear subject choices and concise progress. Existing local WebP is the key art.
- **Navigation:** Home, Learn, Arcade, Rewards, Grown-ups. Pair recognizable icons
  with words, expose active state, preserve predictable back/exit behavior.
- **Learn / Spelling / Math / Reading / Homework:** calm central task, one question
  at a time, conventional instruction type, persistent clear next/help controls.
  Comic framing supports the task without competing with it.
- **Arcade / Rewards:** stronger art, color and rare celebratory effects are welcome.
  Currency, launch cost and session controls must remain explicit.
- **Grown-ups:** clean conventional layout, descriptive labels, ample spacing,
  readable forms and clear feedback. Decoration is secondary to managing learning.

## Interaction and motion

Use the reusable `ComicBurst`, `Effects` and feedback system; keep effects finite
and remove their layers/listeners after completion. Prefer CSS transform/opacity
and SVG over continuous shaders or new runtimes. Fast press feedback supports
frequent actions; rare victories may be more expressive. Practice streak fire,
electric accomplishments and star travel must not obscure tasks or alter rewards.
No flashes, scroll-jacking, perpetual lesson animation or blocking transitions.
Check both saved reduced motion and `prefers-reduced-motion`; essential state
must remain visible with effects disabled. Use optional original synthesized
sound through the existing audio system; never autoplay or fetch recordings.

Every interactive component needs default, hover, focus-visible, pressed,
disabled and applicable loading/error states. Support keyboard, pointer and touch;
hover alone cannot reveal an essential control. Target 48px controls, visible
focus, WCAG AA contrast, labeled inputs and feedback beyond color alone.

## Review loop

State the screen's main action, inspect the relevant skills, implement within
this system, then review real desktop/tablet/mobile screenshots. Include 320px
overflow, 200% zoom, keyboard focus, touch, artwork crops, saved settings and
reduced motion. Exercise the affected learning/reward/game flow. Inspect the
network and console; keep assets local, compressed and appropriately licensed.
Record observed evidence rather than declaring quality from a successful build.

## How the reference resources inform this system

- **Taste:** specific art direction, clear hierarchy, purposeful copy, consistent
  controls and browser review. Its company-site layout, no-violet/no-angle rules,
  photo quotas and mandatory effect dealers are deliberately excluded.
- **UI/UX Pro Max:** use focused local accessibility, interaction and React lookups.
  Existing Hero Academy tokens override palette/font/template suggestions.
- **Design Motion Principles:** weight motion by frequency and context. Learning
  and adult management need restraint; rare accomplishments can carry delight.
- **Awesome Claude Design:** keep token, rule and rationale together in this file;
  document component patterns consistently. Do not copy a catalog brand system.
- **DESIGN.md Chrome:** inspect computed styles to verify tokens, component states
  and responsive behavior, then document deliberate decisions. Extracted values
  are observations, not proof of accessibility or permission to copy assets.

Pinned sources, licenses, review scope and updates: `docs/design-workflow.md`.
