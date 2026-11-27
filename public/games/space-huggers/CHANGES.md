# Space Huggers source distribution

Space Huggers © 2021 Frank Force. Upstream is
[KilledByAPixel/SpaceHuggers](https://github.com/KilledByAPixel/SpaceHuggers/tree/c31a5aaa116842bed4b7385921eaef54dea9681d)
at `c31a5aaa116842bed4b7385921eaef54dea9681d`, licensed under GNU GPL version 3.
See LICENSE and the separate Tiny Canvas, ZzFX and ZzFXM notices.

Hero Academy modified this copy on November 26, 2026. The game runs directly
from the editable scripts in this directory. There are no compiled files,
package installs, network services or platform-specific build tools.

To run it, extract the source archive, run `python3 -m http.server 8000`
from the extracted directory, then visit `http://localhost:8000/index.html`.
To regenerate the downloadable source archive, run `python3 make-source.py`.
The embedded release loads the same HTML and scripts and controls playback
through postMessage. The standalone entry can also run without a parent.

The original editable sprite sheet (tiles.png), runtime atlas (embedded in
engine/engine.js) and reference screenshot are included. The inline atlas
is preserved exactly as published so it works in an opaque sandbox without
cross-origin image loading. Replace its base64 data to update that atlas.

The adaptation adds an HTML entry point, presentation and the Academy bridge
for pause, audio, motion preferences, touch and restart. The engine changes
attach to a dedicated playfield, stop scheduling the loop while paused,
gate Web Audio, and preserve Canvas rendering when WebGL is unavailable.
The compact camera and text fit smaller viewports. The host can suppress blood
particles and reduce background drift, and the release disables debug tooling.
The upstream simulation, combat tuning, destructible world, procedural layouts,
art and sound generation are retained.
