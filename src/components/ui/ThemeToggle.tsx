"use client";

import * as React from "react";
import { Moon, Sun, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle({ direction = "down" }: { direction?: "up" | "down" }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
    
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
      <div className="w-10 h-10 rounded-full bg-[var(--muted)] animate-pulse" />
    );
  }

  const themes = [
    { id: "dark", label: "Dark", icon: Moon, color: "text-blue-400" },
    { id: "light", label: "Light", icon: Sun, color: "text-amber-400" },
  ];

  const currentTheme = themes.find((t) => t.id === theme) || themes[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative w-10 h-10 flex items-center justify-center rounded-full bg-[var(--card)] border-none hover:bg-[var(--muted)] transition-all duration-300 shadow-sm"
        aria-label="Toggle theme"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[var(--viz-purple)]/0 to-[var(--viz-cyan)]/0 group-hover:from-[var(--viz-purple)]/5 group-hover:to-[var(--viz-cyan)]/5 transition-all duration-500" />
        <currentTheme.icon className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: direction === "up" ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: direction === "up" ? 10 : -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`absolute right-0 ${direction === "up" ? "bottom-full mb-3" : "top-full mt-3"} w-48 p-2 rounded-2xl bg-[var(--card)] shadow-2xl z-50`}
          >
            <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] border-b border-[var(--border)] mb-1 opacity-70">
                Interface Mode
            </div>
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2.5 flex items-center justify-between text-sm rounded-xl transition-all duration-200 group ${
                    theme === t.id 
                    ? "bg-[var(--foreground)]/5 text-[var(--foreground)] font-medium" 
                    : "text-[var(--muted-foreground)] hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <t.icon className={`w-4 h-4 ${theme === t.id ? t.color : "opacity-50 group-hover:opacity-100"}`} />
                  <span>{t.label}</span>
                </div>
                {theme === t.id && (
                    <motion.div layoutId="activeTheme" transition={{ duration: 0.2 }}>
                        <Check className="w-3.5 h-3.5 text-[var(--viz-green)]" />
                    </motion.div>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
