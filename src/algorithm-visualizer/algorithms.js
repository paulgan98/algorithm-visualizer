import * as utils from "./utils";

// DFS
export async function dfs(start, end, grid, run, speed, setGrid) {
  var dirs = [
    [-1, 0], // up
    [0, 1], // right
    [1, 0], // down
    [0, -1], // left
  ];

  const [nRows, nCols] = [grid.length, grid[0].length];

  let visited = utils.createArray(nRows, nCols);

  var stack = [start];
  let curr = null;

  while (stack.length > 0 && run.current) {
    curr = stack.pop();

    if (visited[curr.r][curr.c] === 1) continue;

    // found target, return
    if (curr.r === end.r && curr.c === end.c) {
      return "Path Found!";
    }

    // update ui grid
    let newGrid = [...grid];
    if (!(curr.r === start.r && curr.c === start.c)) {
      newGrid[curr.r][curr.c] = 1; // if not source, set to visited in ui grid
      visited[curr.r][curr.c] = 1; // set internal grid to visited
    }

    setGrid(newGrid);

    for (let i in dirs) {
      const [nr, nc] = [curr.r + dirs[i][0], curr.c + dirs[i][1]];

      // if 1) in bounds 2) not visited 3) not wall -> add to stack
      if (
        utils.isInBounds(nr, nc, grid) &&
        visited[nr][nc] === 0 &&
        grid[nr][nc] !== 4
      ) {
        stack.push({ r: nr, c: nc });
      }
    }

    if (speed.current < 100) {
      await utils.sleep(100 - speed.current);
    }
  }

  if (!run.current) return "-";

  // no path between source and destination
  return "Path Not Found!";
}

// BFS
export async function bfs(start, end, grid, run, speed, setGrid, setResult) {
  var dirs = [
    [-1, 0], // up
    [0, 1], // right
    [1, 0], // down
    [0, -1], // left
  ];

  const [nRows, nCols] = [grid.length, grid[0].length];

  let visited = utils.createArray(nRows, nCols);

  var queue = [start];

  while (queue.length > 0 && run.current) {
    let curr = null;

    curr = queue.shift();

    if (visited[curr.r][curr.c] === 1) continue;

    // found target, return
    if (curr.r === end.r && curr.c === end.c) {
      return "Path Found!";
    }

    // update ui grid
    let newGrid = [...grid];
    if (!(curr.r === start.r && curr.c === start.c)) {
      newGrid[curr.r][curr.c] = 1; // if not source, set to visited in ui grid
    }

    setGrid(newGrid);

    visited[curr.r][curr.c] = 1; // set internal grid to visited

    for (let i in dirs) {
      const [nr, nc] = [curr.r + dirs[i][0], curr.c + dirs[i][1]];

      // if 1) in bounds 2) not visited 3) not wall -> add to queue
      if (
        utils.isInBounds(nr, nc, grid) &&
        visited[nr][nc] === 0 &&
        grid[nr][nc] !== 4
      ) {
        queue.push({ r: nr, c: nc });
      }
    }

    if (speed.current < 100) {
      await utils.sleep(100 - speed.current);
    }
  }

  if (!run.current) return "-";

  // no path between source and destination
  return "Path Not Found!";
}

// BFS shortest path
export async function bfsShortestPath(
  start,
  end,
  grid,
  run,
  speed,
  setGrid,
  setResult
) {
  var dirs = [
    [-1, 0], // up
    [0, 1], // right
    [1, 0], // down
    [0, -1], // left
  ];

  const [nRows, nCols] = [grid.length, grid[0].length];

  let visited = utils.createArray(nRows, nCols);
  let prev = new Map();
  prev.set(start.r + "," + start.c, null);

  var queue = [start];

  let curr = null;

  while (queue.length > 0 && run.current) {
    curr = queue.shift();

    if (visited[curr.r][curr.c] === 1) continue;

    for (let i in dirs) {
      const [nr, nc] = [curr.r + dirs[i][0], curr.c + dirs[i][1]];

      // if 1) in bounds 2) not visited 3) not wall -> add to queue
      if (
        utils.isInBounds(nr, nc, grid) &&
        visited[nr][nc] === 0 &&
        grid[nr][nc] !== 4
      ) {
        queue.push({ r: nr, c: nc });
        prev.set(nr + "," + nc, curr);
      }
    }

    // found target, get shortest path, return path
    if (curr.r === end.r && curr.c === end.c) {
      let path = [];
      let currCoord = prev.get(`${curr.r},${curr.c}`);

      while (prev.get(`${currCoord.r},${currCoord.c}`) !== null) {
        path.push(currCoord);

        // update ui grid
        if (
          !(currCoord.r === start.r && currCoord.c === start.c) &&
          !(currCoord.r === end.r && currCoord.c === end.c)
        ) {
          let newGrid = [...grid];
          newGrid[currCoord.r][currCoord.c] = 5; // set to path block
          setGrid(newGrid);
        }

        currCoord = prev.get(`${currCoord.r},${currCoord.c}`);

        if (speed.current < 100) {
          await utils.sleep(100 - 0.95 * speed.current);
        }
      }

      //   path.reverse();

      //   let res = "";
      //   path.forEach((obj) => {
      //     if (res.length > 0) res += " -> ";
      //     res += `(${obj.r}, ${obj.c})`;
      //   });

      return path.length + 1;
    }

    // update ui grid
    let newGrid = [...grid];
    if (!(curr.r === start.r && curr.c === start.c)) {
      newGrid[curr.r][curr.c] = 1; // if not source, set to visited in ui grid
    }

    setGrid(newGrid);
    visited[curr.r][curr.c] = 1; // set internal grid to visited

    if (speed.current < 100) {
      await utils.sleep(100 - speed.current);
    }
  }

  if (!run.current) return "-";

  // no path between source and destination; return null
  return "Path Not Found!";
}
