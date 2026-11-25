import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.argv[2] || "dist");
const html = readFileSync(resolve(root, "index.html"), "utf8");
if (/\/src\/|\.(?:tsx?|jsx)(?:["?])/.test(html)) {
  throw new Error("Unbuilt source HTML must never be published. Deploy the Vite dist artifact.");
}
const urls = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
const modules = urls.filter((url) => /^\/hero-academy\/assets\/.+\.js$/.test(url));
if (!modules.length || !urls.some((url) => /^\/hero-academy\/assets\/.+\.css$/.test(url))) {
  throw new Error("Production HTML needs compiled JS and CSS under /hero-academy/assets/.");
}
if (!html.includes('name="hero-build"')) throw new Error("Missing build provenance.");
for (const url of urls) {
  if (!url.startsWith("/hero-academy/")) throw new Error(`Unexpected asset base: ${url}`);
  const path = resolve(root, url.slice("/hero-academy/".length));
  if (!path.startsWith(root + "/") || statSync(path).size === 0) throw new Error(`Missing/empty asset: ${url}`);
}
console.log("Production artifact verified: compiled modules, styles, base paths and local assets.");
