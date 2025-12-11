"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function ResetContent() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
      return <div className="text-center text-red-500">Invalid link. Token missing.</div>;
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        await axios.post("/api/auth/reset-password", { token, password });
        toast.success("Password reset successfully!");
        router.push("/login");
    } catch (error: any) {
        toast.error(error.response?.data?.error || "Reset failed. Link might be expired.");
    } finally {
        setLoading(false);
    }
  };

  return (
      <div className="w-full max-w-md p-8 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-[var(--foreground)]">Reset Password</h1>
        <form onSubmit={handleReset} className="space-y-4">
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password"
                required
                className="w-full px-4 py-3 rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50 focus:border-[var(--accent-gradient-to)] text-[var(--foreground)] outline-none"
            />
            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[var(--foreground)] text-[var(--background)] rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Reset Password"}
            </button>
        </form>
      </div>
  );
}

export default function ResetPasswordPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
            <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin" />}>
                <ResetContent />
            </Suspense>
        </main>
    )
}
