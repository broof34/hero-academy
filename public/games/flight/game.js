/* Flight, gravity and translating wall pairs adapted from LittleJS's flappyGame.
   Copyright (c) 2021 Frank Force, MIT. See LICENSE.txt. */
mountArcade((academy) => {
  const { ctx, score, detail, sound, finish } = academy;
  const lime = "#bde65d", cyan = "#62e7ff";
  const sky = backdrop((c) => {
    screenprint(c, "#123341", "#5da89c", "#285360");
    for (const [x, y, w] of [[37, 72, 118], [206, 116, 126], [432, 55, 144], [379, 238, 191]]) {
      polygon(c, "#79bdba", [[x, y + 9], [x + w*.22, y + 6], [x + w*.38, y - 13],
        [x + w*.53, y - 4], [x + w*.72, y - 8], [x + w, y + 13], [x + 6, y + 21]], "#285360");
      c.fillStyle = "#b9dfcc";
      c.fillRect(x + w*.29, y + 7, w*.52, 2);
    }
    for (const [x, y, t] of [[169, 53, 13], [427, 162, 10], [265, 207, 8]]) {
      polygon(c, lime, [[x, y-t], [x+2, y-2], [x+t, y], [x+2, y+2],
        [x, y+t], [x-2, y+2], [x-t, y], [x-2, y-2]], null);
    }
    for (let i = 0; i < 11; i++) {
      const x = i * 76 - 40, y = 295 + (i * 23) % 54;
      polygon(c, "#a0cbb3", [[x - 25, y + 22], [x + 5, y + 12], [x + 32, y - 1],
        [x + 69, y + 8], [x + 102, y + 18], [x + 91, y + 27]], null);
    }
    polygon(c, "#203e4b", [[0, 330], [132, 322], [207, 333], [391, 324], [600, 340],
      [600, 360], [0, 360]], null);
  });
  const pilotX = 128;
  const gateW = 49, gap = 184, spacing = 250;
  let player, gates, active, passed, age, trail;

  function wall(x, opening = 177) {
    return { x, opening, passed: false };
  }

  function reset() {
    player = { y: 176, velocity: 0 };
    gates = [wall(451), wall(451 + spacing, 160)];
    active = false;
    passed = trail = 0;
    age = 20;
    score(0);
    detail("Ready to fly");
  }

  function action() {
    if (!active) detail("Gliding");
    active = true;
    player.velocity = -3.75;
    trail = 12;
    sound(295, 530, .1);
  }

  function step() {
    if (!active) return;
    player.velocity += .122;
    player.y = Math.max(20, player.y + player.velocity);
    if (player.y === 20) player.velocity = 0;
    age++;
    trail--;
    let crashed = player.y >= 343;
    for (const gate of gates) {
      gate.x -= 2.18 + Math.min(.7, passed * .045);
      if (gate.x < pilotX + 11 && gate.x + gateW > pilotX - 11 &&
          Math.abs(player.y - gate.opening) > gap / 2 - 10) crashed = true;
      if (!crashed && !gate.passed && gate.x + gateW < pilotX - 11) {
        gate.passed = true;
        score(++passed);
        age = 0;
        sound(610, 950);
      }
    }
    if (crashed) {
      sound(200, 76, .26);
      finish("Flight complete! Try another?");
      return;
    }
    if (gates[0].x + gateW < 0) {
      const last = gates.at(-1);
      gates.shift();
      gates.push(wall(last.x + spacing, clamp(last.opening + (Math.random() - .5) * 98, 122, 235)));
    }
  }

  function tower(x, y, h, top) {
    ctx.fillStyle = ink;
    ctx.fillRect(x, y, gateW, h);
    ctx.fillStyle = "#75549c";
    ctx.fillRect(x + 4, y, gateW - 8, h);
    ctx.fillStyle = "#322754";
    ctx.fillRect(x + gateW - 15, y, 11, h);
    ctx.fillStyle = "#c9acf0";
    for (let r = 12; r < h - 7; r += 15) ctx.fillRect(x + 12, y + r, 10, 3);
    const lip = top ? y + h - 13 : y;
    polygon(ctx, lime, [[x - 4, lip], [x + gateW + 4, lip], [x + gateW, lip + 13], [x, lip + 13]]);
    for (let i = 0; i < 3; i++) {
      const k = x + 6 + i * 14;
      polygon(ctx, "#3b3744", [[k, lip + 9], [k + 5, lip + 4], [k + 9, lip + 4], [k + 4, lip + 9]], null);
    }
  }

  function draw() {
    ctx.drawImage(sky, 0, 0);
    for (const { x, opening } of gates) {
      const upper = opening - gap / 2;
      const lower = opening + gap / 2;
      tower(x, 0, upper, true);
      tower(x, lower, 360 - lower, false);
    }
    ctx.save();
    ctx.translate(pilotX, player.y);
    if (!academy.reduced) ctx.rotate(clamp(player.velocity * .065, -.31, .33));
    if (trail > 0 && !academy.reduced) {
      polygon(ctx, "#ffab6c", [[-22, 8], [-28 - trail * 2.3, 17], [-23, -1]], null);
    }
    polygon(ctx, "#fb80c9", [[-4, -9], [-39, -4], [-28, 12], [2, 5]]);
    polygon(ctx, "#6a4c99", [[-22, 5], [-8, -9], [12, -8], [33, -4], [32, 2], [12, 4], [-9, 13]]);
    disk(ctx, 12, -11, 11, lime);
    polygon(ctx, "#25364f", [[8, -15], [24, -14], [22, -8], [8, -9]], null);
    ctx.fillStyle = cyan;
    ctx.fillRect(12, -13, 8, 2);
    bolt(ctx, -6, -5, .55);
    ctx.restore();
    if (!academy.reduced) sparks(ctx, pilotX + 27, player.y, age, lime);
  }
  return { key: ["Space", "ArrowUp"], reset, action, step, draw };
});
