"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { AlertTriangle, Ban, CheckCircle, XCircle, ShieldAlert } from "lucide-react";

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

export default function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const { data } = await axios.get("/api/admin/reports");
      setReports(data.reports);
    } catch (error) {
      console.error("Failed to fetch reports", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAction = async (action: "WARN" | "BAN" | "DISMISS", report: Report) => {
    try {
      const response = await axios.post("/api/admin/actions", {
        action,
        reportId: report.id,
        userId: report.submission.user.id
      });
      toast.success(response.data.message);
      fetchReports(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Action failed");
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading Admin Dashboard...</div>;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2 text-[var(--foreground)]">
        <ShieldAlert className="w-8 h-8 text-red-500" /> Admin Dashboard
      </h1>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">Pending Reports</h2>
        
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
                        className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/10 text-yellow-500 rounded hover:bg-yellow-500/20 disabled:opacity-50"
                      >
                        <AlertTriangle className="w-4 h-4" /> Warn
                      </button>
                      <button 
                        onClick={() => handleAction("BAN", report)}
                        disabled={report.submission.user.isBanned}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 disabled:opacity-50"
                      >
                        <Ban className="w-4 h-4" /> Ban
                      </button>
                      <button 
                        onClick={() => handleAction("DISMISS", report)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-500/10 text-gray-500 rounded hover:bg-gray-500/20"
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
      </div>
    </div>
  );
}
