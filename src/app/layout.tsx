import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutShell from "@/components/layout/LayoutShell";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth"; // Import auth directly
import { Toaster } from "sonner";
import PageTransition from "@/components/layout/PageTransition"; // Import the PageTransition component
import ActiveTracker from "@/components/ActiveTracker";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LogiQuest - Solve Logic, Master the Journey",
  description: "A premium platform for interactive coding algorithms, AI-powered interview preparation, and real-time competitive logic.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth(); // Fetch session on the server

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased`}
      >
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="dark"
            enableSystem
            themes={["light", "dark", "cream", "batman", "system"]}
            disableTransitionOnChange
          >
            <ActiveTracker />
            <LayoutShell>
              <PageTransition>
                {children}
              </PageTransition>
            </LayoutShell>
            <Toaster richColors position="top-center" />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

