function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// helper function to create an r x c array
function createArray(r, c, ph = 0) {
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

function isInBounds(r, c, grid) {
  if (r >= 0 && r < grid.length && c >= 0 && c < grid[0].length) return true;
  return false;
}

// set all v1's in grid to v2
function changeAll(v1, v2, grid) {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === v1) {
        grid[r][c] = v2;
      }
    }
  }
}

module.exports = { sleep, createArray, isInBounds, changeAll };
