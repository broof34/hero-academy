# Third-party code and asset attribution

## Development design guidance

Project-scoped, development-only skills from Leonxlnx/taste-skill (instruction-only
adaptation), nextlevelbuilder/ui-ux-pro-max-skill and
kylezantos/design-motion-principles are vendored under `.agents/skills/` with their
MIT licenses. Pinned revisions, review scope and modifications are recorded in
`docs/design-workflow.md` and `docs/design-resources.lock.json`. These files are
not imported into the website or shipped as runtime dependencies.
VoltAgent/awesome-claude-design and bergside/design-md-chrome informed project
documentation; no catalog brand assets or Chrome extension code were imported.

## Weekly spelling logic (V3)

### SchoolWordList — primary foundation

[jamesf91/SchoolWordList](https://github.com/jamesf91/SchoolWordList), pinned revision `f5b4cbe90c191e4d51825a3d9eda61ea1f2b894a`. MIT, Copyright (c) 2026 J. Fang. Full unmodified notice: `vendor/school-word-list/LICENSE`; shipped with the site at `public/licenses/SchoolWordList.txt`.

Inspected `src/types/index.ts`, parent list UI/hooks, practice flows, `lib/mastery.ts`, `lib/revisionList.ts` and related tests. Adapted the timestamp-sorted three-correct mastery streak and active/older/missed revision pool approach into `src/spelling/adaptive.ts` and the local queue in `engine.ts`. Weekly list/word/attempt organization informed our additive typed schema. Changes: independent/test evidence only, unique session IDs, explicit assisted/recognition counters, timed revisits, up to two older-list review slots, normalized shared word keys and reload-safe session snapshots. No upstream IndexedDB, router, UI, voice infrastructure or full framework was imported. New regression tests validate Hero Academy's distinct-session/reward/save requirements rather than importing incompatible upstream harnesses.

### Brightleap — secondary foundation

[brightleap-app/brightleap](https://github.com/brightleap-app/brightleap), pinned revision `cd3bee4b067a0170eff227e6c2e6f94cfc9fd25b`. MIT, Copyright (c) 2026 Brightleap. Full unmodified notice: `vendor/brightleap/LICENSE`; shipped at `public/licenses/Brightleap.txt`.

Adapted the due/unseen/future queue tiers from `engine/spacedRep.js` and Fisher–Yates copying shuffle from `engine/shuffle.js` in `src/spelling/adaptive.ts`. Added a recently-missed tier and our per-word interval calculation. Inspected adaptive difficulty/audio-first practice as context; retained Hero Academy's existing local speech implementation and wrote the eight-mode interface and evidence/reward integration locally. No authentication, Supabase, backend, arcade, math content, assets or application shell was imported. Additional suggested spelling repositories were unnecessary.

## Bundled game code

### Super Kart 3D (V2 primary, saved ID `racer`)

Source: [fecolinhares/super-kart-3djs](https://github.com/fecolinhares/super-kart-3djs), pinned revision `d94f63da26b6a01ecbfc1e301e5d754ea64649c2`.
Copyright (c) 2026 Feco Linhares. **MIT**. Full notices: `vendor/super-kart/LICENSE`, `public/games/kart/LICENSE.txt`. Runtime Three.js 0.164.1 is MIT, with full notice at `public/games/kart/THREE-LICENSE.txt`.

Selectively imported only `src/`, license, and upstream README; excluded the repository’s roughly 1.4 GB of art experiments, renders, and other archives. Inspection found no external model, texture, font, recording, CDN, tracking or network asset requirements in the selected source. Track, karts, scenery and textures are created procedurally; audio uses Web Audio synthesis. **No franchise art or commercial recordings are included.**

Adaptations: bundled as a classic IIFE plus local CSS using esbuild (runs in an opaque `allow-scripts` iframe without module CORS); replaced private preference storage references with an in-memory store to prevent parent-save access; 50cc, auto-go and steering assist defaults; Neon City default while preserving both tracks; corrected narrow-screen/coarse-pointer touch-detection mismatch; capped automatic graphics quality to low/medium for embedded play; removed duplicate identical state fields; preserved query parameters when changing tracks; added source-checked parent mute/pause/reduced-motion messages, teardown, and friendly WebGL error/fallback guidance. Cosmetic menu overrides use system fonts and Academy colors. Upstream geometry, racing simulation, AI, track builder, items, driver customization, HUD and touch systems remain.

### Galactic Patrol (V2 primary, saved ID `space`)

Source: [Jafnee/Generic-Space-Shooter](https://github.com/Jafnee/Generic-Space-Shooter), pinned revision `c4763e722bacaaaa0af40f77527937e86734f1f5`.
Copyright (c) 2019 Jafnee Jesmee. **MIT**. Full notices: `vendor/generic-space-shooter/LICENSE`, `public/games/galactic/LICENSE.txt`.

Reused game/character/in-play models, action controls/shooting, collision and power-up logic, wave generation, and view mechanics. Replaced AMD/RequireJS delivery with a small static named-module loader; replaced storage with no-op private stats, removed original menu assets and all audio/font files, added a new DOM launch/replay UI, automatic fire, pointer/touch/keyboard movement, generated background/laser graphics and synthesized quiet SFX, fixed logical canvas size, bounded bullet arrays, a fixed 60 Hz simulation adapter for consistent speed on 30/60/120 Hz displays, recoverable AudioContext mute/resume, and integrated pause/mute/teardown. The existing enemy classes, waves, HP, scoring, pickups and upgrades remain. Session time is always enforced by the Academy parent.

**Asset permissions:** selected sprites come only from the included **Kenney Space Shooter Redux** pack. Its actual `images/SpaceShooterRedux/license.txt` declares **CC0**, explicitly permits personal/commercial use, and credits Kenney Vleugels (kenney.nl). Full original notice is preserved in `public/games/galactic/KENNEY-LICENSE.txt` and the vendor source. The exact source-relative paths are recorded in `vendor/generic-space-shooter/assets.json`; ships are rotated into horizontal flight by the runtime. No other shooter assets, explosion sheets, franchise music, paid fonts or recordings are copied into the distribution.

### Star Defender (lightweight fallback)

Adapted from [dwmkerr/spaceinvaders](https://github.com/dwmkerr/spaceinvaders), revision `5f79c6ae4f3cb1fbda0be5cc5212a3a407fa27ee`.
Copyright (c) 2019 Dave Kerr. **MIT**; complete notice: [public/games/space/LICENSE.txt](public/games/space/LICENSE.txt).

Vendored engine: `public/games/space/engine.js`. Changes: repaired instance/global references, changed title/colors, adjusted difficulty for young learners, added keyboard/pointer controls and isolated embedding, removed all audio loading and assets. The existing state machine, movement, waves, collisions, shooting, score, and lives remain. Rendering uses code-drawn geometry. **No classic game sound recordings, screenshots, logos, or other image assets are included.**

### Cosmic Rally (lightweight fallback)

Adapted from [jakesgordon/javascript-racer](https://github.com/jakesgordon/javascript-racer), revision `3e8a060b5900755db27f899612a74a77427c853e`.
Copyright (c) 2012, 2013, 2014, 2015, 2016 Jake Gordon and contributors. **MIT**; complete notice: [public/games/racer/LICENSE.txt](public/games/racer/LICENSE.txt).

Vendored code: `public/games/racer/common.js` and `race.js`, adapted from `common.js` and the v1 straight-road simulation. Changes: fixed-size lightweight canvas, original programmatically drawn car/planet/background, new palette, lap counter, keyboard/pointer controls, no debug UI, no audio/images/storage, independently cancellable animation loop. The original acceleration, steering, off-road slowdown, looping road geometry, projection, and segment renderer are reused. **No OutRun sprite images or Lucky Lion music tracks are included.** The upstream README explicitly limits rights to these assets, so they were excluded.

## Application dependencies

- React and React DOM — Meta Platforms, Inc. and affiliates, MIT.
- Lucide React icons — Lucide Contributors, ISC (with Feather-derived icons under MIT). Package license/notice preserved by npm; icon license reproduced below.
- Vite, TypeScript, Vitest, ESLint, typescript-eslint, Playwright and build/test dependencies retain their package licenses. See each installed package’s LICENSE/NOTICE files and package-lock.json for exact versions. They are development tools unless bundled into runtime by the build.

The city key art was generated specifically for Hero Academy with the built-in image-generation tool. The exact prompt and provenance are in `public/art/ATTRIBUTION.md`; it depicts an original masked grappling hero, with no Marvel logos, Spider-Man costume, or other protected franchise assets. V2 game previews are screenshots captured from actual play of the imported MIT/CC0 games, and retain those underlying notices. Mission badges, fallback preview graphics, questions and reading passages were authored for Hero Academy. SVG assets are inline code. Body text uses device/system fonts and OS emoji. V4 additionally redistributes Bangers for menu/display text under SIL OFL 1.1; the full notice is included in public/fonts/Bangers-OFL.txt. No emoji files are redistributed. No paid, downloaded, branded superhero, or copyrighted commercial game assets are used.

## Referenced repositories investigated

Inspected availability, declared licenses, READMEs/package dependencies and relevant source before choosing reuse. The educational generators/content here were implemented originally because integrating an entire app would add more work and dependencies than this compact first-grade MVP.

| Candidate                    | Findings and decision                                                                                                                                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| binolgeorge/joju-learn       | Available; MIT code, CC BY-NC 4.0 content. Inspected README and procedural generator. Large engine tied to curriculum types, voice/server/optional Firebase. No code/content copied.                                           |
| brightleap-app/brightleap    | V1: investigated only. V3: selected MIT spaced-repetition/shuffle logic adapted; no backend, UI or assets copied. See above.                                                                                                                      |
| JesseRWeigel/battlemath      | Available; MIT. Inspected package/src structure; React Native Web and additional app machinery. Original compact generator is quicker for the specified scope. No code/assets copied.                                          |
| MaybeSword/math-practice     | Available, no declared repository license in API metadata. Not reused.                                                                                                                                                         |
| h5p                          | Organization, not one application. Inspected h5p/h5p-php-library: GPL PHP platform/library requiring LMS integration and content packages. Does not fit static local-only Vite MVP. Not reused.                                |
| canadianveggie/spellie       | Available; inspected license: PolyForm Noncommercial 1.0.0 with required notices and trademark reservations. Daily Wordle structure is not a fit for phonics/tiles/reading hub. No code/content/branding copied.               |
| fecolinhares/super-kart-3djs | V2: selectively imported MIT source and procedural assets; see primary integration above.                                                                                                                                      |
| Jafnee/Generic-Space-Shooter | V2: MIT engine and actual CC0 Kenney pack license verified. Imported selected mechanics and licensed sprites only; see above.                                                                                                  |
| noisyboy08/SpiderWeb-2D      | Rechecked V2 revision d397156970210f4967846f30daae1f8b89b7675c. No actual license file or code permission grant; README badge is insufficient. Includes named franchise villains and unverified art. No code or assets copied. |
| RedEdge967/Spider-Man        | Rechecked V2 revision 5abe8c9868fc76f2d83ab75fac1c9277175cc1a7. No established code license; franchise assets unverified. No code/assets copied.                                                                               |
| scottrippey/xquestjs         | Available, no declared repository license. Not reused.                                                                                                                                                                         |

## Lucide notice

ISC License

Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

## V4 presentation assets and tool selection (November 25, 2026)

- **Bangers** — Copyright 2010 The Bangers Project Authors (https://github.com/googlefonts/bangers). SIL Open Font License 1.1; full license is distributed at `public/fonts/Bangers-OFL.txt`. Source downloaded from https://github.com/google/fonts/tree/main/ofl/bangers on November 25, 2026. The original TTF was losslessly repackaged as WOFF2 (`public/fonts/Bangers-Regular.woff2`); glyph outlines were not edited. Used for display/menu text only; instructions and grown-up forms use conventional system fonts.
- **Original V4 key art** — generated using the built-in OpenAI image tool, stored locally as `public/art/multiverse-city.webp`. Full prompt and provenance: `public/art/ATTRIBUTION.md`. Supplied copyrighted reference images are not shipped.
- **Original effects** — `src/Effects.tsx` and `src/v4.css` implement finite SVG/CSS impact, fire pulse, lightning, star travel, confetti, portrait reaction and locally synthesized audio. No animation/effect library source was copied and no new runtime dependency was installed.
- React Bits, Motion, Paper Shaders, Aceternity UI, Magic UI, Effekseer, tsParticles, Canvas Confetti, Kenney, Blender, Sloyd and Lucide were investigated. Findings, official source links, MCP/registry installation mechanisms and license distinctions are recorded in `docs/v4-tool-research.md`. React Bits currently includes Commons Clause conditions alongside MIT; Sloyd free access is not a blanket open-source or commercial redistribution license. Neither was imported.

## V4.1 presentation, sound and speech (November 25, 2026)

The comic explosion paths, ink splashes, halftone patterns, lettering compositions, feedback policy and finite CSS animations in `src/ComicBurst.tsx`, `feedback.ts`, `Effects.tsx` and `v41.css` are original project code. Attached commercial/fan-art sound-effect reference images are not redistributed. The local Bangers OFL font remains the display-lettering source; no additional font or raster asset was added.

`src/audio.ts` contains original locally synthesized Web Audio recipes; there are no sampled third-party recordings, copied JFXR/Bfxr presets, downloaded sound packs or new runtime libraries. Howler/JFXR/Bfxr/Kenney and the previously investigated animation libraries were evaluated but not imported. Source links and decisions: `docs/v4-tool-research.md`.

Existing MIT Super Kart source was modified to add an independent effects bus, preserve zero/quiet music volume during victory ducking, and accept host channel volumes. Its adapter and the MIT Galactic Patrol adapter now receive bounded volume settings; game bundles were rebuilt using the existing build scripts. Original upstream MIT/Three.js/Kenney notices remain distributed unchanged.

Speech uses only browser-reported local English voices and does not redistribute voice files. Availability and pronunciation depend on the user's installed OS voices. No speech API, remote audio service or tracking was added.

## Project REBEL typography and cover

- **Barlow Condensed Black** — The Barlow Project Authors. SIL OFL 1.1.
  The license ships at `public/fonts/Barlow-OFL.txt`. Source:
  https://github.com/google/fonts/tree/main/ofl/barlowcondensed.
- **Lexend** — The Lexend Project Authors. SIL OFL 1.1.
  The license ships at `public/fonts/Lexend-OFL.txt`. Source:
  https://github.com/google/fonts/tree/main/ofl/lexend.
- The redistributed fonts are locally hosted Latin WOFF2 subsets. The cutout
  wordmark uses Barlow Condensed letter outlines as artwork. Original
  Project REBEL SVG illustrations and cover provenance are documented in
  `public/art/ATTRIBUTION.md`. Existing Lucide icons and CSS animation are
  used in place of adding a shader, drawing or animation runtime.

## V6 arcade expansion

Only the code listed below was taken from the game upstreams. Each game ships
its license in its own folder under `public/games/`.

| Game and saved ID | Pinned source and license | Reused and adapted |
| --- | --- | --- |
| Rooftop Rush (`rooftop`) | [gamelabz/html5-game-endless-runner](https://github.com/gamelabz/html5-game-endless-runner/tree/2cb8756a1ab38956682f8ab0e64f5d68bc3c4cbd), MIT, copyright 2026 gamelabz | Retained jump/gravity, procedural obstacle spawning, speed ramp, box collision and cleanup from `game.js`. Simplified to one jump control, added a fixed opening barrier, forgiving hitboxes and a slower capped ramp, and replaced the frame counter with obstacles cleared. Removed upstream storage and page markup. |
| Power Smash (`smash`) | [jakesgordon/javascript-breakout](https://github.com/jakesgordon/javascript-breakout/tree/eed59e2affa9423b93d2ac8ff93061bb88b33284), MIT text, copyright 2011–2016 Jake Gordon and contributors | Imported `intercept` and `ballIntercept` from `game.js` and adapted the nearest-target sweep, paddle deflection and remaining-motion update from `breakout.js`. Added a wider paddle, slower serve, three-ball opening and original brick arrangements. Upstream sounds have separate CC BY-ND terms and were excluded. The mixed upstream LICENSE is retained in full. |
| Hero Flight (`flight`) | [KilledByAPixel/LittleJS](https://github.com/KilledByAPixel/LittleJS/tree/2b8b6731329df12401f4552d132da4513fdd634c), MIT, copyright 2021 Frank Force | Ported `examples/shorts/flappyGame.js`'s fixed-horizontal-position player, reset-on-boost velocity, gravity and translating wall pairs. Replaced the LittleJS object wrapper with the shared iframe tick and simple overlap checks. Added wide gates, bounded opening changes, a gates-cleared score and manual retry. The engine distribution and upstream tiles were excluded. |
| Power Merge (`merge`) | [gabrielecirulli/2048](https://github.com/gabrielecirulli/2048/tree/478b6ec346e3787f589e4af751378d06ded4cbbc), MIT, copyright 2014 Gabriele Cirulli | Retained Grid, Tile, random tile generation, traversal and single-merge rules from `js/`. Replaced input, rendering and persistence adapters and started with a guaranteed match. The first goal is 64 and play continues past it. Upstream branding, styles, fonts and icons were excluded. |

The game canvases, characters, skyline, court and gate graphics are original
Hero Academy artwork in the game's JavaScript and `public/games/rebel/draw.js`.
Power Merge's tiles use original CSS and system-rendered numbers and symbols.
The WebP previews under `public/art/` were captured from these playable iframes.
Standard browser/OS fonts render the four games. The surrounding Academy keeps its
existing licensed local fonts listed above. Each game uses original Web Audio
oscillator envelopes in `public/games/rebel/arcade.js`; the release includes no new
recordings, music, art packs, external services or runtime dependencies.

### Other V6 candidates

- [ellisonleao/clumsy-bird](https://github.com/ellisonleao/clumsy-bird) has a GPL-3.0 repository license and bundles melonJS, artwork, fonts and audio. The MIT LittleJS flight example supplies comparable one-touch mechanics with a smaller adaptation and no need to redistribute those assets.
- [jakesgordon/javascript-tetris](https://github.com/jakesgordon/javascript-tetris) has an MIT code license. Falling pieces and rotation would add a second timed arcade challenge and more controls. Power Merge offers an untimed option. Its texture and other assets were excluded with the game.
- [michelpereira/awesome-open-source-games](https://github.com/michelpereira/awesome-open-source-games) is a CC0 directory. Linked games have their own licensing requirements. No material from the directory was copied.
- [xp187/dino-run](https://github.com/xp187/dino-run) (MIT) offers a dependency-free runner with its own Web Audio and weather effects. Its jump-and-duck input and larger simulation add complexity to the one-button brief. [parthjpatel99/endless-runner](https://github.com/parthjpatel99/endless-runner) (MIT) features touch controls and collision tests but also includes an online high-score API. gamelabz's small, local Canvas implementation fit the arcade host more directly.
- LittleJS's [Breakout example](https://github.com/KilledByAPixel/LittleJS/tree/2b8b6731329df12401f4552d132da4513fdd634c/examples/breakout) was also considered. Gordon's standalone collision and bounce code fit the existing plain JavaScript iframe path without another engine or upstream art.
- [pemmyz/js_breakout](https://github.com/pemmyz/js_breakout) ships an MIT license and touch support. Gordon's swept collision code provided a direct fit for the smaller playfield and wide beginner paddle. [davidcmonson/flappy-bird](https://github.com/davidcmonson/flappy-bird) and [josedasilva11/2048-game](https://github.com/josedasilva11/2048-game) describe MIT terms in their READMEs but have no separate license files. Their code and media were excluded in favor of the verified LittleJS and Cirulli sources.

## Moto Rush X3 motorcycle trials

[QemmHD/motogame, Moto Rush X3 v1.8.1](https://github.com/QemmHD/motogame/tree/c0fb2fce24d9d08d90b559254f907d1528112b3b)
is pinned at `c0fb2fce24d9d08d90b559254f907d1528112b3b` from
`agent/motorush-v181-fast-failure`. The license at that revision is ISC,
copyright 2026 QemmHD. The default branch is a placeholder and the separate
Pages branch lacks the source branch's license file. The matching ISC notice
ships at `public/games/moto/LICENSE.txt`.

- **Levels and visuals.** All 16 original courses and reference tapes,
  sprites, textures, scenery, crash rig, menus and animations come from this
  revision. The README's originality statement, the upstream asset inventory
  in `vendor/moto-rush/assets.csv` and the [initial art commit](https://github.com/QemmHD/motogame/commit/a2c4333)
  identify project-authored tracks and art generated with Higgsfield/Nano Banana.
  [Higgsfield's output terms](https://higgsfield.ai/creator-hub/help-center/account/who-owns-my-generations-and-can-i-use-them-commercially)
  permit reuse of generated outputs. The arcade WebP is an actual gameplay
  capture from the embedded build. In-game fonts use browser/OS system fonts.
- **Audio.** Engine, landing, crash, stunt and finish sounds are the upstream
  ISC-licensed Web Audio synthesis. The [two Sonilo-generated music tracks](https://github.com/QemmHD/motogame/commit/1093e6c)
  were omitted along with the music-volume row because their redistribution
  rights could not be verified against [Sonilo's plan-based terms](https://sonilo.com/licensing).
- **Integration.** The upstream Canvas engine runs as a local classic bundle
  generated from `vendor/moto-rush` by `scripts/build-moto.mjs`. Gold Run data
  is bundled to support the opaque iframe. The embedded build removes PWA
  registration and install promotion, forwards the Academy pause, mute,
  effects level and motion preferences, and defaults vibration off. Both mute
  buttons use the same host setting. The compact menu and expanded viewport
  keep course cards and ride controls within reach, and the course picker
  also accepts arrow keys and Enter. A
  source-checked bridge stores motorcycle progress locally under
  `hero-academy:moto-rush:v1`. Unlocks, records, replays and game settings
  survive exit; the current run restarts on reload. The separate game state
  lives outside the Academy learning-progress export and clears on a full reset.
- **Other candidates.** [2bt/bike](https://github.com/2bt/bike) has MIT code
  and seven playable levels but bundles the personal-use Copilme typeface
  inside its WebAssembly binary and uses a remote engine loader.
  [Bike vs Gravity](https://github.com/matyuschenko/bike-vs-gravity) has an
  itch.io browser build and Unity source without an explicit repository
  license. [Wheelie!](https://github.com/MihailPreis/Wheelie) has GPL-2.0
  port code, but lists original Gravity Defied assets as belonging to
  Codebrew and bundles community packs without a blanket grant.
  [jgzuo/moto-racer](https://github.com/jgzuo/moto-racer) describes MIT in
  its README and is a top-down oval racer. Independently evaluated
  [Dirty X Rush](https://github.com/iiTzShubham/dirty-x-rush) had no repository
  license, [elma-web](https://github.com/spryt/elma-web) explicitly excludes
  bundled art, levels and audio from its MIT code license, and
  [X-Moto](https://github.com/xmoto/xmoto) is a native desktop project.

## Space Huggers

[Space Huggers by Frank Force](https://github.com/KilledByAPixel/SpaceHuggers/tree/c31a5aaa116842bed4b7385921eaef54dea9681d)
is pinned at `c31a5aaa116842bed4b7385921eaef54dea9681d`, where the
upstream README explicitly grants redistribution and modification under
GNU GPL version 3. Copyright © 2021 Frank Force. The GPL notice covers the
project's plain JavaScript engine and game, original pixel artwork, procedural
environments, atlas, favicon and reference screenshot. The arcade preview is
a real capture from the adapted build. Text uses browser and system fonts.

- **Embedded dependencies.** [Tiny Canvas](https://github.com/bitnenfer/tiny-canvas/tree/97bd9ceec968fbcc6ded85a923eb6e5f7ca47c76)
  is credited in the upstream drawing source and uses WTFPL v2.
  [ZzFX v1.1.8](https://github.com/KilledByAPixel/ZzFX/tree/ac5a4727a44e5506a12f7340087e0b889cfd69dc)
  is Frank Force's MIT-licensed sound synthesis.
  The bundled, unused music routine comes from [ZzFXM](https://github.com/keithclark/ZzFXM/tree/cb07fa9ca36aefd67a0c8c656d2958b62f8ed9fe)
  by Keith Clark and Frank Force, also MIT. No recordings, music files,
  additional fonts or artwork packs were added to the game.
- **Integration.** The iframe loads local, editable scripts without imports
  from the Academy. The two independent programs communicate through the
  arcade's generic playback and settings messages. Hero Academy added a
  responsive playfield and simultaneous touch inputs, restart, lifecycle and
  audio handling, a compact camera, optional original blood effects and a
  reduced-motion treatment. Original simulation, art, weapons and sound
  design remain in the game. Grown-ups can hide it from the Arcade.
- **Source distribution.** The Arcade briefing and session link to
  `games/space-huggers/SOURCE.html`, with the unchanged GPL text, embedded
  dependency notices and a no-charge corresponding-source ZIP. The ZIP
  contains the exact editable scripts and assets served, dated modifications,
  run instructions and a reproducible archive generator. Python 3 is needed
  only to use the documented local server or regenerate the ZIP.
