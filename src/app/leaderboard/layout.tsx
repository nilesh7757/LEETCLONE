import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Leaderboard | LogiQuest",
  description: "See the top coders ranked by rating, problems solved, and contest performance on the LogiQuest global leaderboard.",
};
export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
