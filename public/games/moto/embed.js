/* Hero Academy boot and progress bridge for the opaque arcade iframe. */
(() => {
  let started = false;
  let settingsChanged;
  const embedded = parent !== window;
  const academy = {
    embedded,
    paused: false,
    muted: embedded,
    reducedMotion: false,
    effectsVolume: embedded ? 0 : 1,
    saved: null,
    onSettingsChange(listener) { settingsChanged = listener; },
    toggleMute() { notify("academy:moto-toggle-mute"); },
    save(progress) {
      parent.postMessage({ type: "academy:moto-save", progress }, "*");
    },
  };
  window.motoAcademy = academy;

  function notify(type) {
    if (embedded) parent.postMessage({ type }, "*");
  }

  function start() {
    started = true;
    const script = document.createElement("script");
    script.src = "./game.js";
    script.onerror = () => notify("academy:error");
    document.head.append(script);
  }

  addEventListener("error", () => notify("academy:error"));
  addEventListener("message", ({ source, data }) => {
    if (!embedded || source !== parent || data?.type !== "academy:settings") return;
    if (!started && !Object.hasOwn(data, "motoProgress")) return;
    academy.paused = data.paused === true;
    academy.muted = data.muted !== false;
    academy.reducedMotion = data.reducedMotion === true;
    academy.effectsVolume = Number.isFinite(data.effectsVolume)
      ? Math.max(0, Math.min(1, data.effectsVolume)) : 0;
    if (started) settingsChanged?.();
    else {
      academy.saved = typeof data.motoProgress === "string" ? data.motoProgress : null;
      start();
    }
  });

  if (embedded) notify("academy:moto-load");
  else start();
})();
