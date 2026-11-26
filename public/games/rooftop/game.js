/* Jump, spawn, speed ramp and hit logic adapted from gamelabz Endless Runner.
   See LICENSE.txt for the MIT notice and THIRD_PARTY.md for the pinned source. */
mountArcade((academy) => {
  const { ctx, score, detail, sound, finish } = academy;
  const W = 600, ground = 286;
  const pink = "#fb80c9", lime = "#bde65d";
  const city = backdrop((c) => {
    screenprint(c, "#281830", "#bb476f", "#45253d");
    disk(c, 455, 137, 89, "#ffab6c", ink, 5);
    for (let y = 111; y < 217; y += 10) {
      const half = Math.sqrt(86 ** 2 - (y - 137) ** 2);
      c.fillStyle = "#d75b76";
      c.fillRect(455 - half, y, half * 2, 3);
    }
    for (let i = 0; i < 15; i++) {
      const x = 43 * i - 6, y = 188 + (i * 29) % 65;
      c.fillStyle = i % 2 ? "#37243e" : "#241b34";
      c.fillRect(x, y, 36, 360 - y);
      if (i % 3 === 0) c.fillRect(x + 15, y - 18, 4, 18);
      c.fillStyle = "#875166";
      for (let r = 0; r < 4; r++) {
        c.fillRect(x + 8, y + 9 + 15*r, 5, 6);
        c.fillRect(x + 21, y + 9 + 15*r, 5, 6);
      }
    }
    polygon(c, "#db7899", [[0, 100], [368, 52], [0, 117]], null);
    polygon(c, "#db7899", [[0, 138], [312, 92], [0, 148]], null);
    polygon(c, "#f4dc46", [[310, 74], [317, 84], [329, 87],
      [318, 94], [315, 105], [308, 94], [299, 89], [309, 85]], null);
    c.fillStyle = "#141219";
    c.fillRect(0, ground, W, 74);
    c.fillStyle = pink;
    c.fillRect(0, ground, W, 5);
    c.fillStyle = "#56424e";
    c.fillRect(0, ground + 20, W, 2);
    c.fillRect(0, ground + 59, W, 2);
  });
  let player, obstacles, speed, cleared, started, spawnTimer, distance, age;

  function reset() {
    player = { x: 103, y: ground, vy: 0, w: 25, h: 39, onGround: true };
    obstacles = [{ x: 445, y: ground, w: 32, h: 35, type: "barrier" }];
    speed = 3.15;
    cleared = distance = 0;
    spawnTimer = 68;
    age = 20;
    started = false;
    score(0);
    detail("Ready to run");
  }

  function action() {
    if (!started) {
      started = true;
      detail("Running");
    }
    if (!player.onGround) return;
    player.vy = -10.9;
    player.onGround = false;
    sound(290, 565);
  }

  function spawn() {
    const small = Math.random() < .55;
    obstacles.push({ x: W + 20, y: ground, w: small ? 30 : 46,
      h: small ? 35 : 27, type: small ? "barrier" : "vent" });
  }

  function step() {
    if (!started) return;
    player.vy += .55;
    player.y += player.vy;
    if (player.y >= ground) {
      player.y = ground;
      player.vy = 0;
      player.onGround = true;
    }
    if (--spawnTimer <= 0) {
      spawn();
      spawnTimer = Math.max(66, 104 - speed * 4) + Math.random() * 28;
    }
    speed = Math.min(6.2, speed + .0022);
    distance += speed;
    age++;
    for (const o of obstacles) {
      o.x -= speed;
      const hit = player.x + 4 < o.x + o.w - 3 && player.x + player.w - 4 > o.x + 3 &&
        player.y - player.h + 4 < o.y && player.y - 5 > o.y - o.h + 5;
      if (hit) {
        sound(177, 69, .26);
        finish("Barrier hit! Ready for another run?");
        return;
      }
      if (!o.passed && o.x + o.w < player.x) {
        o.passed = true;
        score(++cleared);
        age = 0;
        sound(510, 820);
      }
    }
    obstacles = obstacles.filter((o) => o.x + o.w > -10);
  }

  function draw() {
    ctx.drawImage(city, 0, 0);
    ctx.strokeStyle = "#544151";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = -(academy.reduced ? 0 : distance % 40); x < W; x += 40) {
      ctx.moveTo(x, ground + 23);
      ctx.lineTo(x - 10, ground + 57);
    }
    ctx.stroke();
    for (const { x, y, w, h, type } of obstacles) {
      polygon(ctx, type === "vent" ? "#62e7ff" : "#f4dc46",
        [[x, y], [x + 4, y - h], [x + w - 4, y - h - 3], [x + w, y]]);
      for (let offset = 9; offset <= w - 13; offset += 11) {
        polygon(ctx, ink, [[x + offset, y - 7], [x + offset + 7, y - h + 5],
          [x + offset + 11, y - h + 5], [x + offset + 4, y - 7]], null);
      }
    }
    const x = player.x + 12, y = player.y;
    const stride = player.onGround && started && !academy.reduced ? Math.sin(distance * .14) * 8 : 3;
    polygon(ctx, pink, [[x - 4, y - 34], [x - 42, y - 20], [x - 13, y - 10], [x + 1, y - 26]]);
    polygon(ctx, "#644e9e", [[x - 7, y - 18], [x + 10, y - 18],
      [x + 12 + stride, y - 2], [x + 4 + stride, y], [x, y - 11],
      [x - 9 - stride, y], [x - 15 - stride, y - 3]]);
    polygon(ctx, "#7557b2", [[x - 12, y - 31], [x + 10, y - 34],
      [x + 15, y - 26], [x + 8, y - 16], [x - 9, y - 17]]);
    disk(ctx, x + 3, y - 42, 12, paper);
    polygon(ctx, ink, [[x - 8, y - 47], [x + 17, y - 47], [x + 14, y - 40], [x - 6, y - 41]], null);
    polygon(ctx, lime, [[x + 5, y - 45], [x + 14, y - 45], [x + 12, y - 42], [x + 6, y - 42]], null);
    bolt(ctx, x - 3, y - 31, .45, lime);
    if (!academy.reduced) sparks(ctx, x + 25, y - 25, age, lime);
  }
  return { key: ["Space", "ArrowUp"], reset, action, step, draw };
});
