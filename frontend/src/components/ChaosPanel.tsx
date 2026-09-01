"use client";

import React from "react";

export function ChaosPanel({
  activeChaos,
  onInject,
  onClear,
}: {
  activeChaos: string | null;
  onInject: (type: string) => void;
  onClear: () => void;
}) {
  const attacks = [
    { id: "syn_flood", label: "SYN Flood", color: "hover:border-rose-500" },
    { id: "slowloris", label: "Slowloris", color: "hover:border-amber-500" },
    { id: "port_scan", label: "PortScan", color: "hover:border-blue-500" },
    { id: "data_exfil", label: "Data Exfil", color: "hover:border-purple-500" },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold tracking-wider uppercase text-rose-400">Attack Injection:</span>
        {attacks.map((a) => (
          <button
            key={a.id}
            onClick={() => onInject(a.id)}
            className={`px-2.5 py-1 text-xs font-mono rounded border transition-all ${
              activeChaos === a.id
                ? "bg-rose-600 border-rose-400 text-white shadow-[0_0_10px_rgba(244,63,94,0.5)] font-bold"
                : `bg-slate-950 border-slate-800 text-slate-300 ${a.color}`
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>
      {activeChaos && (
        <button
          onClick={onClear}
          className="px-3 py-1 text-xs font-mono rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold"
        >
          Reset to Baseline
        </button>
      )}
    </div>
  );
}