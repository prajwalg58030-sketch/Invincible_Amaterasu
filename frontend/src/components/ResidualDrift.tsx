"use client";

import React from "react";
import { FeatureDeviation } from "@/types/telemetry";

export function ResidualDrift({ deviations = [] }: { deviations?: FeatureDeviation[] }) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-300">Root-Cause Residual Drift</h3>
        <span className="text-[10px] text-rose-400 font-mono">Δ = |X - X̂|</span>
      </div>
      <div className="space-y-2">
        {deviations.slice(0, 4).map((d) => {
          const pct = Math.min(Math.round(d.drift * 100), 100);
          return (
            <div key={d.feature}>
              <div className="flex justify-between text-[11px] mb-1 font-mono">
                <span className="text-slate-300">{d.feature}</span>
                <span className={pct > 40 ? "text-rose-400 font-bold" : "text-slate-400"}>+{d.drift.toFixed(3)}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${pct > 40 ? "bg-rose-500" : "bg-cyan-500"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}