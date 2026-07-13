import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Resources | LogiQuest",
  description: "Access curated DSA sheets, system design guides, and interview prep resources to accelerate your coding journey.",
};
export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
