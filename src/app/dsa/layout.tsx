import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "DSA Visualizer | LogiQuest",
  description: "Interactively visualize 40+ data structures and algorithms including trees, graphs, sorting, and dynamic programming step-by-step.",
};
export default function DSALayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
