import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import AlgorithmVisualizer from "./algorithm-visualizer/algoVisualizer";

const root = ReactDOM.createRoot(document.getElementById("root"));
const maxSize = 535;
root.render(
  <React.StrictMode>
    <div className="flex justify-center align-center w-screen h-screen pt-24">
      <AlgorithmVisualizer w={maxSize} h={maxSize} />
    </div>
  </React.StrictMode>
);
