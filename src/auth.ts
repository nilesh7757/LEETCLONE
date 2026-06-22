import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const AUTH_SECRET = process.env.AUTH_SECRET || "default_auth_secret_for_development_purposes";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Please enter an email and password.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          throw new Error("No user found with the provided email.");
        }

        if (!user.password) {
          throw new Error("This account was created using Google. Please sign in with Google.");
        }

        if (!user.isVerified) {
          throw new Error("Please verify your email first.");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password.");
        }

        return user;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        // Search for properties safely
        if ("role" in user) token.role = user.role as string;
        if ("streak" in user) token.streak = user.streak as number;
        if ("arcadePoints" in user) token.arcadePoints = user.arcadePoints as number;
        if ("githubUsername" in user) token.githubUsername = user.githubUsername as string;
        if ("leetcodeUsername" in user) token.leetcodeUsername = user.leetcodeUsername as string;
        if ("codeforcesUsername" in user) token.codeforcesUsername = user.codeforcesUsername as string;
        if ("devPowerLevel" in user) token.devPowerLevel = user.devPowerLevel as number;
        if ("countryCode" in user) token.countryCode = user.countryCode as string;
        if ("avatarId" in user) token.avatarId = user.avatarId as string;
      }

      if (token.sub && (!token.role || token.devPowerLevel === undefined)) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub as string },
            select: { 
              role: true, streak: true, name: true, image: true,
              arcadePoints: true, githubUsername: true, leetcodeUsername: true,
              codeforcesUsername: true, devPowerLevel: true, countryCode: true,
              avatarId: true
            },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.streak = dbUser.streak;
            token.name = dbUser.name;
            token.picture = dbUser.image;
            token.arcadePoints = dbUser.arcadePoints;
            token.githubUsername = dbUser.githubUsername;
            token.leetcodeUsername = dbUser.leetcodeUsername;
            token.codeforcesUsername = dbUser.codeforcesUsername;
            token.devPowerLevel = dbUser.devPowerLevel;
            token.countryCode = dbUser.countryCode;
            token.avatarId = dbUser.avatarId;
          }
        } catch (error) {
          console.error("JWT Callback Error:", error);
        }
      }

      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
        if (session.role) token.role = session.role;
        if (session.streak !== undefined) token.streak = session.streak;
        if (session.arcadePoints !== undefined) token.arcadePoints = session.arcadePoints;
        if (session.githubUsername !== undefined) token.githubUsername = session.githubUsername;
        if (session.leetcodeUsername !== undefined) token.leetcodeUsername = session.leetcodeUsername;
        if (session.codeforcesUsername !== undefined) token.codeforcesUsername = session.codeforcesUsername;
        if (session.devPowerLevel !== undefined) token.devPowerLevel = session.devPowerLevel;
        if (session.countryCode !== undefined) token.countryCode = session.countryCode;
        if (session.avatarId !== undefined) token.avatarId = session.avatarId;
      }
      return token;
    },
  },
  secret: AUTH_SECRET,
});
