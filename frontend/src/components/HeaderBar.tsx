"use client";

import React from "react";
import { DefconState, BenchmarkMetrics } from "@/types/telemetry";

export function HeaderBar({
  defcon,
  benchmarks,
  isConnected,
  onJump,
}: {
  defcon?: DefconState;
  benchmarks?: BenchmarkMetrics;
  isConnected: boolean;
  onJump: (idx: number) => void;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800">
      <div className="flex items-center gap-3">
        <div className={`w-3.5 h-3.5 rounded-full ${isConnected ? "bg-cyan-400 animate-ping" : "bg-red-500"}`} />
        <div>
          <h1 className="text-base font-black tracking-widest uppercase text-slate-100 flex items-center gap-2">
            INVINCIBLE <span className="text-cyan-400 font-mono text-xs">WORLD MODEL SIEM</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-mono">Air-Gapped State Transition & Kill-Chain Anticipator</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <select
          onChange={(e) => onJump(Number(e.target.value))}
          className="bg-slate-900 border border-slate-800 text-xs font-mono rounded px-2.5 py-1 text-slate-300 focus:outline-none"
        >
          <option value="0">Scenario 1: Benign Enterprise Baseline</option>
          <option value="450">Scenario 2: Volumetric DoS Saturation</option>
          <option value="900">Scenario 3: Stealth Reconnaissance</option>
        </select>

        <div className="bg-slate-900/90 border border-slate-800 rounded px-3 py-1 flex items-center gap-3 font-mono text-[10px]">
          <span className="text-cyan-400">{benchmarks?.inference_latency_ms || 1.8} ms</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400">{benchmarks?.throughput_wps || 550} wps</span>
          <span className="text-slate-600">|</span>
          <span className="text-purple-400">{benchmarks?.ram_usage_mb || 42} MB RAM</span>
        </div>

        <div
          className="px-3 py-1 rounded text-xs font-bold font-mono uppercase tracking-wider"
          style={{ backgroundColor: `${defcon?.color || "#10b981"}25`, color: defcon?.color || "#10b981" }}
        >
          {defcon?.label || "DEFCON 5: NOMINAL"}
        </div>
      </div>
    </header>
  );
}