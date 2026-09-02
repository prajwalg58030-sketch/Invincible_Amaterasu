// frontend/src/components/ResidualDrift.tsx
"use client";

import React from "react";
import { FeatureDeviation } from "@/types/telemetry";

interface ResidualDriftProps {
  deviations?: FeatureDeviation[] | Array<{ feature: string; [key: string]: any }>;
}

export const ResidualDrift = React.memo(function ResidualDrift({
  deviations = [],
}: ResidualDriftProps) {
  const topDeviations = deviations.slice(0, 5);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 font-mono text-xs">
      <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-3">
        Top Feature Drift (Δ_i Decomposition)
      </span>

      <div className="space-y-2.5">
        {topDeviations.length === 0 ? (
          <div className="text-slate-500 text-[11px]">Calculating feature drift...</div>
        ) : (
          topDeviations.map((item: any, idx) => {
            const devValue = Number(item.deviation ?? item.delta ?? item.drift ?? item.value ?? 0);
            const isAnomaly = devValue >= 0.4;
            const barWidth = Math.min(Math.max(devValue * 100, 4), 100);

            return (
              <div key={item.feature || idx} className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-300 truncate max-w-[140px]">{item.feature}</span>
                  <span className={`font-bold ${isAnomaly ? "text-rose-400" : "text-cyan-400"}`}>
                    Δ {devValue.toFixed(4)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                  <div
                    className={`h-full rounded-full transition-[width] duration-100 ease-out ${
                      isAnomaly ? "bg-rose-500" : "bg-cyan-500"
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});