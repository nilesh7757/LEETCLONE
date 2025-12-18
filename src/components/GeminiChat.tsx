"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2, Trash2, Mic, Volume2, VolumeX, ShieldAlert } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
}

interface GeminiChatProps {
  problemId: string;
  problemTitle: string;
  problemDescription: string;
  code: string;
  language: string;
  isInterviewMode?: boolean;
}

export default function GeminiChat({ 
  problemId, 
  problemTitle, 
  problemDescription, 
  code, 
  language,
  isInterviewMode = false
}: GeminiChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isVoiceOn, setIsVoiceOn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice Output
  const speak = (text: string) => {
    if (!isVoiceOn || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop any current speech
    const utterance = new SpeechSynthesisUtterance(text);
    // Find a good professional voice if available
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find(v => v.name.includes('Google') || v.name.includes('Female')) || voices[0];
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // periodic interview questions
  useEffect(() => {
    if (!isInterviewMode) return;

    const interval = setInterval(async () => {
      // Only ask if not already loading and hasn't just asked
      if (isLoading || messages.length === 0) return;
      
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'model' && lastMsg.text.includes('?')) return;

      try {
        const { data } = await axios.post("/api/gemini/chat", {
          messages: messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          context: {
            problemTitle,
            problemDescription,
            code,
            language,
            isInterviewMode: true,
            isPeriodicQuestion: true
          }
        });

        if (data.response) {
          const aiMsg: Message = { id: Date.now().toString(), role: "model", text: data.response };
          setMessages(prev => [...prev, aiMsg]);
          speak(data.response);
        }
      } catch (e) {
        console.error("Periodic question failed", e);
      }
    }, 45000); // Every 45 seconds

    return () => clearInterval(interval);
  }, [isInterviewMode, code, messages, isLoading]);

  // Initialize cooldown from localStorage
  useEffect(() => {
    const checkCooldown = () => {
      const savedCooldownEnd = localStorage.getItem("gemini_cooldown_end");
      if (savedCooldownEnd) {
        const remaining = Math.ceil((parseInt(savedCooldownEnd) - Date.now()) / 1000);
        if (remaining > 0) {
          setCooldown(remaining);
        } else {
          localStorage.removeItem("gemini_cooldown_end");
          setCooldown(0);
        }
      }
    };

    checkCooldown();
    window.addEventListener('storage', checkCooldown);
    return () => window.removeEventListener('storage', checkCooldown);
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            localStorage.removeItem("gemini_cooldown_end");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const setCooldownWithStorage = (seconds: number) => {
    const end = Date.now() + (seconds * 1000);
    localStorage.setItem("gemini_cooldown_end", end.toString());
    setCooldown(seconds);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load chat history from LocalStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem(`gemini_chat_${problemId}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([
        {
          id: "1",
          role: "model",
          text: `Hi! I'm your AI Tutor. I can help you with "${problemTitle}". 

Feel free to ask for hints, explanation of the problem, or feedback on your code!`,
        },
      ]);
    }
  }, [problemId, problemTitle]);

  // Save chat history to LocalStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`gemini_chat_${problemId}`, JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages, problemId]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || cooldown > 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const apiMessages = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      }));

      const { data } = await axios.post("/api/gemini/chat", {
        messages: apiMessages,
        context: {
          problemTitle,
          problemDescription, 
          code,
          language,
        },
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: data.response,
      };

      setMessages((prev) => [...prev, aiMessage]);
      if (isVoiceOn) speak(data.response);
    } catch (error: any) {
      console.error("Chat error:", error);
      const isRateLimit = error.response?.status === 429;
      
      if (isRateLimit) {
        setCooldownWithStorage(60);
        toast.error("AI Quota reached. Cooling down for 60s...");
      } else {
        toast.error("Failed to get response from AI.");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "model",
          text: isRateLimit 
            ? "I'm cooling down! Please wait about 60 seconds before asking another question. This happens on the free tier when we ask too many things quickly."
            : "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && cooldown === 0) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Clear all chat history for this problem?")) {
      localStorage.removeItem(`gemini_chat_${problemId}`);
      setMessages([
        {
          id: "1",
          role: "model",
          text: `Hi! I'm your AI Tutor. I can help you with "${problemTitle}". \n\nFeel free to ask for hints, explanation of the problem, or feedback on your code!`,
        },
      ]);
      toast.success("History cleared");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)]">
      {/* Header */}
      <div className={`p-3 border-b border-[var(--card-border)] flex items-center justify-between shadow-sm z-10 ${isInterviewMode ? 'bg-purple-600/5' : 'bg-[var(--card-bg)]'}`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isInterviewMode ? 'bg-purple-500/20' : 'bg-purple-500/10'}`}>
            {isInterviewMode ? <ShieldAlert className="w-4 h-4 text-purple-500" /> : <Sparkles className="w-4 h-4 text-purple-500" />}
          </div>
          <div>
            <h3 className="font-bold text-sm text-[var(--foreground)]">
              {isInterviewMode ? "Interview Mode" : "AI Tutor"}
            </h3>
            <p className="text-[10px] text-[var(--foreground)]/60">
              {isInterviewMode ? "Real-time assessment" : "Powered by Groq Llama 3.3"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {isInterviewMode && (
            <button
              onClick={() => {
                setIsVoiceOn(!isVoiceOn);
                if (!isVoiceOn) toast.success("AI Voice Enabled");
              }}
              className={`p-2 rounded-lg transition-all cursor-pointer ${isVoiceOn ? 'bg-purple-500/20 text-purple-500' : 'text-[var(--foreground)]/40 hover:bg-[var(--foreground)]/5'}`}
              title="Toggle AI Voice"
            >
              {isVoiceOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}
          {messages.length > 1 && (
            <button 
              onClick={handleClearHistory}
              className="p-2 text-[var(--foreground)]/40 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all cursor-pointer"
              title="Clear History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user"
                ? "bg-[var(--foreground)]/10 text-[var(--foreground)]"
                : "bg-purple-600 text-white"
              }`}
            >
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div
              className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user"
                ? "bg-[var(--foreground)]/10 text-[var(--foreground)] rounded-tr-none"
                : "bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)]/90 rounded-tl-none shadow-sm"
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-3 rounded-2xl rounded-tl-none shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[var(--card-border)] bg-[var(--card-bg)]">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={cooldown > 0}
            placeholder={cooldown > 0 ? `Cooling down (${cooldown}s)...` : "Ask a question..."}
            className={`w-full pl-4 pr-12 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-purple-500/50 resize-none h-[50px] custom-scrollbar ${cooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || cooldown > 0}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 transition-colors"
          >
            {cooldown > 0 ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[10px] text-[var(--foreground)]/40 text-center mt-2">
          {cooldown > 0 ? "Quota hit. Waiting for reset..." : "AI can make mistakes. Review generated code."}
        </p>
      </div>
    </div>
  );
}