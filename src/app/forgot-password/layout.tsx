import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Forgot Password | LogiQuest",
  description: "Reset your LogiQuest account password via email verification.",
};
export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
