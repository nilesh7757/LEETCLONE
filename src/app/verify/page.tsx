"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function VerifyContent() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  if (!email) {
      return <div className="text-center text-red-500">Invalid link. Email missing.</div>;
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        await axios.post("/api/verify", { email, otp });
        toast.success("Verified successfully!");
        router.push("/login?verified=true");
    } catch (error: any) {
        toast.error(error.response?.data?.error || "Verification failed");
    } finally {
        setLoading(false);
    }
  };

  return (
      <div className="w-full max-w-md p-8 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-2 text-[var(--foreground)]">Verify Email</h1>
        <p className="text-center text-sm text-[var(--foreground)]/60 mb-6">
            Enter the OTP sent to <strong>{email}</strong>
        </p>
        <form onSubmit={handleVerify} className="space-y-4">
            <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-3 text-center text-2xl tracking-widest rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50 focus:border-[var(--accent-gradient-to)] text-[var(--foreground)] outline-none"
                maxLength={6}
            />
            <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3 bg-[var(--foreground)] text-[var(--background)] rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Verify"}
            </button>
        </form>
      </div>
  );
}

export default function VerifyPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
            <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin" />}>
                <VerifyContent />
            </Suspense>
        </main>
    )
}
