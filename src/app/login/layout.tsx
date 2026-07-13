import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Sign In | LogiQuest",
  description: "Sign in to your LogiQuest account to track your progress, join contests, and access AI-powered coding tools.",
};
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
