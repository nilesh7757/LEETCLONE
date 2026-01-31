"use client";

import React from 'react';

export default function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Background Shape */}
      <rect 
        x="10" 
        y="10" 
        width="80" 
        height="80" 
        rx="20" 
        fill="currentColor" 
        fillOpacity="0.05"
      />
      
      {/* Stylized L / Bracket */}
      <path 
        d="M35 25V65C35 70.5228 39.4772 75 45 75H75" 
        stroke="url(#logo-gradient)" 
        strokeWidth="10" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Accent Slash / Code Symbol */}
      <path 
        d="M65 25L45 45L65 65" 
        stroke="currentColor" 
        strokeWidth="10" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        opacity="0.3"
      />

      <defs>
        <linearGradient id="logo-gradient" x1="35" y1="25" x2="75" y2="75" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" /> {/* blue-500 */}
          <stop offset="1" stopColor="#8b5cf6" /> {/* purple-500 */}
        </linearGradient>
      </defs>
    </svg>
  );
}
