// frontend/src/components/TrajectoryChart.tsx
"use client";

import React, { useMemo } from "react";
import { TelemetryPayload } from "@/types/telemetry";

export const TrajectoryChart = React.memo(function TrajectoryChart({
  history,
}: {
  history: TelemetryPayload[];
}) {
  if (history.length < 2) {
    return (
      <div className="h-56 bg-slate-900/90 border border-slate-800 rounded-lg p-4 flex items-center justify-center font-mono text-xs text-slate-500">
        Awaiting telemetry stream...
      </div>
    );
  }

  const { realityPath, ghostPath, latestDelta } = useMemo(() => {
    const N = history.length;
    let rPath = "";
    let gPath = "";

    for (let i = 0; i < N; i++) {
      const x = ((i / (N - 1)) * 100).toFixed(1);
      
      const rVal = Math.min(Math.max(history[i]?.trajectory_split?.current_observed_val ?? 0, 0), 1);
      const yR = (100 - rVal * 100).toFixed(1);
      rPath += `${x},${yR} `;

      const gVal = Math.min(Math.max(history[i]?.trajectory_split?.current_predicted_val ?? 0, 0), 1);
      const yG = (100 - gVal * 100).toFixed(1);
      gPath += `${x},${yG} `;
    }

    const delta = history[history.length - 1]?.trajectory_split?.divergence_delta ?? 0;
    return { realityPath: rPath.trim(), ghostPath: gPath.trim(), latestDelta: delta };
  }, [history]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 font-mono">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Trajectory Divergence: Reality vs. Ghost Physics
        </span>
        <span className={`text-xs ${latestDelta > 0.4 ? "text-rose-400 animate-pulse font-bold" : "text-emerald-400"}`}>
          Δ Divergence: {latestDelta.toFixed(4)}
        </span>
      </div>

      <div className="h-44 w-full relative">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          {/* Ghost Forecast (Cyan Dashed) */}
          <polyline fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="2,2" points={ghostPath} />
          {/* Reality Observation (Crimson Solid) */}
          <polyline fill="none" stroke="#f43f5e" strokeWidth="2.5" points={realityPath} />
        </svg>
      </div>

      <div className="flex gap-4 mt-2 text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-rose-500 inline-block"/> Reality Observation</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 border-t-2 border-dashed border-cyan-400 inline-block"/> Ghost World Model</div>
      </div>
    </div>
  );
});