import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Daily Siege | LogiQuest",
  description: "Take on the daily algorithmic siege challenge. A new problem every day with a competitive leaderboard.",
};
export default function SiegeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
