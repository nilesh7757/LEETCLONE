import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const contest = await prisma.contest.findUnique({
      where: { id },
      include: {
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                rating: true, // Current rating
              },
            },
          },
          orderBy: [
            { score: "desc" },
            // Secondary sort: Time taken? We don't have a "finishTime" field yet.
            // For now, let's just sort by score.
          ],
        },
        ratingUpdates: { // Include existing rating updates to check if already processed
            where: { contestId: id },
            take: 1, // Only need to check if any exist
        }
      },
    });

    if (!contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    const now = new Date();
    const hasEnded = now > contest.endTime;
    const ratingsFinalized = contest.ratingUpdates.length > 0;

    // --- RATING CALCULATION AND UPDATE LOGIC ---
    if (hasEnded && !ratingsFinalized && contest.registrations.length > 0) {
        console.log(`Contest ${contest.title} has ended. Calculating ratings...`);

        const participants = contest.registrations.map(reg => ({
            userId: reg.user.id,
            currentRating: reg.user.rating,
            score: reg.score,
            registrationId: reg.id,
            userName: reg.user.name, // For logging
        }));

        // Sort participants by score for ranking
        participants.sort((a, b) => b.score - a.score);

        const totalParticipants = participants.length;
        const updates = [];
        const ratingHistoryEntries = [];

        // Simplified rating logic (adjust as needed for a real system)
        for (let i = 0; i < totalParticipants; i++) {
            const participant = participants[i];
            const rank = i + 1;
            let ratingChange = 0;

            if (rank <= Math.ceil(totalParticipants * 0.2)) { // Top 20%
                ratingChange = 50;
            } else if (rank <= Math.ceil(totalParticipants * 0.5)) { // Next 30%
                ratingChange = 10;
            } else if (rank > Math.ceil(totalParticipants * 0.8)) { // Bottom 20%
                ratingChange = -20;
            }

            const newRating = participant.currentRating + ratingChange;
            
            updates.push(
                prisma.user.update({
                    where: { id: participant.userId },
                    data: { rating: newRating },
                })
            );

            ratingHistoryEntries.push(
                prisma.userRatingHistory.create({
                    data: {
                        userId: participant.userId,
                        contestId: id,
                        ratingBefore: participant.currentRating,
                        ratingAfter: newRating,
                        rank: rank,
                    },
                })
            );
        }

        try {
            await prisma.$transaction([...updates, ...ratingHistoryEntries]);
            console.log(`Ratings updated and history recorded for contest ${contest.title}`);
            // After updating, we need to refresh the user objects in registrations
            // to reflect the new rating for the leaderboard display.
            // This is slightly inefficient but ensures consistency for this request.
            await prisma.contest.findUnique({ // Re-fetch to get updated user ratings
              where: { id },
              include: {
                registrations: {
                  include: {
                    user: { select: { id: true, name: true, image: true, rating: true } },
                  },
                  orderBy: [{ score: "desc" }],
                },
              },
            }).then(reFetchedContest => {
                if (reFetchedContest) contest.registrations = reFetchedContest.registrations;
            });

        } catch (transactionError) {
            console.error(`Failed to update ratings for contest ${contest.title}:`, transactionError);
            // Even if transaction fails, try to return current leaderboard
        }
    }
    // --- END RATING CALCULATION AND UPDATE LOGIC ---

    const leaderboard = contest.registrations.map((reg, index) => ({
      rank: index + 1,
      user: reg.user,
      score: reg.score,
    }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Failed to fetch leaderboard or calculate ratings:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard or calculate ratings" }, { status: 500 });
  }
}
