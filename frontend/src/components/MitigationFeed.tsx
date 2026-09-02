"use client";

import React, { useState, useEffect, useRef } from "react";
import { SoarAction, MitreAttribution } from "@/types/telemetry";

interface ActionItem {
  id: string;
  rule: string;
  technique: string;
  timestamp: string;
}

export function MitigationFeed({
  soar,
  mitre,
}: {
  soar?: SoarAction;
  mitre?: MitreAttribution;
}) {
  const [feed, setFeed] = useState<ActionItem[]>([]);
  const lastRuleRef = useRef<string>("");

  useEffect(() => {
    if (!soar?.rule_generated) return;

    if (
      soar.rule_generated !== lastRuleRef.current &&
      !soar.rule_generated.includes("PASSIVE_MONITORING")
    ) {
      lastRuleRef.current = soar.rule_generated;
      const newItem: ActionItem = {
        id: Math.random().toString(36).substring(2, 9),
        rule: soar.rule_generated,
        technique: `${mitre?.technique_id || "ALERT"} - ${mitre?.technique_name || "Anomaly"}`,
        timestamp: soar.timestamp || new Date().toLocaleTimeString(),
      };
      setFeed((prev) => [newItem, ...prev.slice(0, 14)]);
    }
  }, [soar, mitre]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 font-mono text-xs">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
        <span className="font-bold text-slate-300 uppercase tracking-wider">
          SOAR Active Defense Dispatcher
        </span>
        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          AUTOMATED ENFORCEMENT ACTIVE
        </span>
      </div>

      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
        {feed.length === 0 ? (
          <div className="text-slate-500 py-4 text-center">
            System in equilibrium. SOAR standby: awaiting conservation violation.
          </div>
        ) : (
          feed.map((item) => (
            <div
              key={item.id}
              className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between gap-4"
            >
              <div className="truncate">
                <span className="text-rose-400 font-bold mr-2">[{item.technique}]</span>
                <span className="text-slate-300">{item.rule}</span>
              </div>
              <span className="text-slate-500 text-[10px] shrink-0">{item.timestamp}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}