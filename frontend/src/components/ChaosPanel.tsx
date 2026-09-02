"use client";

import React from "react";

const CHAOS_ATTACKS = [
  { id: "syn_flood", label: "SYN Flood" },
  { id: "slowloris", label: "Slowloris Hold" },
  { id: "data_exfil", label: "Data Exfiltration" },
  { id: "portscan", label: "Port Scan" },
  { id: "zeroday", label: "Zero-Day Exploit" },
];

export function ChaosPanel({
  activeChaos,
  onInject,
  onClear,
}: {
  activeChaos: string | null;
  onInject: (id: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
          Chaos Perturbation Matrix:
        </span>
        <div className="flex flex-wrap gap-2">
          {CHAOS_ATTACKS.map((atk) => {
            const isActive = activeChaos === atk.id;
            return (
              <button
                key={atk.id}
                onClick={() => (isActive ? onClear() : onInject(atk.id))}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all border ${
                  isActive
                    ? "bg-rose-600 border-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                    : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                {atk.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeChaos && (
        <button
          onClick={onClear}
          className="px-3 py-1 rounded text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
        >
          Reset Baseline
        </button>
      )}
    </div>
  );
}