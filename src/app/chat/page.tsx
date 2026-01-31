import { MessageSquare, Sparkles } from "lucide-react";

export default function ChatIndexPage() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Deep Space Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--viz-cyan)]/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
         <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[var(--viz-purple)]/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center p-8">
        <div className="w-24 h-24 rounded-[2rem] bg-[var(--card)]/30 backdrop-blur-xl border border-white/10 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(var(--viz-cyan-rgb),0.1)] animate-bounce" style={{ animationDuration: '3s' }}>
          <MessageSquare className="w-10 h-10 text-[var(--viz-cyan)]" />
        </div>
        
        <h2 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[var(--foreground)] to-[var(--foreground)]/40 mb-4">
          Neural Link Inactive
        </h2>
        
        <p className="text-[var(--muted-foreground)] max-w-sm text-sm font-light leading-relaxed">
          Select a <span className="text-[var(--viz-cyan)] font-mono font-bold">Signal</span> from the sidebar or initiate a new transmission sequence from a user profile.
        </p>

        <div className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/50">
            <Sparkles size={12} /> System Standby
        </div>
      </div>
    </div>
  );
}
