export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// helper function to create an r x c array
export function createArray(r, c, ph = 0) {
  var arr = [];

  for (let i = 0; i < r; i++) {
    var row = [];
    for (let j = 0; j < c; j++) {
      row.push(ph);
    }
    arr.push(row);
  }

  return arr;
}

export function isInBounds(r, c, grid) {
  if (r >= 0 && r < grid.length && c >= 0 && c < grid[0].length) return true;
  return false;
}
