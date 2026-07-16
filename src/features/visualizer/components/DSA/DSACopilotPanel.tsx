"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Trash2, X, RefreshCw, AlertCircle, BookOpen, Compass, HelpCircle } from "lucide-react";
import DOMPurify from "dompurify";
import { marked } from "marked";

interface Message {
  role: "user" | "model";
  content: string;
}

interface DSACopilotPanelProps {
  algorithmId: string;
  algorithmName: string;
  isMobile?: boolean;
  onClose?: () => void;
  onFocus?: () => void;
}

const MarkdownRenderer = ({ content }: { content: string }) => {
  const [html, setHtml] = useState("");

  useEffect(() => {
    const parse = async () => {
      const parsed = await marked.parse(content || "");
      setHtml(DOMPurify.sanitize(parsed));
    };
    parse();
  }, [content]);

  return (
    <div 
      className="markdown-body prose prose-invert max-w-none text-[11px] md:text-xs leading-relaxed prose-p:leading-relaxed prose-pre:bg-black/20 prose-pre:border prose-pre:border-white/5 prose-code:text-[10px] prose-code:font-mono" 
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
};

export default function DSACopilotPanel({ algorithmId, algorithmName, isMobile = false, onClose, onFocus }: DSACopilotPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load chat history
  useEffect(() => {
    const fetchChat = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/dsa/chat?algorithmId=${algorithmId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error("Failed to load chat:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChat();
  }, [algorithmId]);

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputValue).trim();
    if (!prompt) return;

    if (!textToSend) {
      setInputValue("");
    }
    setError(null);

    const updatedMessages: Message[] = [...messages, { role: "user", content: prompt }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/dsa/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          algorithmId,
          algorithmName,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await res.json();
      setMessages([...updatedMessages, { role: "model", content: data.response }]);
    } catch (err) {
      console.error(err);
      setError("Failed to get response from Gemini. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear chat
  const handleClearChat = async () => {
    setMessages([]);
    setError(null);
    try {
      await fetch("/api/dsa/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [],
          algorithmId,
          algorithmName,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const suggestions = [
    { text: "What to do next?", label: "Suggest next steps", icon: Compass },
    { text: "What are some practice questions to solve?", label: "Give practice questions", icon: HelpCircle },
    { text: "Provide resources to read.", label: "Give resources", icon: BookOpen }
  ];

  return (
    <div className={`flex flex-col h-full bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden ${isMobile ? "text-[11px] max-h-full" : "text-xs"}`}>
      {/* Header */}
      <div className="p-3 border-b border-[var(--border)]/45 bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#3b82f6]/10 text-[#3b82f6] rounded-lg">
            <Sparkles size={14} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--foreground)] tracking-tight">AI Copilot</h3>
            <p className="text-[9px] text-[var(--muted-foreground)]/50 tracking-tight">{algorithmName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button 
              onClick={handleClearChat}
              className="p-1.5 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-all cursor-pointer"
              title="Clear Conversation"
            >
              <Trash2 size={13} />
            </button>
          )}

        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex flex-col justify-center items-center p-4 text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-[#3b82f6]/5 border border-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6]">
              <Sparkles size={18} />
            </div>
            <div>
              <h4 className="font-bold text-[var(--foreground)] text-xs">Ask anything about {algorithmName}</h4>
              <p className="text-[10px] text-[var(--muted-foreground)]/50 max-w-[200px] mt-1">Get Socratic tutoring, practice suggestions, or system design insights.</p>
            </div>
            <div className="w-full space-y-2 mt-4 max-w-xs">
              {suggestions.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <button 
                    key={idx}
                    onClick={() => {
                      onFocus?.();
                      handleSendMessage(s.text);
                    }}
                    className="w-full text-left p-2.5 bg-[var(--muted)]/20 hover:bg-[var(--muted)]/40 border border-[var(--border)]/45 rounded-xl transition-all flex items-center gap-2 text-[10px] cursor-pointer"
                  >
                    <Icon size={12} className="text-[#3b82f6]" />
                    <span className="font-semibold text-[var(--foreground)]/80">{s.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl ${
                isUser 
                  ? "bg-[#3b82f6] text-white rounded-br-none" 
                  : "bg-[var(--muted)]/20 border border-[var(--border)]/45 text-[var(--foreground)] rounded-bl-none"
              }`}>
                {isUser ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                ) : (
                  <MarkdownRenderer content={msg.content} />
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[var(--muted)]/20 border border-[var(--border)]/45 text-[var(--foreground)] p-3 rounded-2xl rounded-bl-none flex items-center gap-2">
              <RefreshCw size={12} className="animate-spin text-[#3b82f6]" />
              <span className="text-[10px] text-[var(--muted-foreground)]/70">Copilot is thinking...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-2 text-[10px]">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-2 border-t border-[var(--border)]/45 bg-muted/10">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="flex items-center gap-1.5"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={onFocus}
            placeholder={`Ask about ${algorithmName}...`}
            disabled={isLoading}
            className="flex-1 bg-[var(--muted)]/15 border border-[var(--border)]/75 focus:border-[#3b82f6]/50 rounded-xl px-3 py-2 text-[10px] md:text-xs font-bold text-[var(--foreground)] placeholder:text-muted-foreground/30 focus:outline-none disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={isLoading || !inputValue.trim()}
            className="p-2 bg-[#3b82f6] hover:bg-[#3b82f6]/95 disabled:bg-muted disabled:text-muted-foreground text-white rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer shrink-0"
          >
            <Send size={12} />
          </button>
        </form>
      </div>
    </div>
  );
}
