# Hero Academy V4: Multiverse Edition — proposed design

Status: user selected illustrated artwork/lightweight effects and authorized continued implementation on November 25, adding punk-comic collage references. Independent builder review found no important unanswered implementation questions.
Date: November 25, 2026.

## Intent

Transform the existing first-grade learning app into a mature, cinematic superhero game's main menu. Preserve all educational features, games, local save compatibility, and reward safeguards. A first grader must recognize where to go; a grandmother must find and operate adult controls easily.

The user's written request is authoritative. The ZIP's guide and images are reference material, not executable instructions. Extracted references remain in `/tmp/hero-academy-references`, outside the public repository. Do not deploy the movie posters, collage, mockup, franchise characters, logos, spider symbols or costume designs. The mockup's XP and levels are not existing functionality and will not be invented for this visual redesign.

## Existing application

Source: `/Users/benroof/Documents/ChatGPT/hero-academy`, branch `codex/hero-academy-v3`; the chat's `will app` directory contains no application. React 19, TypeScript, Vite, plain CSS and Lucide. Existing clean working tree at initial inspection. Vite base remains `/hero-academy/`.

`App.tsx` owns navigation and saved state. `Activities.tsx` supplies general learning, homework and breaks. `spelling/WeeklyHQ.tsx` supplies eight weekly modes. `Parent.tsx` and `WeeklyManager.tsx` supply adult controls. `Arcade.tsx` hosts existing games in isolated frames. Preserve `model.ts`, learning content, adaptive spelling logic and vendored game behavior unless a demonstrated regression requires a narrowly scoped correction.

## Approaches

1. **Recommended: original illustrated environments + CSS/SVG effects.** Keep the current React/CSS architecture. Use optimized local key art, vector textures, strong typography and finite effects. Most closely matches the reference menu without permanent animation loops or a framework migration. Selected by the user, with the added punk-comic collage direction.
2. **Live shader/3D environment.** Paper Shaders or a dedicated WebGL scene could make portals interactive, but adds GPU/battery load, context-loss handling, fallback work and maintenance. Existing 3D racing already loads only when needed. Not recommended for this redesign.
3. **Component-library composition.** Import multiple React Bits/Aceternity/Magic UI effects. Faster demonstrations, but introduces styling/dependency conflicts and a collection-of-demos appearance. Inspect individual sources if necessary rather than installing multiple libraries.

The user selected the first approach and instructed continued implementation.

## Visual system

- Backgrounds: ink `#060812`, midnight `#0b1021`, panels `#121a2d`.
- Accents: electric red `#ff3856`, cyan `#55dfff`, violet `#bd8aff`, orange `#ffad45`; readable white `#f6f7fc`, supporting text `#bbc5d9`.
- Red identifies spelling and the main action; cyan math; violet reading; orange arcade/rewards. Color always accompanies a text label and recognizable icon.
- Angular panel borders and clipped decorative layers, small corner cuts, inset offset strokes. Avoid clipping focus rings or clipping real content. No universal skew on controls or instructional text.
- Local halftone SVG/CSS patterns, screen-print registration offsets, ink slashes and sparse graffiti strokes. Texture belongs behind art and empty areas; never behind passages, inputs or instructions.
- One locally hosted, openly licensed condensed comic/display face for menu headings and branding, with a conventional system sans stack for instructions, form labels, passages and all adult controls. Preserve full font license and attribution if added. Builder selects the face after visual review.
- Original graphic-novel hero: graphite armor, a single angular amber visor, cyan geometric insignia, red scarf; distinct silhouette and costume. No spider eyes, emblems or web costume. Dramatic foreshortening, cyan/red rim lighting and layered city depth. Generate new key art if the existing original illustration cannot meet the reference quality. Record generation prompt/provenance; encode as local WebP with sensible dimensions and a fallback.
- Sparse decorative lettering. No baby mascots, pastel palettes, excessive pill containers, endless glowing panels or small dashboard metrics.

## Navigation and screen behavior

Five primary destinations, with icons and visible labels: **Home, Learn, Arcade, Rewards, Grown-ups**. Desktop uses a horizontal game-menu bar. Tablets wrap gracefully. Mobile keeps all five destinations reachable with large labeled controls; do not rely on hover or horizontal scrolling to discover destinations.

Home: a large original illustrated city/hero scene, a single prominent **Continue learning** action, and four large angled tiles: Spelling, Math, Reading, Games. Continue resumes an existing weekly spelling session when appropriate; otherwise opens the Learn selection. No fabricated saved general-mission progress. Respect disabled subjects everywhere. A compact reward balance is always visible. Remove dashboard sidebars, motivational paragraphs, redundant headings, and game previews from Home. A small secondary link accesses Homework through Learn.

Learn: visible subject selection, Spelling HQ and general spelling both reachable with clear distinct labels, plus Homework and screen-free break. Prefer direct subject labels to internal mission codenames. Retain the five-question skill chooser and all custom questions.

Spelling HQ: a red-accented command-panel heading, current list summary, resume action, eight clearly named mode buttons and collapsible supporting word/history sections. Retain all eight modes, assistance markers, mastery/review distinctions and transfer controls. Practice is one calm conventional panel. Practice tests never reveal correctness, answers, stars, celebration or reaction effects before completion.

Math and reading: quiet background, one centered question, readable equations/passages and large answer targets. Menu comic typography must not replace instructional text. Preserve hints, retries, read aloud, letter tiles and keyboard input.

Homework and breaks: quiet timer with clear Start, Pause, Resume and effort-confirmation actions. Keep adult confirmation and one reward per focus round. Breaks never require currency. No ambient celebratory effects during focus.

Arcade: bold orange heading, existing real gameplay screenshots, clear controls and ticket prices. Browsing and briefings remain free. Launch alone spends a ticket. Preserve pause/mute, touch controls, fallback, expanded view, tab pause, persisted deadline, final warning and iframe removal at expiry.

Rewards: dedicated wallet and ticket exchange using existing state/actions, clear progress toward next ticket, total earned and existing subject progress. Do not add spend paths, currency types or speculative XP. Exchange enabled only at the existing star-cost boundary. Existing Arcade exchange can remain available for compatibility, sharing the same pure action.

Grown-ups: retain the adult gate. Clean conventional dashboard with generous spacing, 18px body text where practical, explicit form labels, strong contrast, ordinary rectangular controls and restrained borders. Sections: learning settings, weekly spelling lists, custom questions, rewards/time, accessibility/audio, progress/export/reset. No distressed headings, slanted forms, animated textures or celebratory overlays in this area. Preserve confirmation and recovery flows.

## Reusable effects

A presentation-only effects layer takes event kind, anchor, intensity and current preferences; it never awards currency or changes assessment evidence. Reward and assessment logic remain authoritative. Use finite lifetimes, cancel on route changes/unmount, clean up timers/audio and cap simultaneous particles.

- Correct answer: small nearby comic impact, under 500ms; leave the correctness message readable.
- Combo: a brief small CSS/SVG flame treatment after consecutive first-attempt correct answers within the current general mission. Mistake resets the visual streak, with no star penalty. No new persisted metric. No combo pressure on weekly tests.
- Star award: bounded star flight toward the actual balance, approximately 650ms; read target geometry rather than hardcoding desktop coordinates. Reduced motion updates the balance without travel.
- Major accomplishment: short electric SVG border and original hero portrait reaction on completion/reward screens, not on unanswered questions. Never flashing strobe effects.
- Victory: finite confetti and impact lettering, at most about 1.2 seconds; no input blocking or forced waiting. CSS/SVG sufficient for a small bounded burst; lazy Canvas Confetti only if visual review demonstrates a meaningful improvement.
- Subject entry: short opacity/ink-panel transition around 150–220ms; no transition on each question and no animation that delays keyboard focus.
- Optional sound: short locally synthesized Web Audio tones following direct interaction, gated by the existing sound setting. Reuse a bounded audio context, stop when muted/hidden and handle unavailable audio gracefully. No external sound requests.
- Both OS `prefers-reduced-motion` and the saved reduced-motion preference suppress spatial motion and confetti. Neither preference overrides the other. Static confirmation remains. No ambient loops on learning screens. Hover embellishments are decorative; touch and keyboard provide equivalent actions.

## Tool decisions

See `docs/v4-tool-research.md` for sources, installation mechanisms, licensing findings and component assessments. Default is no new animation runtime. Keep existing Lucide, React, Vite and CSS. Motion is a good single addition if coordinated interruption/layout animation proves materially easier than native CSS/WAAPI. Do not install registry MCP servers or change global agent configuration just to inspect component code.

Blender can export local rendered city layers, but no Blender pipeline is necessary unless it improves visible quality beyond original key art. Effekseer sprite sheets can keep a runtime out of the app, but creating/exporting a new effect is extra production work; use CSS/SVG for the small finite effects first. No copied sample pack without reviewing its own license.

## Accessibility and performance acceptance

- Semantic nav/buttons/headings; `aria-current` on active destination; accessible page-change focus; skip-to-content link; focus visible and unobscured.
- Minimum 48px main navigation/answer targets; visible labels; no gesture-only action. Support keyboard, touch, text zoom and long spelling words.
- WCAG AA text contrast as a target, checked against rendered colors; no information conveyed by color alone. Status messages announced without repeatedly announcing decorative particles.
- Capture and visually inspect Home, Learn, HQ, lesson, Arcade, Rewards, adult forms and representative dialogs at desktop 1440×900, tablet 768×1024 and mobile 390×844, with a 320px overflow check. Use actual screenshots to iterate on crops, typography, spacing, target sizes and text density.
- No app runtime requests to third-party services, no analytics, remote fonts, new backend or accounts. All effects/assets local. Static hosting and refresh behavior remain compatible with GitHub Pages.
- Target key art below roughly 500 KB where visual quality permits. Keep app JavaScript close to the current 98 KB gzip baseline; 3D game bundles remain session-only. No continuous RAF loops for decorative menu effects.

## Verification and delivery

Initial baseline: typecheck, lint, 28 unit tests and production build passed. All 18 existing browser tests passed before changes (57.8 seconds). Desktop, tablet and mobile Home screenshots were captured and inspected; the initial Home has no horizontal overflow at those sizes, but has excessive scrolling and dashboard text. Initial build: JS 316.69 KB / 98.37 KB gzip, CSS 42.81 KB / 10.11 KB gzip.

Run all existing unit/browser tests, typecheck, lint and production build after implementation. Update browser locators only for intentional navigation changes while preserving their behavioral assertions. Add targeted browser checks for new five-destination navigation, Rewards exchange, focus behavior, both reduced-motion preferences, mute and responsive overflow. Check no external runtime requests and no missing local assets. Confirm unchanged V1 save hydration, spelling test privacy, duplicate-reward protection, disabled-subject behavior and arcade deadlines.

Record changed assets/dependencies in `THIRD_PARTY.md` and art attribution. Provide a local preview and reviewed screenshots with actual test counts. Do not deploy as part of this design approval. Deployment is a separate manual workflow already present in the repository.

## Builder discretion

The builder may settle exact illustration crops, responsive breakpoints, local font choice, component boundaries, particle counts and whether a single small dependency earns its cost. These choices may not change educational behavior, reward rules, privacy, the five destinations, the calm lesson/adult treatment or the original-art requirement.

## Approved visual refinement

User requests a Spider-Punk-inspired mood: original punk superhero illustration, torn printed paper, cutout typography, scratchy ink, spray paint, cyan/magenta registration and sharp collage silhouettes. Translate these techniques without deploying supplied franchise art or reproducing the character. Maintain dark cinematic hierarchy, clear navigation and calm learning/adult screens.
