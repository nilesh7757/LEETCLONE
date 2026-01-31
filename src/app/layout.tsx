import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutShell from "@/components/layout/LayoutShell";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth"; // Import auth directly
import { Toaster } from "sonner";
import PageTransition from "@/components/layout/PageTransition"; // Import the PageTransition component
import ActiveTracker from "@/components/ActiveTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LeetClone - Master Coding and System Design",
  description: "A modern platform for coding contests, system design practice, and career growth.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="dark"
            enableSystem
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

