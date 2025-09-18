// File: frontend/tests/operatorHarness.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { ReducerProvider } from "../studio/Reducer.jsx";
import OperatorConsole from "../studio/OperatorConsole.jsx";

function Harness() {
  return (
    <ReducerProvider>
      <div className="p-8 bg-black min-h-screen text-white">
        <h1 className="text-2xl mb-4">🧪 Operator Harness</h1>
        <OperatorConsole />
      </div>
    </ReducerProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Harness />
  </React.StrictMode>
);
