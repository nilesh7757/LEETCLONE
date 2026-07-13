"use client";

import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import {
  Trophy, Calendar, Award, Github, Zap, Code2, Flame, Sparkle
} from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { toast } from 'sonner';

interface UserRatingCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stats: any;
}

const STAT_CONFIGS = [
  { code: "DEEP", label: "Deep Thinking", key: "Dynamic Programming" },
  { code: "TEXT", label: "String Mastery", key: "String" },
  { code: "LINK", label: "Graph Connectivity", key: "Graph" },
  { code: "NUM", label: "Numerical Logic", key: "Math" },
  { code: "ROOT", label: "Tree Structure", key: "Tree" },
  { code: "PUSH", label: "Greedy Drive", key: "Greedy" },
];

const CARD_THEMES = {
  bronze: {
    name: "Novice",
    bg: "linear-gradient(135deg, #1f1412 0%, #36211e 40%, #854b40 85%, #b26a5c 100%)",
    border: "border-[#854b40] shadow-[#854b40]/15",
    text: "text-orange-50",
    textDark: "text-[#b26a5c]",
    textMuted: "text-orange-100/50",
    divider: "bg-[#854b40]/30",
    accent: "#854b40",
    glow: "rgba(133, 75, 64, 0.15)",
    badgeBg: "bg-orange-500/5 border-orange-500/20 text-orange-200/60",
    statHexBg: "rgba(133, 75, 64, 0.12)",
    statBarBg: "bg-orange-500/10",
  },
  silver: {
    name: "Intermediate",
    bg: "linear-gradient(135deg, #13171e 0%, #202735 40%, #768897 85%, #a5b4c0 100%)",
    border: "border-[#768897] shadow-[#768897]/20",
    text: "text-slate-50",
    textDark: "text-[#a5b4c0]",
    textMuted: "text-slate-100/50",
    divider: "bg-[#768897]/30",
    accent: "#768897",
    glow: "rgba(118, 136, 151, 0.2)",
    badgeBg: "bg-slate-500/5 border-slate-500/20 text-slate-200/60",
    statHexBg: "rgba(118, 136, 151, 0.12)",
    statBarBg: "bg-slate-500/10",
  },
  gold: {
    name: "Advanced",
    bg: "linear-gradient(135deg, #1c190f 0%, #352d17 40%, #dbb244 85%, #f7d16f 100%)",
    border: "border-[#dbb244] shadow-[#dbb244]/20",
    text: "text-yellow-50",
    textDark: "text-[#f7d16f]",
    textMuted: "text-yellow-100/60",
    divider: "bg-[#dbb244]/30",
    accent: "#dbb244",
    glow: "rgba(219, 178, 68, 0.25)",
    badgeBg: "bg-yellow-500/5 border-yellow-500/20 text-yellow-200/70",
    statHexBg: "rgba(219, 178, 68, 0.15)",
    statBarBg: "bg-yellow-500/10",
  },
  inform: {
    name: "Specialist",
    bg: "linear-gradient(135deg, #09090c 0%, #15151b 45%, #ffd700 90%, #09090c 100%)",
    border: "border-[#ffd700] shadow-[#ffd700]/25",
    text: "text-white",
    textDark: "text-[#ffd700]",
    textMuted: "text-yellow-100/50",
    divider: "bg-[#ffd700]/20",
    accent: "#ffd700",
    glow: "rgba(255, 215, 0, 0.25)",
    badgeBg: "bg-yellow-500/5 border-yellow-500/20 text-yellow-100/70",
    statHexBg: "rgba(255, 215, 0, 0.12)",
    statBarBg: "bg-yellow-500/10",
  },
  toty: {
    name: "Master",
    bg: "linear-gradient(135deg, #010414 0%, #001f5c 35%, #0056e0 75%, #ffd700 100%)",
    border: "border-[#ffd700] shadow-blue-500/30",
    text: "text-white",
    textDark: "text-[#ffd700]",
    textMuted: "text-blue-200/60",
    divider: "bg-[#ffd700]/30",
    accent: "#ffd700",
    glow: "rgba(0, 86, 224, 0.35)",
    badgeBg: "bg-blue-500/5 border-blue-500/20 text-blue-200/75",
    statHexBg: "rgba(255, 215, 0, 0.15)",
    statBarBg: "bg-blue-500/15",
  },
  icon: {
    name: "Expert",
    bg: "linear-gradient(135deg, #101012 0%, #222226 40%, #ffffff 85%, #d4af37 100%)",
    border: "border-[#d4af37] shadow-[#d4af37]/25",
    text: "text-white",
    textDark: "text-[#d4af37]",
    textMuted: "text-gray-300/60",
    divider: "bg-[#d4af37]/30",
    accent: "#d4af37",
    glow: "rgba(212, 175, 55, 0.3)",
    badgeBg: "bg-white/5 border-white/10 text-gray-300/70",
    statHexBg: "rgba(212, 175, 55, 0.15)",
    statBarBg: "bg-white/10",
  }
};

const getValueColor = (val: number, ring: string) => {
  if (val >= 90) return ring;
  if (val >= 80) return "#34d399";
  if (val >= 70) return "#fbbf24";
  if (val >= 60) return "#fb923c";
  return "#f87171";
};

function lcg(seed: number) {
  let s = seed | 0;
  return () => { s = (s * 1664525 + 1013904223) | 0; return ((s >>> 0) / 4294967296); };
}

function FloatingParticles({ count = 15, accent }: { count?: number; accent: string }) {
  const [ready, setReady] = useState(false);
  const rng = useMemo(() => lcg(123456789), []);
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: rng() * 100,
      size: 1.5 + rng() * 3,
      duration: 3 + rng() * 5,
      delay: rng() * 4,
      targetY: -(320 + rng() * 180),
    })), [count, rng]);

  useEffect(() => { setReady(true); /* eslint-disable-line react-hooks/set-state-in-effect */ }, []);

  if (!ready) return <div className="absolute inset-0 pointer-events-none overflow-hidden z-20" />;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            bottom: '-10%',
            width: p.size,
            height: p.size,
            background: accent,
            boxShadow: `0 0 8px ${accent}`,
          }}
          animate={{
            y: [0, p.targetY],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

// INLINE SKILL RADAR SVG
interface CardSkillRadarProps {
  cat: Record<string, number>;
  accent: string;
  size?: number;
}

function CardSkillRadar({ cat, accent, size = 180 }: CardSkillRadarProps) {
  const center = size / 2;
  const radius = size * 0.36;

  const getCoordinates = (index: number, score: number) => {
    const angle = (Math.PI * 2 * index) / STAT_CONFIGS.length - Math.PI / 2;
    // score is between 40 and 99. Normalize to 0.15 - 1.0 range.
    const normalized = 0.15 + ((score - 40) / 59) * 0.85;
    const r = radius * Math.min(1, Math.max(0.15, normalized));
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const levels = [0.4, 0.7, 1];
  const gridLines = levels.map(level => {
    return STAT_CONFIGS.map((_, i) => {
      const score = level * 59 + 40;
      const point = getCoordinates(i, score);
      return `${point.x},${point.y}`;
    }).join(" ");
  });

  const points = STAT_CONFIGS.map((s, i) => {
    const val = cat[s.key] || 0;
    const score = Math.min(99, Math.max(40, 50 + val * 2));
    const point = getCoordinates(i, score);
    return `${point.x},${point.y}`;
  }).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible select-none">
      {/* Grids */}
      {gridLines.map((line, i) => (
        <polygon
          key={i}
          points={line}
          fill="none"
          stroke={accent}
          strokeWidth="1"
          className="opacity-[0.25]"
        />
      ))}

      {/* Axis Lines */}
      {STAT_CONFIGS.map((_, i) => {
        const point = getCoordinates(i, 99);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={point.x}
            y2={point.y}
            stroke={accent}
            strokeWidth="0.75"
            className="opacity-[0.15]"
          />
        );
      })}

      {/* Area shape */}
      <polygon
        points={points}
        fill={`${accent}30`}
        stroke={accent}
        strokeWidth="1.75"
        className="filter drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
      />

      {/* Data points */}
      {STAT_CONFIGS.map((s, i) => {
        const val = cat[s.key] || 0;
        const score = Math.min(99, Math.max(40, 50 + val * 2));
        const point = getCoordinates(i, score);
        return (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="3.5"
            fill="#ffffff"
            stroke={accent}
            strokeWidth="1.5"
            style={{ filter: `drop-shadow(0 0 5px ${accent})` }}
          />
        );
      })}

      {/* Labels */}
      {STAT_CONFIGS.map((s, i) => {
        const point = getCoordinates(i, 118);
        return (
          <text
            key={i}
            x={point.x}
            y={point.y + 3.5}
            textAnchor="middle"
            fill="rgba(255, 255, 255, 0.6)"
            className="text-[8px] font-black tracking-tight font-mono"
            style={{ fontSize: '7.5px', fontWeight: 900 }}
          >
            {s.code}
          </text>
        );
      })}
    </svg>
  );
}

export default function UserRatingCard({ user, stats }: UserRatingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const rawPower = user?.devPowerLevel || stats?.user?.rating || 0;

  const ultimateRating = useMemo(() => {
    if (rawPower === 0) return 60;
    if (rawPower < 1000) return 60 + Math.floor((rawPower / 1000) * 20);
    if (rawPower < 2000) return 80 + Math.floor(((rawPower - 1000) / 1000) * 15);
    return Math.min(99, 95 + Math.floor(((rawPower - 2000) / 1000) * 4));
  }, [rawPower]);

  // AUTOMATIC RATING TO CARD SKIN MAPPING
  const selectedTheme = useMemo<keyof typeof CARD_THEMES>(() => {
    if (ultimateRating >= 94) return "toty";   // 94-99: Master (Blue/Gold)
    if (ultimateRating >= 88) return "icon";   // 88-93: Expert (White/Gold)
    if (ultimateRating >= 78) return "inform"; // 78-87: Specialist (Black/Gold)
    if (ultimateRating >= 68) return "gold";   // 68-77: Advanced (Gold)
    if (ultimateRating >= 62) return "silver"; // 62-67: Intermediate (Silver)
    return "bronze";                           // <62: Novice (Bronze)
  }, [ultimateRating]);

  const theme = CARD_THEMES[selectedTheme];


  const cat = useMemo(() => stats?.user?.categoryStats || {}, [stats?.user?.categoryStats]);

  const getStat = useCallback((key: string) => {
    const val = cat[key] || 0;
    return Math.min(99, Math.max(40, 50 + val * 2));
  }, [cat]);

  const computedStats = useMemo(() =>
    STAT_CONFIGS.map(s => ({
      ...s,
      value: getStat(s.key),
      color: getValueColor(getStat(s.key), theme.accent),
    })),
  [getStat, theme.accent]);

  const totalSolved = (stats?.user?.solvedEasy || 0) + (stats?.user?.solvedMedium || 0) + (stats?.user?.solvedHard || 0);

  const countryFlag = user?.countryCode
    ? String.fromCodePoint(
        ...user.countryCode.toUpperCase().split('').map((c: string) => 0x1F1E6 + c.charCodeAt(0) - 65)
      )
    : '🇮🇳';

  const positionCode = useMemo(() => {
    const isCP = (user?.codeforcesUsername || user?.atcoderUsername);
    if (isCP) return "CP";
    const isArchitect = (user?.devPowerLevel && user?.devPowerLevel > 2500);
    if (isArchitect) return "ARCH";
    return "SWE";
  }, [user]);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'June 2026';

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const tiltX = useTransform(x, [0, 1], [-8, 8]);
  const tiltY = useTransform(y, [0, 1], [8, -8]);

  const glareX = useTransform(x, [0, 1], ['0%', '100%']);
  const glareY = useTransform(y, [0, 1], ['0%', '100%']);
  
  const glareGradient = useTransform(
    [glareX, glareY],
    ([gx, gy]: string[]) => `radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.2) 0%, transparent 60%)`
  );

  const holoGradient = useTransform(
    [glareX, glareY],
    ([gx, gy]: string[]) => `linear-gradient(${parseFloat(gx) + parseFloat(gy)}deg, rgba(255, 0, 128, 0.05) 0%, rgba(0, 255, 255, 0.05) 50%, rgba(255, 255, 0, 0.05) 100%)`
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0.5);
    y.set(0.5);
  }, [x, y]);

  const captureStyle = { transform: 'none', rotate: '0deg', rotateX: '0deg', rotateY: '0deg' };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 4,
        cacheBust: true,
        style: captureStyle as unknown as Partial<CSSStyleDeclaration>,
      });
      const link = document.createElement('a');
      link.download = `${user?.name || 'player'}-skills-card.png`;
      link.href = dataUrl;
      link.click();
      toast.success("PNG Downloaded!");
    } catch {
      toast.error("Capture Failed");
    } finally {
      setIsDownloading(false);
    }
  };



  const platforms = ["github", "leetcode", "codeforces", "codechef", "atcoder"];
  const platformIcons: Record<string, React.ReactNode> = {
    github: <Github size={10} />,
    leetcode: <Zap size={10} />,
    codeforces: <Award size={10} />,
    codechef: <Code2 size={10} />,
    atcoder: <Code2 size={10} />,
  };
  const platformColors: Record<string, string> = {
    github: "#22c55e",
    leetcode: "#f59e0b",
    codeforces: "#3b82f6",
    codechef: "#d97706",
    atcoder: "#64748b",
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {/* TILT CONTAINER */}
      <div
        className="relative w-[340px] h-[500px] cursor-pointer"
        style={{ perspective: '2000px' }}
        onClick={() => setIsFlipped(!isFlipped)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className="w-full h-full relative"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ rotateY: { type: "spring", stiffness: 45, damping: 10, duration: 0.6 } }}
        >
          {/* FRONT FACE (FUT RADAR SHIELD) */}
          <motion.div
            className="absolute inset-0 w-full h-full"
            style={{ backfaceVisibility: 'hidden', rotateX: tiltY, rotateY: tiltX }}
          >
            <div
              ref={cardRef}
              className={`relative w-full h-full rounded-[32px] border-2 overflow-hidden shadow-2xl transition-all duration-300 flex flex-col ${theme.border} ${theme.text}`}
              style={{
                background: theme.bg,
                boxShadow: `0 20px 40px -15px ${theme.glow}, inset 0 0 35px rgba(255,255,255,0.05)`,
              }}
            >
              {/* Glow radial */}
              <div
                className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] rounded-full blur-[80px] pointer-events-none"
                style={{ background: `radial-gradient(circle, ${theme.accent}20 0%, transparent 60%)` }}
              />

              {/* Scanlines */}
              <div
                className="absolute inset-0 pointer-events-none z-30 opacity-[0.035]"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.4) 2px, rgba(255,255,255,0.4) 3px)',
                  backgroundSize: '100% 3px'
                }}
              />

              {/* Particles */}
              <FloatingParticles count={15} accent={theme.accent} />

              {/* Glare and Holographic Shimmer */}
              <motion.div
                className="absolute inset-0 pointer-events-none z-40 opacity-40 mix-blend-overlay"
                style={{ background: holoGradient }}
              />
              <motion.div
                className="absolute inset-0 pointer-events-none z-40"
                style={{ background: glareGradient }}
              />

              {/* Content */}
              <div className="relative z-10 flex flex-col h-full select-none">
                
                {/* 1. TOP HALF: INFO BADGE (30%) + SKILL RADAR WEB (70%) */}
                <div className="flex w-full h-[260px] pt-8 px-6 relative items-center justify-between">
                  
                  {/* Left FUT info list */}
                  <div className="flex flex-col items-center justify-start gap-1.5 w-[30%] pt-2 z-20">
                    <motion.span
                      className="text-5.5xl font-black italic tracking-tighter leading-none"
                      style={{ textShadow: `0 0 15px ${theme.accent}50`, fontSize: '3.5rem' }}
                    >
                      {ultimateRating}
                    </motion.span>
                    <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white/70">
                      {positionCode}
                    </span>
                    <div className="h-[1.5px] w-8 my-1.5 bg-white/20" />
                    
                    <span className="text-xl leading-none filter drop-shadow-md my-0.5">{countryFlag}</span>
                    
                    <div className="p-1 rounded-md bg-white/5 border border-white/10 mt-1 shadow-md">
                      <Zap size={12} className="text-amber-400" />
                    </div>
                  </div>

                  {/* Right Skill Radar (instead of photo) */}
                  <div className="w-[70%] h-full flex items-center justify-center relative z-10 pt-2">
                    <CardSkillRadar cat={cat} accent={theme.accent} size={190} />
                  </div>
                </div>

                {/* 2. PLAYER NAME */}
                <div className="px-6 pt-3 flex flex-col items-center">
                  <h2 className="text-[20px] font-extrabold uppercase tracking-[0.18em] text-center text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] truncate max-w-full">
                    {user?.name || "CODING PRO"}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Sparkle size={10} className="text-amber-400 animate-pulse" />
                    <span className={`text-[8px] font-black uppercase tracking-[0.3em] ${theme.textDark}`}>
                      {theme.name}
                    </span>
                  </div>
                </div>

                {/* 3. DIVIDER */}
                <div className="px-8 my-2.5">
                  <div className={`h-[1.5px] w-full ${theme.divider}`} />
                </div>

                {/* 4. STATS GRID */}
                <div className="px-6 flex items-center justify-between flex-grow">
                  
                  {/* Left Column Stats */}
                  <div className="w-[45%] flex flex-col gap-2.5">
                    {computedStats.slice(0, 3).map((stat) => (
                      <div key={stat.code} className="flex items-center justify-between gap-1">
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">{stat.code}</span>
                        <span className="text-[12px] font-mono font-extrabold tabular-nums" style={{ color: stat.color }}>{stat.value}</span>
                        <div className={`w-8 h-1 rounded-full ${theme.statBarBg} overflow-hidden`}>
                          <div className="h-full rounded-full" style={{ width: `${((stat.value - 40) / 59) * 100}%`, backgroundColor: stat.color }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Vertical separator */}
                  <div className={`w-[1px] h-14 ${theme.divider}`} />

                  {/* Right Column Stats */}
                  <div className="w-[45%] flex flex-col gap-2.5">
                    {computedStats.slice(3).map((stat) => (
                      <div key={stat.code} className="flex items-center justify-between gap-1">
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">{stat.code}</span>
                        <span className="text-[12px] font-mono font-extrabold tabular-nums" style={{ color: stat.color }}>{stat.value}</span>
                        <div className={`w-8 h-1 rounded-full ${theme.statBarBg} overflow-hidden`}>
                          <div className="h-full rounded-full" style={{ width: `${((stat.value - 40) / 59) * 100}%`, backgroundColor: stat.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. FOOTER BADGES */}
                <div className="px-6 pb-5 pt-3 flex items-center justify-between border-t border-white/5">
                  <div className="flex items-center gap-1">
                    {platforms.slice(0, 3).map(p => {
                      const username = user?.[`${p}Username`];
                      return username ? (
                        <span key={p} className="p-1 rounded bg-white/5 text-white/50 animate-pulse" style={{ color: platformColors[p] }}>
                          {platformIcons[p]}
                        </span>
                      ) : null;
                    })}
                  </div>
                  <div className="flex items-center gap-1 text-white/35">
                    <Flame size={10} className="text-amber-400" />
                    <span className="text-[8px] font-mono font-bold tracking-wider">{rawPower} PW</span>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

          {/* BACK FACE (MATCHES ACTIVE THEME BACKGROUND) */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div
              ref={backCardRef}
              className={`relative w-full h-full rounded-[32px] border-2 overflow-hidden shadow-2xl flex flex-col p-6 ${theme.border} ${theme.text}`}
              style={{
                background: theme.bg,
                boxShadow: `0 20px 40px -15px ${theme.glow}, inset 0 0 35px rgba(255,255,255,0.05)`,
              }}
            >
              {/* Scanlines */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.4) 2px, rgba(255,255,255,0.4) 3px)',
                  backgroundSize: '100% 3px'
                }}
              />

              <div className="relative z-10 flex flex-col h-full select-none">
                
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-1.5 rounded-xl bg-white/5 border border-white/10">
                    <Trophy size={14} className={theme.textDark} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/70">
                    PLAYER OVERVIEW
                  </span>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {computedStats.map((s) => (
                    <div
                      key={s.code}
                      className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white/[0.03] border border-white/5 shadow-sm"
                    >
                      <span className="text-xs font-black font-mono tracking-tighter" style={{ color: s.color }}>{s.value}</span>
                      <span className="text-[6.5px] font-black uppercase tracking-wider text-white/35 mt-0.5">{s.code}</span>
                    </div>
                  ))}
                </div>

                {/* Solving breakdown */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[8px] font-black uppercase tracking-[0.15em] text-white/40">Problems Solved</span>
                    <span className="text-[11px] font-mono font-black text-white/60 tabular-nums">{totalSolved}</span>
                  </div>
                  <div className="flex h-1.5 rounded-full overflow-hidden bg-white/5">
                    {(stats?.user?.solvedEasy || 0) > 0 && (
                      <div className="h-full bg-emerald-500" style={{ width: `${((stats?.user?.solvedEasy || 0) / Math.max(totalSolved, 1)) * 100}%` }} />
                    )}
                    {(stats?.user?.solvedMedium || 0) > 0 && (
                      <div className="h-full bg-amber-500" style={{ width: `${((stats?.user?.solvedMedium || 0) / Math.max(totalSolved, 1)) * 100}%` }} />
                    )}
                    {(stats?.user?.solvedHard || 0) > 0 && (
                      <div className="h-full bg-red-500" style={{ width: `${((stats?.user?.solvedHard || 0) / Math.max(totalSolved, 1)) * 100}%` }} />
                    )}
                  </div>
                  <div className="flex justify-between mt-2 text-[7px] font-mono font-bold text-white/30">
                    <span className="text-emerald-400">{stats?.user?.solvedEasy || 0} Easy</span>
                    <span className="text-amber-400">{stats?.user?.solvedMedium || 0} Medium</span>
                    <span className="text-red-400">{stats?.user?.solvedHard || 0} Hard</span>
                  </div>
                </div>

                {/* Nodes synced list */}
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 mb-4 flex-grow flex flex-col justify-start">
                  <span className="text-[8px] font-black uppercase tracking-[0.15em] text-white/40 block mb-2">Synced Channels</span>
                  <div className="space-y-2 max-h-[100px] overflow-y-auto pr-1">
                    {platforms.map(p => {
                      const username = user?.[`${p}Username`];
                      return username ? (
                        <div key={p} className="flex items-center justify-between text-[9px] font-mono text-white/50">
                          <div className="flex items-center gap-1.5">
                            <span style={{ color: platformColors[p] }}>{platformIcons[p]}</span>
                            <span className="truncate max-w-[120px]">{username}</span>
                          </div>
                          <span className="text-[7.5px] font-bold text-white/20 uppercase">{p.slice(0, 2)}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* Back Footer */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="flex items-center gap-1 text-white/25">
                    <Calendar size={10} />
                    <span className="text-[7.5px] font-mono">{memberSince}</span>
                  </div>
                  <span className="text-[7px] font-black tracking-[0.3em] text-white/20">LOGIQUEST METRICS</span>
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* DOWNLOAD CAPTURE BUTTON */}
      <div className="w-full max-w-[340px]">
        <button
          onClick={(e) => { e.stopPropagation(); handleDownload(); }}
          disabled={isDownloading}
          className="w-full py-3.5 bg-white text-black rounded-2xl text-[10px] font-extrabold uppercase tracking-[0.2em] hover:scale-[1.03] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50"
        >
          {isDownloading ? "Capturing PNG..." : "Download Card (PNG)"}
        </button>
      </div>
    </div>
  );
}
