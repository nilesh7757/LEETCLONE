import type { NextAuthConfig, DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";

// Extend the Session type to include the 'role'
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string | null; 
      streak?: number; 
    } & DefaultSession["user"];
  }

  interface JWT {
    role?: string | null; 
    streak?: number; 
  }
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET || "development-secret-key-at-least-32-chars-long-!",
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      if (token?.name) {
        session.user.name = token.name;
      }
      if (token?.picture) {
        session.user.image = token.picture;
      }
      if (token?.role) { 
        session.user.role = token.role as string;
      }
      if (token?.streak !== undefined) {
        session.user.streak = token.streak as number;
      }
      return session;
    },
    async signIn({ user }) {
      console.log("[AUTH] SignIn Attempt:", user.email);
      return true;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtectedRoute = [
        "/problems",
        "/contest",
        "/leaderboard",
        "/profile"
      ].some((route) => nextUrl.pathname.startsWith(route));

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }
      return true;
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy-secret",
    }),
  ],
} satisfies NextAuthConfig;
