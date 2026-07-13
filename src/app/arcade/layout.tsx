import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Arcade | LogiQuest",
  description: "Play mini coding games: Binary Guess, Bug Sniper, Code Typer, and more. Sharpen your skills while having fun.",
};
export default function ArcadeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
