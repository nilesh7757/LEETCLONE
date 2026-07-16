"use client";

import { useState, useRef, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Mail, RefreshCw } from "lucide-react";
import LoginWall from "@/features/auth/components/Login/Wall";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

function VerifyContent() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  if (!email) {
    return (
      <div className="text-center text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-6 py-4">
        Invalid link. Email missing.
      </div>
    );
  }

  const otpString = otp.join("");

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otp];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpString.length < 6) return;
    setLoading(true);
    try {
      await axios.post("/api/verify", { email, otp: otpString });
      toast.success("Email verified! Welcome to LogiQuest 🎉");
      router.push("/login?verified=true");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Verification failed");
      } else {
        toast.error("Verification failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      await axios.post("/api/resend-otp", { email });
      toast.success("New OTP sent to your email!");
      setOtp(["", "", "", "", "", ""]);
      setCountdown(60);
      inputRefs.current[0]?.focus();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Failed to resend OTP");
      } else {
        toast.error("Failed to resend OTP");
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl p-6 sm:p-8">
      {/* Icon */}
      <div className="flex justify-center mb-5">
        <div className="w-14 h-14 rounded-2xl bg-[#8F44F0]/10 border border-[#8F44F0]/20 flex items-center justify-center">
          <ShieldCheck className="w-7 h-7 text-[#8F44F0]" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-[var(--foreground)] text-center mb-1">Check your inbox</h2>
      <p className="text-sm text-[var(--muted-foreground)] text-center mb-1">
        We sent a 6-digit code to
      </p>
      <div className="flex items-center justify-center gap-1.5 mb-6">
        <Mail className="w-3.5 h-3.5 text-[#8F44F0]" />
        <span className="text-sm font-semibold text-[var(--foreground)]">{email}</span>
      </div>

      <form onSubmit={handleVerify} className="flex flex-col gap-6">
        {/* OTP Boxes */}
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`w-11 h-12 text-center text-xl font-bold rounded-lg border transition-all outline-none bg-[var(--background)] text-[var(--foreground)]
                ${digit ? "border-[#8F44F0]/60 bg-[#8F44F0]/10" : "border-[var(--border)] focus:border-[#8F44F0]/50 focus:bg-[var(--foreground)]/5"}
              `}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || otpString.length < 6}
          className="w-full h-11 bg-[#8F44F0] hover:bg-[#7c35d8] text-white font-semibold rounded-full text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Email"}
        </button>
      </form>

      {/* Resend */}
      <div className="mt-5 flex flex-col items-center gap-1">
        <p className="text-xs text-[var(--muted-foreground)]">Didn&apos;t receive the code?</p>
        <button
          onClick={handleResend}
          disabled={resending || countdown > 0}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#8F44F0] hover:text-[#a55ff5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {resending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
        </button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--background)] overflow-hidden relative p-4 sm:p-8">
      {/* Full-screen Background Animation Wall */}
      <LoginWall />

      {/* Floating Theme Toggle Top Bar */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Centered Verify Container */}
      <div className="w-full max-w-[420px] flex flex-col items-center justify-center relative z-10">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <h1 className="text-3xl font-bold tracking-tighter text-[var(--foreground)] mb-2">
            <span className="text-[#8F44F0]">Logi</span>Quest
          </h1>
          <p className="text-[var(--muted-foreground)] text-sm">Verify your email to continue.</p>
        </div>

        <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-[#8F44F0]" />}>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
