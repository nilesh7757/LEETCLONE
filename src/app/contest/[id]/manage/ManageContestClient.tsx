"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Settings, ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  slug: string;
}

interface Contest {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  visibility: string;
  accessCode: string | null;
  problems: Problem[];
}

export default function ManageContestClient({ contest }: { contest: Contest }) {
  // Use state for problems in case we add delete functionality later
  const [problems, setProblems] = useState(contest.problems);

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
       {/* Background Gradients */}
      <div className="fixed inset-0 bg-[var(--background)] -z-20 transition-colors duration-300" />
      <div className="fixed inset-0 bg-grid-pattern opacity-10 -z-10" />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href={`/contest/${contest.id}`} className="text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)] flex items-center gap-1 mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to Contest
            </Link>
            <h1 className="text-3xl font-bold text-[var(--foreground)]">{contest.title}</h1>
            <p className="text-[var(--foreground)]/60">Manage Dashboard</p>
          </div>
          <div className="flex gap-3">
            {/* Optional: Add 'Edit Settings' button here */}
          </div>
        </div>

        {/* Problems Section */}
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Contest Problems</h2>
            <Link 
              href={`/problems/new?contestId=${contest.id}`}
              className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New Problem
            </Link>
          </div>

          {problems.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-[var(--card-border)] rounded-lg">
              <p className="text-[var(--foreground)]/50 mb-4">No problems added to this contest yet.</p>
              <Link 
                href={`/problems/new?contestId=${contest.id}`}
                className="text-[var(--accent-gradient-to)] hover:underline font-medium"
              >
                Create your first problem
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--card-border)] text-[var(--foreground)]/60">
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Difficulty</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)]">
                  {problems.map((problem) => (
                    <tr key={problem.id} className="group hover:bg-[var(--foreground)]/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                        {problem.title}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          problem.difficulty === "Easy" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                          problem.difficulty === "Medium" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                          "bg-red-500/10 text-red-500 border-red-500/20"
                        }`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right flex justify-end gap-2">
                         <Link 
                            href={`/problems/${problem.slug}`} 
                            target="_blank"
                            className="p-1.5 text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/10 rounded-md transition-colors"
                            title="View Problem"
                         >
                           <ExternalLink className="w-4 h-4" />
                         </Link>
                         {/* Future: Add Remove/Unlink button */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
