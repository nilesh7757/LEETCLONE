import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | LogiQuest",
  description: "View your coding stats, submission history, rating progression, and earned badges on your LogiQuest performance dashboard.",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
