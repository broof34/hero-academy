mountArcade(({ field, score, detail, sound, finish }) => {
  const powers = {
    2: ["•", "Spark"],
    4: ["ϟ", "Bolt"],
    8: ["◆", "Gem"],
    16: ["✦", "Star"],
    32: ["▲", "Rocket"],
    64: ["✹", "Nova"],
  };
  const cells = [];
  let manager;
  let previousScore = 0, highest = 0;
  for (let y = 0; y < 4; y++) {
    const row = document.createElement("div");
    row.className = "board-row";
    row.setAttribute("role", "row");
    for (let x = 0; x < 4; x++) {
      const cell = document.createElement("div");
      cell.setAttribute("role", "gridcell");
      cell.className = "tile";
      const icon = document.createElement("span");
      icon.setAttribute("aria-hidden", "true");
      const value = document.createElement("strong");
      cell.append(icon, value);
      row.append(cell);
      cells.push({ cell, icon, value });
    }
    field.append(row);
  }

  function render(grid, points, over) {
    let max = 0;
    grid.eachCell((x, y, tile) => {
      const { cell, icon, value } = cells[y * 4 + x];
      const [symbol, name] = tile ? (powers[tile.value] || ["✸", "Supernova"]) : ["", "Empty"];
      if (tile) {
        cell.dataset.value = tile.value;
        max = Math.max(max, tile.value);
      } else {
        delete cell.dataset.value;
      }
      cell.setAttribute("aria-label", tile ? `${tile.value}, ${name}` : name);
      icon.textContent = symbol;
      value.textContent = tile?.value ?? "";
      cell.classList.remove("combined");
      if (tile?.mergedFrom) {
        // Re-trigger the short feedback when the same cell merges again.
        cell.getAnimations().forEach((animation) => animation.cancel());
        requestAnimationFrame(() => {
          if (cell.dataset.value === String(tile.value)) cell.classList.add("combined");
        });
      }
    });
    score(points);
    detail(max < 64 ? `Top tile: ${max} · Goal: 64` : `Top tile: ${max} · Goal reached!`);
    if (max > highest && max >= 64) sound(498, 998, .23);
    else if (points > previousScore) sound(390, 760);
    highest = max;
    previousScore = points;
    if (over) finish("Board full! Try a fresh puzzle?");
  }

  function reset() {
    if (manager) manager.restart();
    else manager = new GameManager(4, render);
  }

  return { reset, move(direction) { manager.move(direction); } };
});
