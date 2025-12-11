"use client";

import { motion } from "framer-motion";
import { ArrowRight, Terminal, Trophy } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center pt-20 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[var(--foreground)]/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -z-10" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 -z-10" />

      <div className="max-w-5xl mx-auto px-6 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] text-xs font-medium text-[var(--foreground)]/80 mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            Over 2000+ Questions Available
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[var(--foreground)] mb-6">
            Master the Code. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-gradient-from)] to-[var(--accent-gradient-to)]">
              Ace the Interview.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--foreground)]/60 max-w-2xl mx-auto mb-10">
            The ultimate platform to practice coding, compete in contests, 
            and land your dream job at top tech companies.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/problems"
              className="w-full sm:w-auto px-8 py-4 bg-[var(--foreground)] text-[var(--background)] font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              Start Solving <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contest"
              className="w-full sm:w-auto px-8 py-4 bg-[var(--card-bg)] text-[var(--foreground)] font-semibold rounded-lg border border-[var(--card-border)] hover:bg-[var(--foreground)]/5 transition-colors flex items-center justify-center gap-2"
            >
              Join Contest <Trophy className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Stats / Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
        >
          <FeatureCard 
            icon={<Terminal className="w-6 h-6" />}
            title="In-Browser IDE"
            description="Write, run, and debug code instantly in 10+ languages."
          />
          <FeatureCard 
            icon={<Trophy className="w-6 h-6" />}
            title="Weekly Contests"
            description="Compete globally and climb the leaderboard rankings."
          />
          <FeatureCard 
            icon={<ArrowRight className="w-6 h-6" />}
            title="AI Hints"
            description="Stuck? Get intelligent hints without revealing the solution."
          />
        </motion.div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-sm text-left hover:border-[var(--foreground)]/20 transition-colors">
      <div className="w-12 h-12 rounded-lg bg-[var(--foreground)]/10 border border-[var(--card-border)] flex items-center justify-center text-[var(--foreground)] mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">{title}</h3>
      <p className="text-[var(--foreground)]/60">{description}</p>
    </div>
  );
}
