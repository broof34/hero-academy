/* Jake Gordon’s swept ball collision routines, MIT. See LICENSE.txt. */
const collision = {
    intercept: function(x1, y1, x2, y2, x3, y3, x4, y4, d) {
      var denom = ((y4-y3) * (x2-x1)) - ((x4-x3) * (y2-y1));
      if (denom != 0) {
        var ua = (((x4-x3) * (y1-y3)) - ((y4-y3) * (x1-x3))) / denom;
        if ((ua >= 0) && (ua <= 1)) {
          var ub = (((x2-x1) * (y1-y3)) - ((y2-y1) * (x1-x3))) / denom;
          if ((ub >= 0) && (ub <= 1)) {
            var x = x1 + (ua * (x2-x1));
            var y = y1 + (ua * (y2-y1));
            return { x: x, y: y, d: d};
          }
        }
      }
      return null;
    },

    ballIntercept: function(ball, rect, nx, ny) {
      var pt;
      if (nx < 0) {
        pt = collision.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny,
                                 rect.right  + ball.radius,
                                 rect.top    - ball.radius,
                                 rect.right  + ball.radius,
                                 rect.bottom + ball.radius,
                                 "right");
      }
      else if (nx > 0) {
        pt = collision.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny,
                                 rect.left   - ball.radius,
                                 rect.top    - ball.radius,
                                 rect.left   - ball.radius,
                                 rect.bottom + ball.radius,
                                 "left");
      }
      if (!pt) {
        if (ny < 0) {
          pt = collision.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny,
                                   rect.left   - ball.radius,
                                   rect.bottom + ball.radius,
                                   rect.right  + ball.radius,
                                   rect.bottom + ball.radius,
                                   "bottom");
        }
        else if (ny > 0) {
          pt = collision.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny,
                                   rect.left   - ball.radius,
                                   rect.top    - ball.radius,
                                   rect.right  + ball.radius,
                                   rect.top    - ball.radius,
                                   "top");
        }
      }
      return pt;
    }
};

mountArcade((academy) => {
  const { ctx, field, keys, score, detail, sound, finish } = academy;
  const colors = ["#ffab6c", "#f4dc46", "#fb80c9", "#62e7ff"];
  const court = backdrop((c) => {
    screenprint(c, "#2b1b33", "#482d3d", "#634054");
    polygon(c, "#634054", [[0, 218], [141, 173], [104, 213], [275, 164], [232, 222],
      [600, 166], [600, 182], [203, 260], [224, 212], [86, 251], [100, 216], [0, 255]], null);
    bolt(c, 247, 169, 6.2, "#513444");
    c.fillStyle = "#211927";
    c.fillRect(0, 333, 600, 27);
    c.fillStyle = "#ac7081";
    c.fillRect(0, 333, 600, 2);
  });

  const rect = (left, top, width, height) => ({ left, top, right: left + width, bottom: top + height });
  const walls = [rect(-50, -50, 50, 460), rect(600, -50, 50, 460), rect(0, -50, 600, 50)];
  const shieldY = 309, shieldWidth = 122;
  const top = 42;
  let ball, shield, bricks, lives, level, total, active, burst;

  function updateDetail() {
    detail(`Round ${level} · ${lives} ${lives === 1 ? "ball" : "balls"}${active ? "" : " · Ready to serve"}`);
  }

  function setRound() {
    shield = 300;
    ball = { x: shield, y: shieldY - 8, vx: 0, vy: 0, radius: 7 };
    bricks = [];
    const rows = Math.min(4, level + 2);
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < 7; column++) {
        if (level > 1 && (column + row + level) % 5 === 0) continue;
        bricks.push({ ...rect(26 + column * 79, top + row * 32, 74, 25), row });
      }
    }
    active = false;
    updateDetail();
  }

  function reset() {
    level = 1;
    lives = 3;
    total = 0;
    burst = null;
    score(total);
    setRound();
  }

  function moveShield(x) {
    shield = clamp(x, shieldWidth / 2 + 4, 596 - shieldWidth / 2);
    if (!active) ball.x = shield;
  }

  function action() {
    if (active) return;
    ball.vx = shield <= 300 ? 1.3 : -1.3;
    ball.vy = -4.18;
    active = true;
    updateDetail();
    sound(334, 554);
  }

  function step() {
    moveShield(shield + 7 * (Number(keys.has("ArrowRight")) - Number(keys.has("ArrowLeft"))));
    if (burst) burst.age++;
    if (!active) return;
    // Keep Gordon's nearest-target sweep and reflect the unspent movement
    // after each impact, with a bounded loop for corner contacts.
    const paddle = rect(shield - shieldWidth / 2, shieldY, shieldWidth, 15);
    let remaining = 1;
    for (let bounce = 0; bounce < 4 && remaining > .001; bounce++) {
      const nx = ball.vx * remaining;
      const ny = ball.vy * remaining;
      const targets = [...walls, ...bricks];
      if (ny > 0 && ball.y <= shieldY - ball.radius) targets.push(paddle);
      let closest = null;
      let distance = Infinity;
      for (const target of targets) {
        const point = collision.ballIntercept(ball, target, nx, ny);
        if (!point) continue;
        const traveled = Math.hypot(point.x - ball.x, point.y - ball.y);
        if (traveled < distance) {
          closest = { point, target };
          distance = traveled;
        }
      }
      if (!closest) {
        ball.x += nx;
        ball.y += ny;
        break;
      }

      const { point, target } = closest;
      ball.x = point.x;
      ball.y = point.y;
      if (point.d === "left" || point.d === "right") ball.vx *= -1;
      else ball.vy *= -1;
      if (target === paddle) {
        ball.vx = (ball.x - shield) / (shieldWidth / 2) * 3.15;
        ball.vy = -Math.min(5.4, 4.18 + level * .12 + total * .014);
        sound(203, 354, .075);
      }
      if (target.row !== undefined) {
        bricks.splice(bricks.indexOf(target), 1);
        score(++total);
        burst = { x: ball.x, y: ball.y, age: 0, color: colors[target.row] };
        sound(435 + target.row * 74, 635 + target.row * 75, .13);
        if (!bricks.length) {
          level++;
          lives = Math.min(5, lives + 1);
          setRound();
          return;
        }
      }
      remaining *= Math.max(0, 1 - distance / Math.hypot(nx, ny));
      ball.x += Math.sign(ball.vx) * .01;
      ball.y += Math.sign(ball.vy) * .01;
    }
    if (ball.y > 367) {
      active = false;
      lives--;
      updateDetail();
      sound(210, 86, .23);
      if (!lives) finish("Out of balls! Ready for another round?");
      else {
        ball.x = shield;
        ball.y = shieldY - ball.radius - 1;
      }
    }
  }

  function draw() {
    ctx.drawImage(court, 0, 0);
    for (const b of bricks) {
      polygon(ctx, colors[b.row], [[b.left + 3, b.top], [b.right, b.top],
        [b.right - 4, b.bottom], [b.left, b.bottom]], ink, 4);
      ctx.fillStyle = ink;
      ctx.fillRect(b.left + 9, b.top + 16, 18, 2);
      bolt(ctx, b.right - 21, b.top + 5, .62, "#372239");
    }
    polygon(ctx, "#62e7ff", [[shield - 65, shieldY + 3], [shield - 55, shieldY],
      [shield + 55, shieldY], [shield + 65, shieldY + 3],
      [shield + 56, shieldY + 15], [shield - 56, shieldY + 15]]);
    bolt(ctx, shield - 5, shieldY + 1, .52, ink);
    if (!academy.reduced && active) {
      for (let i = 3; i >= 1; i--)
        disk(ctx, ball.x - ball.vx * i * 1.7, ball.y - ball.vy * i * 1.7,
          2 + (3 - i), i % 2 ? "#f4dc46" : "#ffab6c", null);
    }
    disk(ctx, ball.x, ball.y, ball.radius, paper, "#512040", 2);
    if (burst && !academy.reduced) sparks(ctx, burst.x, burst.y, burst.age, burst.color);
  }

  return {
    key: ["Space", "ArrowLeft", "ArrowRight"],
    reset, action, step, draw,
    direction(dir) { moveShield(shield + (dir === 1 ? 1 : -1) * 27); },
    point(event) {
      const box = field.getBoundingClientRect();
      moveShield((event.clientX - box.left) / box.width * 600);
    },
  };
});
