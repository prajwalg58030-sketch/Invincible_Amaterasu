"use client";

import React from "react";
import { KillChainState } from "@/types/telemetry";

const STAGES = [
  { id: 0, label: "Reconnaissance", code: "TA0043" },
  { id: 1, label: "Initial Access", code: "TA0001" },
  { id: 2, label: "Lateral Move", code: "TA0008" },
  { id: 3, label: "C2 Channel", code: "TA0011" },
  { id: 4, label: "Exfiltration / Impact", code: "TA0040" },
];

export function KillChainMeter({ state, risks }: { state?: KillChainState; risks?: number[] }) {
  const currentIdx = state?.current_stage_idx ?? 0;
  const projectedIdx = state?.projected_stage_idx ?? 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-300">
          Kill Chain Progression & K-Step Forward Horizon
        </h3>
        <span className="text-[10px] text-slate-400 font-mono">
          Rollout Confidence: {((state?.progression_confidence ?? 0) * 100).toFixed(1)}%
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {STAGES.map((s) => {
          const isCurrent = s.id === currentIdx;
          const isProjected = s.id === projectedIdx && projectedIdx > currentIdx;
          const isPassed = s.id < currentIdx;

          return (
            <div
              key={s.id}
              className={`p-2.5 rounded border text-center transition-all ${
                isCurrent
                  ? "bg-rose-950/60 border-rose-500 text-rose-300 ring-1 ring-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                  : isProjected
                  ? "bg-amber-950/40 border-amber-500/80 border-dashed text-amber-300 animate-pulse"
                  : isPassed
                  ? "bg-slate-800/60 border-slate-700 text-slate-400"
                  : "bg-slate-950/40 border-slate-800 text-slate-600"
              }`}
            >
              <div className="text-[9px] font-mono tracking-widest uppercase">{s.code}</div>
              <div className="text-xs font-semibold truncate mt-0.5">{s.label}</div>
              <div className="text-[8px] mt-1 uppercase font-bold">
                {isCurrent ? "Active State" : isProjected ? "Horizon K=5" : isPassed ? "Traversed" : "Nominal"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}