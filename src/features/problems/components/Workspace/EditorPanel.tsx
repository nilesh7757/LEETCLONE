"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Editor, Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { 
  ChevronDown, Check, Play, Send, Loader2, RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { languages } from "@/lib/starterCode";
import { useTheme } from "next-themes";

interface EditorPanelProps {
  code?: string;
  setCode?: (code: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  theme?: string;
  problemType?: string;
  initialCode?: string;
  onMount?: (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => void;
  
  // NEW: Refined props for Studio Layout
  isToolbarOnly?: boolean;
  isEditorOnly?: boolean;
  onRun?: (parseAndSetMarkers: (msg: string) => void) => void;
  onSubmit?: () => void;
  onReset?: () => void;
  isRunning?: boolean;
  isSubmitting?: boolean;
  isLoggedIn?: boolean;
}
export default function EditorPanel({ 
  code = "", setCode = () => {}, language, setLanguage, theme,
  onMount,
  isToolbarOnly, onRun, onSubmit, onReset, isRunning, isSubmitting
}: EditorPanelProps) {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const internalEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const internalMonacoRef = useRef<Monaco | null>(null);
  const { resolvedTheme } = useTheme();

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    internalEditorRef.current = editor;
    internalMonacoRef.current = monaco;
    if (onMount) onMount(editor, monaco);
  };

  const parseAndSetMarkers = useCallback((errorMsg: string) => {
    if (!internalEditorRef.current || !internalMonacoRef.current) return;

    const monaco = internalMonacoRef.current;
    const model = internalEditorRef.current.getModel();
    if (!model) return;

    // Clear previous markers
    monaco.editor.setModelMarkers(model, "owner", []);

    // Try to extract line number from error message (common formats like "line 5", "5:10", etc.)
    const lineMatch = errorMsg.match(/line (\d+)/i) || errorMsg.match(/:(\d+):/);
    if (lineMatch) {
      const lineNumber = parseInt(lineMatch[1]);
      monaco.editor.setModelMarkers(model, "owner", [{
        startLineNumber: lineNumber,
        endLineNumber: lineNumber,
        startColumn: 1,
        endColumn: model.getLineMaxColumn(lineNumber),
        message: errorMsg,
        severity: monaco.MarkerSeverity.Error,
      }]);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine Monaco editor theme
  const getEditorTheme = () => {
    if (theme) return theme;
    if (resolvedTheme === "light" || resolvedTheme === "cream") {
      return "light";
    }
    return "vs-dark";
  };
  const editorTheme = getEditorTheme();

  if (isToolbarOnly) {
    return (
      <div className="flex items-center gap-2">
         <div className="flex items-center relative" ref={langDropdownRef}>
            <button
               onClick={() => setIsLangOpen(!isLangOpen)}
               className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest text-[#52525b] hover:text-white hover:bg-white/5 transition-all"
            >
               <span className="text-[#3b82f6]">{languages.find(l => l.value === language)?.label || language}</span>
               <ChevronDown size={14} className={`opacity-40 transition-transform duration-300 ${isLangOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
               {isLangOpen && (
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 5 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 5 }}
                     className="absolute top-full right-0 mt-2 w-52 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-[100] p-1.5 backdrop-blur-xl"
                  >
                     <div className="text-[9px] font-black text-[#3b82f6] uppercase tracking-[0.2em] px-3 py-2 border-b border-[var(--border)] mb-1">Select Runtime</div>
                     {languages.map(l => (
                        <button 
                           key={l.value}
                           onClick={() => { setLanguage(l.value); setIsLangOpen(false); }}
                           className={`w-full text-left px-3 py-2.5 rounded-lg text-[12px] flex items-center justify-between transition-all group ${
                              language === l.value ? "bg-[#3b82f6]/10 text-[#3b82f6] font-bold" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                           }`}
                        >
                           {l.label}
                           {language === l.value && <Check size={14} />}
                        </button>
                     ))}
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         <div className="w-px h-4 bg-white/5 mx-1" />

         {onReset && (
            <>
               <button 
                  onClick={onReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest text-[#a1a1aa] hover:text-white hover:bg-white/5 transition-all active:scale-95 group"
                  title="Reset code to starter template"
               >
                  <RotateCcw size={13} className="text-[#eab308] group-hover:rotate-[-45deg] transition-transform duration-300" />
                  Reset
               </button>
               <div className="w-px h-4 bg-white/5 mx-1" />
            </>
         )}

         <button 
            onClick={() => onRun && onRun(parseAndSetMarkers)}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest text-[#a1a1aa] hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 group"
         >
            {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} className="text-[#3b82f6] group-hover:scale-110 transition-transform" />}
            Run
         </button>

         <button 
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest bg-white text-black hover:bg-[#3b82f6] hover:text-white transition-all disabled:opacity-30 shadow-xl shadow-white/5 active:scale-95"
         >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Submit
         </button>
      </div>
    );
  }

  // Synchronize code from outside updates (e.g. language switch, reset, page load)
  // while avoiding cursor jumps during active typing (normalizing line endings to prevent mismatch)
  useEffect(() => {
    if (internalEditorRef.current) {
      const currentValue = internalEditorRef.current.getValue();
      const normalize = (str: string) => str.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      if (normalize(code) !== normalize(currentValue)) {
        internalEditorRef.current.setValue(code);
      }
    }
  }, [code]);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-transparent">
      <div className="flex-1 relative min-h-0">
        <Editor
          height="100%"
          language={language}
          theme={editorTheme}
          defaultValue={code}
          onChange={(val) => setCode(val || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 20, bottom: 20 },
            fontFamily: "'JetBrains Mono', monospace",
            cursorBlinking: "smooth",
            renderLineHighlight: "all",
            scrollbar: {
               vertical: 'visible',
               horizontal: 'visible',
               verticalScrollbarSize: 8,
               horizontalScrollbarSize: 8,
               useShadows: false
            },
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            renderLineHighlightOnlyWhenFocus: true
          }}
          onMount={handleEditorDidMount}
        />
      </div>
    </div>
  );
}

