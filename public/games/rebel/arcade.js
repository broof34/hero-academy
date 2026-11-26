/* Hero Academy's sandboxed arcade bridge. Paid time and rewards live in the host. */
function mountArcade(createGame) {
  const field = document.querySelector("#field, #board");
  const score = document.querySelector("#score");
  const detail = document.querySelector("#detail");
  const prompt = document.querySelector("#prompt");
  const retry = document.querySelector("#retry");
  const action = document.querySelector("#action");
  const buttons = document.querySelectorAll(".controls button");
  const keys = new Set();
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let paused = false;
  let reduced = motion.matches;
  let muted = true;
  let volume = 0;
  let audio, bus, game;
  let over = false, swipe;
  let last = null, elapsed = 0;

  const api = {
    field,
    ctx: field.getContext?.("2d"),
    keys,
    get reduced() { return reduced || motion.matches; },
    score(value) { score.textContent = value; },
    detail(text) { detail.textContent = text; },
    finish(text) {
      over = true;
      document.querySelector("#message").textContent = text;
      prompt.hidden = false;
      if (document.hasFocus()) retry.focus({ preventScroll: true });
    },
    sound(pitch, end = pitch, duration = .13) {
      if (paused || muted || !volume || !audio) return;
      if (audio.state === "suspended") {
        audio.resume().then(() => {
          if (audio.state === "running") api.sound(pitch, end, duration);
        }).catch(() => {});
        return;
      }
      if (audio.state !== "running") return;
      const note = audio.createOscillator();
      const envelope = audio.createGain();
      const now = audio.currentTime;
      note.type = "triangle";
      note.frequency.setValueAtTime(pitch, now);
      note.frequency.exponentialRampToValueAtTime(end, now + duration);
      envelope.gain.setValueAtTime(.17, now);
      envelope.gain.exponentialRampToValueAtTime(.001, now + duration);
      note.connect(envelope).connect(bus);
      note.start(now);
      note.stop(now + duration);
      note.onended = () => { note.disconnect(); envelope.disconnect(); };
    },
  };

  function updateAudio() {
    if (bus) bus.gain.value = paused || muted ? 0 : volume;
  }

  function unlockAudio() {
    if (paused || muted || !volume || !window.AudioContext) return;
    if (!audio) {
      audio = new AudioContext();
      bus = audio.createGain();
      bus.connect(audio.destination);
      updateAudio();
    }
    if (audio.state === "suspended") audio.resume().catch(() => {});
  }

  function reset() {
    if (paused) return;
    over = false;
    prompt.hidden = true;
    keys.clear();
    game.reset();
    game.draw?.();
  }

  function interact(callback) {
    if (paused || over) return;
    unlockAudio();
    callback();
    game.draw?.();
  }

  addEventListener("message", (event) => {
    if (window === parent || event.source !== parent || event.data?.type !== "academy:settings") return;
    paused = event.data.paused === true;
    muted = event.data.muted !== false;
    volume = Number.isFinite(event.data.effectsVolume)
      ? Math.max(0, Math.min(1, event.data.effectsVolume)) : 0;
    reduced = event.data.reducedMotion === true;
    document.body.classList.toggle("paused", paused);
    document.body.classList.toggle("reduced", api.reduced);
    for (const button of [...buttons, retry]) button.disabled = paused;
    if (paused) {
      keys.clear();
      swipe = null;
    }
    updateAudio();
  });

  game = createGame(api);
  const directions = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 };
  addEventListener("keydown", (event) => {
    if (!game.key?.includes(event.code) && !(game.move && event.key in directions)) return;
    if (event.code === "Space" && event.target instanceof HTMLButtonElement) return;
    event.preventDefault();
    if (paused || over) return;
    keys.add(event.code);
    if (!event.repeat) interact(() => {
      if (game.move) game.move(directions[event.key]);
      else if (event.code === "Space" || event.code === "ArrowUp") game.action?.();
      else game.direction?.(directions[event.code]);
    });
  });
  addEventListener("keyup", (event) => keys.delete(event.code));
  addEventListener("blur", () => keys.clear());

  action?.addEventListener("click", () => interact(() => game.action()));
  retry.addEventListener("click", () => {
    reset();
    (action || field).focus({ preventScroll: true });
  });

  for (const button of document.querySelectorAll("[data-direction]")) {
    const dir = button.dataset.direction;
    const code = "Arrow" + dir[0].toUpperCase() + dir.slice(1);
    if (!game.move) {
      button.addEventListener("pointerdown", (event) => {
        if (paused || over || !event.isPrimary || event.button !== 0) return;
        button.setPointerCapture(event.pointerId);
        keys.add(code);
      });
      for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
        button.addEventListener(type, () => keys.delete(code));
    }
    button.addEventListener("click", () => interact(() => {
      if (game.move) game.move(directions[code]);
      else game.direction(directions[code]);
    }));
  }

  field.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0 || paused || over) return;
    field.focus({ preventScroll: true });
    field.setPointerCapture(event.pointerId);
    interact(() => {
      if (game.move) swipe = { x: event.clientX, y: event.clientY };
      else if (game.point) game.point(event);
      else game.action();
    });
  });
  field.addEventListener("pointermove", (event) => {
    if (game.point && (event.pointerType === "mouse" || field.hasPointerCapture(event.pointerId)))
      interact(() => game.point(event));
  });
  field.addEventListener("pointerup", (event) => {
    if (!swipe || !event.isPrimary) return;
    const dx = event.clientX - swipe.x;
    const dy = event.clientY - swipe.y;
    swipe = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) >= 18) {
      interact(() => game.move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0)));
    }
  });
  field.addEventListener("lostpointercapture", () => { swipe = null; });

  reset();
  if (game.step) {
    // Fixed 60 Hz simulation keeps the original mechanics consistent across displays.
    function frame(now) {
      if (!paused && !over) {
        let stepped = false;
        elapsed += last === null ? 0 : Math.min(now - last, 50);
        while (elapsed >= 1000 / 60 && !over) {
          game.step();
          stepped = true;
          elapsed -= 1000 / 60;
        }
        if (stepped) game.draw();
      } else {
        elapsed = 0;
      }
      last = now;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if (window !== parent) parent.postMessage({ type: "academy:ready" }, "*");
}

addEventListener("error", () => {
  if (window !== parent) parent.postMessage({ type: "academy:error" }, "*");
});
