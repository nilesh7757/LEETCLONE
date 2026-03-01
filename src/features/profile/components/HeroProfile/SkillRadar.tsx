"use client";

import React from "react";
import { motion } from "framer-motion";

interface SkillRadarProps {
  stats: Record<string, number>;
  theme?: string;
}

const CATEGORIES = ["Arrays", "Strings", "DP", "Greedy", "Trees", "Graphs", "Math", "Sorting"];

export default function SkillRadar({ stats, theme }: SkillRadarProps) {
  const size = 300;
  const center = size / 2;
  const radius = size * 0.4;
  
  // Calculate coordinates for a polygon
  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / CATEGORIES.length - Math.PI / 2;
    const normalizedValue = Math.min(1, value / 20); // Assume 20 is "Mastery"
    const r = radius * normalizedValue;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // Web/Grid Lines
  const levels = [0.25, 0.5, 0.75, 1];
  const gridLines = levels.map(level => {
    return CATEGORIES.map((_, i) => {
        const point = getCoordinates(i, level * 20);
        return `${point.x},${point.y}`;
    }).join(" ");
  });

  // User Skill Shape
  const points = CATEGORIES.map((cat, i) => {
    const val = stats[cat] || 0;
    const point = getCoordinates(i, val);
    return `${point.x},${point.y}`;
  }).join(" ");

  // Theme-specific colors
  const colors: Record<string, string> = {
    matrix: "#00ff41",
    dracula: "#ff0000",
    got: "#38bdf8",
    default: "var(--viz-cyan)"
  };
  const activeColor = colors[theme as string] || colors.default;

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid Web */}
        {gridLines.map((line, i) => (
          <polygon
            key={i}
            points={line}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
            className="opacity-30"
          />
        ))}

        {/* Axis Lines */}
        {CATEGORIES.map((_, i) => {
          const point = getCoordinates(i, radius * 2.5); // Extend line
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={getCoordinates(i, 20).x}
              y2={getCoordinates(i, 20).y}
              stroke="var(--border)"
              strokeWidth="1"
              className="opacity-20"
            />
          );
        })}

        {/* User Data Polygon */}
        <motion.polygon
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1, type: "spring" }}
          points={points}
          fill={activeColor}
          stroke={activeColor}
          strokeWidth="2"
        />

        {/* Data Points (Glows) */}
        {CATEGORIES.map((cat, i) => {
          const val = stats[cat] || 0;
          const point = getCoordinates(i, val);
          return (
            <motion.circle
              key={i}
              initial={{ r: 0 }}
              animate={{ r: 4 }}
              cx={point.x}
              cy={point.y}
              fill={activeColor}
              className="drop-shadow-[0_0_8px_currentColor]"
            />
          );
        })}

        {/* Labels */}
        {CATEGORIES.map((cat, i) => {
          const point = getCoordinates(i, 25); // Push outside
          return (
            <text
              key={i}
              x={point.x}
              y={point.y}
              textAnchor="middle"
              className="text-[10px] font-black uppercase tracking-tighter"
              fill="var(--muted-foreground)"
              style={{ fontSize: '10px', fontWeight: 900 }}
            >
              {cat}
            </text>
          );
        })}
      </svg>
      
      <div className="mt-6 flex flex-col items-center">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Algorithm Radar</h4>
        <div className="text-xs font-mono mt-1" style={{ color: activeColor }}>SYNCING_POWER_LEVELS...</div>
      </div>
    </div>
  );
}
