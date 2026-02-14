import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import { rateLimit } from "./lib/rate-limit";

const authMiddleware = NextAuth(authConfig).auth;

export default authMiddleware(async (req) => {
  const { pathname } = req.nextUrl;

  // Rate limit API routes
  if (pathname.startsWith("/api")) {
    // Exclude certain APIs if needed
    if (!pathname.startsWith("/api/auth")) {
      const ip = req.headers.get("x-forwarded-for")?.split(',')[0] || "127.0.0.1";
      const result = await rateLimit(ip, 50, 60000); // 50 requests per minute

      if (!result.success) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { 
            status: 429,
            headers: {
              "X-RateLimit-Limit": result.limit.toString(),
              "X-RateLimit-Remaining": result.remaining.toString(),
              "X-RateLimit-Reset": result.reset.toString(),
            }
          }
        );
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};