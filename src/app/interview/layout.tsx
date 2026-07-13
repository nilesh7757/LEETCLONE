import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Mock Interview | LogiQuest",
  description: "Practice technical interviews with AI-powered mock sessions. Get real-time feedback on your problem-solving approach and communication.",
};
export default function InterviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
