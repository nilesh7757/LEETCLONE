"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Activity, Database, Cpu, 
  Server, Zap, Sparkles, RefreshCw, 
  Play, CheckCircle2, XCircle, AlertCircle, 
  Terminal, ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import axios from "axios";

interface ServiceStatus {
  status: "ONLINE" | "OFFLINE";
  latency?: number;
  queueSize?: number;
  jobCounts?: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  };
}

interface SystemData {
  timestamp: number;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
    websockets: ServiceStatus;
    executionWorker: ServiceStatus;
  };
  system: {
    uptime: number;
    memory: {
      heapUsed: number;
      heapTotal: number;
      systemFree: number;
      systemTotal: number;
    };
    cpuLoad: number[];
  };
}

export default function SystemMonitor() {
  const [data, setData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStats = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await axios.get("/api/system/health");
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch system stats", err);
      toast.error("Telemetry connection lost");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchStats(true);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, fetchStats]);

  const triggerSpike = async (size: number) => {
    setSimulating(true);
    toast.info(`Injecting ${size} tasks into BullMQ execution pipeline...`);
    try {
      const res = await axios.post("/api/system/health", { spikeSize: size });
      if (res.data.success) {
        toast.success(`Pipeline loaded! Watch the Redis queue process them.`);
        // Instantly fetch stats to reflect the spike
        await fetchStats(true);
      }
    } catch (err) {
      toast.error("Failed to inject simulation load");
    } finally {
      setSimulating(false);
    }
  };

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center gap-4">
        <Activity className="w-12 h-12 text-purple-500 animate-pulse" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-neutral-500">Initiating HUD Telemetry...</p>
      </div>
    );
  }

  const s = data?.services;

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-6 md:p-12 overflow-x-hidden relative font-sans">
      {/* Background Neon Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Link href="/arcade" className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all active:scale-95">
                <ArrowLeft size={16} />
              </Link>
              <span className="text-[10px] font-black tracking-[0.4em] text-purple-400 uppercase">Architecture HUD</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase italic">
              Distributed <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Monitor Room</span>
            </h1>
            <p className="text-neutral-500 text-xs font-semibold">
              Live telemetry of LEETCLONE&apos;s microservices and asynchronous task pipelines.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                autoRefresh 
                  ? "bg-purple-500/10 border-purple-500/20 text-purple-400 animate-pulse" 
                  : "bg-white/5 border-white/10 text-neutral-500"
              }`}
            >
              Auto-Sync: {autoRefresh ? "Active" : "Paused"}
            </button>
            <button
              onClick={() => fetchStats()}
              disabled={refreshing}
              className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* SERVICE HUDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Main Web Server */}
          <div className="p-6 bg-neutral-900/50 border border-white/5 rounded-3xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-6 right-6">
              <span className="flex h-3.5 w-3.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            </div>
            <Cpu className="text-emerald-400 w-8 h-8 mb-6" />
            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-1">Web Core Service</h3>
            <h4 className="text-lg font-black text-white mb-4">Next.js Web Engine</h4>
            <div className="space-y-2 border-t border-white/5 pt-4 text-[10px] font-mono text-neutral-400">
              <div className="flex justify-between">
                <span>Memory Heap:</span>
                <span className="text-white font-bold">{formatBytes(data?.system.memory.heapUsed || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span className="text-white font-bold">{formatUptime(data?.system.uptime || 0)}</span>
              </div>
            </div>
          </div>

          {/* PostgreSQL DB */}
          <div className="p-6 bg-neutral-900/50 border border-white/5 rounded-3xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-6 right-6">
              <span className="flex h-3.5 w-3.5 relative">
                {s?.database.status === "ONLINE" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${s?.database.status === "ONLINE" ? "bg-emerald-500" : "bg-red-500"}`}></span>
              </span>
            </div>
            <Database className={`${s?.database.status === "ONLINE" ? "text-blue-400" : "text-neutral-600"} w-8 h-8 mb-6`} />
            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-1">Database Layer</h3>
            <h4 className="text-lg font-black text-white mb-4">PostgreSQL DB</h4>
            <div className="space-y-2 border-t border-white/5 pt-4 text-[10px] font-mono text-neutral-400">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-bold ${s?.database.status === "ONLINE" ? "text-emerald-400" : "text-red-400"}`}>{s?.database.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Ping Latency:</span>
                <span className="text-white font-bold">{s?.database.latency} ms</span>
              </div>
            </div>
          </div>

          {/* Redis Cache */}
          <div className="p-6 bg-neutral-900/50 border border-white/5 rounded-3xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-6 right-6">
              <span className="flex h-3.5 w-3.5 relative">
                {s?.redis.status === "ONLINE" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${s?.redis.status === "ONLINE" ? "bg-emerald-500" : "bg-red-500"}`}></span>
              </span>
            </div>
            <Zap className={`${s?.redis.status === "ONLINE" ? "text-amber-400" : "text-neutral-600"} w-8 h-8 mb-6`} />
            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-1">In-Memory Cache</h3>
            <h4 className="text-lg font-black text-white mb-4">Redis DB Instance</h4>
            <div className="space-y-2 border-t border-white/5 pt-4 text-[10px] font-mono text-neutral-400">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-bold ${s?.redis.status === "ONLINE" ? "text-emerald-400" : "text-red-400"}`}>{s?.redis.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Ping Latency:</span>
                <span className="text-white font-bold">{s?.redis.latency} ms</span>
              </div>
            </div>
          </div>

          {/* WebSockets */}
          <div className="p-6 bg-neutral-900/50 border border-white/5 rounded-3xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-6 right-6">
              <span className="flex h-3.5 w-3.5 relative">
                {s?.websockets.status === "ONLINE" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${s?.websockets.status === "ONLINE" ? "bg-emerald-500" : "bg-red-500"}`}></span>
              </span>
            </div>
            <Server className={`${s?.websockets.status === "ONLINE" ? "text-purple-400" : "text-neutral-600"} w-8 h-8 mb-6`} />
            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-1">WebSocket Gateway</h3>
            <h4 className="text-lg font-black text-white mb-4">Realtime server.js</h4>
            <div className="space-y-2 border-t border-white/5 pt-4 text-[10px] font-mono text-neutral-400">
              <div className="flex justify-between">
                <span>Socket.io status:</span>
                <span className={`font-bold ${s?.websockets.status === "ONLINE" ? "text-emerald-400" : "text-red-400"}`}>{s?.websockets.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Port:</span>
                <span className="text-white font-bold">3001</span>
              </div>
            </div>
          </div>
        </div>

        {/* DECUPLED QUEUE & WORKER SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Decoupled worker info */}
          <div className="lg:col-span-2 p-8 bg-neutral-900/50 border border-white/5 rounded-[2.5rem] backdrop-blur-md flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShieldCheck className="w-56 h-56 text-purple-400" />
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
                  <Terminal size={20} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-wider text-white">Event-Driven Asynchronous Pipeline</h3>
              </div>
              
              <p className="text-xs text-neutral-400 leading-relaxed max-w-xl">
                When a user submits coding answers, the main website writes the code as <span className="text-white font-bold">PENDING</span> and immediately delegates compiling execution to a separate <span className="text-purple-400 font-bold">BullMQ</span> queue. A background worker process picks up tasks to call sandboxed runtimes. This prevents memory leaks or infinite loop hangs on the main server.
              </p>

              {/* Real-time Queue HUD metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="p-4 bg-[#050505]/40 border border-white/5 rounded-2xl">
                  <div className="text-[8px] font-black uppercase tracking-widest text-neutral-500 mb-1">Queue Size</div>
                  <div className={`text-3xl font-black font-mono ${s?.executionWorker.queueSize && s.executionWorker.queueSize > 0 ? "text-purple-400" : "text-white"}`}>
                    {s?.executionWorker.queueSize || 0}
                  </div>
                </div>
                <div className="p-4 bg-[#050505]/40 border border-white/5 rounded-2xl">
                  <div className="text-[8px] font-black uppercase tracking-widest text-neutral-500 mb-1">Active Runs</div>
                  <div className={`text-3xl font-black font-mono ${s?.executionWorker.jobCounts?.active && s.executionWorker.jobCounts.active > 0 ? "text-amber-400 animate-pulse" : "text-white"}`}>
                    {s?.executionWorker.jobCounts?.active || 0}
                  </div>
                </div>
                <div className="p-4 bg-[#050505]/40 border border-white/5 rounded-2xl">
                  <div className="text-[8px] font-black uppercase tracking-widest text-neutral-500 mb-1">Completed</div>
                  <div className="text-3xl font-black font-mono text-emerald-400">
                    {s?.executionWorker.jobCounts?.completed || 0}
                  </div>
                </div>
                <div className="p-4 bg-[#050505]/40 border border-white/5 rounded-2xl">
                  <div className="text-[8px] font-black uppercase tracking-widest text-neutral-500 mb-1">Failed</div>
                  <div className="text-3xl font-black font-mono text-red-500">
                    {s?.executionWorker.jobCounts?.failed || 0}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 mt-8 pt-6 flex items-center justify-between text-[10px] font-mono text-neutral-500">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${s?.executionWorker.status === "ONLINE" ? "bg-emerald-500" : "bg-red-500"}`} />
                <span>Background Worker Process: <strong className="text-white">{s?.executionWorker.status}</strong></span>
              </div>
              <div>Buffer Limit: 10,000 tasks/min</div>
            </div>
          </div>

          {/* Spike Simulator Control Panel */}
          <div className="p-8 bg-neutral-900/50 border border-white/5 rounded-[2.5rem] backdrop-blur-md flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-xl text-red-500 border border-red-500/20">
                  <Zap size={20} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-wider text-white">Spike Simulator</h3>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Click a directive below to inject dummy execution requests directly into the Redis queue. Watch how the queue buffers the tasks and workers process them concurrently without impacting the website.
              </p>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => triggerSpike(10)}
                  disabled={simulating || s?.executionWorker.status === "OFFLINE"}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 active:scale-98 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Play size={14} /> Inject 10 Code Submissions
                </button>
                <button
                  onClick={() => triggerSpike(20)}
                  disabled={simulating || s?.executionWorker.status === "OFFLINE"}
                  className="w-full py-4 bg-purple-500/20 hover:bg-purple-500/30 active:scale-98 border border-purple-500/30 text-purple-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Sparkles size={14} /> Inject 20 Code Submissions (Stress)
                </button>
              </div>
            </div>

            {s?.executionWorker.status === "OFFLINE" && (
              <div className="mt-6 flex items-center gap-2 p-3.5 bg-red-950/20 border border-red-900/30 rounded-xl text-red-400 text-[10px] font-bold">
                <AlertCircle size={14} />
                <span>Run `npm run worker` locally to enable execution simulation.</span>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM METRICS */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-neutral-500">
          <div>Telemetry Status: Connected via WebSockets & Next API gateway</div>
          <div>CPU Load: [{data?.system.cpuLoad.map(v => v.toFixed(2)).join(", ")}]</div>
          <div>Server Time: {new Date(data?.timestamp || Date.now()).toLocaleTimeString()}</div>
        </div>
      </div>
    </div>
  );
}
