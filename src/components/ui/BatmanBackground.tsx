"use client";

import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function BatmanBackground() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || theme !== "batman") return null;

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-black">
      {/* The Searchlight Beam */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] opacity-25"
        style={{
          background:
            "radial-gradient(circle at 85% 15%, rgba(255, 0, 0, 0.45) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* The Bat-Signal Projection (Permanent Background) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0.15, 0.25, 0.2, 0.3, 0.15],
          scale: [1, 1.03, 0.97, 1.05, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[2%] right-[2%] w-[250px] h-[250px] md:w-[400px] md:h-[400px]"
      >
        <div className="relative w-full h-full mix-blend-screen opacity-60 grayscale brightness-200 contrast-200">
          <Image
            src="/audio/batman-logo.png"
            alt="Bat-Signal Sky"
            fill
            className="object-contain filter drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]"
          />
        </div>
      </motion.div>

      {/* Atmospheric Mist */}
      <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] mix-blend-overlay" />
    </div>
  );
}
