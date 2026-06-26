"use client";

import { useState, useRef, useEffect, use } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Bot, User, Loader2, ArrowLeft, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  analysis?: string;
}

export default function TopicLabPage({ params }: { params: Promise<{ topicId: string }> }) {
  const resolvedParams = use(params);
  const topicId = resolvedParams.topicId;
  const searchParams = useSearchParams();
  const topicTitle = searchParams.get("title") || topicId.replace(/-/g, " ");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch(`/api/cs-core/chat?topicId=${topicId}`);
        const data = await res.json();
        
        if (data.messages && data.messages.length > 0) {
          const formatted = data.messages.map((m: { role: "user" | "model", content?: string, text?: string, internal_analysis?: string }) => ({
            id: Math.random().toString(),
            role: m.role,
            content: m.content || m.text || "", 
            analysis: m.internal_analysis
          }));
          setMessages(formatted);
        } else {
          setMessages([{
            id: "1",
            role: "model",
            content: `Welcome to the Feynman Lab for **${topicTitle}**. \n\nI am the CS Core Simplifier AI. To prove you are ready for a 10 LPA interview, I need you to explain this concept to me as if I am a 5-year-old (use an analogy!). \n\nWhenever you are ready, give me your best explanation.`
          }]);
        }
      } catch (err) {
        toast.error("Failed to load history.");
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, [topicId, topicTitle]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/cs-core/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          topic: topicTitle,
          topicId: topicId
        })
      });

      if (!response.ok) throw new Error("API Failed");

      const data = await response.json();
      
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "model",
          content: data.response,
          analysis: data.analysis
        }
      ]);
    } catch (err) {
      toast.error("Failed to connect to the AI tutor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-white font-sans">
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/cs-core" className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-purple-400" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                {topicTitle}
              </span>
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold mt-1">
              Feynman Memory Active
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar max-w-4xl mx-auto w-full">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} gap-2`}
          >
            <div className={`flex items-start gap-4 max-w-[90%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                    : "bg-gradient-to-br from-purple-600 to-pink-600 text-white"
                }`}
              >
                {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div
                className={`p-5 rounded-3xl text-[15px] leading-relaxed shadow-xl whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-[#18181b] border border-white/5 text-gray-100 rounded-tr-none"
                    : "bg-[#18181b] border border-purple-500/20 text-gray-300 rounded-tl-none"
                }`}
              >
                {msg.analysis && (
                  <div className="mb-4 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-xs text-purple-300 italic flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 shrink-0" />
                    <span>{msg.analysis}</span>
                  </div>
                )}
                {msg.content}
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-[#18181b] border border-purple-500/20 p-5 rounded-3xl rounded-tl-none flex items-center shadow-xl">
              <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
              <span className="ml-3 text-sm text-gray-400 font-medium tracking-wide">Synthesizing Feynman Response...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-[#09090b] border-t border-white/5 pb-12">
        <div className="max-w-4xl mx-auto relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Explain your analogy here..."
            className="w-full pl-6 pr-16 py-5 bg-[#18181b] border border-white/10 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 rounded-3xl text-sm text-white outline-none transition-all resize-none h-[72px] custom-scrollbar shadow-inner"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/25"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
