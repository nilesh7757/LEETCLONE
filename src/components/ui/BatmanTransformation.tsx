"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function BatmanTransformation() {
  const { setTheme } = useTheme();
  const [show, setShow] = useState(false);
  const [stage, setStage] = useState<
    "vengeance" | "underneath" | "batman" | "cape" | "reveal"
  >("vengeance");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handleTrigger = () => {
      console.log("Becoming Vengeance...");
      setShow(true);
      setStage("vengeance");

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0.8;
        audioRef.current
          .play()
          .catch((e) => console.log("Audio play blocked", e));
      }

      // DIALOGUE SEQUENCE
      // 0-3s: I am Vengeance
      // 3-6s: It's not who I am underneath...
      // 6-9s: I am Batman
      // 9-11s: CAPE SWEEP
      // 11-15s: Final Reveal

      setTimeout(() => setStage("underneath"), 3000);
      setTimeout(() => setStage("batman"), 6000);
      setTimeout(() => setStage("cape"), 9000);
      setTimeout(() => setStage("reveal"), 11000);

      // Theme Sync
      setTimeout(() => setTheme("batman"), 13500);

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
          }, 100);
        }
      }, 17000);
    };

    window.addEventListener("start-batman-transformation", handleTrigger);
    return () =>
      window.removeEventListener("start-batman-transformation", handleTrigger);
  }, [setTheme]);

  return (
    <>
      <audio ref={audioRef} src="/audio/batman.mp3" preload="auto" hidden />

      <AnimatePresence>
        {show && (
          <motion.div
            key="batman-ultimate-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden bg-black"
          >
            {/* ACT 1: THE CAPE SWEEP */}
            <AnimatePresence>
              {stage === "cape" && (
                <motion.div
                  initial={{ x: "-100%", skewX: -20 }}
                  animate={{ x: "200%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="absolute inset-0 z-[60] bg-[#050505] w-[150%] shadow-[20px_0_100px_rgba(0,0,0,1)]"
                >
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ACT 2: THUNDER */}
            <motion.div
              animate={{ opacity: [0, 0.1, 0, 0.05, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
              className="absolute inset-0 bg-white z-[55]"
            />

            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <AnimatePresence mode="wait">
                {stage === "vengeance" && (
                  <motion.h2
                    key="v"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-600 font-serif text-4xl md:text-7xl italic font-black uppercase tracking-tighter"
                  >
                    I am Vengeance.
                  </motion.h2>
                )}
                {stage === "underneath" && (
                  <motion.h2
                    key="u"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-600 font-serif text-2xl md:text-5xl italic font-medium tracking-tight max-w-4xl"
                  >
                    It&apos;s not who I am underneath,
                    <br />
                    but what I do that defines me.
                  </motion.h2>
                )}
                {stage === "batman" && (
                  <motion.h2
                    key="b"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="text-red-600 font-serif text-5xl md:text-8xl italic font-black uppercase tracking-widest"
                  >
                    I am Batman.
                  </motion.h2>
                )}
                {stage === "reveal" && (
                  <motion.div
                    key="r"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    {/* THE PURE BAT SIGNAL - NO GLOW IN PICTURE */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 2 }}
                      className="relative w-64 h-64 md:w-[500px] md:h-[500px] mb-8"
                    >
                      {/* The Sharp Spotlight Disc */}
                      <div className="absolute inset-0 rounded-full bg-white opacity-90 shadow-[0_0_80px_rgba(255,255,255,0.8)]" />

                      {/* The User's Logo - Extracted Black on White */}
                      <div className="absolute inset-0 flex items-center justify-center p-12 mix-blend-multiply">
                        <Image
                          src="/audio/batman-logo.png"
                          alt="The Bat"
                          width={600}
                          height={600}
                          className="object-contain grayscale brightness-0 contrast-200"
                        />
                      </div>
                    </motion.div>

                    <motion.h2
                      initial={{ opacity: 0, letterSpacing: "1em" }}
                      animate={{ opacity: 1, letterSpacing: "0.2em" }}
                      transition={{ delay: 1, duration: 3 }}
                      className="text-6xl md:text-[10rem] font-black text-white italic drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                    >
                      BATMAN
                    </motion.h2>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Persistent Rainy Atmosphere */}
            <div className="absolute inset-0 pointer-events-none">
              <BatmanRainSystem />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function BatmanRainSystem() {
  const drops = useMemo(
    () =>
      Array.from({ length: 100 }, (_, i) => ({
        id: i,
        left: `${(i * 1.37) % 100}%`,
        duration: 0.4 + (i % 3) * 0.2,
        delay: (i * 0.11) % 5,
      })),
    [],
  );

  return (
    <>
      {drops.map((drop) => (
        <motion.div
          key={drop.id}
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 1200, opacity: [0, 0.3, 0] }}
          transition={{
            duration: drop.duration,
            delay: drop.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ left: drop.left }}
          className="absolute w-[1px] h-20 bg-gradient-to-b from-transparent via-white/20 to-transparent"
        />
      ))}
    </>
  );
}
