import { MessageSquare } from "lucide-react";

export default function ChatIndexPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-[var(--foreground)]/40 p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--foreground)]/5 flex items-center justify-center mb-6">
        <MessageSquare className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Select a Conversation</h2>
      <p>Choose a chat from the sidebar or start a new one from a user profile.</p>
    </div>
  );
}
