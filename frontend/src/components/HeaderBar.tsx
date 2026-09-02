"use client";

import React from "react";
import { DefconState, BenchmarkMetrics } from "@/types/telemetry";

interface HeaderBarProps {
  defcon?: DefconState;
  benchmarks?: BenchmarkMetrics;
  isConnected: boolean;
  onJump: (idx: number) => void;
}

export function HeaderBar({
  defcon,
  benchmarks,
  isConnected,
  onJump,
}: HeaderBarProps) {
  const latency = benchmarks?.inference_latency_ms ?? benchmarks?.latency_ms ?? 1.2;
  const throughput = benchmarks?.throughput_wps ?? 850;
  const ram = benchmarks?.ram_usage_mb ?? benchmarks?.ram_mb ?? 185.0;

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
      <div className="flex items-center gap-3">
        <div className="relative flex h-3 w-3">
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isConnected ? "bg-cyan-400 animate-ping" : "bg-rose-500"
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-3 w-3 ${
              isConnected ? "bg-cyan-500" : "bg-rose-500"
            }`}
          />
        </div>
        <div>
          <h1 className="text-base font-black tracking-widest uppercase text-slate-100 flex items-center gap-2">
            INVINCIBLE <span className="text-cyan-400 font-mono text-xs">WORLD MODEL SIEM</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-mono">
            Air-Gapped State Transition &amp; Kill-Chain Anticipator
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <select
          defaultValue={25}
          onChange={(e) => onJump(Number(e.target.value))}
          className="bg-slate-900 border border-slate-800 text-xs font-mono rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value={25}>Scenario 1: Benign Enterprise Baseline (Row 25)</option>
          <option value={120}>Scenario 2: Brute-Force / Exfil Surge (Row 120)</option>
          <option value={200}>Scenario 3: Normalization Recovery (Row 200)</option>
          <option value={1140}>Scenario 4: Volumetric DDoS Saturation (Row 1140)</option>
          <option value={1330}>Scenario 5: Post-Incident Cooldown (Row 1330)</option>
        </select>

        <div className="bg-slate-900/90 border border-slate-800 rounded px-3 py-1 flex items-center gap-3 font-mono text-[10px]">
          <span className="text-cyan-400">{Number(latency).toFixed(2)} ms</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400">{throughput} wps</span>
          <span className="text-slate-600">|</span>
          <span className="text-purple-400">{Number(ram).toFixed(1)} MB RAM</span>
        </div>

        <div
          className="px-3 py-1 rounded text-xs font-bold font-mono uppercase tracking-wider transition-colors"
          style={{
            backgroundColor: `${defcon?.color || "#10b981"}25`,
            color: defcon?.color || "#10b981",
          }}
        >
          {defcon?.label || "DEFCON 5: EQUILIBRIUM"}
        </div>
      </div>
    </header>
  );
}