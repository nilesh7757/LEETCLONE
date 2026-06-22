"use client";

import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import {
  Trophy, Sparkles, Calendar, Award, Github, Zap, Code2, Flame
} from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import gifshot from 'gifshot';
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

const getValueColor = (val: number, ring: string) => {
  if (val >= 90) return ring;
  if (val >= 80) return "#34d399";
  if (val >= 70) return "#fbbf24";
  if (val >= 60) return "#fb923c";
  return "#f87171";
};

function FloatingParticles({ count = 15 }: { count?: number }) {
  const [ready, setReady] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; size: number; duration: number; delay: number; targetY: number }[]>([]);

  useEffect(() => {
    setParticles(Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 1.5 + Math.random() * 2.5,
      duration: 4 + Math.random() * 6,
      delay: Math.random() * 5,
      targetY: -(350 + Math.random() * 250),
    })));
    setReady(true);
  }, [count]);

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
            background: 'rgba(255,255,255,0.6)',
            boxShadow: '0 0 6px rgba(255,255,255,0.3)',
          }}
          animate={{
            y: [0, p.targetY],
            opacity: [0, 0.5, 0],
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

function StatHexagon({ value, color }: { value: number; color: string }) {
  const hexPoints = "12,0 24,7 24,21 12,28 0,21 0,7";
  const hexSize = 28;
  return (
    <svg width={hexSize} height={hexSize} viewBox="0 0 24 28" className="shrink-0">
      <polygon points={hexPoints} fill={`${color}20`} stroke={color} strokeWidth="1.5" />
      <text x="12" y="17" textAnchor="middle" fill={color} fontSize="8" fontWeight="900" fontFamily="monospace">
        {value}
      </text>
    </svg>
  );
}

export default function UserRatingCard({ user, stats }: UserRatingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadType, setDownloadType] = useState<"PNG" | "GIF" | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const rawPower = user?.devPowerLevel || stats?.user?.rating || 0;

  const ultimateRating = useMemo(() => {
    if (rawPower === 0) return 60;
    if (rawPower < 1000) return 60 + Math.floor((rawPower / 1000) * 20);
    if (rawPower < 2000) return 80 + Math.floor(((rawPower - 1000) / 1000) * 15);
    return Math.min(99, 95 + Math.floor(((rawPower - 2000) / 1000) * 4));
  }, [rawPower]);

  const tier = useMemo(() => {
    if (ultimateRating >= 94) return { name: "ICON", ring: "#00c6ff" };
    if (ultimateRating >= 88) return { name: "ELITE", ring: "#fcd34d" };
    return { name: "SDE", ring: "#94a3b8" };
  }, [ultimateRating]);

  const cat = stats?.user?.categoryStats || {};

  const getStat = useCallback((key: string) => {
    const val = cat[key] || 0;
    return Math.min(99, Math.max(40, 50 + val * 2));
  }, [cat]);

  const computedStats = useMemo(() =>
    STAT_CONFIGS.map(s => ({
      ...s,
      value: getStat(s.key),
      color: getValueColor(getStat(s.key), tier.ring),
    })),
  [getStat, tier.ring]);

  const totalSolved = (stats?.user?.solvedEasy || 0) + (stats?.user?.solvedMedium || 0) + (stats?.user?.solvedHard || 0);

  const countryFlag = user?.countryCode
    ? String.fromCodePoint(
        ...user.countryCode.toUpperCase().split('').map((c: string) => 0x1F1E6 + c.charCodeAt(0) - 65)
      )
    : '';

  const portraitUrl = user?.image || '';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Unknown';

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const tiltX = useTransform(x, [0, 1], [-6, 6]);
  const tiltY = useTransform(y, [0, 1], [6, -6]);

  const glareX = useTransform(x, [0, 1], ['0%', '100%']);
  const glareY = useTransform(y, [0, 1], ['0%', '100%']);
  const glareGradient = useTransform(
    [glareX, glareY],
    ([gx, gy]: string[]) => `radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.3) 0%, transparent 60%)`
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
    setDownloadType("PNG");
    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, ({
        quality: 1,
        pixelRatio: 4,
        useCORS: true,
        cacheBust: true,
        backgroundColor: "#0d0d14",
        style: captureStyle,
      } as any));
      const link = document.createElement('a');
      link.download = `${user?.name || 'player'}-card.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      toast.error("Capture Failed");
    } finally {
      setIsDownloading(false);
      setDownloadType(null);
    }
  };

  const handleDownloadGif = async () => {
    if (!cardRef.current || !backCardRef.current) return;
    setIsDownloading(true);
    setDownloadType("GIF");
    try {
      const captureOptions = {
        pixelRatio: 1.5,
        style: captureStyle,
        cacheBust: true,
        useCORS: true,
        backgroundColor: "#000000",
      };
      const [frontUrl, backUrl] = await Promise.all([
        htmlToImage.toPng(cardRef.current, captureOptions),
        htmlToImage.toPng(backCardRef.current, captureOptions)
      ]);
      const loadImg = (url: string, label: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Failed to load ${label}`));
          img.src = url;
        });
      const [frontImg, backImg] = await Promise.all([loadImg(frontUrl, "Front"), loadImg(backUrl, "Back")]);
      const width = 340 * 1.5;
      const height = 560 * 1.5;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Canvas failure");
      const frames: string[] = [];
      const numFrames = 60;
      for (let i = 0; i < numFrames; i++) {
        const angle = (i / numFrames) * Math.PI * 2;
        const cos = Math.cos(angle);
        const isFront = cos > 0;
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);
        ctx.save();
        ctx.translate(width / 2, 0);
        ctx.scale(Math.max(0.01, Math.abs(cos)), 1);
        ctx.drawImage(isFront ? frontImg : backImg, -width / 2, 0, width, height);
        ctx.restore();
        frames.push(canvas.toDataURL('image/png'));
      }
      gifshot.createGIF({
        images: frames, gifWidth: 340, gifHeight: 560,
        interval: 0.05, numFrames, sampleInterval: 1,
      }, (obj) => {
        if (!obj.error) {
          const link = document.createElement('a');
          link.download = `${user?.name || 'player'}-nexus.gif`;
          link.href = obj.image;
          link.click();
        }
        setIsDownloading(false);
        setDownloadType(null);
      });
    } catch {
      toast.error("GIF Failed");
      setIsDownloading(false);
      setDownloadType(null);
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

  const topCategories = useMemo(() => {
    const entries = Object.entries(cat);
    return entries
      .sort(([, a]: [string, unknown], [, b]: [string, unknown]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([name, val]) => ({ name: name.length > 12 ? name.slice(0, 12) : name, value: getStat(name) }));
  }, [cat, getStat]);

  return (
    <div className="flex flex-col items-center gap-10">
      <div
        className="relative w-[340px] cursor-pointer"
        style={{ perspective: '2000px' }}
        onClick={() => setIsFlipped(!isFlipped)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className="w-full relative"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ rotateY: { type: "spring", stiffness: 45, damping: 10, duration: 0.6 } }}
        >
          {/* FRONT FACE */}
          <motion.div
            style={{ backfaceVisibility: 'hidden', rotateX: tiltY, rotateY: tiltX }}
          >
            <div
              ref={cardRef}
              className="relative w-full rounded-3xl border border-white/10 bg-gradient-to-b from-[#0d0d14] to-[#08080c] overflow-hidden shadow-2xl"
            >
              {/* Background glow */}
              <div
                className="absolute top-[-30%] left-[-30%] w-[160%] h-[160%] rounded-full blur-[100px] pointer-events-none"
                style={{ background: `radial-gradient(circle, ${tier.ring}10 0%, transparent 70%)` }}
              />

              {/* Scanline subtle */}
              <div
                className="absolute inset-0 pointer-events-none z-30 opacity-[0.03]"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 3px)',
                  backgroundSize: '100% 3px'
                }}
              />

              {/* Particles */}
              <FloatingParticles count={12} />

              {/* Holographic glare */}
              <motion.div
                className="absolute inset-0 pointer-events-none z-40"
                style={{ background: glareGradient }}
              />

              {/* Content */}
              <div className="relative z-10">
                {/* === PORTRAIT / HERO SECTION === */}
                <div className="relative h-[240px] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d14] via-transparent to-transparent z-10" />
                  {portraitUrl ? (
                    <img
                      src={portraitUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${tier.ring}30, #0d0d14 60%)`,
                      }}
                    >
                      <motion.span
                        className="text-[120px] font-black italic select-none"
                        style={{ color: `${tier.ring}15` }}
                        animate={{ scale: [1, 1.03, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      >
                        {(user?.name || '?')[0]}
                      </motion.span>
                    </div>
                  )}

                  {/* Rating overlay on portrait */}
                  <div className="absolute bottom-4 left-5 z-20 flex items-end gap-3">
                    <div className="flex flex-col">
                      <motion.span
                        className="text-6xl font-black italic leading-none tracking-tighter drop-shadow-2xl"
                        style={{ color: tier.ring, textShadow: `0 0 30px ${tier.ring}60` }}
                        animate={{
                          textShadow: [
                            `0 0 20px ${tier.ring}40`,
                            `0 0 40px ${tier.ring}80`,
                            `0 0 20px ${tier.ring}40`,
                          ]
                        }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        {ultimateRating}
                      </motion.span>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mt-0.5 drop-shadow-lg">
                        {tier.name}
                      </span>
                    </div>
                    <motion.div
                      className="mb-1 px-2.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest"
                      style={{ backgroundColor: `${tier.ring}30`, color: tier.ring, border: `1px solid ${tier.ring}50` }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      ★ RARE
                    </motion.div>
                  </div>

                  {/* Rarity stripe top */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px] z-20"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${tier.ring}, transparent)`,
                      boxShadow: `0 0 20px ${tier.ring}`,
                    }}
                  />
                </div>

                {/* === NAME SECTION === */}
                <div className="px-6 pt-4 pb-2">
                  <h2 className="text-2xl font-black uppercase tracking-[0.15em] text-white drop-shadow-sm">
                    {user?.name || "PLAYER"}
                  </h2>
                </div>

                {/* === META ROW: Country + Solved Summary === */}
                <div className="px-6 pb-4 flex items-center gap-4 text-white/50 text-[11px] font-bold">
                  {countryFlag && (
                    <span className="text-base leading-none drop-shadow-lg">{countryFlag}</span>
                  )}
                  <span className="tabular-nums text-white/60">{totalSolved} solved</span>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                    <span className="text-[9px] font-mono text-emerald-400/60 tabular-nums">{stats?.user?.solvedEasy || 0}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                    <span className="text-[9px] font-mono text-amber-400/60 tabular-nums">{stats?.user?.solvedMedium || 0}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                    <span className="text-[9px] font-mono text-red-400/60 tabular-nums">{stats?.user?.solvedHard || 0}</span>
                  </div>
                </div>

                {/* === DIVIDER === */}
                <div className="px-6 pb-2">
                  <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>

                {/* === STATS GRID (2 columns x 3) === */}
                <div className="px-6 pb-4 grid grid-cols-2 gap-x-6 gap-y-3">
                  {computedStats.map((stat, i) => (
                    <motion.div
                      key={stat.code}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                    >
                      <StatHexagon value={stat.value} color={stat.color} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-white/40">{stat.code}</span>
                          <span className="text-[10px] font-black font-mono tabular-nums" style={{ color: stat.color }}>{stat.value}</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((stat.value - 40) / 59) * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: stat.color, boxShadow: `0 0 6px ${stat.color}50` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* === PLATFORM BADGES === */}
                <div className="px-6 pb-4">
                  <div className="flex items-center gap-2">
                    {platforms.map(p => {
                      const username = user?.[`${p}Username`];
                      return (
                        <div
                          key={p}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all ${
                            username
                              ? 'bg-white/5 border border-white/10 text-white/60'
                              : 'bg-white/[0.02] border border-white/5 text-white/15'
                          }`}
                          title={username || `No ${p} linked`}
                        >
                          <span style={username ? { color: platformColors[p] } : {}}>
                            {platformIcons[p]}
                          </span>
                          {username && <span className="font-mono normal-case tracking-normal text-[7px] truncate max-w-[40px]">{username}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* === FOOTER === */}
                <div className="px-6 pb-4 flex items-center justify-between border-t border-white/5 pt-3">
                  <span className="text-[7px] font-black tracking-[0.4em] text-white/15">NEURAL_NEXUS</span>
                  <div className="flex items-center gap-1.5 text-white/15">
                    <Flame size={9} />
                    <span className="text-[7px] font-black tracking-wider">{rawPower}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* BACK FACE */}
          <div
            ref={backCardRef}
            className="absolute inset-0 w-full rounded-3xl border border-white/10 bg-gradient-to-b from-[#0a0a0f] to-[#050508] overflow-hidden shadow-2xl"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.4) 2px, rgba(255,255,255,0.4) 3px)',
                backgroundSize: '100% 3px'
              }}
            />
            <div className="relative z-10 h-full flex flex-col px-6 pt-6 pb-5">
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="p-1.5 rounded-xl bg-white/5">
                  <Trophy size={14} className="text-[#00c6ff]" />
                </div>
                <span className="text-xs font-black tracking-widest text-white/70">PLAYER_STATS</span>
              </div>

              {/* All 6 stats compact grid */}
              <div className="grid grid-cols-3 gap-1.5 mb-5">
                {computedStats.map((s, i) => (
                  <motion.div
                    key={s.code}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col items-center p-2 rounded-xl bg-white/[0.03] border border-white/5"
                  >
                    <span className="text-[11px] font-black font-mono tabular-nums" style={{ color: s.color }}>{s.value}</span>
                    <span className="text-[7px] font-black uppercase tracking-wider text-white/30 mt-0.5">{s.code}</span>
                  </motion.div>
                ))}
              </div>

              {/* Solved breakdown bar */}
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/25">Problems</span>
                  <span className="text-[10px] font-mono font-bold text-white/50 tabular-nums">{totalSolved}</span>
                </div>
                <div className="flex h-1.5 rounded-full overflow-hidden bg-white/5">
                  {(stats?.user?.solvedEasy || 0) > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((stats?.user?.solvedEasy || 0) / Math.max(totalSolved, 1)) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="h-full bg-emerald-500"
                      style={{ boxShadow: '0 0 8px rgba(16,185,129,0.4)' }}
                    />
                  )}
                  {(stats?.user?.solvedMedium || 0) > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((stats?.user?.solvedMedium || 0) / Math.max(totalSolved, 1)) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="h-full bg-amber-500"
                      style={{ boxShadow: '0 0 8px rgba(245,158,11,0.4)' }}
                    />
                  )}
                  {(stats?.user?.solvedHard || 0) > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((stats?.user?.solvedHard || 0) / Math.max(totalSolved, 1)) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="h-full bg-red-500"
                      style={{ boxShadow: '0 0 8px rgba(239,68,68,0.4)' }}
                    />
                  )}
                </div>
                <div className="flex justify-between mt-1.5 text-[7px] font-mono text-white/20">
                  <span>{stats?.user?.solvedEasy || 0}E</span>
                  <span>{stats?.user?.solvedMedium || 0}M</span>
                  <span>{stats?.user?.solvedHard || 0}H</span>
                </div>
              </div>

              {/* Platform nodes */}
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 mb-4">
                <span className="text-[8px] font-black uppercase tracking-widest text-white/25 block mb-2">Nodes</span>
                <div className="space-y-1.5">
                  {user?.githubUsername && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Github size={9} className="text-emerald-500" />
                        <span className="text-[9px] font-mono text-white/50 truncate max-w-[80px]">{user.githubUsername}</span>
                      </div>
                      <span className="text-[7px] font-bold text-emerald-500/50">GH</span>
                    </div>
                  )}
                  {user?.leetcodeUsername && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Zap size={9} className="text-amber-500" />
                        <span className="text-[9px] font-mono text-white/50 truncate max-w-[80px]">{user.leetcodeUsername}</span>
                      </div>
                      <span className="text-[7px] font-bold text-amber-500/50">LC</span>
                    </div>
                  )}
                  {user?.codeforcesUsername && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Award size={9} className="text-blue-500" />
                        <span className="text-[9px] font-mono text-white/50 truncate max-w-[80px]">{user.codeforcesUsername}</span>
                      </div>
                      <span className="text-[7px] font-bold text-blue-500/50">CF</span>
                    </div>
                  )}
                  {!user?.githubUsername && !user?.leetcodeUsername && !user?.codeforcesUsername && (
                    <div className="text-[9px] text-white/15 italic">No nodes synced</div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-white/20">
                  <Calendar size={8} />
                  <span className="text-[7px] font-mono">{memberSince}</span>
                </div>
                <div className="flex items-center gap-1 text-white/20">
                  <Flame size={8} />
                  <span className="text-[7px] font-black">{rawPower} PW</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* DOWNLOAD BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-[500px]">
        <button
          onClick={(e) => { e.stopPropagation(); handleDownload(); }}
          disabled={isDownloading}
          className="flex-1 px-8 py-4 bg-white text-black rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl disabled:opacity-50"
        >
          {isDownloading && downloadType === "PNG" ? "..." : "DOWNLOAD PNG"}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleDownloadGif(); }}
          disabled={isDownloading}
          className="flex-1 px-8 py-4 bg-[var(--viz-cyan)] text-background rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl disabled:opacity-50"
        >
          {isDownloading && downloadType === "GIF" ? "..." : "DOWNLOAD GIF"}
        </button>
      </div>
    </div>
  );
}
