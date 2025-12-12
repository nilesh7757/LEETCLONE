"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { AlertTriangle, Ban, CheckCircle, XCircle, ShieldAlert, Users, FileText, Lock, Unlock, Eye, EyeOff, Plus, Pencil } from "lucide-react";
import Link from "next/link";

interface Report {
  id: string;
  reason: string;
  createdAt: string;
  submission: {
    id: string;
    code: string;
    status: string;
    user: {
      id: string;
      name: string;
      email: string;
      warnings: number;
      isBanned: boolean;
    };
    problem: {
      title: string;
      slug: string;
    };
  };
  reporter: {
    name: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isBanned: boolean;
  createdAt: string;
  _count: {
    submissions: number;
  };
}

interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  isPublic: boolean;
  createdAt: string;
  creator: {
    name: string;
    email: string;
  } | null;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"reports" | "users" | "problems">("reports");
  
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Data Functions
  const fetchReports = async () => {
    try {
      const { data } = await axios.get("/api/admin/reports");
      setReports(data.reports);
    } catch (error) {
      console.error("Failed to fetch reports", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get("/api/admin/users");
      setUsers(data.users);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const fetchProblems = async () => {
    try {
      const { data } = await axios.get("/api/admin/problems");
      setProblems(data.problems);
    } catch (error) {
      console.error("Failed to fetch problems", error);
    }
  };

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchReports(), fetchUsers(), fetchProblems()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Handlers
  const handleAction = async (action: "WARN" | "BAN" | "DISMISS", report: Report) => {
    try {
      const response = await axios.post("/api/admin/actions", {
        action,
        reportId: report.id,
        userId: report.submission.user.id
      });
      toast.success(response.data.message);
      fetchReports(); 
      fetchUsers(); // Refresh users too as ban status might change
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Action failed");
    }
  };

  const handleBanToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await axios.post("/api/admin/users/ban", { userId, isBanned: !currentStatus });
      toast.success(currentStatus ? "User unbanned" : "User banned");
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to update user status");
    }
  };

  const handleVisibilityToggle = async (problemId: string, currentStatus: boolean) => {
    try {
      await axios.post("/api/admin/problems/toggle", { problemId, isPublic: !currentStatus });
      toast.success(currentStatus ? "Problem hidden" : "Problem published");
      fetchProblems();
    } catch (error: any) {
      toast.error("Failed to update problem visibility");
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--foreground)]"></div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2 text-[var(--foreground)]">
        <ShieldAlert className="w-8 h-8 text-red-500" /> Admin Dashboard
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-[var(--card-border)] pb-1">
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === "reports" 
              ? "bg-[var(--card-bg)] text-[var(--foreground)] border-b-2 border-red-500" 
              : "text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--card-bg)]/50"
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Reports
          {reports.length > 0 && <span className="bg-red-500 text-white text-xs px-1.5 rounded-full">{reports.length}</span>}
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === "users" 
              ? "bg-[var(--card-bg)] text-[var(--foreground)] border-b-2 border-blue-500" 
              : "text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--card-bg)]/50"
          }`}
        >
          <Users className="w-4 h-4" /> Users
        </button>
        <button
          onClick={() => setActiveTab("problems")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
            activeTab === "problems" 
              ? "bg-[var(--card-bg)] text-[var(--foreground)] border-b-2 border-green-500" 
              : "text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--card-bg)]/50"
          }`}
        >
          <FileText className="w-4 h-4" /> Problems
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === "reports" && (
            <>
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Pending Reports</h2>
                {reports.length === 0 ? (
                <p className="text-[var(--foreground)]/60">No pending reports.</p>
                ) : (
                <div className="grid gap-6">
                    {reports.map((report) => (
                    <div key={report.id} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-semibold text-lg text-[var(--foreground)]">
                                Report Reason: <span className="text-red-400">{report.reason}</span>
                            </h3>
                            <p className="text-sm text-[var(--foreground)]/60">
                                Reported by: {report.reporter.name} on {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                            <div className="mt-2 text-sm text-[var(--foreground)]/80">
                                <span className="font-medium">Suspect:</span> {report.submission.user.name} ({report.submission.user.email})
                                <br/>
                                <span className="font-medium">Warnings:</span> {report.submission.user.warnings}/3
                                {report.submission.user.isBanned && <span className="text-red-500 font-bold ml-2">(BANNED)</span>}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleAction("WARN", report)}
                                disabled={report.submission.user.isBanned}
                                className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/10 text-yellow-500 rounded hover:bg-yellow-500/20 disabled:opacity-50 cursor-pointer"
                            >
                                <AlertTriangle className="w-4 h-4" /> Warn
                            </button>
                            <button 
                                onClick={() => handleAction("BAN", report)}
                                disabled={report.submission.user.isBanned}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 disabled:opacity-50 cursor-pointer"
                            >
                                <Ban className="w-4 h-4" /> Ban
                            </button>
                            <button 
                                onClick={() => handleAction("DISMISS", report)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-500/10 text-gray-500 rounded hover:bg-gray-500/20 cursor-pointer"
                            >
                                <CheckCircle className="w-4 h-4" /> Dismiss
                            </button>
                        </div>
                        </div>

                        <div className="bg-[var(--background)] p-4 rounded-md font-mono text-sm overflow-x-auto border border-[var(--card-border)]">
                        <p className="text-xs text-[var(--foreground)]/50 mb-2">
                            Submission for: {report.submission.problem.title} ({report.submission.status})
                        </p>
                        <pre>{report.submission.code}</pre>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </>
        )}

        {activeTab === "users" && (
            <div className="overflow-x-auto rounded-lg border border-[var(--card-border)]">
                <table className="w-full text-left text-sm text-[var(--foreground)]">
                    <thead className="bg-[var(--card-bg)] text-[var(--foreground)]/70 uppercase">
                        <tr>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Submissions</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--card-border)] bg-[var(--background)]">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-[var(--card-bg)]/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-xs text-[var(--foreground)]/50">{user.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{user._count.submissions}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${user.isBanned ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                        {user.isBanned ? "Banned" : "Active"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleBanToggle(user.id, user.isBanned)}
                                        className={`p-2 rounded-full transition-colors cursor-pointer ${user.isBanned ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : "bg-red-500/10 text-red-500 hover:bg-red-500/20"}`}
                                        title={user.isBanned ? "Unban User" : "Ban User"}
                                    >
                                        {user.isBanned ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {activeTab === "problems" && (
            <div className="space-y-4">
                <div className="flex justify-end">
                    <Link
                        href="/problems/new"
                        className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2 transition-opacity"
                    >
                        <Plus className="w-4 h-4" /> Add Problem
                    </Link>
                </div>
                <div className="overflow-x-auto rounded-lg border border-[var(--card-border)]">
                    <table className="w-full text-left text-sm text-[var(--foreground)]">
                        <thead className="bg-[var(--card-bg)] text-[var(--foreground)]/70 uppercase">
                            <tr>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Difficulty</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Visibility</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--card-border)] bg-[var(--background)]">
                            {problems.map((problem) => (
                                <tr key={problem.id} className="hover:bg-[var(--card-bg)]/50 transition-colors">
                                    <td className="px-6 py-4 font-medium">
                                        {problem.title}
                                        <div className="text-xs text-[var(--foreground)]/50">By {problem.creator?.name || "Unknown"}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                                            problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                            'bg-red-500/10 text-red-500'
                                        }`}>
                                            {problem.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{problem.category}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${problem.isPublic ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                            {problem.isPublic ? "Public" : "Private"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <Link
                                            href={`/problems/${problem.slug}/edit`}
                                            className="p-2 rounded-full bg-[var(--foreground)]/10 text-[var(--foreground)] hover:bg-[var(--foreground)]/20 transition-colors"
                                            title="Edit Problem"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleVisibilityToggle(problem.id, problem.isPublic)}
                                            className={`p-2 rounded-full transition-colors cursor-pointer ${problem.isPublic ? "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20" : "bg-green-500/10 text-green-500 hover:bg-green-500/20"}`}
                                            title={problem.isPublic ? "Hide Problem" : "Publish Problem"}
                                        >
                                            {problem.isPublic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
