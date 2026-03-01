"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

export default function DraculaTransformation() {
  const { setTheme } = useTheme();
  const [show, setShow] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handleTrigger = () => {
      setShow(true);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0.7;
        audioRef.current.play().catch(e => console.log("Audio play blocked", e));
      }

      setTimeout(() => {
        setTheme("dracula");
      }, 12000);

      const fadeStartTime = 14000;
      const fadeOutTimeout = setTimeout(() => {
        const fadeInterval = setInterval(() => {
          if (audioRef.current && audioRef.current.volume > 0.05) {
            audioRef.current.volume -= 0.05;
          } else {
            if (audioRef.current) audioRef.current.pause();
            clearInterval(fadeInterval);
            setShow(false);
          }
        }, 150);
      }, fadeStartTime);

      return () => clearTimeout(fadeOutTimeout);
    };

    window.addEventListener("start-dracula-transformation", handleTrigger);
    return () => window.removeEventListener("start-dracula-transformation", handleTrigger);
  }, [setTheme]);

  // Use deterministic generation to satisfy linter purity
  const tendrils = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    x: `${i * 6}%`,
    width: `${((i * 7.33) % 8) + 8}%`,
    delay: i * 0.05
  })), []);

  return (
    <>
      <audio ref={audioRef} src="/audio/dracula.mp3" preload="auto" hidden />
      
      <AnimatePresence>
        {show && (
          <motion.div
            key="dracula-ritual-overlay"
            className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden bg-transparent"
          >
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="goo" />
                    </filter>
                    <linearGradient id="bloodGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#450a0a" />
                        <stop offset="100%" stopColor="#ff0000" />
                    </linearGradient>
                </defs>
                
                <g filter="url(#goo)">
                    {tendrils.map((t, i) => (
                        <motion.rect
                            key={i}
                            x={t.x}
                            width={t.width}
                            initial={{ height: 0 }}
                            animate={{ height: ["0%", "110%", "110%", "0%"] }}
                            transition={{ 
                                duration: 14,
                                delay: t.delay,
                                times: [0, 0.7, 0.85, 1],
                                ease: [0.45, 0.05, 0.55, 0.95] 
                            }}
                            fill="url(#bloodGradient)"
                            rx="60"
                        />
                    ))}
                </g>
            </svg>

            <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                    opacity: [0, 0, 1, 1, 0], 
                    scale: [0.5, 0.8, 1, 1.3, 2],
                }}
                transition={{ 
                    duration: 13, 
                    times: [0, 0.5, 0.7, 0.9, 1],
                    delay: 0.5 
                }}
                className="absolute inset-0 flex flex-col items-center justify-center z-10"
            >
                <h2 className="text-9xl md:text-[15rem] font-black text-white italic tracking-tighter drop-shadow-[0_0_100px_rgba(255,0,0,1)] text-center select-none uppercase">
                    DRACULA
                </h2>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 14, times: [0, 0.8, 1] }}
                className="absolute inset-0 bg-red-950/10 mix-blend-multiply"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
