"use client";

import { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

// Generate deterministic-like random data outside to satisfy linter
const STATIC_SNOWFLAKES = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    xStart: `${(i * 1.37) % 100}vw`,
    xEnd: `${(i * 2.71 + 10) % 100}vw`,
    duration: 3 + (i % 5),
    delay: (i * 0.73) % 15
}));

export default function GOTTransformation() {
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
        setTheme("got");
      }, 13000);

      setTimeout(() => {
        if (audioRef.current) {
            const fadeInterval = setInterval(() => {
                if (audioRef.current && audioRef.current.volume > 0.05) {
                    audioRef.current.volume -= 0.05;
                } else {
                    if (audioRef.current) audioRef.current.pause();
                    clearInterval(fadeInterval);
                    setShow(false);
                }
            }, 150);
        } else {
            setShow(false);
        }
      }, 17000);
    };

    window.addEventListener("start-got-transformation", handleTrigger);
    return () => window.removeEventListener("start-got-transformation", handleTrigger);
  }, [setTheme]);

  return (
    <>
      <audio ref={audioRef} src="/audio/got.mp3" preload="auto" hidden />
      
      <AnimatePresence>
        {show && (
          <motion.div
            key="got-prologue-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden bg-black"
          >
            {/* Act 1: The Long Night (0s - 6s) */}
            <motion.div 
                initial={{ opacity: 1 }}
                animate={{ opacity: [1, 1, 0] }}
                transition={{ duration: 7, times: [0, 0.85, 1] }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black"
            >
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -20] }}
                    transition={{ duration: 6, times: [0, 0.2, 0.8, 1] }}
                    className="text-4xl md:text-6xl font-serif text-white tracking-[0.5em] text-center uppercase px-4"
                >
                    The Long Night
                </motion.h2>
                
                <div className="flex gap-20 mt-12">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 1, 0] }}
                        transition={{ delay: 2, duration: 4 }}
                        className="w-4 h-1 bg-sky-400 rounded-full shadow-[0_0_20px_#38bdf8,0_0_40px_#38bdf8]"
                    />
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 1, 0] }}
                        transition={{ delay: 2.1, duration: 4 }}
                        className="w-4 h-1 bg-sky-400 rounded-full shadow-[0_0_20px_#38bdf8,0_0_40px_#38bdf8]"
                    />
                </div>
            </motion.div>

            {/* Act 2: The Snowstorm (Starts at 5s) */}
            <div className="absolute inset-0 z-20">
                {STATIC_SNOWFLAKES.map((flake) => (
                    <motion.div
                        key={flake.id}
                        initial={{ y: -20, x: flake.xStart, opacity: 0 }}
                        animate={{ 
                            y: "110vh",
                            opacity: [0, 1, 1, 0],
                            x: [flake.xStart, flake.xEnd]
                        }}
                        transition={{ 
                            duration: flake.duration, 
                            repeat: Infinity,
                            delay: flake.delay,
                            ease: "linear"
                        }}
                        className="absolute w-1.5 h-1.5 bg-white rounded-full blur-[1px]"
                    />
                ))}
            </div>

            {/* Act 3: "WINTER IS COMING" (6s - 13s) */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{ duration: 9, delay: 6, times: [0, 0.2, 0.8, 1] }}
                className="absolute inset-0 flex flex-col items-center justify-center z-40"
            >
                <h2 className="text-7xl md:text-[12rem] font-serif text-white tracking-[0.4em] drop-shadow-[0_0_50px_rgba(255,255,255,0.3)] text-center select-none uppercase">
                    WINTER
                </h2>
                <h3 className="text-3xl md:text-5xl font-serif text-sky-200 tracking-[0.6em] mt-4 uppercase opacity-60">
                    IS COMING
                </h3>
            </motion.div>

            {/* Act 4: The Icy Mist Reveal (13s - 17s) */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0, 1, 1, 0] }}
                transition={{ 
                    duration: 17,
                    times: [0, 0.7, 0.8, 0.95, 1],
                    ease: "easeInOut"
                }}
                className="absolute inset-0 bg-[#020617]/90 backdrop-blur-2xl z-[100]"
            >
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ 
                            opacity: [0, 1, 1, 0], 
                            scale: [0.9, 1.1, 1.1, 1.2] 
                        }}
                        transition={{ 
                            delay: 13, 
                            duration: 4,
                            times: [0, 0.2, 0.8, 1] 
                        }}
                        className="text-sky-400 font-serif text-2xl md:text-4xl tracking-[1.5em] uppercase text-center"
                    >
                        THE NORTH REMEMBERS
                    </motion.div>
                </div>
            </motion.div>

            {/* Cold Ambient Aura */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 17, delay: 4 }}
                className="absolute inset-0 bg-gradient-to-tr from-sky-900/40 via-transparent to-sky-900/40 z-30"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
