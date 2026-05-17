"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Trophy, Cpu, Sparkles, LineChart, Users } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Hero() {
  return (
    <div className="relative min-h-screen bg-[#080808] text-white overflow-x-hidden pt-24 md:pt-32 pb-20 px-6">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[#8F44F0]/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] -z-10" />

      {/* Hero Section - Centered */}
      <section className="max-w-7xl mx-auto mb-32 text-center">
        <div className="flex flex-col items-center">
          <TypewriterHeader />
          
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tight mb-8 leading-[0.95]">
            MASTER CODING. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8F44F0] via-[#D8B4FE] to-[#8F44F0]">
              LAND THE JOB.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mb-12 leading-relaxed">
            Practice 1000+ problems, track your growth, and compete globally on a platform built for your success.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link
              href="/problems"
              className="w-full sm:w-auto px-10 py-5 bg-[#8F44F0] hover:bg-[#7a39d1] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(143,68,240,0.4)] active:scale-95 group"
            >
              Start Practicing <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/arena"
              className="w-full sm:w-auto px-10 py-5 bg-white/5 text-white font-bold rounded-xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-md active:scale-95"
            >
              Enter Arena <Trophy className="w-5 h-5 text-[#8F44F0]" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Section 1: Visual Right, Text Left */}
      <section className="max-w-7xl mx-auto mb-40">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                <Sparkles className="w-3 h-3 text-[#8F44F0]" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-bold">Interactive IDE</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">Code in Real-Time. <br/>See the Flow.</h2>
            <p className="text-lg md:text-xl text-white/50 leading-relaxed mb-8">
              Run your solutions instantly with our high-speed execution engine. Get instant feedback and debug with ease.
            </p>
            <Link href="/problems" className="text-[#8F44F0] font-black uppercase tracking-widest text-sm flex items-center justify-center md:justify-start gap-2 group hover:gap-4 transition-all">
              Try the Editor <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1 w-full max-w-xl">
             <CodeVisual />
          </div>
        </div>
      </section>

      {/* Feature Section 2: Visual Left, Text Right */}
      <section className="max-w-7xl mx-auto mb-40">
        <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                <LineChart className="w-3 h-3 text-[#8F44F0]" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-bold">Growth Tracking</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">Deep Analytics. <br/>Level Up Faster.</h2>
            <p className="text-lg md:text-xl text-white/50 leading-relaxed mb-8">
              Every submission is analyzed for time and space complexity. Track your progress with detailed charts and understand exactly where you need to improve.
            </p>
            <Link href="/profile" className="text-[#8F44F0] font-black uppercase tracking-widest text-sm flex items-center justify-center md:justify-start gap-2 group hover:gap-4 transition-all">
              View Your Progress <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1 w-full max-w-xl">
            <AnalyticsVisual />
          </div>
        </div>
      </section>

      {/* Feature Section 3: Visual Right, Text Left */}
      <section className="max-w-7xl mx-auto mb-20">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
          <div className="flex-1 text-center md:text-left">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                <Users className="w-3 h-3 text-[#8F44F0]" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-bold">Community</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">Compete Globally. <br/>Win Together.</h2>
            <p className="text-lg md:text-xl text-white/50 leading-relaxed mb-8">
              Join live contests, climb the leaderboard, and challenge your friends. Coding is better when it&apos;s competitive and social.
            </p>
            <Link href="/arena" className="text-[#8F44F0] font-black uppercase tracking-widest text-sm flex items-center justify-center md:justify-start gap-2 group hover:gap-4 transition-all">
              Join a Contest <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1 w-full max-w-xl">
            <ArenaVisual />
          </div>
        </div>
      </section>
    </div>
  );
}

function TypewriterHeader() {
  const [index, setIndex] = useState(0);
  const words = ["Master Algorithms.", "Build Logic.", "Ace Interviews.", "Solve Problems."];
  
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-10 mb-6 overflow-hidden flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <Sparkles className="w-5 h-5 text-[#8F44F0]" />
          <span className="text-sm md:text-base uppercase tracking-[0.4em] text-[#8F44F0] font-black italic">
            {words[index]}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function CodeVisual() {
  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-[#8F44F0]/20 to-[#D8B4FE]/20 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
      <div className="relative bg-[#0F0F0F] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center gap-1.5 px-4 py-3 bg-white/5 border-b border-white/5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          <div className="ml-2 text-[10px] text-white/30 font-mono">solution.py</div>
        </div>
        <div className="p-8 font-mono text-sm space-y-4">
          <motion.div initial={{ width: 0 }} whileInView={{ width: "80%" }} transition={{ duration: 1, delay: 0.5 }} className="h-2 bg-[#8F44F0]/40 rounded" />
          <motion.div initial={{ width: 0 }} whileInView={{ width: "60%" }} transition={{ duration: 1, delay: 0.7 }} className="h-2 bg-white/10 rounded ml-4" />
          <motion.div initial={{ width: 0 }} whileInView={{ width: "90%" }} transition={{ duration: 1, delay: 0.9 }} className="h-2 bg-white/10 rounded ml-8" />
          <motion.div initial={{ width: 0 }} whileInView={{ width: "40%" }} transition={{ duration: 1, delay: 1.1 }} className="h-2 bg-[#8F44F0]/40 rounded ml-8" />
          <motion.div initial={{ width: 0 }} whileInView={{ width: "70%" }} transition={{ duration: 1, delay: 1.3 }} className="h-2 bg-white/10 rounded ml-4" />
          <div className="flex items-center gap-3 pt-6">
             <div className="px-3 py-1.5 rounded bg-green-500/20 text-green-500 text-xs font-black tracking-widest">ACCEPTED</div>
             <div className="text-xs text-white/40 font-bold">12ms | 14.2 MB</div>
          </div>
        </div>
      </div>
      
      {/* Floating Elements */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute -top-10 -right-6 p-5 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl hidden lg:block"
      >
        <Cpu className="w-8 h-8 text-[#8F44F0]" />
      </motion.div>
    </div>
  );
}

function AnalyticsVisual() {
  return (
    <div className="relative group p-10">
       <div className="absolute inset-0 bg-gradient-to-br from-[#8F44F0]/10 to-transparent rounded-3xl" />
       <div className="flex items-end gap-4 h-64">
          {[40, 70, 45, 90, 65, 80, 50].map((height, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              whileInView={{ height: `${height}%` }}
              transition={{ duration: 1, delay: i * 0.1 }}
              className="flex-1 bg-gradient-to-t from-[#8F44F0] to-[#D8B4FE] rounded-t-xl opacity-40 hover:opacity-100 transition-opacity cursor-pointer relative group/bar"
            >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded text-xs font-bold opacity-0 group-hover/bar:opacity-100 transition-opacity">
                    {height}%
                </div>
            </motion.div>
          ))}
       </div>
       <div className="flex justify-between mt-6 text-xs text-white/30 font-black uppercase tracking-widest px-2">
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
          <span>Sun</span>
       </div>
    </div>
  );
}

function ArenaVisual() {
  return (
    <div className="relative flex flex-col items-center justify-center py-20">
      <div className="flex items-end gap-3 relative">
         <motion.div 
            initial={{ scale: 0 }} 
            whileInView={{ scale: 1 }} 
            className="w-24 h-32 bg-white/5 border border-white/10 rounded-t-2xl flex flex-col items-center justify-center shadow-xl"
         >
            <span className="text-2xl font-black text-white/20">2</span>
         </motion.div>
         <motion.div 
            initial={{ scale: 0 }} 
            whileInView={{ scale: 1 }} 
            transition={{ delay: 0.2 }}
            className="w-32 h-44 bg-[#8F44F0]/20 border border-[#8F44F0]/40 rounded-t-2xl flex flex-col items-center justify-center relative shadow-[0_0_50px_rgba(143,68,240,0.2)]"
         >
            <Trophy className="w-10 h-10 text-[#8F44F0] mb-3" />
            <span className="text-3xl font-black text-[#8F44F0]">1</span>
            <motion.div 
                animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-[#8F44F0]/30 blur-3xl rounded-full"
            />
         </motion.div>
         <motion.div 
            initial={{ scale: 0 }} 
            whileInView={{ scale: 1 }} 
            transition={{ delay: 0.4 }}
            className="w-24 h-20 bg-white/5 border border-white/10 rounded-t-2xl flex flex-col items-center justify-center shadow-xl"
         >
            <span className="text-2xl font-black text-white/20">3</span>
         </motion.div>
      </div>
      
      {/* Floating User Avatars */}
      <motion.div 
        animate={{ x: [0, 15, 0], y: [0, -15, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-10 right-10 w-12 h-12 rounded-full bg-[#8F44F0]/40 border border-white/20 shadow-lg" 
      />
      <motion.div 
        animate={{ x: [0, -15, 0], y: [0, 15, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute bottom-10 left-10 w-10 h-10 rounded-full bg-white/10 border border-white/20 shadow-lg" 
      />
    </div>
  );
}
