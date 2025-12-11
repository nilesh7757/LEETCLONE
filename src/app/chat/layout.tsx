import ChatSidebar from "@/components/Chat/ChatSidebar";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-16 h-screen flex bg-[var(--background)]">
      <ChatSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
