---
name: hero-design-taste
description: Use when developing Hero Academy frontend screens, improving UI or UX, reviewing accessibility, or auditing visual quality and responsive layouts.
---

# Hero Academy design taste

Instruction-only project adaptation of Leonxlnx/taste-skill, MIT. Pinned source,
review and deliberate omissions: `docs/design-workflow.md`. Original notice: `LICENSE`.

Read repository `AGENTS.md` and `DESIGN.md` before making visual decisions.
The user's original punk-comic game direction takes precedence over upstream
company-site defaults. Violet, angled artwork and torn panels are intentional here.

1. Name the screen's main action and the intended learner/adult experience.
   Preserve learning behavior and save compatibility while improving presentation.
2. Make the actual game world and original hero art carry the home screen.
   Match the established dark palette, local display type, ink textures and
   distinctive compositions. Keep instructions on a quiet, readable surface.
3. Remove generic dashboard filler and redundant copy. Use a consistent hierarchy,
   spacing and control vocabulary. Keep active navigation and rewards recognizable.
4. Give every control visible keyboard focus, a useful accessible name and touch
   feedback. Check contrast, disabled/error states, zoom and reduced motion.
   Never depend on hover, animation or color alone to convey an answer or action.
5. Review actual screenshots at desktop, tablet and phone widths (including 320px).
   Check artwork cropping, readable text, menu reachability, overflow, collisions,
   and the main action. Correct visible issues and review again.
6. Exercise the changed flow with keyboard and touch-sized controls. Check for
   missing assets, external requests, console errors and unnecessary image weight.
   Use the existing Playwright tooling; this adaptation has no hooks or scripts.

For motion changes also consult `design-motion-principles`; for specific UX,
accessibility or React questions consult `ui-ux-pro-max`. Their recommendations
support the project design rather than replacing it with a new template.
