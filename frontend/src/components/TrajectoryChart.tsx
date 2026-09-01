"use client";

import React from "react";
import { TelemetryPayload } from "@/types/telemetry";

export function TrajectoryChart({ history }: { history: TelemetryPayload[] }) {
  if (!history || history.length < 2) {
    return (
      <div className="h-48 bg-slate-900/90 border border-slate-800 rounded-lg flex items-center justify-center text-slate-500 text-xs font-mono">
        Accumulating real-time telemetry stream...
      </div>
    );
  }

  const points = history.map((h, i) => {
    const obs = h.trajectory_split?.current_observed_val ?? 0;
    const pred = h.trajectory_split?.current_predicted_val ?? 0;
    const x = (i / (history.length - 1)) * 100;
    const yObs = Math.max(2, Math.min(98, 100 - obs * 100));
    const yPred = Math.max(2, Math.min(98, 100 - pred * 100));
    return { x, yObs, yPred };
  });

  const obsPath = points.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.yObs}`, "");
  const predPath = points.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.yPred}`, "");

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          Trajectory Divergence: Expected Physics vs Reality
        </h3>
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-3 h-0.5 bg-cyan-400 inline-block" /> Ghost Forecast (X̂ t+1)
          </span>
          <span className="flex items-center gap-1.5 text-rose-500">
            <span className="w-3 h-0.5 bg-rose-500 inline-block" /> Incoming Reality (X t+1)
          </span>
        </div>
      </div>
      <div className="relative h-44 w-full bg-slate-950/60 rounded border border-slate-800/60 overflow-hidden p-2">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d={predPath} fill="none" stroke="#00f0ff" strokeWidth="1.5" strokeDasharray="2,2" />
          <path d={obsPath} fill="none" stroke="#f43f5e" strokeWidth="2.5" />
        </svg>
      </div>
    </div>
  );
}