import { build } from "esbuild";
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
const out = "public/games/kart";
await mkdir(out, { recursive: true });
await build({
  entryPoints: ["vendor/kart-academy.js"],
  outfile: out + "/game.js",
  bundle: true,
  format: "iife",
  target: "es2022",
  minify: true,
  legalComments: "eof",
  banner: {
    js: `var academyStorage={data:{'sk3d.muted':'1','sk3d.cc':'50','sk3d.autoAccel':'1','sk3d.steerAssist':'1'},getItem(k){return this.data[k]??null},setItem(k,v){this.data[k]=String(v)}};`,
  },
});
await copyFile("vendor/super-kart/LICENSE", out + "/LICENSE.txt");
await copyFile("node_modules/three/LICENSE", out + "/THREE-LICENSE.txt");
await writeFile(
  out + "/index.html",
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'none'; media-src 'none'; font-src 'none'; worker-src 'none'"><title>Super Kart 3D · Hero Academy</title><link rel="stylesheet" href="game.css"><style>body{margin:0;background:#090e1c;font-family:system-ui}#academy-paused,#academy-error{position:fixed;inset:0;z-index:9999;display:none;place-items:center;text-align:center;color:white;background:#0b142de8;padding:30px;font:700 24px system-ui}#academy-error p{font:18px/1.6 system-ui;max-width:550px}.sk3d-menu{font-family:system-ui!important}</style></head><body><div id="app"></div><div id="academy-paused">Game paused · Your session timer is still running.</div><div id="academy-error"><div>Let’s try a lighter adventure.<p>This device could not start 3D. Use “Switch to 2D” above. Your remaining play time stays the same.</p></div></div><script>addEventListener('error',()=>{document.querySelector('#academy-error').style.display='grid';parent.postMessage({type:'academy:error'},'*')});</script><script src="game.js"></script></body></html>`,
);
console.log(
  "Built self-contained Super Kart 3D (classic script; opaque sandbox compatible).",
);
