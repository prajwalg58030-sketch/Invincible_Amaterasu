"use client";

import React from "react";
import { DefconState, MitreAttribution, FeatureDeviation } from "@/types/telemetry";

export function ThreatDiagnosisBanner({
  defcon,
  mitre,
  topDeviation,
  residualError,
  riskScore,
  projectedRisks,
}: {
  defcon?: DefconState;
  mitre?: MitreAttribution;
  topDeviation?: FeatureDeviation;
  residualError?: number;
  riskScore?: number;
  projectedRisks?: number[];
}) {
  const isAttack = defcon?.level === 1;

  return (
    <div
      className={`rounded-xl p-4 border transition-all ${
        isAttack
          ? "bg-rose-950/20 border-rose-600/60 shadow-[0_0_24px_rgba(244,63,94,0.15)]"
          : "bg-slate-900/80 border-slate-800"
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div>
          <div className="text-[10px] font-mono text-slate-400 uppercase">Operational State</div>
          <div
            className="text-base font-black font-mono tracking-wide mt-0.5"
            style={{ color: defcon?.color || "#10b981" }}
          >
            {defcon?.label || "DEFCON 5: EQUILIBRIUM"}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-mono text-slate-400 uppercase">MITRE ATT&amp;CK Mapping</div>
          <div className="font-mono text-sm font-bold text-slate-100 truncate mt-0.5">
            {mitre?.technique_id ? `${mitre.technique_id} - ${mitre.technique_name}` : "TA0043 - Baseline"}
          </div>
          <div className="text-[10px] text-slate-400 truncate">{mitre?.description || "Nominal state"}</div>
        </div>

        <div>
          <div className="text-[10px] font-mono text-slate-400 uppercase">Root Cause Feature Drift</div>
          <div className="font-mono text-sm font-bold text-rose-400 mt-0.5">
            {topDeviation ? `${topDeviation.feature} (+${topDeviation.deviation.toFixed(4)})` : "None (0.0000)"}
          </div>
          <div className="text-[10px] text-slate-400">Largest conservation violation</div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Residual (ε)</div>
            <div className="font-mono text-base font-bold text-slate-100">
              {residualError !== undefined && residualError !== null ? residualError.toFixed(4) : "0.0000"}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Risk Level</div>
            <div className="font-mono text-base font-bold text-cyan-400">
              {riskScore !== undefined && riskScore !== null ? `${(riskScore * 100).toFixed(1)}%` : "0.0%"}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">150s Horizon</div>
            <div className="font-mono text-base font-bold text-purple-400">
              {projectedRisks && projectedRisks.length > 0
                ? `${(projectedRisks[projectedRisks.length - 1] * 100).toFixed(0)}%`
                : "0%"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}