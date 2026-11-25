(async function () {
  const paths = {
    playerShip: "playerShip",
    scout: "scout",
    fighter: "fighter",
    interceptor: "interceptor",
    tank: "tank",
    transport: "transport",
    pickUpHealth: "pickUpHealth",
    pickUpDamage: "pickUpDamage",
    pickUpFireRate: "pickUpFireRate",
  };
  const images = {};
  await Promise.all(
    Object.entries(paths).map(async ([key, path]) => {
      const img = new Image();
      img.src = "sprites/" + path + ".png";
      await img.decode();
      const c = document.createElement("canvas");
      const ship = !key.startsWith("pickUp");
      if (ship) {
        c.width = key === "playerShip" ? 75 : 84;
        c.height = key === "playerShip" ? 99 : 93;
        const ctx = c.getContext("2d");
        ctx.translate(c.width / 2, c.height / 2);
        ctx.rotate(key === "playerShip" ? Math.PI / 2 : -Math.PI / 2);
        ctx.drawImage(img, -c.height / 2, -c.width / 2, c.height, c.width);
        images[key] = c;
      } else images[key] = img;
    }),
  );
  window.academyImages = images;
  const Game = resolve("model/game"),
    Character = resolve("model/character"),
    InPlay = resolve("model/inPlay"),
    GL = resolve("controller/gameLogic"),
    Action = resolve("controller/action"),
    Draw = resolve("view/draw"),
    C = resolve("model/canvas");
  const ctx = C.context,
    player = Character.ship.player;
  let started = false,
    paused = false,
    dir = 0,
    countdown = 0,
    shot = 0,
    last = 0,
    frame = 0,
    muted = true,
    effectsVolume = 1,
    audio;
  Game.muteMusic = true;
  Game.muteSFX = true;
  Game.addStars();
  player.pos.x = 85;
  player.pos.y = 250;
  const status = document.querySelector("#status"),
    overlay = document.querySelector("#overlay"),
    start = document.querySelector("#start");
  start.disabled = false;
  status.textContent = "Ready for launch";
  Draw.drawPlayerShip = function () {
    if (player.hp <= 0) return;
    ctx.shadowColor = "#36d6ff";
    ctx.shadowBlur = 12;
    ctx.drawImage(images.playerShip, player.pos.x, player.pos.y - 49.5, 75, 99);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#56d9ff";
    ctx.beginPath();
    ctx.moveTo(player.pos.x, player.pos.y - 9);
    ctx.lineTo(player.pos.x - 18 - Math.random() * 14, player.pos.y);
    ctx.lineTo(player.pos.x, player.pos.y + 9);
    ctx.fill();
  };
  Draw.drawScore = Draw.drawHP = function () {};
  Draw.drawBullets = function () {
    for (const b of InPlay.playerBullets) {
      if (!b.alive) continue;
      b.x += 20;
      ctx.fillStyle = "#a5f4ff";
      ctx.shadowColor = "#37c9ff";
      ctx.shadowBlur = 8;
      ctx.fillRect(b.x, b.y, 24, 5);
      if (b.x > 1000) b.alive = false;
    }
    for (const b of InPlay.enemyBullets) {
      if (!b.alive) continue;
      b.x -= 7;
      ctx.fillStyle = "#ff715c";
      ctx.fillRect(b.x, b.y, 15, 6);
      if (b.x < 0) b.alive = false;
    }
    ctx.shadowBlur = 0;
    InPlay.playerBullets = InPlay.playerBullets.filter((b) => b.alive);
    InPlay.enemyBullets = InPlay.enemyBullets.filter((b) => b.alive);
  };
  function beep() {
    if (muted || effectsVolume === 0) return;
    try {
      audio ??= new AudioContext();
      if (audio.state === "suspended") void audio.resume().catch(() => {});
      const o = audio.createOscillator(),
        g = audio.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(650, audio.currentTime);
      o.frequency.exponentialRampToValueAtTime(180, audio.currentTime + 0.07);
      g.gain.setValueAtTime(0.025 * effectsVolume, audio.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.07);
      o.connect(g).connect(audio.destination);
      o.start();
      o.stop(audio.currentTime + 0.08);
    } catch {}
  }
  GL.level.start = function () {
    GL.timer.stop();
    Game.levelStarted = false;
    countdown = 1;
  };
  function begin() {
    GL.timer.stop();
    Action.resetVariables();
    InPlay.playerBullets.length = 0;
    Game.screen = "game";
    started = true;
    paused = false;
    player.pos.y = 250;
    overlay.style.display = "none";
    GL.level.start();
    if (!muted) {
      audio ??= new AudioContext();
      syncAudio();
    }
    parent.postMessage({ type: "academy:ready" }, "*");
  }
  start.onclick = begin;
  function syncAudio() {
    if (!audio) return;
    if (muted || paused || effectsVolume === 0) void audio.suspend();
    else void audio.resume().catch(() => {});
  }
  function setPaused(value) {
    if (paused === value) return;
    paused = value;
    dir = 0;
    GL.timer.stop();
    if (!value && started && Game.levelStarted && !Game.gameOver)
      GL.timer.start();
    syncAudio();
    if (value) status.textContent = "Paused · timer still running";
  }
  function background() {
    const g = ctx.createLinearGradient(0, 0, 1000, 500);
    g.addColorStop(0, "#071b32");
    g.addColorStop(0.55, "#132342");
    g.addColorStop(1, "#080d20");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1000, 500);
    ctx.fillStyle = "#1e3854";
    ctx.beginPath();
    ctx.arc(820, 110, 85, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3a6281";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.ellipse(820, 110, 123, 19, -0.3, 0, Math.PI * 2);
    ctx.stroke();
    Draw.drawStars();
  }
  function simulate(dt) {
    if (!paused) {
      background();
      if (started && !Game.gameOver) {
        player.pos.y = Math.max(
          55,
          Math.min(445, player.pos.y + dir * 330 * dt),
        );
        if (countdown > 0) {
          countdown -= dt;
          if (countdown <= 0) {
            Game.levelStarted = true;
            GL.addEnemies();
            GL.timer.start();
          }
        }
        shot -= dt;
        if (shot <= 0 && Game.levelStarted) {
          Action.playerShoot();
          beep();
          shot = player.fireRate * 0.1;
        }
        ctx.font = "bold 24px system-ui";
        Draw.drawGame();
        if (Game.levelStarted) GL.checkCollisions();
        status.textContent =
          "Playing · Score " +
          Math.max(0, Math.round(player.score)) +
          " · Wave " +
          Game.level +
          " · Shields " +
          Math.max(0, player.hp) +
          "%";
        if (Game.gameOver) {
          overlay.style.display = "grid";
          overlay.querySelector("h1").textContent = "GREAT PATROL, HERO!";
          overlay.querySelector("p:nth-of-type(2)").textContent =
            "You protected the galaxy. Try another patrol while your ticket time remains.";
          start.textContent = "Play again";
        }
      } else Draw.drawPlayerShip();
    }
  }
  const fixedClock = AcademyClock.createFixedClock(simulate);
  function tick(now) {
    fixedClock.advance(last ? (now - last) / 1000 : 0);
    last = now;
    frame = requestAnimationFrame(tick);
  }
  function key(e, down) {
    if (
      ["ArrowUp", "ArrowDown", "w", "s", "W", "S", " ", "p", "P"].includes(
        e.key,
      )
    ) {
      e.preventDefault();
      if (["ArrowUp", "w", "W"].includes(e.key)) dir = down ? -1 : 0;
      if (["ArrowDown", "s", "S"].includes(e.key)) dir = down ? 1 : 0;
      if (down && e.key === " ") {
        if (!started) begin();
        else Action.playerShoot();
      }
      if (down && !e.repeat && e.key.toLowerCase() === "p") setPaused(!paused);
    }
  }
  addEventListener("keydown", (e) => key(e, true));
  addEventListener("keyup", (e) => key(e, false));
  addEventListener("blur", () => (dir = 0));
  document.querySelectorAll("[data-dir]").forEach((b) => {
    b.onpointerdown = (e) => {
      e.preventDefault();
      b.setPointerCapture(e.pointerId);
      dir = +b.dataset.dir;
    };
    b.onpointerup =
      b.onpointercancel =
      b.onlostpointercapture =
        () => (dir = 0);
  });
  const canvas = C.canvas;
  canvas.onpointerdown = (e) => {
    canvas.setPointerCapture(e.pointerId);
    move(e);
  };
  canvas.onpointermove = (e) => {
    if (e.buttons) move(e);
  };
  function move(e) {
    const r = canvas.getBoundingClientRect();
    player.pos.y = Math.max(
      55,
      Math.min(445, ((e.clientY - r.top) / r.height) * 500),
    );
  }
  addEventListener("message", (e) => {
    if (e.source !== parent || e.data?.type !== "academy:settings") return;
    muted = e.data.muted !== false;
    effectsVolume = typeof e.data.effectsVolume === "number" && Number.isFinite(e.data.effectsVolume) ? Math.max(0, Math.min(1, e.data.effectsVolume)) : 1;
    if (typeof e.data.paused === "boolean") setPaused(e.data.paused);
    syncAudio();
  });
  addEventListener("pagehide", () => {
    cancelAnimationFrame(frame);
    GL.timer.stop();
    audio?.close();
  });
  window.__patrol = { Game, Character, InPlay };
  frame = requestAnimationFrame(tick);
  parent.postMessage({ type: "academy:ready" }, "*");
})().catch((error) => {
  document.querySelector("#status").textContent =
    "The ship could not load. Try the lighter game or return to the Academy.";
  console.error(error);
  parent.postMessage({ type: "academy:error" }, "*");
});
