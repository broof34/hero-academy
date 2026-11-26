import { build } from "esbuild";
import { copyFile } from "node:fs/promises";

const source = "vendor/moto-rush";
const output = "public/games/moto";
// Classic scripts can load inside Academy's opaque-origin iframe. The bundle
// includes the original Gold Run manifest so playback needs no iframe fetch.
await build({
  entryPoints: [`${source}/game.js`],
  outfile: `${output}/game.js`,
  bundle: true,
  format: "iife",
  target: "es2022",
  minify: true,
  legalComments: "eof",
});
for (const file of ["index.html", "version.js"]) {
  await copyFile(`${source}/${file}`, `${output}/${file}`);
}
await copyFile(`${source}/LICENSE`, `${output}/LICENSE.txt`);
