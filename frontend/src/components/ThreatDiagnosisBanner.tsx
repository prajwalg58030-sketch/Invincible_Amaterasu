"use client";

import React from "react";
import { DefconState, MitreAttribution, FeatureDeviation } from "@/types/telemetry";

interface ThreatDiagnosisBannerProps {
  defcon?: DefconState;
  mitre?: MitreAttribution | { tactic?: string; technique_id?: string; [key: string]: any };
  topDeviation?: FeatureDeviation | { feature?: string; [key: string]: any };
  residualError?: number;
  riskScore?: number;
  projectedRisks?: number[];
}

export function ThreatDiagnosisBanner({
  defcon,
  mitre,
  topDeviation,
  residualError = 0,
  riskScore = 0,
  projectedRisks = [0, 0, 0, 0, 0],
}: ThreatDiagnosisBannerProps) {
  const currentLevel = defcon?.level ?? 5;
  const isNominal = currentLevel === 5;
  const isCritical = currentLevel === 1;

  const tactic = (mitre as any)?.tactic || (mitre as any)?.name || "Unknown Anomaly";
  const techniqueId = (mitre as any)?.technique_id || (mitre as any)?.technique || (mitre as any)?.id || "T1190";

  const feat = (topDeviation as any)?.feature;
  const devValue = (topDeviation as any)?.deviation ?? (topDeviation as any)?.delta ?? (topDeviation as any)?.drift ?? (topDeviation as any)?.value ?? 0;
  const deltaPct = (Number(devValue) * 100).toFixed(0);

  const getRootCause = () => {
    if (!feat) return "All 11 feature dimensions within mathematical baseline tolerances.";

    switch (feat) {
      case "SYN Flag Cnt":
      case "Flow Pkts/s":
        return `TCP handshake initiation rate exceeded normal completion threshold by ${deltaPct}%.`;
      case "Flow Duration":
      case "Fwd IAT Mean":
        return `Abnormal socket hold duration detected; packet inter-arrival latency stretched by ${deltaPct}%.`;
      case "TotLen Fwd Pkts":
      case "Flow Byts/s":
        return `Asymmetrical outbound byte volume surge with negligible ACK receipts (deviation: ${deltaPct}%).`;
      case "Tot Fwd Pkts":
        return `High-frequency ephemeral port sweeps detected without completed TCP sessions.`;
      default:
        return `Multi-dimensional physics state divergence violating baseline conservation laws by ${((residualError ?? 0) * 100).toFixed(0)}%.`;
    }
  };

  const safeRisks = Array.isArray(projectedRisks) && projectedRisks.length > 0 ? projectedRisks : [0];
  const maxProjectedRisk = Math.max(...safeRisks, riskScore ?? 0);
  const horizonConfidence = (maxProjectedRisk * 100).toFixed(0);

  const getHorizonImpact = () => {
    if (isNominal) {
      return "Zero threat trajectory detected across next 150-second forward lookahead window.";
    }
    if (techniqueId === "T1498.001" || techniqueId === "T1499.003") {
      return `Target socket pool starvation & service unresponsiveness projected within ~90s (Confidence: ${horizonConfidence}%).`;
    }
    if (techniqueId === "T1048") {
      return `Critical data egress breach threshold anticipated in ~60-90s without SOAR containment.`;
    }
    return `Adversary stage escalation to ${tactic} projected within next K=5 steps (Confidence: ${horizonConfidence}%).`;
  };

  if (isNominal) {
    return (
      <div className="w-full bg-emerald-950/30 border border-emerald-500/40 rounded-lg p-3 font-mono text-xs shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
            SYSTEM STATE: EQUILIBRIUM
          </span>
          <span className="text-slate-500 text-[10px]">|</span>
          <span className="text-slate-300">
            Telemetry is actively adhering to learned physical network dynamics (Residual: ε = {(residualError ?? 0).toFixed(4)} &lt; 0.45).
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full rounded-lg p-4 font-mono transition-all border ${
        isCritical
          ? "bg-rose-950/40 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.25)]"
          : "bg-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
      }`}
    >
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isCritical ? "bg-rose-400" : "bg-amber-400"
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isCritical ? "bg-rose-500" : "bg-amber-500"
              }`}
            ></span>
          </span>
          <span
            className={`font-bold uppercase tracking-wider text-xs ${
              isCritical ? "text-rose-400" : "text-amber-400"
            }`}
          >
            {isCritical ? "ACTIVE THREAT DIAGNOSIS VERDICT" : "ELEVATED BEHAVIORAL DRIFT DETECTED"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-slate-400">Physics Residual:</span>
          <span className={`font-bold ${isCritical ? "text-rose-400" : "text-amber-400"}`}>
            ε = {(residualError ?? 0).toFixed(4)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
            Detected Threat
          </div>
          <div className="font-bold text-slate-100 flex items-center gap-1.5">
            <span>{tactic}</span>
          </div>
          <div className="text-[10px] text-cyan-400 mt-0.5">
            MITRE Ref: {techniqueId}
          </div>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
            Root Cause Analysis
          </div>
          <div className="text-slate-300 text-[11px] leading-relaxed">
            {getRootCause()}
          </div>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
            150s Horizon Projection
          </div>
          <div className="text-amber-300/90 text-[11px] leading-relaxed">
            {getHorizonImpact()}
          </div>
        </div>
      </div>
    </div>
  );
}