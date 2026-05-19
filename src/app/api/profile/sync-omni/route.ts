import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import axios from "axios";
import { runAI } from "@/lib/gemini";
import { z } from "zod";

const AIResponseSchema = z.object({
  advice: z.union([z.string(), z.array(z.string())]),
  powerLevelName: z.union([z.string(), z.number()]), 
});

interface Stats {
  github: { publicRepos: number; followers: number } | null;
  leetcode: { totalSolved: number } | null;
  codeforces: { rating: number; rank: string } | null;
  codechef: { rating: number; stars: string } | null;
  atcoder: { rating: number; maxRating: number } | null;
  consistency: {
    recentSolved7Days: number;
    status: string;
  }
}

export async function POST(_req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const stats: Stats = {
      github: null,
      leetcode: null,
      codeforces: null,
      codechef: null,
      atcoder: null,
      consistency: {
        recentSolved7Days: 0,
        status: "Checking..."
      }
    };

    const nowSeconds = Math.floor(Date.now() / 1000);
    const sevenDaysAgoSeconds = nowSeconds - (7 * 24 * 60 * 60);

    // Fetch stats in parallel
    await Promise.allSettled([
      // 1. GitHub
      (async () => {
        if (user.githubUsername) {
          try {
            const ghRes = await axios.get(`https://api.github.com/users/${user.githubUsername}`, { timeout: 8000 });
            stats.github = {
              publicRepos: ghRes.data.public_repos,
              followers: ghRes.data.followers,
            };
          } catch {}
          }
          })(),

      // 2. Codeforces
      (async () => {
        if (user.codeforcesUsername) {
          try {
            const cfRes = await axios.get(`https://codeforces.com/api/user.info?handles=${user.codeforcesUsername}`, { timeout: 8000 });
            if (cfRes.data.status === "OK") {
              const info = cfRes.data.result[0];
              stats.codeforces = {
                rating: info.rating || 0,
                rank: info.rank || "unrated",
              };
              const cfStatus = await axios.get(`https://codeforces.com/api/user.status?handle=${user.codeforcesUsername}&from=1&count=50`, { timeout: 8000 });
              if (cfStatus.data.status === "OK") {
                const recent = cfStatus.data.result.filter((sub: { verdict: string; creationTimeSeconds: number }) => 
                  sub.verdict === "OK" && sub.creationTimeSeconds > sevenDaysAgoSeconds
                );
                stats.consistency.recentSolved7Days += recent.length;
              }
            }
          } catch {}
          }
          })(),

      // 3. LeetCode
      (async () => {
        if (user.leetcodeUsername) {
          try {
            const lcRes = await axios.post("https://leetcode.com/graphql", {
              query: `
                query userOmniSync($username: String!) {
                  matchedUser(username: $username) {
                    submitStats { acSubmissionNum { difficulty count } }
                    userCalendar { submissionCalendar }
                  }
                }
              `,
              variables: { username: user.leetcodeUsername }
            }, { timeout: 10000 });
            const userData = lcRes.data.data?.matchedUser;
            if (userData) {
              const solved = userData.submitStats.acSubmissionNum;
              stats.leetcode = {
                totalSolved: solved.find((s: { difficulty: string; count: number }) => s.difficulty === "All")?.count || 0,
              };
              try {
                const calendar = JSON.parse(userData.userCalendar.submissionCalendar);
                Object.keys(calendar).forEach(ts => { if (parseInt(ts) > sevenDaysAgoSeconds) stats.consistency.recentSolved7Days += calendar[ts]; });
              } catch {}
              }
              } catch {}
              }
              })(),

      // 4. CodeChef (Public API / Scraping simulation)
      (async () => {
        if (user.codechefUsername) {
          try {
            // Using a community API for CodeChef since they don't have a direct public REST API
            const ccRes = await axios.get(`https://codechef-api.vercel.app/${user.codechefUsername}`, { timeout: 8000 });
            stats.codechef = {
              rating: ccRes.data.currentRating || 0,
              stars: ccRes.data.stars || "1*",
            };
          } catch {}
          }
          })(),

      // 5. Atcoder
      (async () => {
        if (user.atcoderUsername) {
          try {
            const acRes = await axios.get(`https://kenkoooo.com/atcoder/atcoder-api/v3/user/info?user=${user.atcoderUsername}`, { timeout: 8000 });
            stats.atcoder = {
              rating: acRes.data.rating || 0,
              maxRating: acRes.data.highest_rating || 0,
            };
          } catch {}
          }
          })(),
    ]);

    // Calculate Consistency Status
    const totalRecent = stats.consistency.recentSolved7Days;
    if (totalRecent === 0) stats.consistency.status = "CRITICAL_GAP";
    else if (totalRecent < 5) stats.consistency.status = "INCONSISTENT";
    else if (totalRecent < 15) stats.consistency.status = "STEADY";
    else stats.consistency.status = "ELITE_MOMENTUM";

    // Calculate Power Level
    let powerLevel = (stats.codeforces?.rating || 0) * 1.5;
    powerLevel += (stats.leetcode?.totalSolved || 0) * 5;
    powerLevel += (stats.codechef?.rating || 0) * 1.2;
    powerLevel += (stats.atcoder?.rating || 0) * 2.0; // Atcoder rating is "purer" math/algo
    powerLevel += ((stats.github?.publicRepos || 0) * 10) + ((stats.github?.followers || 0) * 2);
    powerLevel += (user.arcadePoints || 0) * 2;
    
    if (stats.consistency.status === "ELITE_MOMENTUM") powerLevel *= 1.1;
    if (stats.consistency.status === "CRITICAL_GAP") powerLevel *= 0.9;

    const finalPowerLevel = Math.round(powerLevel);

    // AI Feedback
    const aiPrompt = `
      Analyze these developer stats:
      - GitHub: ${stats.github ? `${stats.github.publicRepos} repos` : "No"}
      - LeetCode: ${stats.leetcode ? `${stats.leetcode.totalSolved} solved` : "No"}
      - Codeforces: ${stats.codeforces ? `${stats.codeforces.rating} rating` : "No"}
      - CodeChef: ${stats.codechef ? `${stats.codechef.rating} rating` : "No"}
      - Atcoder: ${stats.atcoder ? `${stats.atcoder.rating} rating` : "No"}
      - RECENT_ACTIVITY: ${totalRecent} problems in 7 days (${stats.consistency.status})
      
      Unified Power Level: ${finalPowerLevel}
      
      Provide tactical placement advice. Be harsh if activity is low.
      Respond in JSON with "advice" (string) and "powerLevelName" (RPG title).
    `;

    const aiResultRaw = await runAI(aiPrompt, "You are the Neural Placement Coach.", AIResponseSchema, true);
    if (typeof aiResultRaw === 'string') {
      throw new Error("AI returned string instead of object");
    }
    const aiResult = aiResultRaw;

    const formattedAdvice = Array.isArray(aiResult.advice) ? aiResult.advice.join(" ") : String(aiResult.advice);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        devPowerLevel: finalPowerLevel,
        aiProfileFeedback: formattedAdvice,
        externalStats: stats as unknown as Prisma.InputJsonValue,
        description: String(aiResult.powerLevelName), 
      }
    });

    return NextResponse.json({ 
      success: true, 
      powerLevel: finalPowerLevel,
      title: String(aiResult.powerLevelName),
      advice: formattedAdvice,
      externalStats: stats as unknown as Prisma.InputJsonValue
    });

  } catch (error: unknown) {
    console.error("Omni Sync Error:", error);
    return NextResponse.json({ error: "Failed to synchronize profile" }, { status: 500 });
  }
}

