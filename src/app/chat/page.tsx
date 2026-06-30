import { MessageSquare } from "lucide-react";

export default function ChatIndexPage() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden bg-[var(--background)]">
      <div className="relative z-10 flex flex-col items-center text-center p-8 max-w-xs">
        <div className="w-16 h-16 rounded-2xl bg-[var(--muted)]/50 border border-[var(--border)] flex items-center justify-center mb-6 shadow-sm">
          <MessageSquare className="w-6 h-6 text-[var(--muted-foreground)]" />
        </div>
        
        <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] mb-2">
          Your Conversations
        </h2>
        
        <p className="text-[var(--muted-foreground)] text-xs leading-relaxed">
          Select a chat from the sidebar or start a new conversation from a user profile to begin messaging.
        </p>
      </div>
    </div>
  );
}
