import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavigationWrapper from "@/components/NavigationWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth"; // Import auth directly
import { Toaster } from "sonner";
import PageTransition from "@/components/PageTransition"; // Import the PageTransition component
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
  title: "LeetCode Clone",
  description: "A modern platform for coding contests and practice.",
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
            <NavigationWrapper />
            <PageTransition>
              {children}
            </PageTransition>
            <Toaster richColors position="top-center" />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

