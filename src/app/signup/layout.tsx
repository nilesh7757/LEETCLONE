import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Create Account | LogiQuest",
  description: "Join thousands of developers on LogiQuest. Create your free account and start solving problems today.",
};
export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
