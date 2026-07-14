"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import axios from "axios";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";

export default function StudioJoinPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const role = searchParams.get("role");
  const type = searchParams.get("type") || "problem";

  const [isJoining, setIsJoining] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
       router.push(`/login?callbackUrl=${encodeURIComponent(window.location.href)}`);
       return;
    }

    if (status === "authenticated" && token) {
       const joinWorkspace = async () => {
          try {
             const endpoint = type === "problem" 
                ? `/api/problems/join` 
                : `/api/contest/join`;
             
             const { data } = await axios.post(endpoint, { token, role });
             toast.success(`Joined as ${role}`);
             router.push(`/studio/${type}s/${data.id}`);
          } catch (err: unknown) {
             const message = axios.isAxiosError(err)
                ? err.response?.data?.error
                : "Failed to join workspace";
             toast.error(message || "Failed to join workspace");
             router.push("/studio");
          } finally {
             setIsJoining(false);
          }
       };
       joinWorkspace();
    }
  }, [status, token, role, type, router]);

  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center">
       <div className="flex flex-col items-center gap-6 text-center p-12">
          {isJoining ? (
             <>
                <div className="w-16 h-16 border-2 border-[#3b82f6]/20 border-t-[#3b82f6] rounded-full animate-spin" />
                <div className="space-y-2">
                   <h1 className="text-2xl font-black text-white uppercase tracking-tight">Joining Workspace</h1>
                   <p className="text-[#52525b] text-[10px] font-bold uppercase tracking-widest">Verifying invitation token...</p>
                </div>
             </>
          ) : (
             <>
                <AlertCircle className="w-16 h-16 text-rose-500" />
                <div className="space-y-2">
                   <h1 className="text-2xl font-black text-white uppercase tracking-tight">Invalid Invitation</h1>
                   <p className="text-[#52525b] text-[10px] font-bold uppercase tracking-widest">This link may be expired or broken.</p>
                </div>
                <button onClick={() => router.push("/studio")} className="mt-8 px-10 py-4 bg-white text-black rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#3b82f6] hover:text-[var(--foreground)] transition-all">Return to Studio</button>
             </>
          )}
       </div>
    </main>
  );
}
