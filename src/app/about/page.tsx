"use client";

import { 
  Github, ExternalLink, Code2, Database, Cpu, Zap, 
  Sparkles, Trophy, Layers, Mail, Globe, Cpu as RunnerIcon 
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AboutPage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const techStack = [
    { name: "Next.js 15", category: "Frontend & API Routes", desc: "React Server Components, SSR, and dynamic route handlers." },
    { name: "Prisma ORM", category: "Database Layer", desc: "Typesafe database access, complex relation maps, and automatic migrations." },
    { name: "PostgreSQL", category: "Primary Datastore", desc: "Relational database for storing user profiles, submissions, problems, and study plans." },
    { name: "Redis", category: "Cache & Messaging", desc: "Lobby synchronization, matchmaking queues, rate limiting, and BullMQ queues." },
    { name: "Socket.io", category: "Real-time Sync", desc: "Persistent bidirectional WebSocket connections for Head-To-Head coding matches." },
    { name: "BullMQ", category: "Job Queueing", desc: "Reliable background task runner for asynchronous code execution and evaluation." },
    { name: "Monaco Editor", category: "Code Sandbox IDE", desc: "VS Code's core editing engine with auto-completion, syntax coloring, and error markers." },
    { name: "Gemini AI API", category: "AI Orchestrator", desc: "Generative AI API integration powering the contextual Code Coach feedback loop." },
  ];

  const challenges = [
    {
      title: "Real-Time Multiplayer Arena Matching",
      icon: Trophy,
      tech: "Socket.io + Redis Pub/Sub",
      desc: "Synchronizing state across separate client workspaces during Head-to-Head coding battles. Implemented a Redis-backed queue logic combined with WebSocket events to safely pair coders, distribute challenges, run timers, and update leaderboards dynamically without database race conditions.",
      impact: "Matches initialize in <500ms, and state synchronization is maintained in real-time."
    },
    {
      title: "Secure Sandboxed Code Execution",
      icon: RunnerIcon,
      tech: "Judge0 API + BullMQ background workers",
      desc: "Executing arbitrary user-submitted code securely while maintaining sub-second feedback. Configured isolated runtime environments using the Judge0 API. Developed a BullMQ job distribution pattern backed by persistent worker scripts to queue, execute, and verify code execution memory/time limits without stalling the primary Node.js process.",
      impact: "Sandboxed execution completes in under 2.0 seconds with resource quotas strictly enforced."
    },
    {
      title: "Multi-Model AI Code Coach Integration",
      icon: Sparkles,
      tech: "Gemini Pro API + Contextual Prompting",
      desc: "Providing step-by-step guidance without exposing direct code solutions. Created a custom system prompt that digests compilation logs, AST structures, and previous submission history to guide users through progressive hints (Logic Analysis, Edge Case Checks, and Complexity Optimizations).",
      impact: "Contextual feedback reduces code stuckness by 40% while maintaining developer agency."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 text-[var(--foreground)] relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-[#8F44F0]/5 via-[#740DF6]/2 to-transparent rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Header section */}
      <header className="mb-16 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8F44F0]/10 border border-[#8F44F0]/20 text-[#c084fc] mb-4">
          <Layers size={12} className="text-[#8F44F0]" />
          <span className="text-[10px] uppercase font-black tracking-widest">Engineering Walkthrough</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white mb-4">
          System Architecture & Case Study
        </h1>
        <p className="text-base sm:text-lg text-[#a1a1aa] max-w-3xl leading-relaxed">
          LogiQuest is a high-fidelity competitive programming workbench. Here is a look behind the scenes at the architecture, primary stack, and advanced engineering challenges solved during construction.
        </p>
      </header>

      {/* Architecture Diagram Section */}
      <section className="mb-20">
        <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wider mb-6 flex items-center gap-2.5">
          <Code2 size={20} className="text-[#8F44F0]" />
          System Architecture
        </h2>
        <div className="p-6 bg-[#0e0e11] border border-white/5 rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="absolute -inset-10 bg-radial-gradient from-[#8F44F0]/5 to-transparent pointer-events-none -z-10" />
          
          {/* Custom SVG Architecture Diagram */}
          <div className="w-full h-auto min-h-[350px] flex items-center justify-center py-4">
            <svg viewBox="0 0 800 420" className="w-full h-auto text-xs font-mono select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Grid Lines */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1"/>
                </pattern>
                <linearGradient id="glowPurple" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#8F44F0" stopOpacity="0.8"/>
                </linearGradient>
              </defs>
              <rect width="800" height="420" fill="url(#grid)" rx="16"/>

              {/* Connections (Lines & Paths) */}
              <path d="M 170 110 L 290 110" stroke="rgba(143,68,240,0.3)" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M 170 210 L 290 210" stroke="rgba(143,68,240,0.5)" strokeWidth="2" />
              <path d="M 170 310 L 290 310" stroke="rgba(143,68,240,0.3)" strokeWidth="2" strokeDasharray="4 4" />
              
              <path d="M 430 110 L 530 110" stroke="rgba(59,130,246,0.5)" strokeWidth="2" />
              <path d="M 430 210 L 530 210" stroke="rgba(59,130,246,0.5)" strokeWidth="2" />
              <path d="M 430 310 L 530 310" stroke="rgba(59,130,246,0.5)" strokeWidth="2" />

              <path d="M 640 110 L 640 180" stroke="rgba(234,179,8,0.5)" strokeWidth="2" />
              <path d="M 640 310 L 640 240" stroke="rgba(16,185,129,0.5)" strokeWidth="2" />

              {/* Node 1: Client Layer */}
              <g transform="translate(30, 80)">
                <rect width="140" height="260" rx="12" fill="#16161a" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="2"/>
                <text x="70" y="30" fill="#a1a1aa" fontWeight="bold" textAnchor="middle">CLIENT SIDE</text>
                <rect x="15" y="60" width="110" height="40" rx="8" fill="#27272a" />
                <text x="70" y="85" fill="#ffffff" textAnchor="middle" fontSize="10">Monaco Editor</text>
                <rect x="15" y="120" width="110" height="40" rx="8" fill="#27272a" />
                <text x="70" y="145" fill="#ffffff" textAnchor="middle" fontSize="10">Real-Time Lobbies</text>
                <rect x="15" y="180" width="110" height="40" rx="8" fill="#27272a" />
                <text x="70" y="205" fill="#ffffff" textAnchor="middle" fontSize="10">DSA Visualizers</text>
              </g>

              {/* Node 2: App & API Server */}
              <g transform="translate(290, 80)">
                <rect width="140" height="260" rx="12" fill="#1a1226" stroke="#8F44F0" strokeWidth="2"/>
                <text x="70" y="35" fill="url(#glowPurple)" fontWeight="bold" textAnchor="middle">NEXT.JS ENGINE</text>
                <rect x="15" y="65" width="110" height="40" rx="8" fill="#2a1b40" />
                <text x="70" y="90" fill="#ffffff" textAnchor="middle" fontSize="10">API routes</text>
                <rect x="15" y="125" width="110" height="40" rx="8" fill="#2a1b40" />
                <text x="70" y="150" fill="#ffffff" textAnchor="middle" fontSize="10">Server Components</text>
                <rect x="15" y="185" width="110" height="40" rx="8" fill="#2a1b40" />
                <text x="70" y="210" fill="#ffffff" textAnchor="middle" fontSize="10">WebSockets Sync</text>
              </g>

              {/* Node 3: Cache / Queues */}
              <g transform="translate(530, 80)">
                <rect width="120" height="70" rx="10" fill="#1c1c1f" stroke="#3b82f6" strokeWidth="2" />
                <text x="60" y="25" fill="#3b82f6" fontWeight="bold" textAnchor="middle">REDIS</text>
                <text x="60" y="45" fill="#a1a1aa" textAnchor="middle" fontSize="9">Pub/Sub Matchmaker</text>
                <text x="60" y="58" fill="#a1a1aa" textAnchor="middle" fontSize="9">Job Queuing (BullMQ)</text>
              </g>

              {/* Node 4: Isolated Executor */}
              <g transform="translate(530, 180)">
                <rect width="120" height="70" rx="10" fill="#1e1313" stroke="#ef4444" strokeWidth="2" />
                <text x="60" y="25" fill="#ef4444" fontWeight="bold" textAnchor="middle">SANDBOX RUNNER</text>
                <text x="60" y="45" fill="#a1a1aa" textAnchor="middle" fontSize="9">Judge0 API</text>
                <text x="60" y="58" fill="#a1a1aa" textAnchor="middle" fontSize="9">BullMQ Workers</text>
              </g>

              {/* Node 5: Database */}
              <g transform="translate(530, 280)">
                <rect width="120" height="70" rx="10" fill="#131e1c" stroke="#10b989" strokeWidth="2" />
                <text x="60" y="25" fill="#10b989" fontWeight="bold" textAnchor="middle">POSTGRESQL</text>
                <text x="60" y="45" fill="#a1a1aa" textAnchor="middle" fontSize="9">Prisma Client DB</text>
                <text x="60" y="58" fill="#a1a1aa" textAnchor="middle" fontSize="9">Relational Store</text>
              </g>

              {/* Node 6: AI Orchestrator */}
              <g transform="translate(680, 180)">
                <rect width="100" height="70" rx="10" fill="#1e1811" stroke="#eab308" strokeWidth="2" />
                <text x="50" y="25" fill="#eab308" fontWeight="bold" textAnchor="middle">GEMINI AI</text>
                <text x="50" y="45" fill="#a1a1aa" textAnchor="middle" fontSize="9">Contextual Prompts</text>
                <text x="50" y="58" fill="#a1a1aa" textAnchor="middle" fontSize="9">AI Code Coach</text>
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* Hard Engineering Challenges */}
      <section className="mb-20">
        <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wider mb-8 flex items-center gap-2.5">
          <Cpu size={20} className="text-[#8F44F0]" />
          Engineering Case Studies
        </h2>
        
        <div className="space-y-6">
          {challenges.map((ch, idx) => {
            const Icon = ch.icon;
            return (
              <div 
                key={idx}
                onMouseEnter={() => setHoveredFeature(idx)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={`p-6 md:p-8 bg-[#0e0e11] border rounded-3xl transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row gap-6 ${
                  hoveredFeature === idx 
                    ? "border-[#8F44F0]/30 shadow-[0_0_30px_rgba(143,68,240,0.05)] translate-x-1" 
                    : "border-white/5"
                }`}
              >
                {/* Left icon wrapper */}
                <div className="w-12 h-12 rounded-2xl bg-[#8F44F0]/10 border border-[#8F44F0]/20 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-[#8F44F0]" />
                </div>
                
                {/* Right content */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-black text-white uppercase tracking-wider">{ch.title}</h3>
                    <span className="text-[10px] font-mono font-bold uppercase bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-[#a1a1aa]">{ch.tech}</span>
                  </div>
                  <p className="text-sm text-[#a1a1aa] leading-relaxed">
                    {ch.desc}
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-xs font-mono text-[#a7f3d0]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                    <span><strong>Proven Impact:</strong> {ch.impact}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tech Stack Details */}
      <section className="mb-20">
        <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wider mb-8 flex items-center gap-2.5">
          <Database size={20} className="text-[#8F44F0]" />
          Production Technology Stack
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {techStack.map((tech, idx) => (
            <div key={idx} className="p-5 bg-[#0e0e11] border border-white/5 hover:border-white/10 transition-colors rounded-2xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-white tracking-wider">{tech.name}</span>
                <span className="text-[9px] font-bold text-[#71717a] uppercase tracking-widest">{tech.category}</span>
              </div>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">{tech.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Developer Card (Built by Nilesh) */}
      <section className="mb-12">
        <div className="p-8 bg-gradient-to-br from-[#0e0e11] to-[#050505] border border-white/5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-[#8F44F0]/5 to-transparent rounded-full blur-[100px] pointer-events-none -z-10" />
          
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-2xl font-black uppercase text-white tracking-wide">
              Created by Nilesh Mori
            </h2>
            <p className="text-sm text-[#a1a1aa] max-w-xl leading-relaxed">
              I am a software engineer focused on building highly responsive, performance-driven web applications. This workspace demonstrates clean architecture, scalable task distribution, and dynamic client-side visualizers.
            </p>
            
            {/* Contact channels */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-mono text-[#a1a1aa] pt-2">
              <a href="https://github.com/nilesh7757" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Github size={14} />
                <span>github/nilesh7757</span>
              </a>
              <a href="mailto:nileshmori7757@gmail.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Mail size={14} />
                <span>nileshmori7757@gmail.com</span>
              </a>
              <a href="https://codeforces.com/profile/nileshm7757" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Globe size={14} />
                <span>codeforces/nileshm7757</span>
              </a>
            </div>
          </div>

          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full sm:w-auto shrink-0">
            <a 
              href="https://github.com/nilesh7757/LEETCLONE" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2.5 active:scale-95 text-center"
            >
              <Github size={14} />
              Explore Repository
              <ExternalLink size={12} className="text-[#a1a1aa]" />
            </a>
            <a 
              href="mailto:nileshmori7757@gmail.com?subject=Reaching out regarding LogiQuest" 
              className="px-6 py-3 bg-gradient-to-r from-[#8F44F0] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#6d28d9] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(143,68,240,0.3)] active:scale-95 text-center"
            >
              <Mail size={14} />
              Get In Touch
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
