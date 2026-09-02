// frontend/src/components/FeatureRadar.tsx
"use client";

import React, { useMemo } from "react";

const RADAR_KEYS = [
  "Flow Pkts/s",
  "Flow Byts/s",
  "SYN Flag Cnt",
  "Flow Duration",
  "Fwd IAT Mean",
  "Tot Fwd Pkts",
];

const SIZE = 180;
const CENTER = SIZE / 2;
const RADIUS = SIZE * 0.38;
const NUM_AXES = RADAR_KEYS.length;

// Precompute static trig vectors once in module memory
const AXIS_VECTORS = RADAR_KEYS.map((_, i) => {
  const angle = (i * 2 * Math.PI) / NUM_AXES - Math.PI / 2;
  return { cos: Math.cos(angle), sin: Math.sin(angle) };
});

interface FeatureRadarProps {
  observed?: Record<string, number>;
  predicted?: Record<string, number>;
}

export const FeatureRadar = React.memo(function FeatureRadar({
  observed = {},
  predicted = {},
}: FeatureRadarProps) {
  const ghostCoords = useMemo(() => {
    return AXIS_VECTORS.map((vec, i) => {
      const val = Math.min(Math.max(predicted[RADAR_KEYS[i]] ?? 0.05, 0.05), 1.0);
      const r = val * RADIUS;
      return `${(CENTER + r * vec.cos).toFixed(1)},${(CENTER + r * vec.sin).toFixed(1)}`;
    }).join(" ");
  }, [predicted]);

  const realityCoords = useMemo(() => {
    return AXIS_VECTORS.map((vec, i) => {
      const val = Math.min(Math.max(observed[RADAR_KEYS[i]] ?? 0.05, 0.05), 1.0);
      const r = val * RADIUS;
      return `${(CENTER + r * vec.cos).toFixed(1)},${(CENTER + r * vec.sin).toFixed(1)}`;
    }).join(" ");
  }, [observed]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 flex flex-col items-center">
      <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 self-start font-mono">
        State Topology Radar (6-Axis)
      </span>
      <svg width={SIZE} height={SIZE} className="overflow-visible">
        {[0.3, 0.6, 1.0].map((scale, idx) => (
          <circle
            key={idx}
            cx={CENTER}
            cy={CENTER}
            r={RADIUS * scale}
            fill="none"
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        ))}
        {/* Ghost Shape (Cyan) */}
        <polygon
          points={ghostCoords}
          fill="rgba(6, 182, 212, 0.15)"
          stroke="#06b6d4"
          strokeWidth="1.5"
          strokeDasharray="3,2"
        />
        {/* Reality Shape (Crimson) */}
        <polygon
          points={realityCoords}
          fill="rgba(244, 63, 94, 0.25)"
          stroke="#f43f5e"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
});