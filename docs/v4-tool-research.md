# V4 tool and reference research

Researched November 25, 2026. Recommendations below are engineering judgments; project licenses and plan terms must be checked at the exact revision used. Investigation does not add a dependency or grant redistribution rights to sample art.

## Reference findings

The extracted poster/collage use offset cyan/magenta outlines, rough print textures, hard rim lighting, foreshortened silhouettes, layered city diagonals and dramatic warm/cool contrast. The Hero Academy mockup contributes the practical structure: large labeled top navigation, an art-led central action and four angled subject/game tiles. Transfer that visual grammar to an original hero and city. Do not copy franchise assets. The attached guide is reference data; the user's explicit request controls scope.

## Tools

| Tool | Findings and installation | V4 decision |
| --- | --- | --- |
| [React Bits](https://reactbits.dev/) | Source components in JS/TS and CSS/Tailwind variants; manual source copy or shadcn CLI. Its current [license](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md) includes Commons Clause restrictions alongside MIT, so it should not be described as plain MIT. | Study effects; favor small original CSS/SVG implementations. Preserve exact notices if any source is reused. |
| [Motion](https://motion.dev/) | MIT core; npm `motion`, React entry `motion/react`; optional commercial Motion+ features are separate. [Accessibility guide](https://motion.dev/docs/react-accessibility) covers motion preferences. AI tooling is advertised, but the package does not require MCP. | Good candidate if layout/interruption orchestration justifies an added runtime; not necessary for simple finite effects. |
| [Paper Shaders](https://github.com/paper-design/shaders) | Zero-dependency canvas shader library, React wrapper available through npm. [Apache 2.0](https://raw.githubusercontent.com/paper-design/shaders/main/LICENSE). | Dramatic portals are possible, but continuous canvas/GPU use is unnecessary for lessons; defer in favor of static halftone art. |
| [Aceternity UI](https://ui.aceternity.com/) | React/Tailwind/Motion source components; free collection and paid products coexist. [CLI and MCP documentation](https://ui.aceternity.com/docs/cli) supports source registry installation. Verify the license of selected source and avoid assuming paid templates share the free license. | Reference light sweeps and border treatments; no full styling-stack migration or template import. |
| [Magic UI](https://magicui.design/) | Free open-source React/TypeScript/Tailwind/Motion components, [MIT source](https://raw.githubusercontent.com/magicuidesign/magicui/main/LICENSE.md), separate Pro products. [MCP/registry docs](https://magicui.design/docs/mcp). | Confetti/border ideas useful, generic landing-page blocks do not match this game's identity. |
| [Effekseer](https://effekseer.github.io/en/) | Free effect editor exports 2D animations and supports a WebGL runtime; [MIT editor source](https://raw.githubusercontent.com/Effekseer/Effekseer/master/LICENSE). Individual contributed sample effects require their own provenance review. | Sprite sheets are feasible without shipping its engine. For a few small reward effects, CSS/SVG avoids authoring/runtime overhead. |
| [tsParticles](https://particles.js.org/) | [MIT](https://raw.githubusercontent.com/tsparticles/tsparticles/main/LICENSE); packages range from basic/slim to full, with React wrappers and finite-effect helpers. | More flexibility than needed; no permanent particle background. |
| [Canvas Confetti](https://github.com/catdad/canvas-confetti) | Small focused npm package; worker option and reduced-motion support; [ISC](https://github.com/catdad/canvas-confetti/blob/master/LICENSE). | Best fallback dependency for richer victory bursts, lazy-loaded only on completion if used. |
| [Kenney](https://kenney.nl/assets) | Asset packs include 2D/3D/UI/audio. Official [Development Essentials](https://kenney.nl/assets/development-essentials) identifies CC0. Check the included license per selected pack. Existing game sprites already have preserved notices. | Keep game assets; potential small UI/audio source. Do not use cartoon characters as the app's visual identity. |
| [Blender](https://www.blender.org/) | Free/open-source GPL creation tool; the [official FAQ](https://www.blender.org/support/faq/) distinguishes tool license from user-created output. Main site returned 403 during direct inspection; official indexed FAQ corroborated output ownership. | Useful for prerendered city layers if needed, not a new live 3D app dependency. |
| [Sloyd](https://www.sloyd.ai/) | Hosted commercial service with free access, not an assumed open-source tool. Current [pricing](https://www.sloyd.ai/pricing) labels Guest output personal-use; a separate answers page describes CC BY community downloads. These are different asset/plan cases and must not be conflated. | Do not use free generated output for this public project on an unverified assumption. No need for Sloyd assets. |
| [Lucide](https://lucide.dev/) | Already installed. Tree-shakable SVG React icons; site identifies ISC licensing, preserve existing notices including upstream icon notices. | Retain for recognizable nav, subject and accessibility controls. |

## React Bits component assessment

- [Electric Border](https://reactbits.dev/animations/electric-border): crackling outline. Appropriate only for finite major accomplishment emphasis. A small original SVG lightning path gives a predictable footprint; never require cursor position.
- [Dither](https://reactbits.dev/backgrounds/dither): moving patterned waves. Use static printed/dither texture for this project; a full moving background competes with learning and adds rendering work.
- [Halftone Reveal](https://reactbits.dev/animations/halftone-reveal): pointer-based dots reveal imagery. Interesting for optional menu art, but the image/content must remain available on touch/keyboard; not suitable for hiding instructions or navigation.
- [Pixel Transition](https://reactbits.dev/animations/pixel-transition): tiled dissolve. Could inspire a short subject-entry wipe; avoid hundreds of DOM tiles and do not delay focus or each answer.
- [Glare Hover](https://reactbits.dev/animations/glare-hover): reflective sweep. Low-cost CSS gradient sweep on primary tiles, enabled for fine pointers; keyboard focus gets a clear static stroke.
- [Star Border](https://reactbits.dev/animations/star-border): moving edge highlight. Reserve a finite version for a newly available reward; avoid continuous loops.
- [Split Text](https://reactbits.dev/text-animations/split-text): staggered heading entrances. Optional single menu entrance only; no fragmented screen-reader labels, animated instructions or randomizing letter effects.

These assessments refer to documented behavior, not a claim to have installed or profiled every component. No React Bits source has been copied at this stage.

## MCP, skills, registries and installation

Available connected tools were inspected: Context7 documentation lookup, Figma, image generation, and browser control can support implementation/review. No dedicated React Bits, Effekseer, Blender, or Motion MCP appears in the available tool catalog. No server installation is needed to read official docs/source.

[React Bits MCP guide](https://reactbits.dev/get-started/mcp) routes through shadcn MCP and registry `https://reactbits.dev/r/{name}.json`. The CLI supports per-component variants, for example `npx shadcn@latest add @react-bits/Dither-TS-CSS`; inspect the item's source/dependencies and exact registry availability before executing an install. Manual copying is supported and better fits an existing plain-CSS app when only one effect is needed.

Aceternity documents registry `https://ui.aceternity.com/registry/{name}.json`, alias `@aceternity`; Magic UI documents `https://magicui.design/r/{name}.json`, alias `@magicui`. All can be queried through shadcn MCP with project registry configuration. This does not make these servers already connected, nor justify changing global agent settings. Registry code must be reviewed before use.

Applicable local skills: brainstorming/design, writing implementation plans, imagegen for original raster key art, verification before completion, and React quality review if multiple TSX components change. Use Playwright already installed in this project for behavioral verification and screenshots. Retain the current Vite/React implementation rather than routing this existing codebase through a new hosted website builder.

## Dependency budget and provenance

Default: no new animation dependency. Native CSS transforms/opacity and SVG cover the proposed effects. Add at most a justified focused package after reviewing exact source/license. Store fonts/art locally; include original font licenses and art provenance. No runtime CDN, analytics or external asset calls. Existing game licenses and notices remain intact. User-supplied movie references stay outside `public/` and the Git history.

## V4.1 sound and refinement review (November 25, 2026)

- [Howler.js](https://howlerjs.com/) provides sample loading, audio sprites, codecs, fades and Web Audio/HTML5 fallback; its [source license is MIT](https://github.com/goldfire/howler.js/blob/master/LICENSE.md). It earns its cost for a recorded soundtrack or sample bank. V4.1 uses short original synthesis, so adding a playback library would duplicate native functionality.
- [JFXR](https://jfxr.frozenfractal.com/) is a browser sound-effect authoring tool with editable parameters and WAV export; [source](https://github.com/ttencate/jfxr). Useful for auditioning arcade envelopes. Its README identifies the code as BSD 3-Clause and gives users ownership of generated sounds, including commercial use. No JFXR code or exported sound was imported.
- [Bfxr](https://www.bfxr.net/) is an open-source sound-effect generator descended from Sfxr, with mutation and WAV export; [source](https://github.com/increpare/bfxr). The original repository identifies Apache 2.0 licensing and points to its newer [Bfxr2 JavaScript successor](https://github.com/increpare/bfxr2); the current website exposes the modern browser UI. No tool code or output was copied.
- [Kenney Interface Sounds](https://kenney.nl/assets/interface-sounds) was considered as a sampled UI bank. Direct site access was restricted during this session; existing Kenney game-art CC0 notices remain. No new sound pack was downloaded, so no unverified asset license is relied on.
- [Web Audio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) supplies oscillators, envelopes, filters, bounded noise and offline rendering for original short cues. V4.1's recipes distinguish navigation, tap, retry, correct, star, fire, lightning, legendary, ticket and completion sounds, with small pitch variations. One lazy audio context, bounded active sources, suspension on mute/hidden/quiet, speech ducking and explicit preview reduce overhead.
- [Speech synthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) reuses installed local English voices, with cancellation, rate and volume. Voice availability varies by OS/browser. The app deliberately does not fall back to remote voices or a paid API. Automatic instructions never receive a hidden spelling target or example sentence. Explicit Hear word is the legitimate dictation stimulus; hidden/covered/test modes speak only the target, not its sentence.
- React Bits, Motion, Effekseer, Canvas Confetti, Paper Shaders and tsParticles were revisited. The original SVG/CSS approach supports this specific printed-comic direction with no new runtime dependency. Animated SVG wrappers, bounded particles, one finite shockwave and short registration offsets replace the old plain-text impacts. Full WebGL shaders and effect runtimes would add battery/maintenance cost without improving one-question-at-a-time usability.

The existing kart already contained procedural music. V4.1 therefore adds a separate music preference and a real independent effects bus to that existing game, rather than adding a new soundtrack. Space audio follows effects volume. Music remains off by default; other learning/menu screens have no music. Existing game mute/pause/deadline controls remain authoritative.
