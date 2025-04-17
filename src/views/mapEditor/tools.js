export function placeBlock(map, type, x, y) {
  switch (type) {
    case "moving":
      map[x][y] = { type: "moving", offset: 0 };
      map[x - 1][y] = { type: "placeholder" };
      map[x + 1][y] = { type: "placeholder" };
      break;
    case "moving-y":
      map[x][y] = { type: "moving-y", offset: 0 };
      map[x][y - 1] = { type: "placeholder" };
      map[x][y + 1] = { type: "placeholder" };
      break;
    case "sloped":
      map[x][y] = { type: "sloped" };
      map[x - 1][y] = { type: "placeholder", allows: ["star"] };
      break;
    default:
      map[x][y] = { type };
      break;
  }
}

export function removeBlock(map, x, y) {
  const { type } = map[x][y] || {};
  switch (type) {
    case "moving":
      map[x][y] = null;
      map[x - 1][y] = null;
      map[x + 1][y] = null;
      break;
    case "moving-y":
      map[x][y] = null;
      map[x][y - 1] = null;
      map[x][y + 1] = null;
      break;
    case "sloped":
      map[x][y] = null;
      break;
    default:
      map[x][y] = null;
      break;
  }
}
