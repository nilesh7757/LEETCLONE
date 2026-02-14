"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Sparkles, Loader2, Trash2, Volume2, VolumeX, ShieldAlert } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
}

interface TestCase {
  input: string | object;
  expectedOutput?: string | object;
}

interface GeminiChatProps {
  problemId: string;
  problemTitle: string;
  problemDescription: string;
  code: string;
  language: string;
  isInterviewMode?: boolean;
  testCases?: TestCase[];
}

export default function GeminiChat({ 
  problemId, 
  problemTitle, 
  problemDescription, 
  code, 
  language,
  isInterviewMode = false,
  testCases = []
}: GeminiChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isVoiceOn, setIsVoiceOn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice Output
  const speak = useCallback((text: string) => {
    if (!isVoiceOn || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop any current speech
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find(v => v.name.includes('Google') || v.name.includes('Female')) || voices[0];
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }, [isVoiceOn]);

  // periodic interview questions
  useEffect(() => {
    if (!isInterviewMode) return;

    const interval = setInterval(async () => {
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
            isPeriodicQuestion: true,
            testCases
          }
        });

        if (data.response) {
          const aiMsg: Message = { id: Date.now().toString(), role: "model", text: data.response };
          setMessages(prev => [...prev, aiMsg]);
          speak(data.response);
        }
      } catch (err) {
        console.error("Periodic question failed", err);
      }
    }, 45000); 

    return () => clearInterval(interval);
  }, [isInterviewMode, code, messages, isLoading, problemDescription, problemTitle, language, testCases, speak]);

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
    const savedMessages = localStorage.getItem(`gemini_chat_\${problemId}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([
        {
          id: "1",
          role: "model",
          text: `Hi! I'm your AI Tutor. I can help you with "\${problemTitle}". \n\nFeel free to ask for hints, explanation of the problem, or feedback on your code!`,
        },
      ]);
    }
  }, [problemId, problemTitle]);

  // Save chat history to LocalStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`gemini_chat_\${problemId}`, JSON.stringify(messages));
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

    const assistantMessageId = (Date.now() + 1).toString();
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      role: "model",
      text: "",
    };

    setMessages((prev) => [...prev, initialAssistantMessage]);

    try {
      const apiMessages = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      }));

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          context: {
            problemTitle,
            problemDescription, 
            code,
            language,
            testCases
          },
          stream: true
        }),
      });

      if (!response.ok) {
        let errorMessage = "API_ERROR";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch { /* ignore */ }

        if (response.status === 429 || errorMessage === "RATE_LIMIT") {
          throw new Error("RATE_LIMIT");
        }
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          
          setMessages((prev) => 
            prev.map(m => m.id === assistantMessageId ? { ...m, text: fullText } : m)
          );
        }
      }

      if (isVoiceOn) speak(fullText);
    } catch (err: unknown) {
      console.error("Chat error:", err);
      const isRateLimit = err instanceof Error && err.message === "RATE_LIMIT";
      
      if (isRateLimit) {
        setCooldownWithStorage(60);
        toast.error("AI Quota reached. Cooling down for 60s...");
      } else {
        toast.error("Failed to get response from AI.");
      }

      setMessages((prev) => [
        ...prev.filter(m => m.id !== assistantMessageId),
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
      localStorage.removeItem(`gemini_chat_\${problemId}`);
      setMessages([
        {
          id: "1",
          role: "model",
          text: `Hi! I'm your AI Tutor. I can help you with "\${problemTitle}". \n\nFeel free to ask for hints, explanation of the problem, or feedback on your code!`,
        },
      ]);
      toast.success("History cleared");
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Header */}
      <div className={`p-4 flex items-center justify-between z-10 \${isInterviewMode ? 'bg-purple-600/5' : 'bg-transparent'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl \${isInterviewMode ? 'bg-purple-500/20' : 'bg-purple-500/10'}`}>
            {isInterviewMode ? <ShieldAlert className="w-4 h-4 text-purple-500" /> : <Sparkles className="w-4 h-4 text-purple-500" />}
          </div>
          <div>
            <h3 className="font-bold text-sm text-[var(--foreground)] tracking-tight">
              {isInterviewMode ? "Interview Mode" : "AI Tutor"}
            </h3>
            <p className="text-[10px] text-[var(--foreground)]/40 font-bold uppercase tracking-widest">
              {isInterviewMode ? "Real-time assessment" : "Groq Neural Engine"}
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
              className={`p-2 rounded-lg transition-all cursor-pointer \${isVoiceOn ? 'bg-purple-500/20 text-purple-500' : 'text-[var(--foreground)]/30 hover:bg-[var(--foreground)]/5'}`}
              title="Toggle AI Voice"
            >
              {isVoiceOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}
          {messages.length > 1 && (
            <button 
              onClick={handleClearHistory}
              className="p-2 text-[var(--foreground)]/30 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all cursor-pointer"
              title="Clear History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-4 \${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm \${msg.role === "user"
                ? "bg-[var(--foreground)]/10 text-[var(--foreground)]"
                : "bg-purple-600/10 text-purple-500"
              }`}
            >
              {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div
              className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed whitespace-pre-wrap \${msg.role === "user"
                ? "bg-[var(--foreground)]/5 text-[var(--foreground)] rounded-tr-none"
                : "bg-[var(--card)]/40 text-[var(--foreground)]/90 rounded-tl-none"
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
            className="flex items-start gap-4"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-600/10 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-purple-500" />
            </div>
            <div className="bg-[var(--card)]/40 p-4 rounded-3xl rounded-tl-none">
              <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-transparent">
        <div className="relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={cooldown > 0}
            placeholder={cooldown > 0 ? `Neural Cooldown (\${cooldown}s)...` : "Signal your question..."}
            className={`w-full pl-5 pr-14 py-4 bg-[var(--card)]/20 border border-transparent focus:border-purple-500/20 rounded-3xl text-sm text-[var(--foreground)] outline-none transition-all resize-none h-[64px] custom-scrollbar shadow-inner \${cooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || cooldown > 0}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 transition-all shadow-xl shadow-purple-600/30"
          >
            {cooldown > 0 ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-[9px] text-[var(--foreground)]/20 text-center mt-4 font-black uppercase tracking-tighter">
          {cooldown > 0 ? "Neural buffer overflow. Please standby." : "AI responses may be non-deterministic. Verify critical logic."}
        </p>
      </div>
    </div>
  );
}
