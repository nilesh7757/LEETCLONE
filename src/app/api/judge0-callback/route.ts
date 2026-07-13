import { NextResponse } from "next/server";
import { connection } from "@/lib/queue";
import { logger } from "@/lib/logger";

// A global fallback memory store for local development where Redis may be offline
const globalStore = ((globalThis as unknown as Record<string, unknown>)._judge0CallbackStore as Map<string, unknown>) || new Map<string, unknown>();
(globalThis as unknown as Record<string, unknown>)._judge0CallbackStore = globalStore;

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const token = data.token;
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    logger.info(`[JUDGE0_CALLBACK] Received webhook callback payload for token: ${token}`);

    // 1. Store in global in-memory store
    globalStore.set(token, data);

    // 2. Store in Redis if connection is ready (for shared serverless production)
    try {
      if (connection && connection.status === "ready") {
        await connection.set(`judge0:token:${token}`, JSON.stringify(data), "EX", 300);
      }
    } catch (redisErr) {
      logger.warn(`[JUDGE0_CALLBACK] Redis set failed for token ${token}:`, redisErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("[JUDGE0_CALLBACK] Webhook handler error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
