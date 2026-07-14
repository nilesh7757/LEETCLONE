"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-[var(--muted)] animate-pulse" />
    );
  }

  const toggleTheme = () => {
    const currentTheme = theme === "system" ? resolvedTheme : theme;
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="group relative w-10 h-10 flex items-center justify-center rounded-full bg-[var(--card)] border-none hover:bg-[var(--muted)] transition-all duration-300 shadow-sm cursor-pointer"
      aria-label="Toggle theme"
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[var(--viz-purple)]/0 to-[var(--viz-cyan)]/0 group-hover:from-[var(--viz-purple)]/5 group-hover:to-[var(--viz-cyan)]/5 transition-all duration-500" />
      {isDark ? (
        <Sun className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors" />
      ) : (
        <Moon className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors" />
      )}
    </button>
  );
}
