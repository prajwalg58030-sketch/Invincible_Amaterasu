"use client";

import React, { useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";

const FEATURE_SHORT_LABELS: Record<string, string> = {
  "Flow Duration": "DUR",
  "Tot Fwd Pkts": "FWD_PKT",
  "Tot Bwd Pkts": "BWD_PKT",
  "TotLen Fwd Pkts": "FWD_LEN",
  "TotLen Bwd Pkts": "BWD_LEN",
  "Flow Byts/s": "BYT/S",
  "Flow Pkts/s": "PKT/S",
  "Fwd IAT Mean": "FWD_IAT",
  "Bwd IAT Mean": "BWD_IAT",
  "SYN Flag Cnt": "SYN",
  "ACK Flag Cnt": "ACK",
};

export function FeatureRadar({
  observed,
  predicted,
}: {
  observed?: Record<string, number>;
  predicted?: Record<string, number>;
}) {
  const chartData = useMemo(() => {
    if (!observed || !predicted) return [];
    return Object.keys(FEATURE_SHORT_LABELS).map((key) => ({
      feature: FEATURE_SHORT_LABELS[key] || key,
      observed: Number((observed[key] ?? 0).toFixed(3)),
      predicted: Number((predicted[key] ?? 0).toFixed(3)),
    }));
  }, [observed, predicted]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 h-[340px]">
      <h3 className="text-xs font-mono font-bold text-slate-300 uppercase mb-2 tracking-wider">
        Phase-Space Manifold (11-D Drift)
      </h3>
      <div className="w-full h-[270px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis
              dataKey="feature"
              stroke="#94a3b8"
              tick={{ fontSize: 9, fontFamily: "monospace" }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 1]} stroke="#475569" tick={false} />
            <Radar
              name="Observed"
              dataKey="observed"
              stroke="#f43f5e"
              fill="#f43f5e"
              fillOpacity={0.4}
              isAnimationActive={false}
            />
            <Radar
              name="Ghost Pred"
              dataKey="predicted"
              stroke="#22d3ee"
              fill="#22d3ee"
              fillOpacity={0.25}
              isAnimationActive={false}
            />
            <Legend wrapperStyle={{ fontSize: "10px", fontFamily: "monospace", paddingTop: "6px" }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}