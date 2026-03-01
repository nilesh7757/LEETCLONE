import { prisma } from "@/lib/prisma";

/**
 * Updates a user's solving streak and last solved date.
 * Returns the updated streak count.
 */
export async function updateUserStreak(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true, lastSolvedDate: true }
  });

  if (!user) return 0;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  
  const lastSolved = user.lastSolvedDate ? new Date(user.lastSolvedDate) : null;
  if (lastSolved) lastSolved.setUTCHours(0, 0, 0, 0);

  let newStreak = user.streak;
  
  if (!lastSolved) {
    newStreak = 1;
  } else if (lastSolved.getTime() !== today.getTime()) {
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    
    // If last solved was yesterday, increment. Otherwise, reset to 1.
    newStreak = lastSolved.getTime() === yesterday.getTime() ? newStreak + 1 : 1;
  } else {
    // Already solved today, no change to streak count
    return newStreak;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      streak: newStreak,
      lastSolvedDate: new Date()
    }
  });

  return newStreak;
}
