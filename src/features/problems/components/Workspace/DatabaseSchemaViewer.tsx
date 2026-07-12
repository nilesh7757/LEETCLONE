"use client";

import { useState } from "react";
import { Database, Table, Key, Eye, EyeOff, Loader2, Play, AlertCircle, FileCode, DatabaseZap } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface Column {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}

interface TableSchema {
  name: string;
  columns: Column[];
}

interface DatabaseSchemaViewerProps {
  problemId: string;
  initialSchema: string | null | undefined;
  initialData: string | null | undefined;
}

// Parses standard SQLite CREATE TABLE definitions
function parseSqlSchema(schemaSql: string | null | undefined): TableSchema[] {
  if (!schemaSql) return [];
  const tables: TableSchema[] = [];

  // Clean comments and format lines
  const cleanSql = schemaSql
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");

  // Match CREATE TABLE [tableName] ( [body] );
  const createTableRegex = /CREATE\s+TABLE\s+(\w+)\s*\(([\s\S]*?)\);/gi;
  let match;
  while ((match = createTableRegex.exec(cleanSql)) !== null) {
    const tableName = match[1];
    const body = match[2];
    const lines = body.split(",").map(l => l.trim()).filter(l => l.length > 0);

    const columns: Column[] = [];

    for (const line of lines) {
      const upperLine = line.toUpperCase();
      // Skip constraints at table level
      if (
        upperLine.startsWith("FOREIGN KEY") ||
        upperLine.startsWith("PRIMARY KEY") ||
        upperLine.startsWith("UNIQUE") ||
        upperLine.startsWith("CONSTRAINT")
      ) {
        continue;
      }

      const tokens = line.split(/\s+/);
      if (tokens.length >= 2) {
        const colName = tokens[0].replace(/['"`]/g, "");
        const colType = tokens[1].replace(/,/g, "");
        const isPk = upperLine.includes("PRIMARY KEY");
        const isFk = upperLine.includes("REFERENCES");

        columns.push({
          name: colName,
          type: colType,
          isPrimaryKey: isPk,
          isForeignKey: isFk,
        });
      }
    }

    tables.push({ name: tableName, columns });
  }

  return tables;
}

// Custom CSV Parser for SQLite output
function parseCSV(csvString: string) {
  const lines = csvString.trim().split("\n");
  if (lines.length === 0 || lines[0].trim() === "") return { headers: [], rows: [] };
  
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map(line => {
    const values: string[] = [];
    let current = "";
    let insideQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ""));
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ""));
    return values;
  });

  return { headers, rows };
}

export default function DatabaseSchemaViewer({
  problemId,
  initialSchema,
  initialData,
}: DatabaseSchemaViewerProps) {
  const tables = parseSqlSchema(initialSchema);
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});
  const [tableData, setTableData] = useState<Record<string, { headers: string[]; rows: string[][] }>>({});
  const [loadingTables, setLoadingTables] = useState<Record<string, boolean>>({});
  const [showSqlScripts, setShowSqlScripts] = useState(false);

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName],
    }));
  };

  const previewTableData = async (tableName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling accordion

    if (tableData[tableName]) {
      // Toggle off if data is already loaded
      setTableData(prev => {
        const copy = { ...prev };
        delete copy[tableName];
        return copy;
      });
      return;
    }

    setLoadingTables(prev => ({ ...prev, [tableName]: true }));
    try {
      const { data } = await axios.post("/api/run", {
        code: `.headers on\n.mode csv\nSELECT * FROM ${tableName};`,
        type: "SQL",
        language: "sql",
        problemId: problemId,
        testCases: [{ input: "", expectedOutput: "" }],
      });

      const result = data.results?.[0];
      if (result && result.status === "Accepted") {
        const parsed = parseCSV(result.actual);
        setTableData(prev => ({
          ...prev,
          [tableName]: parsed,
        }));
      } else {
        const errMsg = result?.error || "Error executing preview query.";
        toast.error(`Failed to load data for ${tableName}: ${errMsg}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Execution error while retrieving mock rows.");
    } finally {
      setLoadingTables(prev => ({ ...prev, [tableName]: false }));
    }
  };

  if (tables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-[var(--muted-foreground)]">
        <AlertCircle size={32} className="mb-3 text-[var(--primary)]" />
        <p className="text-sm font-medium">No initial schema defined for this problem.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-[var(--primary)]" />
          <h3 className="text-[14px] font-black uppercase tracking-wider text-[var(--foreground)]">
            Database Catalog
          </h3>
        </div>
        <button
          onClick={() => setShowSqlScripts(!showSqlScripts)}
          className="px-4 py-2 rounded-xl bg-[var(--foreground)]/[0.04] hover:bg-[var(--foreground)]/[0.08] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)] text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
        >
          <FileCode size={14} />
          {showSqlScripts ? "Hide SQL DDL" : "Show SQL DDL"}
        </button>
      </div>

      {showSqlScripts && (
        <div className="space-y-4 animate-fadeIn">
          {initialSchema && (
            <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--foreground)]/[0.01]">
              <div className="px-4 py-3 bg-[var(--foreground)]/[0.03] border-b border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] flex items-center gap-2">
                <DatabaseZap size={14} /> Table Structures (Schema DDL)
              </div>
              <pre className="p-4 text-[11px] font-mono text-[var(--foreground)] overflow-x-auto leading-relaxed max-h-[200px]">
                {initialSchema.trim()}
              </pre>
            </div>
          )}
          {initialData && (
            <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--foreground)]/[0.01]">
              <div className="px-4 py-3 bg-[var(--foreground)]/[0.03] border-b border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] flex items-center gap-2">
                <Play size={14} /> Mock Seed Data (Insert Statements)
              </div>
              <pre className="p-4 text-[11px] font-mono text-[var(--foreground)] overflow-x-auto leading-relaxed max-h-[200px]">
                {initialData.trim()}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {tables.map(table => {
          const isExpanded = !!expandedTables[table.name];
          const hasData = !!tableData[table.name];
          const data = tableData[table.name];
          const isLoading = !!loadingTables[table.name];

          return (
            <div
              key={table.name}
              className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--card)] hover:border-[var(--foreground)]/10 transition-all"
            >
              {/* Accordion Header */}
              <div
                onClick={() => toggleTable(table.name)}
                className="flex items-center justify-between p-4 bg-[var(--foreground)]/[0.01] hover:bg-[var(--foreground)]/[0.03] transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg border border-[var(--primary)]/20">
                    <Table size={16} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-[var(--foreground)]">
                      {table.name}
                    </h4>
                    <p className="text-[9px] font-black uppercase tracking-wider text-[var(--muted-foreground)] mt-0.5">
                      {table.columns.length} columns defined
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => previewTableData(table.name, e)}
                    disabled={isLoading}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all flex items-center gap-1 ${
                      hasData
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20"
                        : "bg-[var(--primary)]/10 border-[var(--primary)]/20 text-[var(--primary)] hover:bg-[var(--primary)]/20"
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : hasData ? (
                      <EyeOff size={12} />
                    ) : (
                      <Eye size={12} />
                    )}
                    {hasData ? "Hide Rows" : "Inspect Data"}
                  </button>
                </div>
              </div>

              {/* Accordion Body */}
              {isExpanded && (
                <div className="border-t border-[var(--border)] p-4 bg-[var(--foreground)]/[0.005] space-y-4 animate-slideDown">
                  {/* Columns List */}
                  <div className="space-y-2">
                    <div className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-3">
                      Fields & Datatypes
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {table.columns.map(col => (
                        <div
                          key={col.name}
                          className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--background)]"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {col.isPrimaryKey && (
                              <Key size={12} className="text-[var(--viz-gold)] shrink-0" />
                            )}
                            {!col.isPrimaryKey && col.isForeignKey && (
                              <Key size={12} className="text-purple-400 shrink-0" />
                            )}
                            <span className="text-[12px] font-bold text-[var(--foreground)] truncate">
                              {col.name}
                            </span>
                          </div>
                          <span className="text-[9px] font-black font-mono uppercase tracking-widest text-[var(--muted-foreground)]">
                            {col.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mock Data preview container */}
                  {hasData && data && (
                    <div className="border-t border-[var(--border)] pt-4 space-y-3">
                      <div className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                        Mock Rows Preview ({data.rows.length} records)
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-[var(--border)] max-h-[300px]">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[var(--foreground)]/[0.03] border-b border-[var(--border)]">
                              {data.headers.map((h, i) => (
                                <th
                                  key={i}
                                  className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {data.rows.map((row, rIdx) => (
                              <tr
                                key={rIdx}
                                className="border-b border-[var(--border)]/50 hover:bg-[var(--foreground)]/[0.01] transition-colors last:border-b-0"
                              >
                                {row.map((val, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className="px-4 py-3 text-[11px] font-medium text-[var(--muted-foreground)] font-mono"
                                  >
                                    {val === "" || val === null ? (
                                      <span className="text-gray-400 italic">NULL</span>
                                    ) : (
                                      val
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
