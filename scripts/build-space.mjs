import { transform } from "esbuild";
import {
  readFile,
  writeFile,
  mkdir,
  copyFile,
  readdir,
} from "node:fs/promises";
const dir = "vendor/generic-space-shooter",
  out = "public/games/galactic";
await mkdir(out + "/sprites", { recursive: true });
for (const file of await readdir(dir + "/sprites"))
  await copyFile(dir + "/sprites/" + file, out + "/sprites/" + file);
await copyFile(dir + "/LICENSE", out + "/LICENSE.txt");
await copyFile(
  dir + "/images/SpaceShooterRedux/license.txt",
  out + "/KENNEY-LICENSE.txt",
);
let source = `/* Generic Space Shooter, MIT, Jafnee Jesmee; see LICENSE.txt. Kenney sprites: CC0, see KENNEY-LICENSE.txt. Academy wrapper and rendering changes: MIT. */\nvar modules={},instances={};function define(id,deps,factory){modules[id]={deps:deps,factory:factory}}function resolve(id){if(instances[id])return instances[id];var m=modules[id];if(!m)throw new Error('Missing module '+id);return instances[id]=m.factory.apply(null,m.deps.filter(Boolean).map(resolve))}\n`;
source += `define('model/canvas',[],()=>{const canvas=document.querySelector('canvas');return {canvas,context:canvas.getContext('2d'),canvasWidth:1000,canvasHeight:500}});\n`;
source += `define('controller/localStorageManager',[],()=>({set(){},get(){return 0},init(){},load(){}}));\n`;
source += `define('model/sounds',[],()=>new Proxy({},{get:()=>({play(){}})}));\n`;
source += `define('model/images',[],()=>window.academyImages);\n`;
for (const id of [
  "model/game",
  "model/character",
  "model/inPlay",
  "controller/gameLogic",
  "controller/action",
  "view/draw",
]) {
  const text = (await readFile(dir + "/js/" + id + ".js", "utf8")).replace(
    "define([",
    `define('${id}',[`,
  );
  source += text + "\n";
}
source += (
  await transform(await readFile("vendor/space-clock.js", "utf8"), {
    format: "iife",
    globalName: "AcademyClock",
  })
).code;
source += await readFile("vendor/space-academy.js", "utf8");
await writeFile(out + "/game.js", source);
await copyFile("vendor/space-index.html", out + "/index.html");
console.log(
  "Built Galactic Patrol with imported MIT mechanics and CC0 sprites.",
);
