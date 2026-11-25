// Deliberately independent of React, module imports and application storage writes.
(() => {
  const panel = document.getElementById("startup");
  const loading = document.getElementById("startup-loading");
  const failure = document.getElementById("startup-failure");
  const detail = document.getElementById("startup-detail");
  let ready = false;
  let failed = false;
  const timer = setTimeout(() => {
    if (!ready) recover("Loading is taking longer than expected. Check your connection and reload.");
  }, 20000);

  function recover(message) {
    clearTimeout(timer);
    failed = true;
    panel.hidden = false;
    loading.hidden = true;
    failure.hidden = false;
    detail.textContent = message;
    failure.querySelector("h1").focus();
  }
  window.addEventListener("hero:ready", () => {
    if (failed) return;
    ready = true;
    clearTimeout(timer);
    panel.hidden = true;
  });
  window.addEventListener("hero:startup-error", () => recover("An application error interrupted this session. Reload to try again."));
  window.addEventListener("error", (event) => {
    if (event.target instanceof HTMLScriptElement && event.target.type === "module") {
      recover("A required application file could not load. Reload to get the latest version.");
    } else if (!ready && event instanceof ErrorEvent && (!event.filename || event.filename.startsWith(location.origin))) {
      recover("An application error prevented startup. Reload to try again.");
    }
  }, true);
  window.addEventListener("unhandledrejection", () => {
    if (!ready) recover("An application error prevented startup. Reload to try again.");
  });
  document.getElementById("startup-reload").addEventListener("click", () => location.reload());
  document.getElementById("startup-export").addEventListener("click", () => {
    try {
      const raw = localStorage.getItem("hero-academy:v1");
      if (raw === null) {
        detail.textContent = "There is no saved progress in this browser to download.";
        return;
      }
      const url = URL.createObjectURL(new Blob([raw], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "hero-academy-recovery.json";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      detail.textContent = "Browser storage is unavailable. Enable storage for this site and try again. Nothing has been reset.";
    }
  });
})();
