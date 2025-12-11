"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Placeholder content for the wall
const items = [
  { id: 1, title: "Two Sum", difficulty: "Easy", color: "bg-emerald-500" },
  { id: 2, title: "LRU Cache", difficulty: "Medium", color: "bg-yellow-500" },
  { id: 3, title: "Merge K Lists", difficulty: "Hard", color: "bg-red-500" },
  { id: 4, title: "Valid Parentheses", difficulty: "Easy", color: "bg-emerald-500" },
  { id: 5, title: "Trapping Rain Water", difficulty: "Hard", color: "bg-red-500" },
  { id: 6, title: "Number of Islands", difficulty: "Medium", color: "bg-yellow-500" },
  { id: 7, title: "Reverse Linked List", difficulty: "Easy", color: "bg-emerald-500" },
  { id: 8, title: "Median of Two Arrays", difficulty: "Hard", color: "bg-red-500" },
  { id: 9, title: "3Sum", difficulty: "Medium", color: "bg-yellow-500" },
  { id: 10, title: "Climbing Stairs", difficulty: "Easy", color: "bg-emerald-500" },
  { id: 11, title: "Word Break", difficulty: "Medium", color: "bg-yellow-500" },
  { id: 12, title: "N-Queens", difficulty: "Hard", color: "bg-red-500" },
];

const Column = ({ offset = 0, speed = 20 }) => {
  return (
    <div className="relative w-1/3 h-[150%] -top-[25%] overflow-hidden">
        <motion.div
            initial={{ y: 0 }}
            animate={{ y: offset % 2 === 0 ? "-50%" : "0%" }}
            transition={{
                duration: speed,
                ease: "linear",
                repeat: Infinity,
                repeatType: "loop",
                // For the reverse direction effect, we actually just animate from different start points
                // but Framer Motion loop is simplest if we just scroll continuously.
                // To do "up and down" scrolling like the reference, we can toggle direction.
                // For now, let's just make them all scroll up but at different speeds/offsets.
            }}
            style={{ 
                y: offset % 2 === 0 ? 0 : "-50%",
            }}
            // Overriding animate for continuous scroll
            // We need a continuous loop. 
            // The simplest way to achieve the "infinite scroll" look is to duplicate items.
            className="flex flex-col gap-4 w-full"
        >
            {[...items, ...items, ...items].map((item, i) => (
                <div 
                    key={i} 
                    className="w-full aspect-[2/3] rounded-lg overflow-hidden shadow-lg bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center p-4 relative group"
                >
                    <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${item.color}`} />
                    <div className="text-4xl font-mono font-bold text-neutral-700 group-hover:text-neutral-500 transition-colors">
                        {`</>`}
                    </div>
                    <div className="mt-4 text-center">
                        <h3 className="text-neutral-300 font-medium text-sm">{item.title}</h3>
                        <p className={`text-xs mt-1 ${item.color.replace('bg-', 'text-')}`}>{item.difficulty}</p>
                    </div>
                </div>
            ))}
        </motion.div>
    </div>
  );
};

export default function LoginWall() {
  return (
    <div className="w-full h-full flex justify-center items-center relative overflow-hidden bg-[#080808]">
        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-64 z-10 pointer-events-none bg-gradient-to-t from-[#080808] via-[#080808]/80 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-32 z-10 pointer-events-none bg-gradient-to-b from-[#080808] via-[#080808]/80 to-transparent" />

        <div className="w-[120%] h-full flex space-x-6 rotate-12 scale-110 opacity-50 blur-[1px]">
            <Column offset={0} speed={40} />
            <Column offset={1} speed={55} />
            <Column offset={2} speed={45} />
        </div>
    </div>
  );
}
