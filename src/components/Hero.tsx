"use client";

import { motion } from "framer-motion";
import { ArrowRight, Terminal, Trophy } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] md:min-h-screen flex flex-col justify-center items-center py-12 md:pt-20 overflow-hidden">
      {/* Background Gradients - Adjusted for responsiveness */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] md:w-[1000px] h-[200px] md:h-[400px] bg-[var(--viz-blue)]/5 rounded-full blur-[80px] md:blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[200px] md:w-[500px] h-[200px] md:h-[500px] bg-[var(--viz-purple)]/5 rounded-full blur-[60px] md:blur-[100px] -z-10" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 md:opacity-20 -z-10" />

      <div className="w-full max-w-5xl mx-auto px-4 md:px-6 text-center z-10">    
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-[var(--foreground)] mb-4 md:mb-6 leading-[1.1]">
            Master the Code. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--viz-blue)] via-[var(--viz-purple)] to-[var(--viz-gold)]">
              Ace the Interview.
            </span>
          </h1>

          <p className="text-base md:text-xl text-[var(--foreground)]/60 max-w-2xl mx-auto mb-8 md:mb-10 px-4">
            The ultimate platform to practice coding, compete in contests,
            and land your dream job at top tech companies.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 w-full sm:w-auto px-4">
            <Link
              href="/problems"
              className="w-full sm:w-auto px-6 md:px-8 py-3.5 md:py-4 bg-[var(--viz-blue)] text-[var(--background)] font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--viz-blue)]/20 active:scale-95"
            >
              Start Solving <ArrowRight className="w-4 h-4" />     
            </Link>
            <Link
              href="/contest"
              className="w-full sm:w-auto px-6 md:px-8 py-3.5 md:py-4 bg-[var(--card)] text-[var(--foreground)] font-semibold rounded-xl border border-[var(--border)] hover:bg-[var(--muted)] transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              Join Contest <Trophy className="w-4 h-4 text-[var(--viz-gold)]" />
            </Link>
          </div>
        </motion.div>

        {/* Stats / Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-16 md:mt-24 px-4"  
        >
          <FeatureCard
            icon={<Terminal className="w-5 h-5 md:w-6 md:h-6" />}
            title="In-Browser IDE"
            description="Write, run, and debug code instantly in 10+ languages."
            href="/problems"
          />
          <FeatureCard
            icon={<Trophy className="w-5 h-5 md:w-6 md:h-6" />}
            title="Weekly Contests"
            description="Compete globally and climb the leaderboard rankings."
            href="/contest"
          />
          <FeatureCard
            icon={<ArrowRight className="w-5 h-5 md:w-6 md:h-6" />}
            title="AI Hints"
            description="Stuck? Get intelligent hints without revealing the solution."
            href="/problems"
            className="sm:col-span-2 md:col-span-1"
          />
        </motion.div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, href, className = "" }: { icon: React.ReactNode; title: string; description: string; href: string; className?: string }) {
  return (
    <Link href={href} className={`group ${className}`}>
      <div className="p-5 md:p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] backdrop-blur-sm text-left hover:bg-[var(--muted)] transition-all hover:shadow-xl hover:-translate-y-1 h-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--viz-blue)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] mb-4 group-hover:text-[var(--viz-blue)] transition-colors">
          {icon}
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-[var(--foreground)] mb-2 group-hover:text-[var(--viz-blue)] transition-colors">{title}</h3>
        <p className="text-[var(--foreground)]/60 text-sm leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}