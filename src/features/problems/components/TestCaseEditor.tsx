"use client";

import { useState, useRef } from "react";
import { PlusCircle, Trash2, Upload, X, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useFieldArray, Control, UseFormRegister, FieldValues, Path, FieldArray } from "react-hook-form";

interface TestCase {
  input: string;
  output: string;
}

interface TestCaseEditorProps<T extends FieldValues> {
  name: Path<T>;
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
      if (activeTab === "text") {
        cases = parseContent(textContent);
      } else {
        cases = parseContent(textContent);
      }

      if (cases.length === 0) {
        setError("No valid test cases found.");
        return;
      }

      onImport(cases);
      onClose();
      setTextContent("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to parse test cases.");
      }
    }
  };

  const parseContent = (content: string): TestCase[] => {
    const trimmed = content.trim();
    if (!trimmed) return [];

    // Try JSON first
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const json = JSON.parse(trimmed);
        if (Array.isArray(json)) {
          return json.map((item: { input?: unknown; output?: unknown }) => ({
            input: typeof item.input === "string" ? item.input : JSON.stringify(item.input || ""),
            output: typeof item.output === "string" ? item.output : JSON.stringify(item.output || ""),
          }));
        }
      } catch {
        // Not valid JSON, fall through to text parsing
      }
    }

    // Text Parsing (Newline separated)
    const lines = trimmed.split(/\r?\n/).filter((l) => l.trim() !== "");
    const cases: TestCase[] = [];

    if (showOutputs) {
      // Expect alternating Input / Output
      for (let i = 0; i < lines.length; i += 2) {
        const input = lines[i];
        const output = lines[i + 1] || ""; // Handle missing last output
        cases.push({ input, output });
      }
    } else {
      // Just Inputs
      for (const line of lines) {
        cases.push({ input: line, output: "" });
      }
    }

    return cases;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setTextContent(content);
      setActiveTab("text"); // Switch to text view to show imported content
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border)] bg-[var(--background)]/30">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--foreground)]">Bulk Vector Import</h3>
          <button onClick={onClose} className="p-2 hover:bg-[var(--foreground)]/10 rounded-xl transition-all text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar space-y-8">
          <div className="flex p-1.5 bg-[var(--background)] rounded-2xl w-fit">
            <button
              className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${activeTab === "text"
                ? "bg-[var(--viz-cyan)] text-white shadow-lg shadow-[var(--viz-cyan)]/20"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
              }`}
              onClick={() => setActiveTab("text")}
            >
              Raw Buffer / JSON
            </button>
            <button
              className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${activeTab === "file"
                ? "bg-[var(--viz-cyan)] text-white shadow-lg shadow-[var(--viz-cyan)]/20"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
              }`}
              onClick={() => setActiveTab("file")}
            >
              Binary File
            </button>
          </div>

          {activeTab === "text" ? (
            <div className="space-y-4">
              <div className="bg-[var(--viz-cyan)]/5 p-4 rounded-2xl border border-[var(--viz-cyan)]/10">
                <p className="text-[10px] font-bold text-[var(--viz-cyan)] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> Protocol Specifications:
                </p>
                <ul className="space-y-1.5">
                  <li className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-tight flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[var(--viz-cyan)]" /> JSON Schema: <code className="lowercase opacity-80 bg-[var(--background)] px-1.5 py-0.5 rounded ml-1">{`[{ "input": "...", "output": "..." }]`}</code>
                  </li>
                  {showOutputs ? (
                    <li className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-tight flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-[var(--viz-cyan)]" /> Stream: Line 1 = Input, Line 2 = Output
                    </li>
                  ) : (
                    <li className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-tight flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-[var(--viz-cyan)]" /> Sequence: One Input sequence per line
                    </li>
                  )}
                </ul>
              </div>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="w-full h-64 p-5 font-mono text-xs rounded-3xl bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--viz-cyan)]/20 outline-none resize-none transition-all shadow-inner"
                placeholder={
                  showOutputs
                    ? 'Transmission Format:\n[1, 2]\n3\n\nJSON Protocol:\n[{"input": "2", "output": "4"}]'
                    : 'Input Sequence:\n0x4A... \n0xBF... \n0xEE...'
                }
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[var(--border)] rounded-[2rem] bg-[var(--background)]/30 hover:bg-[var(--background)]/50 transition-all cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
              <div className="w-16 h-16 rounded-full bg-[var(--viz-cyan)]/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="h-8 w-8 text-[var(--viz-cyan)] opacity-50" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">Select System File (.txt / .json)</p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".txt,.json"
                onChange={handleFileChange}
              />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[var(--viz-red)] bg-[var(--viz-red)]/5 p-4 rounded-2xl border border-[var(--viz-red)]/10">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>

        <div className="px-8 py-6 border-t border-[var(--border)] bg-[var(--background)]/30 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 rounded-xl transition-all cursor-pointer"
          >
            Abort
          </button>
          <button
            onClick={handleImport}
            disabled={!textContent.trim()}
            className="flex items-center px-8 py-2.5 text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-[var(--viz-cyan)] to-[var(--viz-blue)] rounded-xl shadow-lg shadow-[var(--viz-cyan)]/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all cursor-pointer"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Commit Buffer
          </button>
        </div>
      </div>
    </div>
  );
};

const TestCaseEditor = <T extends FieldValues>({
  name,
  label,
  showOutputs = true,
  hideInput = false,
  control,
  register,
}: TestCaseEditorProps<T>) => {
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const { fields, append, remove } = useFieldArray({
    control,
    name: name,
  });

  const handleAddTestCase = () => {
    append({ input: "", output: "" } as unknown as FieldArray<T, Path<T>>);
  };

  const handleBulkImport = (cases: TestCase[]) => {
    append(cases as unknown as FieldArray<T, Path<T>>[]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] ml-1">
          {label}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsBulkImportOpen(true)}
            className="inline-flex items-center px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] bg-[var(--card)]/30 hover:bg-[var(--card)]/50 hover:text-[var(--foreground)] rounded-xl transition-all"
          >
            <Upload className="mr-2 h-3.5 w-3.5" />
            Bulk Import
          </button>
          <button
            type="button"
            onClick={handleAddTestCase}
            className="inline-flex items-center px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--viz-cyan)] bg-[var(--viz-cyan)]/5 hover:bg-[var(--viz-cyan)]/10 rounded-xl transition-all cursor-pointer"
          >
            <PlusCircle className="mr-2 h-3.5 w-3.5" />
            Initialize Vector
          </button>
        </div>
      </div>

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImport={handleBulkImport}
        showOutputs={showOutputs}
      />

      {fields.length === 0 && (
        <div className="text-center py-10 rounded-3xl bg-[var(--card)]/10 border border-dashed border-[var(--border)]">
           <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] opacity-30">No active test vectors found in this registry.</p>
        </div>
      )}

      <div className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="p-6 rounded-[2rem] bg-[var(--card)]/20 border border-[var(--border)] relative group transition-all hover:bg-[var(--card)]/30">
            <button
              type="button"
              onClick={() => remove(index)}
              className="absolute top-4 right-4 p-2 bg-red-500/5 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer opacity-0 group-hover:opacity-100"
              title="Remove Vector"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <div className={`grid grid-cols-1 ${showOutputs && !hideInput ? "md:grid-cols-2" : ""} gap-6`}>
              {!hideInput && (
                <div className="space-y-2">
                  <label htmlFor={`${name}.\${index}.input`} className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] ml-1">
                    Input Buffer {index + 1}
                  </label>
                  <textarea
                    id={`${name}.\${index}.input`}
                    {...register(`${name}.\${index}.input` as Path<T>, { required: true })}
                    rows={3}
                    className="w-full p-4 font-mono text-xs rounded-2xl bg-[var(--background)] border border-transparent focus:border-[var(--viz-cyan)]/20 text-[var(--foreground)] outline-none resize-none transition-all shadow-inner"
                    placeholder="nums = [2,7,11,15], target = 9"
                  />
                </div>
              )}
              {showOutputs && (
                <div className="space-y-2">
                  <label htmlFor={`${name}.\${index}.output`} className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] ml-1">
                    Target Output {index + 1}
                  </label>
                  <textarea
                    id={`${name}.\${index}.output`}
                    {...register(`${name}.\${index}.output` as Path<T>, { required: true })}
                    rows={3}
                    className="w-full p-4 font-mono text-xs rounded-2xl bg-[var(--background)] border border-transparent focus:border-[var(--viz-cyan)]/20 text-[var(--foreground)] outline-none resize-none transition-all shadow-inner"
                    placeholder="[0,1]"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestCaseEditor;
