const { wall } = require("./algorithm-visualizer/blocks");
const mg = require("./algorithm-visualizer/mazeGenerator");

const [nRows, nCols] = [64, 64];
let maze = mg.generateMaze(nRows, nCols);

test("maze should be nRows x nCols", () => {
  expect(maze.length).toBe(nRows);
  expect(maze[0].length).toBe(nCols);
});

test("randInt should pick random int between [a, b] inclusive", () => {
  let s = new Set();
  for (let i = 0; i < 200; i++) {
    s.add(mg.randInt(0, 3));
  }
  expect(s.size).toBe(4); // 0,1,2,3
});

test("randChoice should choose be able to pick any item in list", () => {
  let s = new Set();
  const d = ["up", "down", "left", "right"];
  for (let i = 0; i < 200; i++) {
    let item = mg.randChoice(d);
    s.add(item);
  }
  expect(s.size).toBe(d.length);
  expect(s.has("up")).toBe(true);
  expect(s.has("down")).toBe(true);
  expect(s.has("left")).toBe(true);
  expect(s.has("right")).toBe(true);
});

test("isWall", () => {
  let newMaze = [...maze];

  let wall = { r: 0, c: 1 };
  expect(mg.isWall(wall, "down", newMaze)).toBe(true);

  wall = { r: nRows - 1, c: 1 };
  expect(mg.isWall(wall, "up", newMaze)).toBe(true);

  wall = { r: 1, c: 0 };
  expect(mg.isWall(wall, "right", newMaze)).toBe(true);

  wall = { r: 1, c: nCols - 1 };
  expect(mg.isWall(wall, "left", newMaze)).toBe(true);

  newMaze[0][1] = 0;
  expect(mg.isWall({ r: 1, c: 1 }, "down", newMaze)).toBe(false);

  expect(mg.isWall({ r: 10, c: 10 }, "up", newMaze)).toBe(false);
  expect(mg.isWall({ r: 10, c: 10 }, "down", newMaze)).toBe(false);
  expect(mg.isWall({ r: 10, c: 10 }, "left", newMaze)).toBe(false);
  expect(mg.isWall({ r: 10, c: 10 }, "right", newMaze)).toBe(false);
});

test("initStartPos should return coord on border of grid", () => {
  const d = ["up", "down", "left", "right"];

  for (let i in d) {
    for (let k = 0; k < nRows * 3; k++) {
      const startPos = mg.initStartPos(d[i], nRows, nCols);
      if (d[i] === "up") expect(startPos.r).toBe(nRows - 1);
      else if (d[i] === "down") expect(startPos.r).toBe(0);
      else if (d[i] === "left") expect(startPos.c).toBe(nCols - 1);
      else if (d[i] === "right") expect(startPos.c).toBe(0);
    }
  }
});
