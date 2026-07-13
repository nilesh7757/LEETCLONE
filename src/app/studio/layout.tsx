import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Studio | LogiQuest",
  description: "Create, edit, and manage coding problems and contests in the LogiQuest Studio. Build challenges for the community.",
};
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
