"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/auth/forgot-password", { email });
      setSent(true);
      toast.success("Reset link sent!");
    } catch (error) {
      toast.error("Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md p-8 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-4 text-[var(--foreground)]">Forgot Password</h1>
        
        {sent ? (
          <div className="text-center text-[var(--foreground)]/80">
            <p className="mb-4">Check your email for a reset link.</p>
            <p className="text-sm">Didn't receive it? Check spam or try again later.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 rounded-lg border border-[var(--card-border)] bg-[var(--background)]/50 focus:border-[var(--accent-gradient-to)] text-[var(--foreground)] outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--foreground)] text-[var(--background)] rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
