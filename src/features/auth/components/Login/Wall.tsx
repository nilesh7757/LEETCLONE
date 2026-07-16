"use client";

import { motion } from "framer-motion";

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

const Column = ({ speed = 25, reverse = false }) => {
  return (
    <div className="relative w-1/3 h-[180%] -top-[40%] overflow-hidden">
        <motion.div
            initial={{ y: reverse ? "-50%" : "0%" }}
            animate={{ y: reverse ? "0%" : "-50%" }}
            transition={{
                duration: speed,
                ease: "linear",
                repeat: Infinity,
                repeatType: "loop",
            }}
            className="flex flex-col gap-4 w-full"
        >
            {[...items, ...items, ...items].map((item, i) => (
                <div 
                    key={i} 
                    className="w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg bg-[var(--card)] border border-[var(--border)]/60 flex flex-col items-center justify-center p-4 relative group transition-all"
                >
                    <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${item.color}`} />
                    <div className="text-3xl font-mono font-bold text-[var(--muted-foreground)]/20 group-hover:text-[var(--primary)]/40 transition-colors select-none">
                        {`</>`}
                    </div>
                    <div className="mt-3 text-center w-full">
                        <h3 className="text-[var(--foreground)]/80 font-semibold text-xs truncate w-full px-1">{item.title}</h3>
                        <p className={`text-[10px] mt-0.5 font-bold ${item.color.replace('bg-', 'text-')}`}>{item.difficulty}</p>
                    </div>
                </div>
            ))}
        </motion.div>
    </div>
  );
};

export default function LoginWall() {
  return (
    <div className="absolute inset-0 w-full h-full flex justify-center items-center overflow-hidden bg-[var(--background)] z-0">
        {/* Soft backdrop blur and vignette overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-[var(--background)]/50 backdrop-blur-[1.5px]" />
        
        {/* Gradient overlays to fade out edges */}
        <div className="absolute bottom-0 left-0 right-0 h-48 z-10 pointer-events-none bg-gradient-to-t from-[var(--background)] via-[var(--background)]/40 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-48 z-10 pointer-events-none bg-gradient-to-b from-[var(--background)] via-[var(--background)]/40 to-transparent" />

        <div className="w-[110%] h-full flex space-x-6 rotate-0 scale-100 opacity-25 select-none pointer-events-none">
            <Column speed={45} reverse={false} />
            <Column speed={60} reverse={true} />
            <Column speed={50} reverse={false} />
        </div>
    </div>
  );
}
