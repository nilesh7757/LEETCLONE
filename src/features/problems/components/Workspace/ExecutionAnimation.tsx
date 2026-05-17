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

  const isBatman = theme === "batman";

  useEffect(() => {
    if (!isVisible) return;

    // Timer to auto-close the animation
    const timer = setTimeout(() => {
      onComplete();
    }, 6000);

    // Dialogue Logic
    if (isBatman) {
        const quotes = [
            "I'm Vengeance.",
            "Things always get worse before they get better.",
            "It's not just a signal; it's a warning.",
            "The city is a powder keg, and Riddler's the match."
        ];
        const index = Math.floor(Date.now() / 1000) % quotes.length;
        requestAnimationFrame(() => setActiveMessage(quotes[index]));
    } else {
        const standardMessages = [
            "SOLVED_WITH_PRECISION",
            "ALGORITHM_OPTIMIZED",
            "COMPUTATIONAL_VICTORY",
            `EXCELLENT_WORK_${session?.user?.name?.toUpperCase() || 'USER'}`
        ];
        const index = Math.floor(Date.now() / 1000) % standardMessages.length;
        requestAnimationFrame(() => setActiveMessage(standardMessages[index]));
    }

    return () => clearTimeout(timer);
  }, [isVisible, isBatman, session?.user?.name, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden">
      
      <AnimatePresence>
        {isBatman && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-red-950/10 backdrop-blur-sm"
            />
        )}
      </AnimatePresence>

      <div className="absolute inset-0">
        {isBatman && <BatmanRainEffect />}
        {!isBatman && <StandardParticlesEffect />}
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 1.1, opacity: 0 }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div 
            animate={{ 
                boxShadow: isBatman ? ["0 0 20px #ff0000", "0 0 60px #ff0000", "0 0 20px #ff0000"] :
                           ["0 0 20px #3b82f6", "0 0 60px #3b82f6", "0 0 20px #3b82f6"]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`px-12 py-6 rounded-3xl bg-black/80 border-2 backdrop-blur-xl ${
                isBatman ? 'border-red-600' : 'border-[#3b82f6]'
            }`}
        >
            <h2 className={`text-4xl md:text-6xl font-black italic tracking-tighter ${
                isBatman ? 'text-red-600' : 'text-white'
            }`}>
                ACCEPTED
            </h2>
        </motion.div>
        
        <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`mt-8 text-xl md:text-2xl text-center px-6 max-w-2xl font-black uppercase tracking-[0.2em] leading-relaxed drop-shadow-lg ${
                isBatman ? 'text-red-500 italic' : 'text-[#3b82f6]'
            }`}
        >
            {activeMessage}
        </motion.p>
      </motion.div>

    </div>
  );
}

function StandardParticlesEffect() {
    const [particles] = useState(() => Array.from({ length: 20 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 4,
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 2
    })));

    return (
        <div className="absolute inset-0">
            {particles.map((p, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 0.5, 0], scale: [0, 1.5, 0] }}
                    transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
                    style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
                    className="absolute bg-[#3b82f6] rounded-full blur-[1px]"
                />
            ))}
        </div>
    );
}

function BatmanRainEffect() {
    const drops = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
        left: `${(i * 3.33) % 100}%`,
        duration: 0.5 + (i % 0.5),
        delay: (i * 0.1) % 2
    })), []);

    return (
        <div className="absolute inset-0">
            <motion.div 
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-y-0 w-[500px] bg-gradient-to-r from-transparent via-red-600/10 to-transparent skew-x-[-20deg]"
            />
            {drops.map((drop, i) => (
                <motion.div
                    key={i}
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 1000, opacity: [0, 0.4, 0] }}
                    transition={{ duration: drop.duration, delay: drop.delay, repeat: Infinity, ease: "linear" }}
                    style={{ left: drop.left }}
                    className="absolute w-[1px] h-12 bg-white/30"
                />
            ))}
        </div>
    );
}
