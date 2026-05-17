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
      arcadePoints?: number;
      githubUsername?: string | null;
      leetcodeUsername?: string | null;
      codeforcesUsername?: string | null;
      devPowerLevel?: number;
      aiProfileFeedback?: string | null;
      description?: string | null;
    } & DefaultSession["user"];
  }

  interface JWT {
    role?: string | null; 
    streak?: number; 
    arcadePoints?: number;
    githubUsername?: string | null;
    leetcodeUsername?: string | null;
    codeforcesUsername?: string | null;
    devPowerLevel?: number;
    aiProfileFeedback?: string | null;
    description?: string | null;
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
      if (token?.arcadePoints !== undefined) session.user.arcadePoints = token.arcadePoints as number;
      if (token?.githubUsername) session.user.githubUsername = token.githubUsername as string;
      if (token?.leetcodeUsername) session.user.leetcodeUsername = token.leetcodeUsername as string;
      if (token?.codeforcesUsername) session.user.codeforcesUsername = token.codeforcesUsername as string;
      if (token?.devPowerLevel !== undefined) session.user.devPowerLevel = token.devPowerLevel as number;
      if (token?.aiProfileFeedback) session.user.aiProfileFeedback = token.aiProfileFeedback as string;
      if (token?.description) session.user.description = token.description as string;
      
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
