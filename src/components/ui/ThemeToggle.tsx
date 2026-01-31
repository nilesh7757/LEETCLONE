"use client";

import * as React from "react";
import { Moon, Sun, Coffee, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle({ direction = "down" }: { direction?: "up" | "down" }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
    
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] animate-pulse" />
    );
  }

  const themes = [
    { id: "dark", label: "Dark", icon: Moon },
    { id: "light", label: "Light", icon: Sun },
    { id: "cream", label: "Cream", icon: Coffee },
  ];

  const currentTheme = themes.find((t) => t.id === theme) || themes[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] hover:bg-[var(--foreground)]/5 transition-colors text-[var(--foreground)]"
        aria-label="Toggle theme"
      >
        <currentTheme.icon className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: direction === "up" ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: direction === "up" ? 10 : -10, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className={`absolute right-0 ${direction === "up" ? "bottom-full mb-2" : "top-full mt-2"} w-36 py-1 rounded-xl border border-[var(--card-border)] bg-[var(--background)] shadow-xl z-50 backdrop-blur-xl`}
          >
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 flex items-center justify-between text-sm text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <t.icon className="w-4 h-4 opacity-70" />
                  <span>{t.label}</span>
                </div>
                {theme === t.id && <Check className="w-3 h-3 text-green-500" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
