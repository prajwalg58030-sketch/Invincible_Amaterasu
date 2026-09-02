// frontend/src/components/MitigationFeed.tsx
"use client";

import React, { memo } from "react";

interface MitigationFeedProps {
  soar?: {
    rule_generated?: string;
    timestamp?: string;
  };
  mitre?: {
    tactic?: string;
    technique_id?: string;
  };
}

function MitigationFeedBase({ soar, mitre }: MitigationFeedProps) {
  const rule = soar?.rule_generated || "iptables -L -n (Listening)";
  const timestamp = soar?.timestamp || "00:00:00";
  const tactic = mitre?.tactic || "Nominal Baseline Monitoring";

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs">
      <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800">
        <span className="text-slate-400 font-semibold tracking-wider uppercase text-[10px]">
          SOAR Active Remediation Engine
        </span>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
          AUTONOMOUS DEFENSE
        </span>
      </div>
      <div className="text-[11px] text-slate-300 space-y-1">
        <div className="text-slate-400">
          [{timestamp}] Target Classification: <span className="text-cyan-400">{tactic}</span>
        </div>
        <div className="p-2 bg-slate-900 rounded border border-slate-800 text-emerald-400 font-bold overflow-x-auto whitespace-pre">
          $ {rule}
        </div>
      </div>
    </div>
  );
}

export const MitigationFeed = memo(
  MitigationFeedBase,
  (prev, next) =>
    prev.soar?.timestamp === next.soar?.timestamp &&
    prev.soar?.rule_generated === next.soar?.rule_generated &&
    prev.mitre?.tactic === next.mitre?.tactic
);

MitigationFeed.displayName = "MitigationFeed";

export default MitigationFeed;