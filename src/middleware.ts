import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import { rateLimit } from "./lib/rate-limit";

// Middleware doesn't need to re-initialize NextAuth with secret here if it's in authConfig,
// but some v5 beta versions are picky.
const { auth: authMiddleware } = NextAuth(authConfig);

export default authMiddleware(async (req) => {
  const { pathname } = req.nextUrl;

  // Rate limit API routes
  if (pathname.startsWith("/api")) {
    if (!pathname.startsWith("/api/auth")) {
      const ip = req.headers.get("x-forwarded-for")?.split(',')[0] || "127.0.0.1";
      const result = await rateLimit(ip, 50, 60000);

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
