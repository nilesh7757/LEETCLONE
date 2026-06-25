import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { connection, executionQueue } from "@/lib/queue";
import { apiHandler } from "@/lib/api-handler";
import { ApiError } from "@/lib/api-error";
import { logger } from "@/lib/logger";
import net from "net";
import os from "os";

// Helper to check if a TCP port is active (used for checking the custom Socket.io server)
const checkPort = (port: number, host: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
};

export const GET = apiHandler(async () => {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  // 1. PostgreSQL Health Check
  let dbStatus = "OFFLINE";
  let dbLatency = 0;
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbStart;
    dbStatus = "ONLINE";
  } catch (err) {
    logger.warn("[Monitor] Database ping failed:", err);
  }

  // 2. Redis Health Check
  let redisStatus = "OFFLINE";
  let redisLatency = 0;
  try {
    const redisStart = Date.now();
    await connection.ping();
    redisLatency = Date.now() - redisStart;
    redisStatus = "ONLINE";
  } catch (err) {
    logger.warn("[Monitor] Redis ping failed:", err);
  }

  // 3. WebSocket Gateway Health Check (Socket.io)
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
  let wsStatus = "OFFLINE";
  try {
    const url = new URL(socketUrl);
    const port = url.port ? parseInt(url.port) : 80;
    const hostname = url.hostname || "localhost";
    const isListening = await checkPort(port, hostname);
    wsStatus = isListening ? "ONLINE" : "OFFLINE";
  } catch (err) {
    logger.warn("[Monitor] Socket.io ping failed:", err);
  }

  // 4. Background Queue & Worker Stats (BullMQ)
  let queueSize = 0;
  let isWorkerOnline = false;
  let jobCounts = { waiting: 0, active: 0, completed: 0, failed: 0 };

  try {
    const workers = await executionQueue.getWorkers();
    isWorkerOnline = workers.length > 0;
    const rawCounts = await executionQueue.getJobCounts("wait", "active", "completed", "failed");
    jobCounts = {
      waiting: rawCounts.wait || 0,
      active: rawCounts.active || 0,
      completed: rawCounts.completed || 0,
      failed: rawCounts.failed || 0,
    };
    queueSize = jobCounts.waiting + jobCounts.active;
  } catch (err) {
    logger.warn("[Monitor] BullMQ queue check failed:", err);
  }

  // 5. System/Process resource stats
  const memoryUsage = process.memoryUsage();
  const systemMemory = {
    free: os.freemem(),
    total: os.totalmem(),
  };

  return NextResponse.json({
    status: "healthy",
    timestamp: Date.now(),
    services: {
      database: { status: dbStatus, latency: dbLatency },
      redis: { status: redisStatus, latency: redisLatency },
      websockets: { status: wsStatus },
      executionWorker: { status: isWorkerOnline ? "ONLINE" : "OFFLINE", queueSize, jobCounts },
    },
    system: {
      uptime: process.uptime(),
      memory: {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        systemFree: systemMemory.free,
        systemTotal: systemMemory.total,
      },
      cpuLoad: os.loadavg(),
    },
  });
});

export const POST = apiHandler(async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

  const { spikeSize } = await req.json();
  const count = typeof spikeSize === "number" ? Math.min(spikeSize, 20) : 10;

  try {
    logger.info(`[Monitor] Simulating load spike of ${count} compilation requests`);
    
    // Add dummy execution jobs to the Redis BullMQ queue.
    // They compile simple Javascript code inside Judge0 to simulate real asynchronous execution load.
    for (let i = 0; i < count; i++) {
      await executionQueue.add("code-execution", {
        code: `console.log("System Design Stress Test Job ${i + 1}/${count}");`,
        testCases: [{ input: "", expectedOutput: "" }],
        language: "javascript",
        timeLimit: 2,
        memoryLimit: 128,
      }, {
        attempts: 1,
        backoff: 1000,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Enqueued ${count} execution requests in the Redis queue.`,
    });
  } catch (err: unknown) {
    logger.error("[Monitor] Failed to enqueue load simulation:", err);
    throw new ApiError("Failed to trigger load spike simulation", 500);
  }
});
