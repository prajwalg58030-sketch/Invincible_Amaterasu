"use client";

import React from "react";
import { KillChainMeterState } from "@/types/telemetry";

const KILL_CHAIN_STAGES = [
  { idx: 0, label: "Recon", id: "TA0043" },
  { idx: 1, label: "Initial Access", id: "TA0001" },
  { idx: 2, label: "Lateral Move", id: "TA0008" },
  { idx: 3, label: "C2 Channel", id: "TA0011" },
  { idx: 4, label: "Exfiltration", id: "TA0010" },
];

export function KillChainMeter({
  state,
  risks,
}: {
  state?: KillChainMeterState;
  risks?: number[];
}) {
  const activeIdx = state?.current_stage_idx ?? 0;
  const projectedIdx = state?.projected_stage_idx ?? 1;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
          Kill-Chain Progression Anticipator
        </h3>
        <span className="text-[10px] font-mono text-cyan-400">
          Rollout Confidence: {((state?.progression_confidence ?? 0.05) * 100).toFixed(1)}%
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {KILL_CHAIN_STAGES.map((stage) => {
          const isPassed = stage.idx <= activeIdx && activeIdx > 0;
          const isProjected = stage.idx === projectedIdx && activeIdx < projectedIdx;

          return (
            <div
              key={stage.idx}
              className={`p-2.5 rounded border text-center transition-all ${
                isPassed
                  ? "bg-rose-500/20 border-rose-500 text-rose-300"
                  : isProjected
                  ? "bg-amber-500/15 border-amber-500/60 text-amber-300 animate-pulse"
                  : "bg-slate-950/60 border-slate-800 text-slate-500"
              }`}
            >
              <div className="text-[9px] font-mono opacity-60">{stage.id}</div>
              <div className="text-xs font-bold font-mono truncate">{stage.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}