"use client";

import { useState, useRef } from "react";
import { PlusCircle, Trash2, Upload, X, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useFieldArray, Control, UseFormRegister } from "react-hook-form";

interface TestCase {
  input: string;
  output: string;
}

interface TestCaseEditorProps {
  name: string;
  label: string;
  showOutputs?: boolean;
  control: Control<any>;
  register: UseFormRegister<any>;
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
        // File import is handled in handleFileChange, but if user clicked import after selecting file...
        // We'll rely on the text content being populated by the file reader for simplicity
        // or re-read if needed. But easier: file reader puts content into 'textContent' or we handle it immediately.
        // Let's make the file input handler set the textContent.
        cases = parseContent(textContent);
      }

      if (cases.length === 0) {
        setError("No valid test cases found.");
        return;
      }

      onImport(cases);
      onClose();
      setTextContent("");
    } catch (err: any) {
      setError(err.message || "Failed to parse test cases.");
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
          return json.map((item: any) => ({
            input: typeof item.input === "string" ? item.input : JSON.stringify(item.input),
            output: typeof item.output === "string" ? item.output : JSON.stringify(item.output || ""),
          }));
        }
      } catch (e) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Bulk Import Test Cases</h3>
          <button onClick={onClose} className="text-[var(--foreground)]/50 hover:text-[var(--foreground)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex space-x-4 mb-4">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "text"
                  ? "bg-[var(--accent-gradient-to)] text-white"
                  : "bg-[var(--background)] text-[var(--foreground)]/70 hover:bg-[var(--foreground)]/10"
              }`}
              onClick={() => setActiveTab("text")}
            >
              Paste Text / JSON
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "file"
                  ? "bg-[var(--accent-gradient-to)] text-white"
                  : "bg-[var(--background)] text-[var(--foreground)]/70 hover:bg-[var(--foreground)]/10"
              }`}
              onClick={() => setActiveTab("file")}
            >
              Upload File
            </button>
          </div>

          {activeTab === "text" ? (
            <div className="space-y-2">
              <label className="block text-sm text-[var(--foreground)]/70">
                Paste your test cases below.
                <span className="block text-xs text-[var(--foreground)]/50 mt-1">
                  Supported formats:
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li>JSON Array: <code>[{`{ "input": "...", "output": "..." }`}, ...]</code></li>
                    {showOutputs ? (
                      <li>Newline Separated: Line 1 = Input, Line 2 = Output, etc.</li>
                    ) : (
                      <li>Newline Separated: One input per line.</li>
                    )}
                  </ul>
                </span>
              </label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="w-full h-64 p-3 font-mono text-sm rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] focus:border-[var(--accent-gradient-to)] focus:ring-1 focus:ring-[var(--accent-gradient-to)] outline-none resize-none"
                placeholder={
                  showOutputs
                    ? 'Example (Text):\n[1, 2]\n3\n[4, 5]\n9\n\nExample (JSON):\n[{"input": "2", "output": "4"}]'
                    : 'Example:\ninput1\ninput2\ninput3'
                }
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[var(--card-border)] rounded-lg bg-[var(--background)]/30 hover:bg-[var(--background)]/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <FileText className="h-10 w-10 text-[var(--foreground)]/30 mb-2" />
              <p className="text-sm text-[var(--foreground)]/60">Click to upload .txt or .json</p>
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
            <div className="flex items-center gap-2 mt-4 text-sm text-red-500 bg-red-500/10 p-3 rounded-md border border-red-500/20">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[var(--card-border)] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[var(--foreground)]/70 hover:bg-[var(--foreground)]/10 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!textContent.trim()}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[var(--accent-gradient-from)] to-[var(--accent-gradient-to)] rounded-md shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Import Test Cases
          </button>
        </div>
      </div>
    </div>
  );
};

const TestCaseEditor = ({ name, label, showOutputs = true, control, register }: TestCaseEditorProps) => {
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const { fields, append, remove } = useFieldArray({
    control,
    name: name,
  });

  const handleAddTestCase = () => {
    append({ input: "", output: "" });
  };

  const handleBulkImport = (cases: TestCase[]) => {
    append(cases);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-[var(--foreground)]/70">
          {label}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsBulkImportOpen(true)}
            className="inline-flex items-center px-3 py-1.5 border border-[var(--card-border)] rounded-md shadow-sm text-sm font-medium text-[var(--foreground)]/70 bg-[var(--background)] hover:bg-[var(--foreground)]/10 transition-colors"
          >
            <Upload className="-ml-0.5 mr-2 h-4 w-4" />
            Bulk Import
          </button>
          <button
            type="button"
            onClick={handleAddTestCase}
            className="inline-flex items-center px-3 py-1.5 border border-[var(--card-border)] rounded-md shadow-sm text-sm font-medium text-[var(--foreground)]/70 bg-[var(--background)] hover:bg-[var(--foreground)]/10 transition-colors"
          >
            <PlusCircle className="-ml-0.5 mr-2 h-4 w-4" />
            Add Test Case
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
        <p className="text-sm text-[var(--foreground)]/50">No test cases added yet.</p>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="p-4 border border-[var(--card-border)] rounded-lg bg-[var(--background)]/50 relative">
            <button
              type="button"
              onClick={() => remove(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors"
              title="Remove Test Case"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <div className={`grid grid-cols-1 ${showOutputs ? "md:grid-cols-2" : ""} gap-4 mt-2`}>
              <div>
                <label htmlFor={`${name}.${index}.input`} className="block text-xs font-medium text-[var(--foreground)]/60 mb-1">
                  Input {index + 1}
                </label>
                <textarea
                  id={`${name}.${index}.input`}
                  {...register(`${name}.${index}.input`, { required: true })}
                  rows={3}
                  className="w-full p-2 font-mono text-sm rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] focus:border-[var(--accent-gradient-to)] focus:ring-1 focus:ring-[var(--accent-gradient-to)] outline-none resize-y"
                  placeholder="e.g., nums = [2,7,11,15], target = 9"
                />
              </div>
              {showOutputs && (
                <div>
                  <label htmlFor={`${name}.${index}.output`} className="block text-xs font-medium text-[var(--foreground)]/60 mb-1">
                    Output {index + 1}
                  </label>
                  <textarea
                    id={`${name}.${index}.output`}
                    {...register(`${name}.${index}.output`, { required: true })}
                    rows={3}
                    className="w-full p-2 font-mono text-sm rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] focus:border-[var(--accent-gradient-to)] focus:ring-1 focus:ring-[var(--accent-gradient-to)] outline-none resize-y"
                    placeholder="e.g., [0,1]"
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
