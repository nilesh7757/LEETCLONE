"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";

interface ExecutionAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
}

export default function ExecutionAnimation({ isVisible, onComplete }: ExecutionAnimationProps) {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const [activeMessage, setActiveMessage] = useState("");

  const isMatrix = theme === "matrix";
  const isDracula = theme === "dracula";
  const isGOT = theme === "got";

  useEffect(() => {
    if (!isVisible) return;

    // Timer to auto-close the animation
    const timer = setTimeout(() => {
      onComplete();
    }, 6000);

    // Dialogue Logic
    if (isDracula) {
        const quotes = [
            "Listen to them, children of the night. What music they make!",
            "I am the monster that breathing men would kill. I am Dracula.",
            "Enter freely and of your own will!",
            "Blood is life... and it shall be mine."
        ];
        const index = Math.floor(Date.now() / 1000) % quotes.length;
        // defer to avoid cascading renders warning
        requestAnimationFrame(() => setActiveMessage(quotes[index]));
    } else if (isMatrix) {
        const msg = `Wake up, ${session?.user?.name || 'Neo'}... The system is yours.`;
        requestAnimationFrame(() => setActiveMessage(msg));
    } else if (isGOT) {
        requestAnimationFrame(() => setActiveMessage("THE NORTH REMEMBERS. YOUR DEBT IS PAID."));
    }

    return () => clearTimeout(timer);
  }, [isVisible, isDracula, isMatrix, isGOT, session?.user?.name, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden">
      
      <AnimatePresence>
        {isDracula && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-red-950/20 backdrop-blur-sm"
            />
        )}
        {isMatrix && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            />
        )}
      </AnimatePresence>

      <div className="absolute inset-0">
        {isDracula && <BloodDripEffect />}
        {isMatrix && <MatrixRainEffect />}
        {isGOT && <SnowStormEffect />}
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 1.1, opacity: 0 }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div 
            animate={{ 
                boxShadow: isDracula ? ["0 0 20px #ff0000", "0 0 60px #ff0000", "0 0 20px #ff0000"] :
                           isMatrix ? ["0 0 20px #00ff41", "0 0 60px #00ff41", "0 0 20px #00ff41"] :
                           ["0 0 20px #38bdf8", "0 0 60px #38bdf8", "0 0 20px #38bdf8"]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`px-12 py-6 rounded-3xl bg-black/80 border-2 backdrop-blur-xl ${
                isDracula ? 'border-red-600' : isMatrix ? 'border-[#00ff41]' : 'border-sky-400'
            }`}
        >
            <h2 className={`text-4xl md:text-6xl font-black italic tracking-tighter ${
                isDracula ? 'text-red-600' : isMatrix ? 'text-[#00ff41] font-mono' : 'text-white font-serif'
            }`}>
                ACCEPTED
            </h2>
        </motion.div>
        
        <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`mt-8 text-xl md:text-2xl text-center px-6 max-w-2xl font-medium tracking-widest leading-relaxed drop-shadow-lg ${
                isDracula ? 'text-red-500 italic' : isMatrix ? 'text-[#00ff41] font-mono' : 'text-sky-200 font-serif'
            }`}
        >
            {activeMessage}
        </motion.p>
      </motion.div>

    </div>
  );
}

function BloodDripEffect() {
    const drops = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
        left: `${i * 10}%`,
        delay: i * 0.3
    })), []);

    return (
        <div className="absolute inset-0">
            {drops.map((drop, i) => (
                <motion.div
                    key={i}
                    initial={{ y: -100, height: 0 }}
                    animate={{ y: [-100, 1000], height: [0, 400, 0] }}
                    transition={{ duration: 4, delay: drop.delay, repeat: Infinity, ease: "easeIn" }}
                    style={{ left: drop.left }}
                    className="absolute w-1 bg-gradient-to-b from-red-900 to-red-600 rounded-full blur-[1px] opacity-60"
                />
            ))}
        </div>
    );
}

function MatrixRainEffect() {
    const columns = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
        duration: 2 + (i % 3),
        delay: (i * 0.4) % 2,
        chars: Array.from({ length: 20 }, (_, j) => String.fromCharCode(0x30A0 + ((i * 10 + j) % 96))).join('')
    })), []);

    return (
        <div className="absolute inset-0 flex justify-around opacity-20">
            {columns.map((col, i) => (
                <motion.div
                    key={i}
                    initial={{ y: -500 }}
                    animate={{ y: 1000 }}
                    transition={{ duration: col.duration, repeat: Infinity, ease: "linear", delay: col.delay }}
                    className="text-[#00ff41] font-mono text-xs [writing-mode:vertical-rl] tracking-tighter"
                >
                    {col.chars}
                </motion.div>
            ))}
        </div>
    );
}

function SnowStormEffect() {
    const flakes = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
        xStart: `${(i * 2.5) % 100}%`,
        xEnd: `${((i * 2.5) + (i % 2 === 0 ? 5 : -5)) % 100}%`,
        duration: 2 + (i % 3),
        delay: (i * 0.2) % 2
    })), []);

    return (
        <div className="absolute inset-0">
            {flakes.map((flake, i) => (
                <motion.div
                    key={i}
                    initial={{ y: -20, x: flake.xStart, opacity: 0 }}
                    animate={{ y: "100vh", opacity: [0, 1, 0], x: [flake.xStart, flake.xEnd] }}
                    transition={{ duration: flake.duration, repeat: Infinity, ease: "linear", delay: flake.delay }}
                    className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
                />
            ))}
        </div>
    );
}
