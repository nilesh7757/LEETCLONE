"use client";

import { motion } from "framer-motion";
import Logo from "@/components/ui/Logo";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#080808]">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#8F44F0]/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative flex flex-col items-center">
        {/* Animated Logo Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            ease: "easeOut"
          }}
          className="relative mb-8"
        >
          {/* Logo Pulse Effect */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-[#8F44F0] rounded-full blur-2xl -z-10"
          />
          
          <Logo className="w-16 h-16 text-[#8F44F0]" />
        </motion.div>

        {/* Text and Progress Bar */}
        <div className="flex flex-col items-center gap-4">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-bold tracking-tighter text-white"
          >
            LogiQuest
          </motion.h2>
          
          <div className="w-48 h-[2px] bg-white/5 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-[#8F44F0] to-transparent"
            />
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold"
          >
            Initializing Logic Grid
          </motion.p>
        </div>
      </div>
    </div>
  );
}
