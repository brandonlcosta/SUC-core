/**************************************************
 * Recap Panel
 * Purpose: Display recap highlights + summary
 * Inputs: recap JSON (from Broadcast Engine)
 * Outputs: UI panel in Studio
 **************************************************/

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function RecapPanel({ recap }) {
  if (!recap || !recap.highlights || recap.highlights.length === 0) {
    return (
      <Card className="p-4 rounded-2xl shadow bg-neutral-900 text-neutral-200">
        <CardContent>
          <h2 className="text-xl font-bold mb-2">Recap</h2>
          <p>No recap available for this session.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-4 rounded-2xl shadow bg-neutral-900 text-neutral-200">
      <CardContent>
        <h2 className="text-xl font-bold mb-2">Session Recap</h2>
        <p className="mb-4 text-sm opacity-80">{recap.summary}</p>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {recap.highlights.map((h, idx) => (
            <div
              key={idx}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition"
            >
              <span className="text-xs opacity-70">{h.timestamp}</span>
              <div className="text-sm font-medium mt-1">
                {h.type.toUpperCase()}:{" "}
                <span className="font-normal">
                  {JSON.stringify(h.detail)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
