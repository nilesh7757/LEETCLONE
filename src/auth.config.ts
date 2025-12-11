import type { NextAuthConfig, DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma"; // Import the existing PrismaClient instance

// Extend the Session type to include the 'role'
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string | null; // Add role property
    } & DefaultSession["user"];
  }

  interface JWT {
    role?: string | null; // Add role to JWT
  }
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
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
      if (token?.role) { // Add role to session
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // On sign-in, fetch user from DB to get the role and update token
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, name: true, image: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.name = dbUser.name;
          token.picture = dbUser.image;
        } else {
            // Fallback if dbUser not found, though user object should have it
            token.role = (user as any).role || "USER"; // Default to USER
        }
        token.sub = user.id; // ensure sub is always user.id
      }
      if (trigger === "update" && session) {
        token.name = session.name;
        token.picture = session.image;
        // If role could be updated from profile, handle it here as well
        if ((session as any).role) { // Cast to any to access role
            token.role = (session as any).role;
        }
      }
      return token;
    },
    authorized({ auth, request: { nextUrl } }) {
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
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
} satisfies NextAuthConfig;
