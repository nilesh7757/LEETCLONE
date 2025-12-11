"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react"; // Import Clock

interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  isSolved?: boolean; // Added
  isAttempted?: boolean; // Added
}

export default function ProblemTable({ problems }: { problems: Problem[] }) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--card-border)] text-[var(--foreground)]/60">
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Difficulty</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--card-border)]">
            {problems.map((problem, index) => (
              <motion.tr
                key={problem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group hover:bg-[var(--foreground)]/5 transition-colors"
              >
                <td className="px-6 py-4">
                  {problem.isSolved ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" aria-label="Solved" />
                  ) : problem.isAttempted ? (
                    <Clock className="w-5 h-5 text-yellow-500" aria-label="Attempted" />
                  ) : (
                    <span className="inline-block w-3 h-3 rounded-full bg-[var(--foreground)]/20" aria-label="Not attempted"></span>
                  )}
                </td>
                <td className="px-6 py-4 font-medium text-[var(--foreground)]">
                  <Link href={`/problems/${problem.slug}`} className="hover:underline">
                    {problem.title}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      problem.difficulty === "Easy"
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : problem.difficulty === "Medium"
                        ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}
                  >
                    {problem.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4 text-[var(--foreground)]/60">
                  {problem.category}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/problems/${problem.slug}`}
                    className="inline-flex items-center gap-1 text-[var(--foreground)] hover:text-[var(--accent-gradient-to)] transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Solve <ArrowRight className="w-4 h-4" />
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      {problems.length === 0 && (
        <div className="p-12 text-center text-[var(--foreground)]/40">
          No problems found. Try seeding the database.
        </div>
      )}
    </div>
  );
}
