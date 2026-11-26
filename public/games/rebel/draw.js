/* Original Project REBEL screen-printed game artwork and hit effects. */
const ink = "#131018";
const paper = "#fff1d7";
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function polygon(ctx, fill, points, edge = ink, line = 3) {
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (const point of points.slice(1)) ctx.lineTo(...point);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (edge) {
    ctx.strokeStyle = edge;
    ctx.lineWidth = line;
    ctx.stroke();
  }
}

function disk(ctx, x, y, r, fill, edge = ink, line = 3) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (edge) {
    ctx.strokeStyle = edge;
    ctx.lineWidth = line;
    ctx.stroke();
  }
}

function screenprint(ctx, top, bottom, dot) {
  const sky = ctx.createLinearGradient(0, 0, 0, 360);
  sky.addColorStop(0, top);
  sky.addColorStop(1, bottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 360);
  ctx.fillStyle = dot;
  ctx.beginPath();
  for (let x = 4; x < 600; x += 11) {
    for (let y = 4; y < 360; y += 11) {
      const r = 1 + (x + y) / 900;
      ctx.moveTo(x + r, y);
      ctx.arc(x, y, r, 0, Math.PI * 2);
    }
  }
  ctx.fill();
}

function backdrop(draw) {
  const layer = document.createElement("canvas");
  layer.width = 600;
  layer.height = 360;
  draw(layer.getContext("2d"));
  return layer;
}

function bolt(ctx, x, y, s, color = paper) {
  polygon(ctx, color, [[x + 9*s, y], [x, y + 14*s], [x + 7*s, y + 14*s],
    [x + 4*s, y + 25*s], [x + 17*s, y + 10*s], [x + 10*s, y + 10*s]], null);
}

function sparks(ctx, x, y, age, color) {
  if (age >= 20) return;
  ctx.save();
  ctx.globalAlpha = 1 - age / 20;
  for (let i = 0; i < 8; i++) {
    const angle = i * Math.PI / 4;
    const dx = Math.cos(angle), dy = Math.sin(angle);
    const a = 9 + age * 1.35, b = a + 9;
    polygon(ctx, color, [[x + dx*a - dy*2, y + dy*a + dx*2],
      [x + dx*b, y + dy*b], [x + dx*a + dy*2, y + dy*a - dx*2]], null);
  }
  ctx.restore();
}
