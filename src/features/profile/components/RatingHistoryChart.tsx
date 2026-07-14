"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface RatingHistory {
  date: string;
  rating: number;
}

interface RatingHistoryChartProps {
  data: RatingHistory[];
  gradientId?: string;
  yDomain?: [string, string];
  tooltipBorderRadius?: string;
  strokeWidth?: number;
}

export default function RatingHistoryChart({
  data,
  gradientId = "ratingP",
  yDomain = ['dataMin - 50', 'dataMax + 50'],
  tooltipBorderRadius = "12px",
  strokeWidth = 3,
}: RatingHistoryChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--viz-cyan)" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="var(--viz-cyan)" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="date" hide />
        <YAxis hide domain={yDomain} />
        <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderRadius: tooltipBorderRadius, border: '1px solid var(--border)' }} />
        <Area type="monotone" dataKey="rating" stroke="var(--viz-cyan)" strokeWidth={strokeWidth} fill={`url(#${gradientId})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
