import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Contests | LogiQuest",
  description: "Compete head-to-head against developers worldwide in real-time timed coding battles. Earn rating points and climb the ranks.",
};
export default function ContestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
