"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import LoginWall from "@/features/auth/components/Login/Wall";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCredentialSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Something went wrong during registration.");
    } else {
      if (data.requireVerification) {
        router.push(`/verify?email=${encodeURIComponent(data.email)}`);
        return;
      }

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/problems");
      }
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    await signIn("google", { callbackUrl: "/problems" });
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--background)] overflow-hidden relative p-4 sm:p-8">
      {/* Full-screen Background Animation Wall */}
      <LoginWall />

      {/* Floating Theme Toggle Top Bar */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Centered Signup Container */}
      <div className="w-full max-w-[420px] flex flex-col items-center justify-center relative z-10">
        
        {/* Logo Area */}
        <div className="mb-8 flex flex-col items-center">
            <h1 className="text-3xl font-bold tracking-tighter text-[var(--foreground)] mb-2">
              <span className="text-[#8F44F0]">Logi</span>Quest
            </h1>
            <p className="text-[var(--muted-foreground)] text-sm">Create an account to start coding.</p>
        </div>

        {/* Theme-aware Card Container */}
        <div className="w-full max-w-[420px] bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-[var(--foreground)] text-center mb-6">Sign Up</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-500/10 text-red-500 text-sm rounded-lg text-center border border-red-500/20">
                    {error}
                </div>
            )}

            <form onSubmit={handleCredentialSignup} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">Full Name</label>
                    <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full h-10 px-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:outline-none focus:ring-2 focus:ring-[#8F44F0]/30 focus:border-[#8F44F0]/60 transition-all text-sm"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">Email Address</label>
                    <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full h-10 px-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:outline-none focus:ring-2 focus:ring-[#8F44F0]/30 focus:border-[#8F44F0]/60 transition-all text-sm"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full h-10 px-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:outline-none focus:ring-2 focus:ring-[#8F44F0]/30 focus:border-[#8F44F0]/60 transition-all text-sm pr-10"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 top-0 h-full px-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 mt-2 bg-[#8F44F0] hover:bg-[#7c35d8] text-white font-medium rounded-full text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign Up"}
                </button>
            </form>

            <div className="relative flex items-center my-6">
                <div className="flex-grow border-t border-[var(--border)]"></div>
                <span className="flex-shrink mx-4 text-[var(--muted-foreground)] text-xs uppercase font-medium">Or continue with</span>
                <div className="flex-grow border-t border-[var(--border)]"></div>
            </div>

            <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full h-10 bg-[var(--background)] border border-[var(--border)] hover:bg-[var(--foreground)]/5 text-[var(--foreground)] font-medium rounded-full text-sm transition-all flex items-center justify-center gap-2"
            >
               {/* Google Icon */}
               <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
               Google
            </button>
        </div>

        {/* Footer Text */}
        <div className="mt-8 text-center">
             <p className="text-[var(--muted-foreground)] text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-[var(--foreground)] font-medium hover:underline">
                    Login
                </Link>
             </p>
        </div>
      </div>
    </div>
  );
}
