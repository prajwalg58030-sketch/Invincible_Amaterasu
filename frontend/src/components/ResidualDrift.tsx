"use client";

import React from "react";
import { FeatureDeviation } from "@/types/telemetry";

export function ResidualDrift({ deviations }: { deviations?: FeatureDeviation[] }) {
  const displayDevs = (deviations || []).slice(0, 6);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 font-mono text-xs">
      <h3 className="font-bold text-slate-300 uppercase tracking-wider mb-3">
        Ranked Feature Residual Drift (Δ)
      </h3>

      <div className="space-y-2.5">
        {displayDevs.length === 0 ? (
          <div className="text-slate-500 py-4 text-center">No drift calculated</div>
        ) : (
          displayDevs.map((d) => {
            const isHigh = d.deviation >= 0.4;
            const isMid = d.deviation >= 0.15;
            const widthPct = Math.min(Math.max(d.deviation * 100, 4), 100);

            return (
              <div key={d.feature} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 truncate">{d.feature}</span>
                  <span
                    className={
                      isHigh ? "text-rose-400 font-bold" : isMid ? "text-amber-400" : "text-emerald-400"
                    }
                  >
                    +{d.deviation.toFixed(4)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isHigh ? "bg-rose-500" : isMid ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}