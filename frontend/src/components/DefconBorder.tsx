"use client";

import React from "react";
import { DefconState } from "@/types/telemetry";

export function DefconBorder({ defcon, children }: { defcon?: DefconState; children: React.ReactNode }) {
  const color = defcon?.color || "#10b981";
  const isCrit = defcon?.level === 1;

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 p-4 transition-all duration-300 ${
        isCrit ? "ring-4 ring-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)]" : "ring-1 ring-slate-800"
      }`}
      style={{
        boxShadow: `inset 0 0 80px ${color}15`
      }}
    >
      {children}
    </div>
  );
}