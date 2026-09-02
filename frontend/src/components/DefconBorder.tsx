"use client";

import React from "react";
import { DefconState } from "@/types/telemetry";

export function DefconBorder({
  defcon,
  children,
}: {
  defcon?: DefconState;
  children: React.ReactNode;
}) {
  const borderColor = defcon?.color || "#10b981";
  const isCritical = defcon?.level === 1;

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 p-4 transition-all duration-500 border-t-4 ${
        isCritical ? "shadow-[inset_0_0_80px_rgba(244,63,94,0.12)]" : ""
      }`}
      style={{ borderTopColor: borderColor }}
    >
      {children}
    </div>
  );
}