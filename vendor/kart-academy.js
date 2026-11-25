import "./super-kart/src/main.js";
import "./kart-academy.css";
const api = window.__sk3d;
let parentMuted = true,
  paused = false;
const originalMute = api.audio.setMuted.bind(api.audio);
api.audio.setMuted = (muted) => originalMute(parentMuted || muted);
function pause(value) {
  if (value === paused) return;
  paused = value;
  document.querySelector("#academy-paused").style.display = value
    ? "grid"
    : "none";
  if (value) {
    api.loop.stop();
    api.audio.suspend();
  } else {
    api.loop.start(api.loop.updateFn);
    if (!parentMuted) api.audio.resume();
  }
}
addEventListener("message", (e) => {
  if (e.source !== parent || e.data?.type !== "academy:settings") return;
  const data = e.data;
  parentMuted = data.muted !== false;
  api.audio.setEffectsVolume(typeof data.effectsVolume === "number" && Number.isFinite(data.effectsVolume) ? Math.max(0, Math.min(1, data.effectsVolume)) : 1);
  api.audio.setMusicVolume(typeof data.musicVolume === "number" && Number.isFinite(data.musicVolume) ? Math.max(0, Math.min(1, data.musicVolume)) : 0);
  originalMute(parentMuted);
  if (typeof data.paused === "boolean") pause(data.paused);
  window.academyReducedMotion = data.reducedMotion === true;
  document.documentElement.classList.toggle(
    "academy-reduced",
    window.academyReducedMotion,
  );
});
addEventListener("pagehide", () => {
  api.loop.stop();
  api.audio.suspend();
  api.audio.clearEngineLoops();
  api.renderer.dispose();
});
parent.postMessage({ type: "academy:ready" }, "*");
