"use client";

import React from "react";
import { SoarAction, MitreAttribution } from "@/types/telemetry";

export function MitigationFeed({ soar, mitre }: { soar?: SoarAction; mitre?: MitreAttribution }) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Autonomous SOAR Action Console
          </h3>
          <span className="text-[10px] font-mono text-slate-500">{soar?.timestamp || "00:00:00"}</span>
        </div>
        <div className="bg-black/80 rounded border border-slate-800/80 p-2.5 font-mono text-[11px] text-emerald-400 space-y-1 overflow-x-auto">
          <p className="text-slate-500">[SOC-ENGINE] Active Threat Rule:</p>
          <p className="text-slate-200 break-all">{soar?.rule_generated || "Awaiting state divergence..."}</p>
          <p className="text-slate-500 mt-2">
            Target Technique: <span className="text-amber-400">{mitre?.technique_id} ({mitre?.technique})</span>
          </p>
        </div>
      </div>
    </div>
  );
}