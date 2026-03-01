"use client";

import { useRef, useState, useEffect } from "react";
import { Editor, Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { 
  RotateCcw, ChevronDown, Check, Code2, Settings2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { languages, getStarterCode } from "@/lib/starterCode";

interface EditorPanelProps {
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  theme: string;
  problemType: string;
  initialCode: string;
  onMount: (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => void;
}

export default function EditorPanel({ 
  code, setCode, language, setLanguage, theme, problemType, initialCode, onMount 
}: EditorPanelProps) {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-[var(--background)]">
      <div className="h-12 flex items-center justify-between px-4 border-b border-[var(--border)] bg-[var(--card)]/30 shrink-0">
        <div className="flex items-center gap-2 relative" ref={langDropdownRef}>
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-2.5 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all group border border-transparent hover:border-[var(--border)] shadow-sm"
          >
            <div className="p-1 rounded-md bg-[var(--viz-blue)]/10 text-[var(--viz-blue)]">
               <Code2 size={12} className="group-hover:rotate-12 transition-transform" />
            </div>
            <span>{languages.find(l => l.value === language)?.label || language}</span>
            <ChevronDown size={12} className={`opacity-50 transition-transform duration-300 ${isLangOpen ? "rotate-180" : ""}`} />
          </button>
          
          <AnimatePresence>
            {isLangOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="absolute top-full left-0 mt-2 w-56 bg-[var(--card)]/80 backdrop-blur-2xl border border-[var(--border)] rounded-2xl shadow-2xl z-[60] overflow-hidden p-2 shadow-black/40"
              >
                <div className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)] border-b border-[var(--border)] mb-1">Select Language</div>
                <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-0.5">
                  {languages.map(l => (
                    <button 
                      key={l.value}
                      onClick={() => { setLanguage(l.value); setIsLangOpen(false); }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                         language === l.value 
                         ? "text-[var(--viz-blue)] font-bold bg-[var(--viz-blue)]/10 border border-[var(--viz-blue)]/20 shadow-inner" 
                         : "text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                      }`}
                    >
                      <span className="tracking-tight">{l.label}</span>
                      {language === l.value && <Check size={14} className="drop-shadow-[0_0_5px_currentColor]" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-1.5">
          <button className="p-2 hover:bg-[var(--foreground)]/5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all group" title="Editor Settings">
            <Settings2 size={16} className="group-hover:rotate-45 transition-transform" />
          </button>
          <div className="w-px h-4 bg-[var(--border)] mx-1 opacity-50" />
          <button 
            onClick={() => setCode(initialCode)} 
            className="p-2 hover:bg-[var(--viz-red)]/10 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--viz-red)] transition-all active:scale-90" 
            title="Reset Code"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 relative min-h-0">
        <Editor
          height="100%"
          language={language}
          theme={theme === "dark" ? "vs-dark" : "light"}
          value={code}
          onChange={(val) => setCode(val || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 20, bottom: 20 },
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            glyphMargin: true,
            folding: true,
            lineDecorationsWidth: 12,
            lineNumbersMinChars: 3,
            letterSpacing: 0.5,
            renderLineHighlight: "all",
            scrollbar: {
               vertical: 'visible',
               horizontal: 'visible',
               useShadows: false,
               verticalScrollbarSize: 10,
               horizontalScrollbarSize: 10
            }
          }}
          onMount={onMount}
        />
        {/* Editor Bottom Info Overlay */}
        <div className="absolute bottom-4 right-6 pointer-events-none opacity-40 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
           <span>Ln {code.split('\n').length}</span>
           <span>UTF-8</span>
           <span className="text-[var(--viz-blue)]">{language}</span>
        </div>
      </div>
    </div>
  );
}
