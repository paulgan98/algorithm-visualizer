import React, { useState, useEffect, useRef } from "react";
import "./algoVisualizer.css";
import * as algorithms from "./algorithms";
const blocks = require("./blocks");
const utils = require("./utils");
const mazeGenerator = require("./mazeGenerator");

const DEBUG = false;

export default function AlgorithmVisualizer(props) {
  const randomInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const canvasRef = useRef(null);
  const scale = window.devicePixelRatio || 1;

  const [minBlockScale, maxBlockScale] = [2, 5];
  const defaultBlockScale = minBlockScale + 1;
  const baseBlockSize = 2;
  let blockScale = useRef(defaultBlockScale);
  let blockSize = useRef(baseBlockSize * Math.pow(2, blockScale.current));
  let [nRows, nCols] = [
    useRef(Math.floor(props.h / blockSize.current)),
    useRef(Math.floor(props.w / blockSize.current)),
  ];

  let gap = useRef((props.h % blockSize.current) / (nCols.current + 1)); // gap size

  const [result, setResult] = useState("-");
  const [algorithm, setAlgorithm] = useState("bfs");
  let run = useRef(false);

  const [sliderMin, sliderMax] = [0, 100];
  let speed = useRef(sliderMax - 1);

  // mouse data
  const [mousePos, setMousePos] = useState({ x: -1, y: -1 });
  let [isLeftMouseDown, isRightMouseDown, isShiftDown] = [
    useRef(false),
    useRef(false),
    useRef(false),
  ];

  let [hoverRow, hoverCol] = [useRef(-1), useRef(-1)];
  let isEventListenersAttached = useRef(false);

  // initialize random start and end positions
  let _start = {
    r: randomInteger(0, Math.floor((nRows.current - 1) / 2)),
    c: randomInteger(0, nCols.current - 1),
  };
  let _end = {
    r: randomInteger(
      Math.floor((nRows.current - 1) / 2) + 1,
      nRows.current - 1
    ),
    c: randomInteger(0, nCols.current - 1),
  };

  const [startPos, setStartPos] = useState(_start);
  const [endPos, setEndPos] = useState(_end);

  let tempGrid = utils.createArray(nRows.current, nCols.current);
  tempGrid[_start.r][_start.c] = 2;
  tempGrid[_end.r][_end.c] = 3;

  // array to store block states
  let [grid, setGrid] = useState(tempGrid);

  function runSearch(start, end) {
    run.current = true;
    let res = null;
    if (algorithm === "dfs")
      res = algorithms.dfs(start, end, grid, run, speed, setGrid);
    else if (algorithm === "bfs")
      res = algorithms.bfs(start, end, grid, run, speed, setGrid);
    else if (algorithm === "bfsShortestPath")
      res = algorithms.bfsShortestPath(start, end, grid, run, speed, setGrid);

    return res;
  }

  function resetVisited() {
    run.current = false;

    let newGrid = [...grid];
    utils.changeAll(blocks.visited, blocks.empty, newGrid);
    utils.changeAll(blocks.path, blocks.empty, newGrid);
    setGrid(newGrid);
    setResult("-");
  }

  useEffect(() => {
    // handles logic for user interactions
    function updateGrid() {
      if (hoverRow.current === -1 || hoverCol.current === -1) return;

      let n; // type of block we want to add to grid

      if (isLeftMouseDown.current) {
        if (result !== "-") setResult("-");
        // if shift is pressed, we are adding wall (n = 4)
        if (isShiftDown.current) n = blocks.wall;
        else n = blocks.source; // source block
      } else if (isRightMouseDown.current) {
        if (result !== "-") setResult("-");
        if (isShiftDown.current) n = blocks.empty;
        else n = blocks.sink; // sink block
      } else {
        return;
      }

      // if same -> return
      if (n === grid[hoverRow.current][hoverCol.current]) return;

      // if clearing start point -> return
      if (grid[hoverRow.current][hoverCol.current] === blocks.source) return;

      // if attempting to place start/end point on wall -> return
      if (
        (n === blocks.source || n === blocks.sink) &&
        grid[hoverRow.current][hoverCol.current] === blocks.wall
      )
        return;

      if (grid[hoverRow.current][hoverCol.current] === blocks.source)
        setStartPos({ r: -1, c: -1 });
      if (grid[hoverRow.current][hoverCol.current] === blocks.sink)
        setEndPos({ r: -1, c: -1 });

      // if setting start/end point, remove other start/end points from grid, and set startPos
      if (n === blocks.source) {
        utils.changeAll(n, blocks.empty, grid);
        setStartPos({ r: hoverRow.current, c: hoverCol.current });
      } else if (n === blocks.sink) {
        utils.changeAll(n, blocks.empty, grid);
        setEndPos({ r: hoverRow.current, c: hoverCol.current });
      }

      // update grid with new value, and trigger a rerender
      let newGrid = [...grid];
      newGrid[hoverRow.current][hoverCol.current] = n;
      utils.changeAll(blocks.visited, blocks.empty, newGrid); // clear all visited blocks in grid
      utils.changeAll(blocks.path, blocks.empty, newGrid); // clear all path blocks in grid
      setGrid(newGrid);
      run.current = false; // stop currently running algorithms
    }

    // check if mouse is hovering over rect
    const isMouseOverBlock = (r, c) => {
      return (
        mousePos.x >= c - 0.5 * gap.current &&
        mousePos.x < c + blockSize.current + 0.5 * gap.current &&
        mousePos.y >= r - 0.5 * gap.current &&
        mousePos.y < r + blockSize.current + 0.5 * gap.current
      );
    };

    // return color based on value of grid[j][i]
    const getFillColor = (j, i) => {
      const opacity = "dd";
      var color = "";
      // unvisited block
      if (grid[j][i] === blocks.empty) {
        color = "#ffffff";
      }
      // visited block
      else if (grid[j][i] === blocks.visited) {
        // color = "#00ff00";
        color = "#3ded97";
      }
      // start block
      else if (grid[j][i] === blocks.source) {
        // color = "#ff0000";
        color = "#d21f3c";
      }
      // end block
      else if (grid[j][i] === blocks.sink) {
        // color = "#0000cc";
        color = "#1aa7ec";
      }
      // wall block
      else if (grid[j][i] === blocks.wall) {
        color = "#444444";
      }
      // path block
      else if (grid[j][i] === blocks.path) {
        color = "#ffff00";
      }

      return color.concat(opacity);
    };

    const drawGrid = (ctx, canvas) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let [hoverR, hoverC, fillColor] = [null, null, null];

      for (let j = 0; j < nRows.current; j++) {
        for (let i = 0; i < nCols.current; i++) {
          const [r, c] = [
            j * (blockSize.current + gap.current),
            i * (blockSize.current + gap.current),
          ];

          ctx.beginPath();

          if (isMouseOverBlock(r, c)) {
            [hoverR, hoverC, fillColor] = [r, c, getFillColor(j, i)];
          } else {
            ctx.fillStyle = getFillColor(j, i);
            ctx.rect(c, r, blockSize.current, blockSize.current);
            ctx.fill();
          }

          if (DEBUG) {
            ctx.font = "10px Arial";
            ctx.fillStyle = "#000";
            ctx.fillText(String(grid[j][i]), c + 7, r + 14);
          }
        }
      }

      if (hoverR !== null) {
        const lineThickness = Math.min(2, blockSize.current / 10);
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.rect(
          hoverC + 0.5 * lineThickness,
          hoverR + 0.5 * lineThickness,
          blockSize.current - lineThickness,
          blockSize.current - lineThickness
        );
        ctx.fill();

        ctx.lineWidth = lineThickness;
        ctx.strokeStyle = "#00ff00ff";
        ctx.stroke();
      }
    };

    function handleMouseMove(e, canvas) {
      const rect = canvas.getBoundingClientRect();
      const [relX, relY] = [
        Math.floor(e.clientX - rect.left),
        Math.floor(e.clientY - rect.top),
      ];
      setMousePos({
        x: relX,
        y: relY,
      });

      // update mouse hover position (hoverRow and hoverCol)
      let [r, c] = [-1, -1];
      r = Math.floor(relY / (blockSize.current + gap.current));
      c = Math.floor(relX / (blockSize.current + gap.current));

      if (r < 0 || c < 0 || r >= nRows.current || c >= nCols.current) return;

      hoverRow.current = r;
      hoverCol.current = c;
    }

    function handleKeyDown(e, canvas) {
      if (e.keyCode === 16) {
        e.preventDefault();
        isShiftDown.current = true;
      }

      // return if click did not occur within canvas
      const rect = canvas.getBoundingClientRect();
      if (
        !(
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        )
      )
        return;

      e.preventDefault();

      // left
      if (e.button === 0) isLeftMouseDown.current = true;
      // right
      else isRightMouseDown.current = true;

      const [currX, currY] = [
        Math.floor(e.clientX - rect.left),
        Math.floor(e.clientY - rect.top),
      ];

      setMousePos({ x: currX, y: currY });
    }

    function handleKeyRelease(e, canvas) {
      e.preventDefault();

      if (e.keyCode === 16) {
        isShiftDown.current = false;
      }

      const rect = canvas.getBoundingClientRect();

      if (e.button === 0) {
        isLeftMouseDown.current = false; // left
      } else {
        isRightMouseDown.current = false; // right
      }

      const [currX, currY] = [
        Math.floor(e.clientX - rect.left),
        Math.floor(e.clientY - rect.top),
      ];

      if (mousePos.x !== currX && mousePos.y !== currY) {
        setMousePos({ x: currX, y: currY });
      }
    }

    // create HD canvas
    function createHiPPICanvas(w, h) {
      let cv = canvasRef.current;
      cv.width = w * scale;
      cv.height = h * scale;
      cv.style.width = w + "px";
      cv.style.height = h + "px";
      cv.getContext("2d").scale(scale, scale);
      return cv;
    }

    const canvas = createHiPPICanvas(props.w, props.h);
    const context = canvas.getContext("2d");

    if (!isEventListenersAttached.current) {
      window.addEventListener("mousemove", (e) => {
        handleMouseMove(e, canvas);
      });
    }

    if (!isEventListenersAttached.current) {
      window.addEventListener("contextmenu", (e) => {
        const rect = canvas.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          e.preventDefault();
        }
      });
      window.addEventListener("mousedown", (e) => {
        handleKeyDown(e, canvas);
      });
      window.addEventListener("keydown", (e) => {
        handleKeyDown(e, canvas);
      });
    }

    if (!isEventListenersAttached.current) {
      window.addEventListener("mouseup", (e) => {
        handleKeyRelease(e, canvas);
      });
      window.addEventListener("keyup", (e) => {
        handleKeyRelease(e, canvas);
      });
    }

    isEventListenersAttached.current = true;
    updateGrid();
    drawGrid(context, canvas);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleKeyDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleKeyDown);
      window.removeEventListener("mouseup", handleKeyRelease);
      window.removeEventListener("keyup", handleKeyRelease);
    };
  }, [
    props,
    nRows,
    nCols,
    scale,
    grid,
    blockSize,
    blockScale,
    algorithm,
    mousePos,
    hoverRow,
    hoverCol,
    isLeftMouseDown,
    isRightMouseDown,
    isShiftDown,
    result,
    speed,
    gap,
  ]);

  return (
    <div className="flex">
      <div className="flex mx-3">
        <canvas className="bfs-canvas" ref={canvasRef} {...props} />
        <div className="px-5 w-96">
          <div className="options-block">
            <p>Search Algorithm:</p>
            <div className="flex">
              <div
                className="mr-5"
                onClick={() => {
                  setAlgorithm("bfs");
                  resetVisited();
                }}
              >
                <label>
                  <input
                    className="mr-1"
                    type="radio"
                    name="algorithm"
                    value={algorithm}
                    checked={algorithm === "bfs"}
                    onChange={() => {
                      setAlgorithm("bfs");
                      resetVisited();
                    }}
                  />
                  BFS
                </label>
              </div>
              <div
                className="mr-5"
                onClick={() => {
                  setAlgorithm("dfs");
                  resetVisited();
                }}
              >
                <label>
                  <input
                    className="mr-1"
                    type="radio"
                    name="algorithm"
                    value={algorithm}
                    checked={algorithm === "dfs"}
                    onChange={() => {
                      setAlgorithm("dfs");
                      resetVisited();
                    }}
                  />
                  DFS
                </label>
              </div>
              <div
                className="mr-5"
                onClick={() => {
                  setAlgorithm("bfsShortestPath");
                  resetVisited();
                }}
              >
                <label>
                  <input
                    className="mr-1"
                    type="radio"
                    name="algorithm"
                    value={algorithm}
                    checked={algorithm === "bfsShortestPath"}
                    onChange={() => {
                      setAlgorithm("bfsShortestPath");
                      resetVisited();
                    }}
                  />
                  BFS Shortest Path
                </label>
              </div>
            </div>
          </div>

          <div className="options-block">
            <label htmlFor="block-size">Block Size: {blockSize.current}</label>
            <input
              className="block"
              type="range"
              id="block-size"
              name="block-size"
              min={minBlockScale}
              max={maxBlockScale}
              defaultValue={defaultBlockScale}
              step={1}
              onInput={(e) => {
                e.preventDefault();
                const val = parseInt(e.target.value);
                blockScale.current = val;

                run.current = false;
                setResult("-");

                blockSize.current = baseBlockSize * Math.pow(2, val);
                nRows.current = Math.floor(props.h / blockSize.current);
                nCols.current = Math.floor(props.w / blockSize.current);
                gap.current =
                  (props.h % blockSize.current) / (nCols.current + 1);

                // initialize random start and end positions
                _start = {
                  r: randomInteger(0, Math.floor((nRows.current - 1) / 2)),
                  c: randomInteger(0, nCols.current - 1),
                };

                _end = {
                  r: randomInteger(
                    Math.floor((nRows.current - 1) / 2) + 1,
                    nRows.current - 1
                  ),
                  c: randomInteger(0, nCols.current - 1),
                };

                let tempGrid = utils.createArray(nRows.current, nCols.current);
                tempGrid[_start.r][_start.c] = 2;
                tempGrid[_end.r][_end.c] = 3;

                setStartPos(_start);
                setEndPos(_end);
                setGrid(tempGrid);
              }}
            />
          </div>

          <div className="options-block">
            <label htmlFor="speed">
              Speed: {speed.current === sliderMax ? "Max" : speed.current + 1}
            </label>
            <input
              className="block"
              type="range"
              id="speed"
              name="speed"
              min={sliderMin}
              max={sliderMax}
              defaultValue={speed.current}
              step={1}
              onInput={(e) => {
                e.preventDefault();
                const val = parseInt(e.target.value);
                speed.current = val;
              }}
            />
          </div>

          <div className="options-block">
            <button
              className="block"
              onClick={() => {
                if (startPos.r === -1) return;

                resetVisited();

                const prom = runSearch(startPos, endPos);
                if (run.current) {
                  prom.then((res) => {
                    setResult(res);
                    run.current = false;
                  });
                }
              }}
            >
              Begin Search
            </button>
            <button
              className="block"
              onClick={() => {
                resetVisited();
              }}
            >
              Clear Visited
            </button>
            <button
              className="block"
              onClick={() => {
                resetVisited();
                utils.changeAll(blocks.wall, blocks.empty, grid);
              }}
            >
              Clear Walls
            </button>
            <button
              className="block"
              onClick={() => {
                resetVisited();
                setGrid(
                  mazeGenerator.generateMaze(nRows.current, nCols.current)
                );
              }}
            >
              Generate Maze
            </button>
          </div>

          <div className="options-block">
            <p>
              {algorithm === "bfsShortestPath" ? "Path Length" : "Result"}:
              {` ${result}`}
            </p>
          </div>
        </div>
      </div>

      {DEBUG === false ? null : (
        <div className="mx-3 w-70">
          <div>
            <div>
              Keys Down:
              {` ${String(isLeftMouseDown.current)}, ${String(
                isRightMouseDown.current
              )}, ${String(isShiftDown.current)}`}
            </div>
            <div>
              Grid Val:
              {hoverRow.current !== -1 &&
              hoverRow.current < nRows.current &&
              hoverCol.current < nCols.current
                ? ` ${grid[hoverRow.current][hoverCol.current]}, (${
                    hoverRow.current
                  }, ${hoverCol.current})`
                : ""}
            </div>
            <div>nRows, nCols: {`(${nRows.current}, ${nCols.current})`}</div>
            <div>Grid Dimensions: {`(${grid.length}, ${grid[0].length})`}</div>
            <div>Block Scale: {blockScale.current}</div>
            <div>Block Size: {blockSize.current}</div>
          </div>
        </div>
      )}
    </div>
  );
}
