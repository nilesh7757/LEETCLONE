"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

export default function SpiderTransformation() {
  const { setTheme } = useTheme();
  const [show, setShow] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handleTrigger = () => {
      console.log("Anomaly Detected...");
      setShow(true);

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0.7;
        audioRef.current
          .play()
          .catch((e) => console.log("Audio play blocked", e));
      }

      // Delayed theme change: 12.5 seconds in
      setTimeout(() => {
        setTheme("spider");
      }, 12500);

      // Total sequence: 15 seconds
      setTimeout(() => {
        setShow(false);
        if (audioRef.current) {
          const fadeInterval = setInterval(() => {
            if (audioRef.current && audioRef.current.volume > 0.05) {
              audioRef.current.volume -= 0.05;
            } else {
              if (audioRef.current) audioRef.current.pause();
              clearInterval(fadeInterval);
            }
          }, 50);
        }
      }, 15000);
    };

    window.addEventListener("start-spider-transformation", handleTrigger);
    return () =>
      window.removeEventListener("start-spider-transformation", handleTrigger);
  }, [setTheme]);

  const glitchBlocks = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        top: `${(i * 17.3) % 100}%`,
        left: `${(i * 23.7) % 100}%`,
        width: `${((i * 11.1) % 30) + 10}%`,
        height: `${((i * 7.9) % 10) + 2}%`,
        delay: (i * 0.4) % 12,
      })),
    [],
  );

  return (
    <>
      <audio ref={audioRef} src="/audio/spider.mp3" preload="auto" hidden />

      <AnimatePresence>
        {show && (
          <motion.div
            key="spider-ritual-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden bg-[#0c0a1f]"
          >
            {/* Background Glitch Pulse */}
            <motion.div
              animate={{
                backgroundColor: ["#0c0a1f", "#1a0a3d", "#0c0a1f"],
                scale: [1, 1.02, 1],
              }}
              transition={{ duration: 0.2, repeat: Infinity }}
              className="absolute inset-0 opacity-20"
            />

            {/* Halftone Pattern Overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(#ff0055 1px, transparent 0)`,
                backgroundSize: "4px 4px",
              }}
            />

            {/* Dimensional Glitch Blocks */}
            <div className="absolute inset-0">
              {glitchBlocks.map((block) => (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    x: [0, block.id % 2 === 0 ? 20 : -20, 0],
                    scaleX: [1, 1.5, 1],
                    backgroundColor: ["#ff0055", "#00f2ff", "#ffff00"],
                  }}
                  transition={{
                    duration: 0.1,
                    repeat: Infinity,
                    repeatDelay: block.delay,
                    ease: "linear",
                  }}
                  style={{
                    position: "absolute",
                    top: block.top,
                    left: block.left,
                    width: block.width,
                    height: block.height,
                  }}
                />
              ))}
            </div>

            {/* SPIDER-VERSE Text Reveal */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 md:p-12 z-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0.5, 1, 1.1, 1.5],
                  skewX: [0, -10, 10, 0],
                }}
                transition={{
                  duration: 13,
                  times: [0, 0.1, 0.8, 1],
                  delay: 0.5,
                }}
                className="relative"
              >
                <h2 className="text-6xl sm:text-8xl md:text-[10rem] lg:text-[12rem] font-black text-white tracking-tighter text-center select-none uppercase italic leading-none drop-shadow-[4px_4px_0px_#ff0055]">
                  SPIDER
                  <br />
                  VERSE
                </h2>

                {/* RGB Split Echoes */}
                <h2 className="absolute inset-0 text-6xl sm:text-8xl md:text-[10rem] lg:text-[12rem] font-black text-[#00f2ff] tracking-tighter text-center select-none uppercase italic leading-none translate-x-1 translate-y-1 opacity-50 mix-blend-screen">
                  SPIDER
                  <br />
                  VERSE
                </h2>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ delay: 8, duration: 4 }}
                className="mt-8 px-6 py-3 bg-[#ff0055] text-white font-black text-sm md:text-xl tracking-[0.5em] uppercase skew-x-[-15deg] shadow-[8px_8px_0px_#00f2ff]"
              >
                What&apos;s up danger?
              </motion.div>
            </div>

            {/* Chromatic Aberration Edge Effect */}
            <div className="absolute inset-0 border-[40px] border-transparent shadow-[inset_0_0_100px_rgba(255,0,85,0.2)]" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
