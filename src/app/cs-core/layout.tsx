import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "CS Core | LogiQuest",
  description: "Master Operating Systems, DBMS, Computer Networks, and OOP fundamentals with structured notes and quick revision guides.",
};
export default function CSCoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
