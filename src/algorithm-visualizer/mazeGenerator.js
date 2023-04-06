const utils = require("./utils");
const blocks = require("./blocks");

// X X X X X
// X X X X X
// X X X X X
// X X X X X
// X   X X X

// const dirs = { up: [-1, 0], down: [1, 0], left: [0, 1], right: [0, -1] };
const dirChange = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

const dirs = ["up", "down", "left", "right"];

// get reverse direction of a given direction
const reverseDir = new Map();
reverseDir.set("up", "down");
reverseDir.set("down", "up");
reverseDir.set("left", "right");
reverseDir.set("right", "left");

function generateMaze(nRows, nCols) {
  let grid = utils.createArray(nRows, nCols, blocks.wall);
  const startDir = randChoice(dirs);
  const startPos = initStartPos(startDir, nRows, nCols);
  grid[startPos.r][startPos.c] = blocks.empty;

  return grid;
}

// random integer generator
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// choose random item from list
function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// return random start position on grid border based on defined direction
function initStartPos(startDir, nRows, nCols) {
  if (startDir === "up") {
    return { r: nRows - 1, c: randInt(1, nCols - 2) };
  } else if (startDir === "down") {
    return { r: 0, c: randInt(1, nCols - 2) };
  } else if (startDir === "left") {
    return { r: randInt(1, nRows - 2), c: nCols - 1 };
  } else if (startDir === "right") {
    return { r: randInt(1, nRows - 2), c: 0 };
  }
}

// return true if block at coord is a wall coordinate
// a wall is either a border block, or is adjacent to an empty block in the forward/side directions
function isWall(coord, forwardDir, grid) {
  if (
    coord.r === 0 ||
    coord.r === grid.length - 1 ||
    coord.c === 0 ||
    coord.c === grid[0].length - 1
  )
    return true;

  for (let i in dirs) {
    let direction = dirs[i];
    // dont check behind for empty blocks
    if (direction === reverseDir.get(forwardDir)) continue;

    let [nr, nc] = [coord.r + dirChange[i][0], coord.c + dirChange[i][1]];
    if (grid[nr][nc] === blocks.empty) return true;
  }

  return false;
}

// function getNextDir() {
//   const random = Math.floor(Math.random() * dirs.length);
//   return random;
// }

// // return random end coords for a straight corridor based on a start position
// function getCorner(start, grid, visited) {}

// return start and end coord objects, where coords are random coords on the border
// function initStartEnd(grid) {}

module.exports = { generateMaze, randInt, randChoice, isWall, initStartPos };
