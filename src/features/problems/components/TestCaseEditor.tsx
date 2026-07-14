"use client";

import { useState, useRef } from "react";
import { 
  PlusCircle, Trash2, Upload, X, FileText, 
  CheckCircle, AlertCircle, Database, Binary,
  Fingerprint, Zap, ShieldCheck, ArrowRight
} from "lucide-react";
import { useFieldArray, Control, UseFormRegister, FieldValues, Path, ArrayPath } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";

interface TestCase {
  input: string;
  output: string;
}

interface TestCaseEditorProps<T extends FieldValues> {
  name: ArrayPath<T>;
  label: string;
  showOutputs?: boolean;
  hideInput?: boolean;
  control: Control<T>;
  register: UseFormRegister<T>;
}

const BulkImportModal = ({
  isOpen,
  onClose,
  onImport,
  showOutputs,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImport: (cases: TestCase[]) => void;
  showOutputs: boolean;
}) => {
  const [activeTab, setActiveTab] = useState<"text" | "file">("text");
  const [textContent, setTextContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImport = () => {
    setError(null);
    let cases: TestCase[] = [];
    try {
      cases = parseContent(textContent);
      if (cases.length === 0) {
        setError("No valid test cases found.");
        return;
      }
      onImport(cases);
      onClose();
      setTextContent("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to parse test cases.");
    }
  };

  const parseContent = (content: string): TestCase[] => {
    const trimmed = content.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const json = JSON.parse(trimmed);
        if (Array.isArray(json)) {
          return json.map((item: Record<string, unknown>) => ({
            input: typeof item.input === "string" ? item.input : JSON.stringify(item.input || ""),
            output: typeof item.output === "string" ? item.output : JSON.stringify(item.output || ""),
          }));
        }
      } catch { }
    }
    const lines = trimmed.split(/\r?\n/).filter((l) => l.trim() !== "");
    const cases: TestCase[] = [];
    if (showOutputs) {
      for (let i = 0; i < lines.length; i += 2) {
        cases.push({ input: lines[i], output: lines[i + 1] || "" });
      }
    } else {
      for (const line of lines) {
        cases.push({ input: line, output: "" });
      }
    }
    return cases;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,1)] w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center border border-[#3b82f6]/20">
                <Database size={16} className="text-[#3b82f6]" />
             </div>
             <h3 className="text-sm font-bold uppercase tracking-wider text-white">Bulk Import</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar space-y-8 bg-[#050505]">
          <div className="flex p-1 bg-white/5 rounded-2xl w-fit border border-white/5">
            <button
              className={`px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${activeTab === "text" ? "bg-white text-black shadow-xl" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
              onClick={() => setActiveTab("text")}
            >
              Text
            </button>
            <button
              className={`px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${activeTab === "file" ? "bg-white text-black shadow-xl" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
              onClick={() => setActiveTab("file")}
            >
              File
            </button>
          </div>

          {activeTab === "text" ? (
            <div className="space-y-6">
              <div className="bg-[#3b82f6]/5 p-5 rounded-2xl border border-[#3b82f6]/10 space-y-4">
                <p className="text-[10px] font-bold text-[#3b82f6] uppercase tracking-widest flex items-center gap-2">
                  <FileText size={14} /> Import Guide
                </p>
                <div className="grid grid-cols-1 gap-2 text-[9px] font-mono text-[var(--muted-foreground)] uppercase">
                   <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[#3b82f6]" /> JSON: {`[{ "input": "...", "output": "..." }]`}</div>
                   <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[#3b82f6]" /> Alternating: Input followed by Output line by line</div>
                </div>
              </div>
              <textarea
                value={textContent} onChange={(e) => setTextContent(e.target.value)}
                className="w-full h-64 p-6 font-mono text-xs rounded-2xl bg-[#020202] border border-white/5 text-[#f5f5f5] focus:border-[#3b82f6]/20 outline-none resize-none transition-all"
                placeholder={showOutputs ? "Input:\n1 2\nOutput:\n3" : "Enter inputs..."}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
              <div className="w-16 h-16 rounded-3xl bg-[#3b82f6]/5 flex items-center justify-center mb-6 border border-white/5">
                <Upload className="h-8 w-8 text-[#3b82f6] opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]">Upload test cases (.txt / .json)</p>
              <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.json" onChange={(e) => {
                 const file = e.target.files?.[0]; if (!file) return;
                 const reader = new FileReader(); reader.onload = (ev) => { setTextContent(ev.target?.result as string); setActiveTab("text"); };
                 reader.readAsText(file);
              }} />
            </div>
          )}
        </div>

        <div className="px-8 py-6 border-t border-white/5 bg-[#0a0a0a] flex justify-end gap-4 shrink-0">
          <button onClick={onClose} className="px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all">Cancel</button>
          <button
            onClick={handleImport} disabled={!textContent.trim()}
            className="flex items-center px-10 py-3 text-[10px] font-bold uppercase tracking-widest text-black bg-white rounded-xl shadow-xl hover:bg-[#3b82f6] hover:text-[var(--foreground)] active:scale-95 disabled:opacity-30 transition-all"
          >
            <CheckCircle className="h-4 w-4 mr-2" /> Import
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const TestCaseEditor = <T extends FieldValues>({
  name, label, showOutputs = true, hideInput = false, control, register
}: TestCaseEditorProps<T>) => {
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const { fields, append, remove } = useFieldArray({ control, name: name });

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col gap-1">
           <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">{label}</label>
           <span className="text-[8px] font-mono text-[#262626] uppercase">Test Cases: {fields.length}</span>
        </div>
        <div className="flex gap-4">
          <button
            type="button" onClick={() => setIsBulkImportOpen(true)}
            className="inline-flex items-center px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[#3b82f6] transition-all"
          >
            <Upload className="mr-2 h-3.5 w-3.5" /> Bulk Import
          </button>
          <button
            type="button" onClick={() => append({ input: "", output: "" } as unknown as Parameters<typeof append>[0])}
            className="inline-flex items-center px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest text-[#3b82f6] bg-[#3b82f6]/5 border border-[#3b82f6]/20 rounded-xl hover:bg-[#3b82f6]/10 transition-all shadow-lg"
          >
            <PlusCircle className="mr-2 h-3.5 w-3.5" /> Add Test Case
          </button>
        </div>
      </div>

      <BulkImportModal
        isOpen={isBulkImportOpen} onClose={() => setIsBulkImportOpen(false)}
        onImport={(cases) => append(cases as unknown as Parameters<typeof append>[0])} showOutputs={showOutputs}
      />

      {fields.length === 0 && (
        <div className="py-20 rounded-3xl border border-dashed border-white/5 bg-white/[0.01] flex flex-col items-center justify-center space-y-4">
           <Binary size={32} className="text-[#262626]" />
           <p className="text-[9px] font-bold uppercase tracking-widest text-[#262626]">No test cases added</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {fields.map((field, index) => (
          <motion.div 
            key={field.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 relative group hover:border-white/10 transition-all shadow-xl"
          >
            <button
              type="button" onClick={() => remove(index)}
              className="absolute top-6 right-6 p-2 bg-rose-500/5 text-rose-500/30 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-4 mb-8">
               <div className="w-8 h-8 rounded-lg bg-black border border-white/5 flex items-center justify-center text-[10px] font-mono font-bold text-[var(--muted-foreground)]">
                  {String(index + 1).padStart(2, '0')}
               </div>
               <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className={`grid grid-cols-1 ${showOutputs && !hideInput ? "xl:grid-cols-2" : ""} gap-10`}>
              {!hideInput && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 ml-1">
                     <div className="w-1 h-1 rounded-full bg-[#3b82f6]" />
                     <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Input</label>
                  </div>
                  <textarea
                    {...register(`${name}.${index}.input` as Path<T>, { required: true })}
                    rows={4}
                    className="w-full p-5 font-mono text-xs rounded-2xl bg-[#020202] border border-white/5 focus:border-[#3b82f6]/30 text-white outline-none resize-none transition-all shadow-inner"
                    placeholder="Enter input data..."
                  />
                </div>
              )}
              {showOutputs && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 ml-1">
                     <div className="w-1 h-1 rounded-full bg-[#22c55e]" />
                     <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Output</label>
                  </div>
                  <textarea
                    {...register(`${name}.${index}.output` as Path<T>, { required: true })}
                    rows={4}
                    className="w-full p-5 font-mono text-xs rounded-2xl bg-[#020202] border border-white/5 focus:border-[#22c55e]/30 text-[#22c55e] font-bold outline-none resize-none transition-all shadow-inner"
                    placeholder="Enter expected output..."
                  />
                </div>
              )}
            </div>
            
            {/* HUD Decoration */}
            <div className="absolute bottom-4 right-8 opacity-[0.02] pointer-events-none">
               <Fingerprint size={80} className="text-white" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TestCaseEditor;
