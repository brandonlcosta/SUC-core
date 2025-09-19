import React from "react";

export default function OperatorConsole() {
  return (
    <div className="absolute bottom-4 right-4 bg-gray-800/90 rounded-xl p-3 shadow-lg text-sm">
      <h3 className="text-pink-500 font-bold mb-2">🎛 Operator Console</h3>
      <button className="bg-pink-600 hover:bg-pink-700 px-3 py-1 rounded mr-2">Replay</button>
      <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded mr-2">Sponsor</button>
      <button className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded">Rollback</button>
    </div>
  );
}
