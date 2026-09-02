// src/components/TrajectoryChart.tsx
"use client";

import React, { useMemo } from "react";
import { TelemetryPayload } from "@/types/telemetry";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export function TrajectoryChart({ history }: { history: TelemetryPayload[] }) {
  const trackedMetric = history[history.length - 1]?.trajectory_split?.tracked_feature || "Flow Pkts/s";

  const chartData = useMemo(() => {
    return history.map((item) => ({
      // Use the actual progressing CSV row index so the axis continuously moves forward
      step: item.timestamp_idx,
      observed: item.trajectory_split?.current_observed_val ?? 0,
      predicted: item.trajectory_split?.current_predicted_val ?? 0,
      delta: item.trajectory_split?.divergence_delta ?? 0,
    }));
  }, [history]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 h-[340px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
          Observed Telemetry vs. Ghost Forecast Trajectory
        </h3>
        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
          Tracking: {trackedMetric}
        </span>
      </div>

      <div className="w-full h-[270px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis 
              dataKey="step" 
              stroke="#64748b" 
              domain={["dataMin", "dataMax"]}
              tick={{ fontSize: 9, fontFamily: "monospace" }} 
            />
            <YAxis domain={[0, 1]} stroke="#64748b" tick={{ fontSize: 9, fontFamily: "monospace" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                borderColor: "#334155",
                fontFamily: "monospace",
                fontSize: "10px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "10px", fontFamily: "monospace", paddingTop: "4px" }} />
            <Line
              type="monotone"
              dataKey="observed"
              name="Observed Reality"
              stroke="#f43f5e"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              name="Ghost Model Forecast"
              stroke="#22d3ee"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}