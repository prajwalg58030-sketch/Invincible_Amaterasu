// frontend/src/components/ChaosPanel.tsx
"use client";

import React from "react";

interface ChaosPanelProps {
  activeChaos: string | null;
  onInject: (type: string) => void;
  onClear: () => void;
}

const ATTACK_VECTORS = [
  { id: "syn_flood", label: "SYN Flood", desc: "DoS Handshake Exhaustion" },
  { id: "slowloris", label: "Slowloris", desc: "Low & Slow Socket Hold" },
  { id: "data_exfil", label: "Data Exfiltration", desc: "Asymmetric Outbound Surge" },
  { id: "portscan", label: "Port Scan", desc: "Reconnaissance Sweep" },
  { id: "zeroday", label: "Zero-Day Exploit", desc: "Multi-D State Violation" },
];

export const ChaosPanel = React.memo(function ChaosPanel({
  activeChaos,
  onInject,
  onClear,
}: ChaosPanelProps) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 font-mono">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Chaos Injection Matrix
        </span>
        {activeChaos && (
          <button
            onClick={onClear}
            className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500 rounded text-[11px] hover:bg-rose-500/30 transition-colors"
          >
            Reset Vector
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {ATTACK_VECTORS.map((vector) => {
          const isActive = activeChaos === vector.id;
          return (
            <button
              key={vector.id}
              onClick={() => onInject(vector.id)}
              className={`p-2 rounded border text-left transition-colors ${
                isActive
                  ? "bg-rose-950/80 border-rose-500 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <div className="text-[11px] font-bold truncate">{vector.label}</div>
              <div className="text-[9px] text-slate-500 truncate">{vector.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
});