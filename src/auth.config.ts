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
      streak?: number; // Add streak property
    } & DefaultSession["user"];
  }

  interface JWT {
    role?: string | null; // Add role to JWT
    streak?: number; // Add streak to JWT
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
      if (token?.streak !== undefined) {
        session.user.streak = token.streak as number;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      console.log("[AUTH] SignIn Attempt:", user.email);
      return true;
    },
    async jwt({ token, user, trigger, session, account }) {
      if (user) {
        console.log("[AUTH] JWT New User/Sign-in:", user.email);
        token.sub = user.id;

        // Ensure user exists in DB for social logins if adapter didn't do it yet
        if (account?.provider === "google") {
            const existingUser = await prisma.user.findUnique({
                where: { email: user.email as string }
            });

            if (!existingUser) {
                console.log("[AUTH] Creating new Google user in DB:", user.email);
                await prisma.user.create({
                    data: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        role: "USER",
                        streak: 0,
                    }
                });
            }
        }

        token.role = (user as any).role || "USER";
        token.streak = (user as any).streak || 0;
      }

      // If we don't have the role/streak yet, try to fetch from DB
      if (token.sub && (!token.role || token.streak === undefined)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub as string },
          select: { role: true, name: true, image: true, streak: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.streak = dbUser.streak;
          token.name = dbUser.name;
          token.picture = dbUser.image;
        } else {
          // Fallback if not in DB yet (e.g. just after social sign in before adapter finished)
          token.role = token.role || "USER";
          token.streak = token.streak || 0;
        }
      }

      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
        // If role could be updated from profile, handle it here as well
        if ((session as any).role) { // Cast to any to access role
            token.role = (session as any).role;
        }
        if ((session as any).streak !== undefined) {
            token.streak = (session as any).streak;
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
