"use client";

import React from "react";

const RADAR_KEYS = ["Flow Pkts/s", "SYN Flag Cnt", "Flow Duration", "TotLen Fwd Pkts", "Flow Byts/s", "Fwd IAT Mean"];

export function FeatureRadar({ observed = {}, predicted = {} }: { observed?: Record<string, number>; predicted?: Record<string, number> }) {
  const size = 160;
  const center = size / 2;
  const radius = size * 0.38;
  const angleStep = (Math.PI * 2) / RADAR_KEYS.length;

  const getCoordinates = (vals: Record<string, number>) => {
    return RADAR_KEYS.map((key, i) => {
      const v = Math.min(Math.max(vals[key] || 0.05, 0.05), 1.0);
      const r = v * radius;
      const angle = i * angleStep - Math.PI / 2;
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(" ");
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-300">State Topology Radar</h3>
        <span className="text-[10px] text-cyan-400 font-mono">6 Core Dims</span>
      </div>
      <svg width={size} height={size} className="overflow-visible my-1">
        {[0.3, 0.6, 1.0].map((scale, idx) => (
          <circle key={idx} cx={center} cy={center} r={radius * scale} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2,2" />
        ))}
        <polygon points={getCoordinates(predicted)} fill="rgba(6,182,212,0.25)" stroke="#06b6d4" strokeWidth="1.5" />
        <polygon points={getCoordinates(observed)} fill="rgba(244,63,94,0.3)" stroke="#f43f5e" strokeWidth="2" />
      </svg>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] text-slate-400 font-mono w-full mt-2">
        {RADAR_KEYS.slice(0, 4).map((k) => (
          <div key={k} className="flex justify-between">
            <span className="truncate">{k}:</span>
            <span className="text-slate-200">{(observed[k] || 0).toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}