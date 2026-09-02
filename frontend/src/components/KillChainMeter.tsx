// frontend/src/components/KillChainMeter.tsx
"use client";

import React, { memo } from "react";

const STAGES = [
  { name: "Recon", id: "TA0043" },
  { name: "Initial Access", id: "TA0001" },
  { name: "Lateral Move", id: "TA0008" },
  { name: "Command & Control", id: "TA0011" },
  { name: "Exfiltration", id: "TA0040" },
];

interface KillChainMeterProps {
  state?: {
    current_stage?: string;
    current_stage_idx?: number;
    projected_stage?: string;
    projected_stage_idx?: number;
    progression_confidence?: number;
  };
  risks?: number[];
  currentIdx?: number;
  projectedIdx?: number;
  confidence?: number;
}

function KillChainMeterBase({
  state,
  risks,
  currentIdx,
  projectedIdx,
  confidence,
}: KillChainMeterProps) {
  const activeIdx = currentIdx ?? state?.current_stage_idx ?? 0;
  const targetIdx = projectedIdx ?? state?.projected_stage_idx ?? 1;
  const rawConfidence =
    confidence ??
    state?.progression_confidence ??
    (risks && risks.length > 0 ? risks[risks.length - 1] : 0.0);

  const confidencePct = (rawConfidence * 100).toFixed(1);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 font-mono">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          MITRE Kill Chain Horizon
        </span>
        <span className="text-[11px] text-amber-400">
          Horizon Forecast: {confidencePct}%
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {STAGES.map((s, idx) => {
          const isCurrent = idx === activeIdx;
          const isProjected = idx === targetIdx && idx > activeIdx;

          return (
            <div
              key={s.id}
              className={`p-2 rounded text-center border transition-colors duration-150 ${
                isCurrent
                  ? "bg-rose-950/70 border-rose-500 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.35)]"
                  : isProjected
                  ? "bg-amber-950/40 border-amber-500/70 border-dashed text-amber-300 animate-pulse"
                  : "bg-slate-950/50 border-slate-800 text-slate-500"
              }`}
            >
              <div className="text-[10px] text-slate-400">{s.id}</div>
              <div className="text-[11px] font-bold mt-1 truncate">{s.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const KillChainMeter = memo(KillChainMeterBase, (prev, next) => {
  // Always trigger render on the first payload transition from null/undefined
  if (!prev.state && next.state) return false;
  if (!prev.risks && next.risks) return false;
  if (prev.currentIdx === undefined && next.currentIdx !== undefined) return false;

  const prevCur = prev.currentIdx ?? prev.state?.current_stage_idx ?? 0;
  const nextCur = next.currentIdx ?? next.state?.current_stage_idx ?? 0;

  const prevProj = prev.projectedIdx ?? prev.state?.projected_stage_idx ?? 1;
  const nextProj = next.projectedIdx ?? next.state?.projected_stage_idx ?? 1;

  const prevConf =
    prev.confidence ??
    prev.state?.progression_confidence ??
    (prev.risks?.length ? prev.risks[prev.risks.length - 1] : 0);
  const nextConf =
    next.confidence ??
    next.state?.progression_confidence ??
    (next.risks?.length ? next.risks[next.risks.length - 1] : 0);

  // Skip re-render if stage indices are unchanged and confidence drift is below 0.5%
  return (
    prevCur === nextCur &&
    prevProj === nextProj &&
    Math.abs(prevConf - nextConf) < 0.005
  );
});

KillChainMeter.displayName = "KillChainMeter";

export default KillChainMeter;