# Third-party code and asset attribution

## Bundled game code

### Star Defender

Adapted from [dwmkerr/spaceinvaders](https://github.com/dwmkerr/spaceinvaders), revision `5f79c6ae4f3cb1fbda0be5cc5212a3a407fa27ee`.
Copyright (c) 2019 Dave Kerr. **MIT**; complete notice: [public/games/space/LICENSE.txt](public/games/space/LICENSE.txt).

Vendored engine: `public/games/space/engine.js`. Changes: repaired instance/global references, changed title/colors, adjusted difficulty for young learners, added keyboard/pointer controls and isolated embedding, removed all audio loading and assets. The existing state machine, movement, waves, collisions, shooting, score, and lives remain. Rendering uses code-drawn geometry. **No classic game sound recordings, screenshots, logos, or other image assets are included.**

### Cosmic Rally

Adapted from [jakesgordon/javascript-racer](https://github.com/jakesgordon/javascript-racer), revision `3e8a060b5900755db27f899612a74a77427c853e`.
Copyright (c) 2012, 2013, 2014, 2015, 2016 Jake Gordon and contributors. **MIT**; complete notice: [public/games/racer/LICENSE.txt](public/games/racer/LICENSE.txt).

Vendored code: `public/games/racer/common.js` and `race.js`, adapted from `common.js` and the v1 straight-road simulation. Changes: fixed-size lightweight canvas, original programmatically drawn car/planet/background, new palette, lap counter, keyboard/pointer controls, no debug UI, no audio/images/storage, independently cancellable animation loop. The original acceleration, steering, off-road slowdown, looping road geometry, projection, and segment renderer are reused. **No OutRun sprite images or Lucky Lion music tracks are included.** The upstream README explicitly limits rights to these assets, so they were excluded.

## Application dependencies

- React and React DOM — Meta Platforms, Inc. and affiliates, MIT.
- Lucide React icons — Lucide Contributors, ISC (with Feather-derived icons under MIT). Package license/notice preserved by npm; icon license reproduced below.
- Vite, TypeScript, Vitest, ESLint, typescript-eslint, Playwright and build/test dependencies retain their package licenses. See each installed package’s LICENSE/NOTICE files and package-lock.json for exact versions. They are development tools unless bundled into runtime by the build.

All hero artwork, card illustrations, game previews, simple racer graphics, questions, and reading passages were authored for Hero Academy. SVG assets are inline code. Device/system fonts and OS emoji are rendered by the browser; no font or emoji files are redistributed. No paid, downloaded, branded superhero, or copyrighted commercial game assets are used.

## Referenced repositories investigated

Inspected availability, declared licenses, READMEs/package dependencies and relevant source before choosing reuse. The educational generators/content here were implemented originally because integrating an entire app would add more work and dependencies than this compact first-grade MVP.

| Candidate                    | Findings and decision                                                                                                                                                                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| binolgeorge/joju-learn       | Available; MIT code, CC BY-NC 4.0 content. Inspected README and procedural generator. Large engine tied to curriculum types, voice/server/optional Firebase. No code/content copied.                                                |
| brightleap-app/brightleap    | Available; MIT. React/Vite with Supabase, aimed at Year 6 rather than first grade. No code/assets copied.                                                                                                                           |
| JesseRWeigel/battlemath      | Available; MIT. Inspected package/src structure; React Native Web and additional app machinery. Original compact generator is quicker for the specified scope. No code/assets copied.                                               |
| MaybeSword/math-practice     | Available, no declared repository license in API metadata. Not reused.                                                                                                                                                              |
| h5p                          | Organization, not one application. Inspected h5p/h5p-php-library: GPL PHP platform/library requiring LMS integration and content packages. Does not fit static local-only Vite MVP. Not reused.                                     |
| canadianveggie/spellie       | Available; inspected license: PolyForm Noncommercial 1.0.0 with required notices and trademark reservations. Daily Wordle structure is not a fit for phonics/tiles/reading hub. No code/content/branding copied.                    |
| fecolinhares/super-kart-3djs | Available; MIT, Three.js/Vite, procedural-art claim in README. Large repo (~1.6 GB metadata size) and much heavier 3D app. Chose small 2D pseudo-3D racer for speed and compatibility. No assets copied.                            |
| Jafnee/Generic-Space-Shooter | Available; MIT code. Cloned and inspected engine/credits; referenced image and sound directories absent from checkout; separately credited font/music/assets. Chose a complete geometry-only engine instead. No code/assets copied. |
| noisyboy08/SpiderWeb-2D      | Available, no declared license. Not reused.                                                                                                                                                                                         |
| RedEdge967/Spider-Man        | Available, no declared license; branded character imagery also undesirable. Not reused.                                                                                                                                             |
| scottrippey/xquestjs         | Available, no declared repository license. Not reused.                                                                                                                                                                              |

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
