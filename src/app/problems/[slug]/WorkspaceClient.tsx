"use client";

import { useState, useEffect, useRef } from "react";
import Split from "react-split";
import { Editor } from "@monaco-editor/react";
import { Settings, RotateCcw, Play, Send, ChevronUp, ChevronDown, CheckCircle, XCircle, AlertTriangle, AlertCircle, ChevronLeft, FileText, History, X, MessageSquare, Flag, Code2, PlusCircle, Bookmark, Trash2, Terminal, Users, Copy, LogOut, Sparkles, Loader2, Pencil, BrainCircuit, BookOpen, Mic, MicOff, Volume2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import DiscussionSection from "@/components/Discussion/DiscussionSection";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { languages, getStarterCode } from "@/lib/starterCode";
import TiptapEditor from "@/components/TiptapEditor";
import Whiteboard from "@/components/Whiteboard";
import GeminiChat from "@/components/GeminiChat";
import BlueprintModal from "@/components/Blueprint/BlueprintModal";

interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  description: string;
  timeLimit: number;
  memoryLimit: number;
  initialSchema?: string | null;
  initialData?: string | null;
  hints?: string[] | null;
  isVerified?: boolean;
  creatorId?: string | null;
  // Added fields from Prisma schema
  type: "CODING" | "SHELL" | "INTERACTIVE" | "SYSTEM_DESIGN" | "SQL" | "READING";
  pattern?: string | null;
  blueprint?: any[] | null;
}

interface WorkspaceClientProps {
  problem: Problem;
  examples: any[];
  showBlueprint?: boolean;
  alreadySolved?: boolean;
}

export default function WorkspaceClient({ problem, examples, showBlueprint = false, alreadySolved = false }: WorkspaceClientProps) {
  const initialCode = problem.type === "SQL" 
      ? "SELECT * FROM Users;" 
      : getStarterCode("javascript"); 
  const initialLanguage = problem.type === "SQL" ? "sql" : "javascript";

  const [isBlueprintComplete, setIsBlueprintComplete] = useState(alreadySolved);
  const [hasStartedAnalysis, setHasStartedAnalysis] = useState(false);
  const [isInterviewMode, setIsInterviewMode] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

  // Load blueprint completion status from localStorage
  useEffect(() => {
    if (!isBlueprintComplete) {
      const savedStatus = localStorage.getItem(`blueprint_complete_${problem.id}`);
      if (savedStatus === 'true') {
        setIsBlueprintComplete(true);
      }
    }
  }, [problem.id, isBlueprintComplete]);

  const handleStartAnalysis = () => {
    setHasStartedAnalysis(true);
  };

  const [code, setCode] = useState(initialCode);
  const codeRef = useRef(initialCode); // Track current code to avoid unnecessary resets

  useEffect(() => {
    // ONLY update the editor instance if the change came from an EXTERNAL source
    // (like a reset, initial load, or collaboration update).
    // We check codeRef.current to see if our internal state already matches.
    if (editorRef.current && code !== codeRef.current) {
       const model = editorRef.current.getModel();
       if (model && code !== model.getValue()) {
          editorRef.current.setValue(code);
       }
    }
    codeRef.current = code;
  }, [code]);

  const [language, setLanguage] = useState(initialLanguage);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [activeTestCaseId, setActiveTestCaseId] = useState(0);
  const [syntaxError, setSyntaxError] = useState<string | null>(null);
  const [editorAndConsoleSizes, setEditorAndConsoleSizes] = useState<number[]>([70, 30]);
  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'submissions' | 'discussion' | 'ai_tutor'>('description');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  
  // Snippets State
  const [showSnippets, setShowSnippets] = useState(false);
  const [snippets, setSnippets] = useState<any[]>([]);
  const [snippetTitle, setSnippetTitle] = useState("");
  const [isSavingSnippet, setIsSavingSnippet] = useState(false);
  
  // Test Cases State
  const [localTestCases, setLocalTestCases] = useState<any[]>(examples);
  const [consoleTab, setConsoleTab] = useState<'testcases' | 'results'>('testcases');
  const [revealedHints, setRevealedHints] = useState<number[]>([]);

  // Collaboration State
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [collabRoomId, setCollabRoomId] = useState<string | null>(null);
  const [joinRoomIdInput, setJoinRoomIdInput] = useState("");
  const collabSocketRef = useRef<Socket | null>(null);
  const isRemoteUpdate = useRef(false);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const remoteCursors = useRef<Map<string, { decorationIds: string[], color: string, username: string }>>(new Map());

  const { data: session } = useSession(); // Access session properly
  
  const [participants, setParticipants] = useState<{ id: string, username: string, color: string, image?: string | null, dbUserId?: string }[]>([]);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);

  // Language Dropdown State
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Reporting State
  const [isReporting, setIsReporting] = useState(false);
  const [isAnalyzingComplexity, setIsAnalyzingComplexity] = useState(false);
  const [isImprovingAI, setIsImprovingAI] = useState(false);
  const [aiImprovementFeedback, setAiImprovementFeedback] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [showReportDialog, setShowReportDialog] = useState(false); // Restored
// ...
  const handleAnalyzeComplexity = async () => {
    if (!selectedSubmission || isAnalyzingComplexity) return;
    setIsAnalyzingComplexity(true);
    try {
      const { data } = await axios.post(`/api/submission/${selectedSubmission.id}/complexity`);
      if (data.success) {
        setSelectedSubmission({
          ...selectedSubmission,
          timeComplexity: data.timeComplexity,
          spaceComplexity: data.spaceComplexity
        });
        // Update in the submissions list too
        setSubmissions(prev => prev.map(s => s.id === selectedSubmission.id ? { ...s, timeComplexity: data.timeComplexity, spaceComplexity: data.spaceComplexity } : s));
        toast.success("Complexity analyzed!");
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("AI Limit reached. Please wait.");
      } else {
        toast.error("Analysis failed.");
      }
    } finally {
      setIsAnalyzingComplexity(false);
    }
  };

  const handleImproveAI = async () => {
    if (!aiImprovementFeedback.trim() || isImprovingAI) return;
    setIsImprovingAI(true);
    toast.info("AI is refining the problem based on your feedback...");
    try {
      const { data } = await axios.post(`/api/problems/${problem.slug}/improve`, {
        feedback: aiImprovementFeedback
      });
      if (data.success) {
        toast.success("Problem improved! Reloading...");
        window.location.reload(); // Refresh to see new description/testsets
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to improve problem.");
    } finally {
      setIsImprovingAI(false);
    }
  };

  const { resolvedTheme } = useTheme();
  const { update } = useSession();
  const [mounted, setMounted] = useState(false);

  // Helper to inject dynamic cursor styles
  const injectCursorStyle = (userId: string, color: string) => {
    const styleId = `cursor-style-${userId}`;
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        .remote-cursor-${userId} {
          background-color: ${color}20; /* Light background selection */
        }
        .remote-cursor-widget-${userId} {
          border-left: 2px solid ${color};
          margin-left: -1px;
        }
        .remote-cursor-widget-${userId}::after {
          content: "${userId}"; 
          position: absolute;
          top: -18px;
          left: 0;
          font-size: 10px;
          color: white;
          background-color: ${color};
          padding: 1px 4px;
          border-radius: 4px;
          white-space: nowrap;
          pointer-events: none;
          z-index: 20;
        }
      `;
      document.head.appendChild(style);
    }
  };
  
  // Helper to generate consistent color from string
  const getColorFromName = (name: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98FB98', '#DDA0DD', '#F0E68C', '#87CEFA'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // --- Collaboration Logic ---
  useEffect(() => {
    return () => {
      if (collabSocketRef.current) {
        collabSocketRef.current.disconnect();
      }
      // Cleanup cursor styles
      remoteCursors.current.forEach((_, userId) => {
         const style = document.getElementById(`cursor-style-${userId}`);
         if (style) style.remove();
      });
    };
  }, []);

  const initCollabSocket = (roomId: string) => {
    if (collabSocketRef.current) collabSocketRef.current.disconnect();

    const socket = io("http://localhost:3001"); // Adjust port/URL if needed
    collabSocketRef.current = socket;

    socket.emit("join_collab", { 
       roomId, 
       username: session?.user?.name || "Anonymous",
       image: session?.user?.image,
       dbUserId: (session?.user as any)?.id // Cast to any to access id if not in default type
    });

    socket.on("code_update", (data: { code: string, language: string, isInit?: boolean }) => {
      isRemoteUpdate.current = true;
      setCode(data.code);
      // Optional: Sync language too if desired, but user might want local pref
      // setLanguage(data.language); 
      if (data.isInit) {
        toast.success("Synced with room code");
      }
      // Reset flag after a short tick to allow local edits again
      // Actually, since setCode is async-ish, we just need to ensure the next render doesn't trigger emit
      setTimeout(() => { isRemoteUpdate.current = false; }, 50); 
    });

    socket.on("cursor_update", (data: { userId: string, username: string, position: any }) => {
       if (!editorRef.current || !monacoRef.current) {
          console.warn("Editor not ready for cursor update");
          return;
       }
       
       // console.log("Cursor update received:", data); // debugging

       let cursorData = remoteCursors.current.get(data.userId);
       if (!cursorData) {
          const color = getColorFromName(data.username);
          injectCursorStyle(data.userId, color);
          cursorData = { decorationIds: [], color, username: data.username };
          remoteCursors.current.set(data.userId, cursorData);
       }
       
       const newDecorations: any[] = [{
          range: new monacoRef.current.Range(data.position.lineNumber, data.position.column, data.position.lineNumber, data.position.column),
          options: {
             // Use className for selection/background (if we had range)
             className: `remote-cursor-${data.userId}`,
             // Use beforeContentClassName for the cursor line itself
             beforeContentClassName: `remote-cursor-widget-${data.userId}`,
             hoverMessage: { value: data.username },
             stickiness: monacoRef.current.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
             zIndex: 100
          }
       }];
       
       // Update dynamic CSS to ensure name is correct (in case username changed or re-init)
       const styleId = `cursor-style-${data.userId}`;
       const style = document.getElementById(styleId);
       if (style) {
          style.innerHTML = `
            .remote-cursor-${data.userId} {
              background-color: ${cursorData.color}20;
            }
            .remote-cursor-widget-${data.userId} {
              border-left: 2px solid ${cursorData.color};
              margin-left: -1px;
            }
            .remote-cursor-widget-${data.userId}::after {
              content: "${data.username}";
              position: absolute;
              top: -18px;
              left: 0;
              font-size: 10px;
              color: white;
              background-color: ${cursorData.color};
              padding: 1px 4px;
              border-radius: 4px;
              white-space: nowrap;
              pointer-events: none;
              z-index: 20;
            }
          `;
       }
       
       cursorData.decorationIds = editorRef.current.deltaDecorations(cursorData.decorationIds, newDecorations);
    });

    socket.on("user_joined_collab", (data: { username: string }) => {
      toast.success(`${data.username} joined the session!`);
    });
    
    socket.on("room_users_update", (users: { id: string, username: string, image?: string, dbUserId?: string }[]) => {
       setParticipants(users.map(u => ({
          ...u,
          color: getColorFromName(u.username)
       })));
    });

    setCollabRoomId(roomId);
    setShowCollabModal(false);
    toast.success("Connected to collaboration session!");

    // Update URL without reload
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("session", roomId);
    window.history.replaceState({}, "", newUrl.toString());

    // Persist session
    localStorage.setItem("active_collab_session", JSON.stringify({
      roomId,
      problemId: problem.id
    }));
  };

  const handleStartCollab = () => {
    const newRoomId = Math.random().toString(36).substring(2, 9);
    initCollabSocket(newRoomId);
  };

  const handleJoinCollab = () => {
    if (!joinRoomIdInput.trim()) return;
    initCollabSocket(joinRoomIdInput.trim());
  };

  const handleLeaveCollab = () => {
    if (collabSocketRef.current) {
      collabSocketRef.current.emit("leave_collab", { roomId: collabRoomId });
      collabSocketRef.current.disconnect();
      collabSocketRef.current = null;
    }
    
    // Cleanup cursors
    if (editorRef.current) {
       remoteCursors.current.forEach((data) => {
          editorRef.current.deltaDecorations(data.decorationIds, []);
       });
    }
    remoteCursors.current.forEach((_, userId) => {
       const style = document.getElementById(`cursor-style-${userId}`);
       if (style) style.remove();
    });
    remoteCursors.current.clear();

    setCollabRoomId(null);
    setParticipants([]);
    toast.info("Left collaboration session");
    
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete("session");
    window.history.replaceState({}, "", newUrl.toString());
    
    localStorage.removeItem("active_collab_session");
  };

  useEffect(() => {
    setMounted(true);
    
    // Check for active collaboration session from URL or LocalStorage
    const sessionParam = searchParams.get("session");
    const savedSession = localStorage.getItem("active_collab_session");
    
    if (sessionParam) {
       // Priority to URL param
       if (collabRoomId !== sessionParam) {
          initCollabSocket(sessionParam);
       }
    } else if (savedSession) {
      try {
        const { roomId, problemId } = JSON.parse(savedSession);
        if (roomId && problemId === problem.id) {
           initCollabSocket(roomId);
        }
      } catch (e) {
        console.error("Failed to restore session", e);
      }
    }
    
    // Click outside handler for language dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEditorWillMount = (monaco: any) => {
    monaco.editor.defineTheme('cream', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: '', foreground: '3E3028', background: 'EAE0D5' },
      ],
      colors: {
        'editor.background': '#EAE0D5',
        'editor.foreground': '#3E3028',
        'editor.lineHighlightBackground': '#D6C8BC',
        'editorCursor.foreground': '#3E3028',
        'editorIndentGuide.background': '#D6C8BC',
        'editorLineNumber.foreground': '#8A6A4B',
      }
    });
  };

  const handleReport = async () => {
    if (!selectedSubmission) return;
    setIsReporting(true);
    try {
      await axios.post("/api/reports/create", {
        submissionId: selectedSubmission.id,
        reason: reportReason || "Suspected AI generation"
      });
      toast.success("Report submitted successfully.");
      setShowReportDialog(false);
      setReportReason("");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to submit report.");
    } finally {
      setIsReporting(false);
    }
  };

  const editorConsoleSplitRef = useRef<any>(null);
  const searchParams = useSearchParams();
  const contestId = searchParams.get("contestId");

  useEffect(() => {
    if (problem.type === "CODING") {
      const savedLanguage = localStorage.getItem("preferredLanguage");
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    }
  }, [problem.type]);

  // Autosave & Load Draft
  useEffect(() => {
    // When language changes, try to load draft
    const draftKey = `draft_${problem.id}_${language}`;
    const savedDraft = localStorage.getItem(draftKey);
    
    if (savedDraft) {
      setCode(savedDraft);
    } else {
      if (problem.type === "CODING") {
        setCode(getStarterCode(language));
      } else if (problem.type === "SQL") {
        setCode("SELECT * FROM Users;"); // Reset to default if no draft
      }
    }
  }, [language, problem.id, problem.type]); // Add problem.type to dependencies

  useEffect(() => {
    // Save draft on code change
    const draftKey = `draft_${problem.id}_${language}`;
    // Debounce saving slightly if needed, but for local storage direct write is usually fine for text
    const defaultCode = problem.type === "SQL" ? "SELECT * FROM Users;" : getStarterCode(language);
    if (code !== defaultCode) {
        localStorage.setItem(draftKey, code);
    }
  }, [code, language, problem.id, problem.type]);

  useEffect(() => {
    if (activeLeftTab === 'submissions') {
      fetchSubmissions();
    }
  }, [activeLeftTab]);

  const fetchSnippets = async () => {
    try {
      const { data } = await axios.get(`/api/snippets?language=${language}`);
      setSnippets(data.snippets);
    } catch (error) {
      console.error("Failed to fetch snippets", error);
    }
  };

  useEffect(() => {
    if (showSnippets) {
      fetchSnippets();
    }
  }, [showSnippets, language]);

  const handleSaveSnippet = async () => {
    if (!snippetTitle.trim()) {
      toast.error("Please enter a title for your snippet.");
      return;
    }
    setIsSavingSnippet(true);
    try {
      await axios.post("/api/snippets", {
        title: snippetTitle,
        code,
        language
      });
      toast.success("Snippet saved!");
      setSnippetTitle("");
      fetchSnippets();
    } catch (error) {
      toast.error("Failed to save snippet.");
    } finally {
      setIsSavingSnippet(false);
    }
  };

  const handleDeleteSnippet = async (id: string) => {
    try {
      await axios.delete(`/api/snippets/${id}`);
      toast.success("Snippet deleted.");
      fetchSnippets();
    } catch (error) {
      toast.error("Failed to delete snippet.");
    }
  };

  const fetchSubmissions = async () => {
    try {
      const { data } = await axios.get(`/api/submission?problemId=${problem.id}&t=${Date.now()}`);
      setSubmissions(data.submissions);
    } catch (error) {
      console.error("Failed to fetch submissions", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (language === "javascript") {
        try {
          new Function(code);
          setSyntaxError(null);
        } catch (e: any) {
          if (e.name === "SyntaxError") {
            setSyntaxError(e.message);
          } else {
             setSyntaxError(null);
          }
        }
      } else {
        setSyntaxError(null);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [code, language]);

  const handleResetCode = () => {
    const defaultCode = problem.type === "SQL" ? "SELECT * FROM Users;" : getStarterCode(language) || "";
    setCode(defaultCode);
    
    // Broadcast reset to collaboration room
    if (collabSocketRef.current && collabRoomId) {
      collabSocketRef.current.emit("code_update", {
        roomId: collabRoomId,
        code: defaultCode,
        language
      });
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setResults(null);
    setSyntaxError(null);
    setConsoleTab('results');
    toast.info("Running code...");

    try {
      let requestBody: any = {
        problemId: problem.id, // Always send problemId
        code,
        type: problem.type, // Send problem type
      };

      if (problem.type === "CODING") {
        requestBody = {
          ...requestBody,
          language,
          testCases: localTestCases.map(e => ({ 
            input: e.input, 
            expectedOutput: (e.expectedOutput === null || e.expectedOutput === undefined) ? "" : String(e.expectedOutput) 
          })), // Safely handle undefined/null output
          timeLimit: problem.timeLimit,
          memoryLimit: problem.memoryLimit,
        };
      } else if (problem.type === "SQL") {
         requestBody = {
            ...requestBody,
            initialSchema: problem.initialSchema,
            initialData: problem.initialData,
            testCases: localTestCases.length > 0 ? localTestCases : [],
         }
      }
      // Add other problem types here

      const { data } = await axios.post("/api/run", requestBody);

      setResults(data.results);
      
      const firstFailedIndex = data.results.findIndex((r: any) => r.status !== "Accepted");
      
      if (firstFailedIndex !== -1) {
        setActiveTestCaseId(firstFailedIndex);
        toast.error(`Test Case ${firstFailedIndex + 1} Failed`);
      } else {
        toast.success("All Test Cases Passed!");
        setActiveTestCaseId(0);
      }
      if (editorAndConsoleSizes[1] < 10) {
          setEditorAndConsoleSizes([60, 40]);
      }

    } catch (error: any) {
      console.error(error);
      toast.error("Execution failed: " + (error.response?.data?.error || error.message));
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    toast.info("Submitting solution...");

    try {
      let requestBody: any = {
        problemId: problem.id,
        code: problem.type === "READING" ? "READING_COMPLETED" : code,
        type: problem.type, 
        language: problem.type === "READING" ? "text" : language
      };

      if (problem.type === "CODING") {
        requestBody = {
          ...requestBody,
          // For submission, test cases are not sent from client. Server uses problem.testSets
        };
      } else if (problem.type === "SQL") {
          requestBody = {
            ...requestBody,
            // SQL might need schemas on server side too if checking against hidden cases
          }
      }
      // Add other problem types here

      const { data } = await axios.post("/api/submission", requestBody);

      if (data.submission.status === "Accepted") {
        toast.success(problem.type === "READING" ? "Study Session Complete! 🎉" : "Accepted! 🎉");
        if (data.newStreak) {
           update({ streak: data.newStreak });
        }
      } else {
        const failed = data.failedTestCase;
        if (failed) {
           toast.error(`Wrong Answer on Input: ${failed.input}`);
           // Also log to console for debugging
           console.log("Failed Test Case:", failed);
           // Show more details in toast description if supported or just relying on console/toast title
           toast.error(`Expected: ${failed.expected} | Output: ${failed.output}`);
        } else {
           toast.error("Wrong Answer 😔");
        }
      }
      
      setActiveLeftTab('submissions');
      fetchSubmissions();

    } catch (error: any) {
      console.error(error);
      toast.error("Submission failed: " + (error.response?.data?.error || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleConsoleHeight = () => {
    if (editorAndConsoleSizes[1] < 5) {
      setEditorAndConsoleSizes([70, 30]);
    } else {
      setEditorAndConsoleSizes([100, 0]);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="h-14 border-b border-[var(--card-border)] flex items-center justify-between px-4 bg-[var(--card-bg)] shrink-0">
        <div className="flex items-center gap-2">
          <Link 
            href={searchParams.get("returnTo") || (contestId ? `/contest/${contestId}` : "/problems")} 
            className="p-1.5 hover:bg-[var(--foreground)]/5 rounded-md transition-colors text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
            title={searchParams.get("returnTo") ? "Back to Previous" : (contestId ? "Back to Contest" : "Back to Problems")}
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="font-semibold text-[var(--foreground)]">{problem.title}</span>
          {!problem.isVerified && (
             <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-yellow-500/20">Draft</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Edit Draft Button */}
          {!problem.isVerified && (session?.user as any)?.id === problem.creatorId && (
             <Link
                href={`/problems/${problem.slug}/edit`}
                className="px-3 py-1.5 text-sm font-medium text-[var(--foreground)]/80 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
             >
                <Pencil className="w-4 h-4" /> Edit Draft
             </Link>
          )}
          {/* Participants List */}
          {problem.type !== "READING" && collabRoomId && participants.length > 0 && (
             <div 
                className="flex items-center -space-x-2 mr-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setShowParticipantsModal(true)}
                title="View all participants"
             >
                {participants.slice(0, 3).map((p) => (
                   <div 
                      key={p.id} 
                      className="w-8 h-8 rounded-full border-2 border-[var(--card-bg)] flex items-center justify-center text-[10px] font-bold text-white shadow-sm overflow-hidden bg-cover bg-center"
                      style={{ 
                         backgroundColor: p.color,
                         backgroundImage: p.image ? `url(${p.image})` : 'none'
                      }}
                   >
                      {!p.image && p.username.substring(0, 2).toUpperCase()}
                   </div>
                ))}
                {participants.length > 3 && (
                   <div className="w-8 h-8 rounded-full border-2 border-[var(--card-bg)] bg-[var(--foreground)]/10 flex items-center justify-center text-[10px] font-medium text-[var(--foreground)]">
                      +{participants.length - 3}
                   </div>
                )}
             </div>
          )}

          {/* Interview Mode Toggle */}
          {problem.type === "CODING" && (
            <button
              onClick={() => {
                setIsInterviewMode(!isInterviewMode);
                if (!isInterviewMode) {
                  toast.info("Interview Mode Active: Auto-complete disabled.");
                  setActiveLeftTab('ai_tutor');
                } else {
                  toast.success("Interview Mode Deactivated.");
                }
              }}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                isInterviewMode 
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20" 
                  : "text-[var(--foreground)]/80 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10"
              }`}
              title="Simulate a real technical interview"
            >
              <Mic className="w-4 h-4" />
              {isInterviewMode ? "Interview On" : "Mock Interview"}
            </button>
          )}

          {/* Collaboration Button */}
          {problem.type !== "SYSTEM_DESIGN" && problem.type !== "READING" && (
             <button
                onClick={() => {
                   if (collabRoomId) {
                      toast.info(`Session ID: ${collabRoomId}`);
                   } else {
                      setShowCollabModal(true);
                   }
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                   collabRoomId 
                      ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                      : "text-[var(--foreground)]/80 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10"
                }`}
                title={collabRoomId ? "Active Session (Click to see ID)" : "Start Collaboration"}
             >
                <Users className="w-4 h-4" />
                {collabRoomId ? "Live" : "Collab"}
             </button>
          )}

          {problem.type !== "SYSTEM_DESIGN" && problem.type !== "READING" && (
            <button 
              onClick={handleRun}
              disabled={isRunning}
              className="px-4 py-1.5 text-sm font-medium text-[var(--foreground)]/80 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-4 h-4 text-[var(--foreground)]/60" /> {isRunning ? "Running..." : "Run"}
            </button>
          )}
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || isRunning}
            className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-green-900/20 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? <span className="animate-spin">⌛</span> : problem.type === "READING" ? <Sparkles className="w-4 h-4" /> : <Send className="w-4 h-4" />} 
            {problem.type === "READING" ? "Complete Session" : "Submit"}
          </button>
        </div>
      </div>

      {problem.type === "READING" ? (
        <div className="flex-1 overflow-y-auto bg-[var(--background)] custom-scrollbar">
          <div className="max-w-4xl mx-auto px-6 py-12">
            {/* Breadcrumbs / Metadata */}
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-500 mb-4">
              <BookOpen className="w-4 h-4" /> Study Guide • {problem.category} • {problem.difficulty}
            </div>

            <h1 className="text-4xl font-black text-[var(--foreground)] mb-8 leading-tight">
              {problem.title}
            </h1>

            {/* Main Content */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-8 md:p-12 shadow-xl shadow-purple-500/5 mb-12">
              <div 
                className="prose prose-invert max-w-none text-[var(--foreground)] font-sans 
                  [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-[var(--foreground)] [&_h1]:mb-6 [&_h1]:pb-2 [&_h1]:border-b [&_h1]:border-[var(--card-border)]
                  [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[var(--foreground)] [&_h2]:mt-10 [&_h2]:mb-4
                  [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-[var(--foreground)] [&_h3]:mt-8 [&_h3]:mb-3
                  [&_p]:text-[var(--foreground)]/80 [&_p]:leading-relaxed [&_p]:mb-6 [&_p]:text-lg
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul]:space-y-2
                  [&_li]:text-[var(--foreground)]/80 [&_li]:text-lg
                  [&_strong]:text-[var(--foreground)] [&_strong]:font-bold
                  [&_code]:bg-purple-500/10 [&_code]:text-purple-400 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm
                  [&_pre]:bg-black/40 [&_pre]:p-6 [&_pre]:rounded-2xl [&_pre]:border [&_pre]:border-[var(--card-border)] [&_pre]:my-8 [&_pre]:overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: problem.description }}
              />

              {/* Completion Footer */}
              <div className="mt-16 pt-12 border-t border-[var(--card-border)] text-center space-y-6">
                <div className="flex flex-col items-center gap-3">
                   <div className="p-4 bg-green-500/10 rounded-full">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                   </div>
                   <h3 className="text-2xl font-bold text-[var(--foreground)]">Finished reading?</h3>
                   <p className="text-[var(--foreground)]/60 max-w-sm">
                      Mark this guide as complete to earn your points and move forward in your study plan.
                   </p>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-purple-500/20 flex items-center gap-3 mx-auto text-lg group cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  Complete Study Session
                </button>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="flex justify-between items-center text-sm text-[var(--foreground)]/40 border-t border-[var(--card-border)] pt-8">
              <span>Topic: {problem.category}</span>
              <span className="flex items-center gap-1">Powered by AI Tutor <Sparkles className="w-3 h-3" /></span>
            </div>
          </div>
        </div>
      ) : (
        <Split
          className="flex-1 flex overflow-hidden"
          sizes={[50, 50]}
          minSize={400}
          gutterSize={8}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
        >
        {/* Left Panel: Description & Submissions */}
        <div className="h-full flex flex-col bg-[var(--background)]">
          {/* Tabs */}
          <div className="h-10 border-b border-[var(--card-border)] flex items-center gap-1 px-2 bg-[var(--card-bg)] shrink-0">
            <button
              onClick={() => setActiveLeftTab('description')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-colors cursor-pointer ${activeLeftTab === 'description' ? "bg-[var(--foreground)]/10 text-[var(--foreground)]" : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"}`}
            >
              <FileText className="w-3.5 h-3.5" /> Description
            </button>
            <button
              onClick={() => setActiveLeftTab('submissions')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-colors cursor-pointer ${activeLeftTab === 'submissions' ? "bg-[var(--foreground)]/10 text-[var(--foreground)]" : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"}`}
            >
              <History className="w-3.5 h-3.5" /> Submissions
            </button>
            <button
              onClick={() => setActiveLeftTab('discussion')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-colors cursor-pointer ${activeLeftTab === 'discussion' ? "bg-[var(--foreground)]/10 text-[var(--foreground)]" : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"}`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Discussion
            </button>
            <button
              onClick={() => setActiveLeftTab('ai_tutor')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-colors cursor-pointer ${activeLeftTab === 'ai_tutor' ? "bg-[var(--foreground)]/10 text-[var(--foreground)]" : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"}`}
            >
              <Sparkles className="w-3.5 h-3.5" /> AI Tutor
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-0 custom-scrollbar relative">
            {activeLeftTab === 'description' ? (
              <div className="prose prose-invert max-w-none p-6">
                <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4">{problem.title}</h1>
                <div className="inline-flex items-center gap-2 mb-6">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    problem.difficulty === "Easy"
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : problem.difficulty === "Medium"
                      ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                      : "bg-red-500/10 text-red-500 border-red-500/20"
                  }`}>
                    {problem.difficulty}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--foreground)]/5 text-[var(--foreground)]/60 border border-[var(--card-border)]">
                    {problem.category}
                  </span>
                </div>

                <div 
                  className="prose max-w-none text-[var(--foreground)] mb-8 font-sans 
                    [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-[var(--foreground)] [&_h1]:mb-6 [&_h1]:block
                    [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[var(--foreground)] [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:block
                    [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-[var(--foreground)] [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:block
                    [&_p]:text-[var(--foreground)]/80 [&_p]:leading-relaxed [&_p]:mb-4
                    [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:text-[var(--foreground)]/80
                    [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:text-[var(--foreground)]/80
                    [&_li]:mb-1 [&_strong]:text-[var(--foreground)] [&_strong]:font-bold"
                  dangerouslySetInnerHTML={{ __html: problem.description }}
                />

                {examples.map((example: any, index: number) => (
                  <div key={index} className="mb-6">
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">Example {index + 1}:</h3>
                    <div className="bg-[var(--card-bg)] p-4 rounded-lg border border-[var(--card-border)] font-mono text-sm">
                      <p className="text-[var(--foreground)]/80 mb-2 whitespace-pre-wrap">
                        <strong className="text-[var(--foreground)]">Input:</strong><br />
                        {typeof example.input === 'object' ? JSON.stringify(example.input) : example.input}
                      </p>
                      <p className="text-[var(--foreground)]/80 whitespace-pre-wrap">
                        <strong className="text-[var(--foreground)]">Output:</strong><br />
                        {typeof example.expectedOutput === 'object' ? JSON.stringify(example.expectedOutput) : example.expectedOutput}
                      </p>
                      {example.explanation && (
                        <p className="text-[var(--foreground)]/80 mt-2">
                          <strong className="text-[var(--foreground)]">Explanation:</strong> {example.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Hints Section - Hidden during contests */}
                {!contestId && problem.hints && problem.hints.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-[var(--card-border)] space-y-4">
                    <h3 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                      <Settings className="w-5 h-5 text-blue-500" /> Hints
                    </h3>
                    <div className="space-y-3">
                      {problem.hints.map((hint, idx) => {
                        const isRevealed = revealedHints.includes(idx);
                        return (
                          <div key={idx} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl overflow-hidden">
                            {!isRevealed ? (
                              <button 
                                onClick={() => setRevealedHints([...revealedHints, idx])}
                                className="w-full px-4 py-3 text-left text-sm font-medium text-blue-500 hover:bg-blue-500/5 transition-colors flex items-center justify-between group"
                              >
                                <span>Show Hint {idx + 1}</span>
                                <PlusCircle className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            ) : (
                              <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 text-sm text-[var(--foreground)]/80 leading-relaxed bg-[var(--background)]/50"
                              >
                                <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Hint {idx + 1}</div>
                                {hint}
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* AI Improvement Section - Only for creators of unverified problems */}
                {!problem.isVerified && (session?.user as any)?.id === problem.creatorId && (
                  <div className="mt-12 pt-8 border-t border-[var(--card-border)] space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      <h3 className="text-lg font-bold text-[var(--foreground)]">Improve with AI</h3>
                    </div>
                    <p className="text-sm text-[var(--foreground)]/60">
                      Not happy with the AI generation? Describe what's wrong (e.g., "Make the test cases harder" or "The description is unclear") and the AI will fix it.
                    </p>
                    <div className="relative">
                      <textarea
                        value={aiImprovementFeedback}
                        onChange={(e) => setAiImprovementFeedback(e.target.value)}
                        placeholder="Type your feedback here..."
                        className="w-full p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--foreground)] focus:ring-2 focus:ring-purple-500/50 outline-none min-h-[100px] resize-y"
                      />
                      <button
                        onClick={handleImproveAI}
                        disabled={isImprovingAI || !aiImprovementFeedback.trim()}
                        className="absolute bottom-3 right-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-lg shadow-purple-900/20 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        {isImprovingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Refine Problem
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : activeLeftTab === 'submissions' ? (
              <div className="space-y-4 p-6">
                <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">My Submissions</h2>
                {submissions.length === 0 ? (
                  <div className="text-[var(--foreground)]/40 text-center py-10 text-sm">
                    No submissions yet.
                  </div>
                ) : (
                  submissions.map((sub: any) => (
                    <div 
                      key={sub.id} 
                      onClick={() => setSelectedSubmission(sub)}
                      className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] flex items-center justify-between hover:border-[var(--foreground)]/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {sub.status === "Accepted" ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <div>
                          <p className={`font-medium ${sub.status === "Accepted" ? "text-green-500" : "text-red-500"}`}>
                            {sub.status}
                          </p>
                          <p className="text-xs text-[var(--foreground)]/60">
                            {new Date(sub.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono bg-[var(--foreground)]/10 px-2 py-1 rounded text-[var(--foreground)]/80">
                          {problem.type === "SYSTEM_DESIGN" && sub.score !== null ? `Score: ${sub.score}%` : sub.language}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : activeLeftTab === 'discussion' ? (
               <div className="p-4">
                  <DiscussionSection problemId={problem.id} />
               </div>
            ) : (
              /* AI Tutor Tab */
            <GeminiChat
              problemId={problem.id}
              problemTitle={problem.title}
              problemDescription={problem.description}
              code={code}
              language={language}
              isInterviewMode={showBlueprint}
              testCases={examples}
            />
            )}
          </div>
        </div>


        {/* Right Panel: Code Editor & Console */}
        <div className="relative h-full flex flex-col overflow-hidden">
          {/* Logic Blueprint Overlay - Blocks only the Editor side */}
          <AnimatePresence>
            {showBlueprint && !isBlueprintComplete && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 bg-[var(--background)]/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
              >
                {!hasStartedAnalysis ? (
                  <div className="max-w-sm space-y-6">
                    <div className="p-4 bg-purple-500/10 rounded-2xl w-fit mx-auto">
                      <BrainCircuit className="w-12 h-12 text-purple-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Analyze & Solve</h2>
                      <p className="text-sm text-[var(--foreground)]/60">
                        To master this pattern, complete a quick conceptual blueprint before writing your code.
                      </p>
                    </div>
                    <button 
                      onClick={handleStartAnalysis}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" /> Start Logic Analysis
                    </button>
                  </div>
                ) : (
                  <div className="absolute inset-0 z-50">
                                            <BlueprintModal 
                                              problemTitle={problem.title}
                                              problemDescription={problem.description}
                                              patternName={problem.pattern || undefined}
                                              onComplete={() => {
                    
                        localStorage.setItem(`blueprint_complete_${problem.id}`, 'true');
                        setIsBlueprintComplete(true);
                        toast.success("Blueprint Complete! Code Editor Unlocked.");
                      }}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {problem.type === "SYSTEM_DESIGN" ? (
            <div className="flex flex-col h-full bg-[var(--background)] border-l border-[var(--card-border)] overflow-hidden">
               <div className="h-10 border-b border-[var(--card-border)] flex items-center justify-between px-4 bg-[var(--card-bg)] shrink-0">
                  <div className="text-sm font-medium text-[var(--foreground)]">Design Document</div>
                  <div className="flex items-center gap-3">
                     <button
                        className="p-1.5 hover:bg-[var(--foreground)]/10 rounded-md transition-colors text-[var(--foreground)]/60 hover:text-[var(--foreground)] cursor-pointer"
                        title="Reset"
                        onClick={() => setCode("")}
                     >
                        <RotateCcw className="w-4 h-4" />
                     </button>
                  </div>
               </div>
               
               <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                  <TiptapEditor 
                     description={code}
                     onChange={(html) => setCode(html)}
                  />
               </div>
            </div>
          ) : (
            <Split
              ref={editorConsoleSplitRef}
              direction="vertical"
              sizes={editorAndConsoleSizes}
              minSize={0}
              gutterSize={8}
              gutterAlign="center"
              snapOffset={30}
              dragInterval={1}
              className="flex flex-col bg-[var(--background)] h-full"
              onDragEnd={(newSizes) => setEditorAndConsoleSizes(newSizes)}
            >
              {problem.type === "CODING" || problem.type === "SQL" ? (
                <div className="flex flex-col h-full min-h-0">
                  <div className="h-10 border-b border-[var(--card-border)] flex items-center justify-between px-4 bg-[var(--background)] shrink-0 z-20">
                    {problem.type === "CODING" && (
                      <div className="relative" ref={langDropdownRef}>
                        <button
                          onClick={() => setIsLangOpen(!isLangOpen)}
                          className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)] hover:text-[var(--foreground)]/80 transition-colors px-2 py-1.5 rounded-md hover:bg-[var(--foreground)]/5 cursor-pointer"
                        >
                          <Code2 className="w-4 h-4 text-green-500" />
                          {languages.find(l => l.value === language)?.label}
                          <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? "rotate-180" : ""}`} />
                        </button>

                        <AnimatePresence>
                          {isLangOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 5, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 5, scale: 0.95 }}
                              transition={{ duration: 0.1 }}
                              className="absolute top-full left-0 mt-1 w-48 bg-[var(--background)] border border-[var(--card-border)] rounded-lg shadow-xl overflow-hidden py-1 z-50"
                            >
                              {languages.map((lang) => (
                                <button
                                  key={lang.value}
                                  onClick={() => {
                                    setLanguage(lang.value);
                                    localStorage.setItem("preferredLanguage", lang.value);
                                    setIsLangOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer ${
                                    language === lang.value ? "text-green-500 bg-[var(--foreground)]/5" : "text-[var(--foreground)]"
                                  }`}
                                >
                                  {lang.label}
                                  {language === lang.value && <CheckCircle className="w-3 h-3" />}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                    {problem.type === "SQL" && (
                       <div className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)] px-2 py-1.5">
                          <Code2 className="w-4 h-4 text-blue-500" /> SQL Query
                       </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      {syntaxError && (
                        <div className="flex items-center gap-1.5 text-red-400 text-xs px-2 py-1 bg-red-500/10 rounded animate-pulse">
                          <AlertCircle className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">{syntaxError}</span>
                        </div>
                      )}
                      <button
                        className="p-1.5 hover:bg-[var(--foreground)]/10 rounded-md transition-colors text-[var(--foreground)]/60 hover:text-[var(--foreground)] cursor-pointer"
                        title="Reset Code"
                        onClick={handleResetCode}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        className={`p-1.5 rounded-md transition-colors cursor-pointer ${showSnippets ? "bg-blue-500/20 text-blue-500" : "text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/10"}`}
                        title="My Snippets"
                        onClick={() => setShowSnippets(!showSnippets)}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 hover:bg-[var(--foreground)]/10 rounded-md transition-colors text-[var(--foreground)]/60 hover:text-[var(--foreground)] cursor-pointer"
                        title="Settings"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 relative min-h-0">
                    <AnimatePresence>
                      {showSnippets && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="absolute top-0 right-0 w-72 h-full bg-[var(--card-bg)] border-l border-[var(--card-border)] z-30 flex flex-col shadow-xl backdrop-blur-md"
                        >
                          <div className="p-4 border-b border-[var(--card-border)] flex items-center justify-between">
                            <h3 className="font-bold text-sm text-[var(--foreground)] flex items-center gap-2">
                              <Terminal className="w-4 h-4 text-blue-500" /> My Snippets
                            </h3>
                            <button onClick={() => setShowSnippets(false)} className="text-[var(--foreground)]/40 hover:text-[var(--foreground)]">
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                            {/* Save Current Code */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/50">Save current code</label>
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  value={snippetTitle}
                                  onChange={(e) => setSnippetTitle(e.target.value)}
                                  placeholder="Snippet title..."
                                  className="flex-1 min-w-0 px-2 py-1.5 bg-[var(--background)] border border-[var(--card-border)] rounded text-xs text-[var(--foreground)] outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <button 
                                  onClick={handleSaveSnippet}
                                  disabled={isSavingSnippet || !code.trim()}
                                  className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                  <PlusCircle className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="h-px bg-[var(--card-border)]" />

                            {/* List Snippets */}
                            <div className="space-y-3">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/50">{language} snippets</label>
                              {snippets.length === 0 ? (
                                <p className="text-[10px] text-[var(--foreground)]/40 text-center py-4 italic">No {language} snippets saved.</p>
                              ) : (
                                snippets.map(snippet => (
                                  <div key={snippet.id} className="group p-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg hover:border-blue-500/30 transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-bold text-[var(--foreground)] truncate pr-2">{snippet.title}</span>
                                      <button 
                                        onClick={() => handleDeleteSnippet(snippet.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-500/10 rounded transition-all"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <button 
                                      onClick={() => {
                                        setCode(prev => prev + "\n" + snippet.code);
                                        setShowSnippets(false);
                                        toast.success("Snippet inserted!");
                                      }}
                                      className="w-full py-1.5 bg-[var(--foreground)]/5 hover:bg-blue-500/10 text-[var(--foreground)] hover:text-blue-500 text-[10px] font-bold rounded border border-[var(--card-border)] transition-all"
                                    >
                                      Insert to Editor
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                                    <Editor
                                      height="100%"
                                      language={language}
                                      theme={mounted && resolvedTheme === "dark" ? "vs-dark" : mounted && resolvedTheme === "cream" ? "cream" : "light"}
                                      beforeMount={handleEditorWillMount}
                                      onMount={(editor, monaco) => {
                                         editorRef.current = editor;
                                         monacoRef.current = monaco;
                                         // Listen for cursor changes
                                         editor.onDidChangeCursorPosition((e) => {
                                            if (collabSocketRef.current && collabRoomId) {
                                               collabSocketRef.current.emit("cursor_move", {
                                                  roomId: collabRoomId,
                                                  position: e.position,
                                                  username: session?.user?.name || "Anonymous"
                                               });
                                            }
                                         });
                                      }}
                                      defaultValue={code}
                                      path={`problem-${problem.id}-${language}`} // Use unique path per language/problem
                                      onChange={(value) => {
                                         const newCode = value || "";
                                         codeRef.current = newCode;
                                         setCode(newCode);
                                         // Emit code change if it's a local edit
                                         if (!isRemoteUpdate.current && collabSocketRef.current && collabRoomId) {
                                            collabSocketRef.current.emit("code_update", {
                                               roomId: collabRoomId,
                                               code: newCode,
                                               language
                                            });
                                         }
                                      }}
                                      options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        padding: { top: 16, bottom: 16 },
                                        renderValidationDecorations: "on",
                                        // Interview Mode restrictions
                                        quickSuggestions: !isInterviewMode,
                                        parameterHints: { enabled: !isInterviewMode },
                                        suggestOnTriggerCharacters: !isInterviewMode,
                                        acceptSuggestionOnEnter: isInterviewMode ? "off" : "on",
                                        snippetSuggestions: isInterviewMode ? "none" : "inline",
                                        wordBasedSuggestions: !isInterviewMode ? "currentDocument" : "off",
                                      }}
                                    />                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full min-h-0 justify-center items-center text-[var(--foreground)]/60 text-lg">
                  <p>Editor not available for this problem type.</p>
                  <p>Please select a different problem type.</p>
                </div>
              )}

              {/* Console Panel Section */}
              <div className="flex flex-col h-full bg-[var(--background)] min-h-0 border-t border-[var(--card-border)]">
                <div className="flex items-center justify-between px-4 h-10 bg-[var(--card-bg)] border-b border-[var(--card-border)] shrink-0 cursor-pointer" onClick={toggleConsoleHeight}>
                  <div className="flex gap-4 items-center h-full">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setConsoleTab('testcases'); }}
                      className={`text-sm font-medium h-full flex items-center border-b-2 transition-colors ${consoleTab === 'testcases' ? 'border-[var(--foreground)] text-[var(--foreground)]' : 'border-transparent text-[var(--foreground)]/60 hover:text-[var(--foreground)]'}`}
                    >
                      Test Cases
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setConsoleTab('results'); }}
                      className={`text-sm font-medium h-full flex items-center border-b-2 transition-colors ${consoleTab === 'results' ? 'border-[var(--foreground)] text-[var(--foreground)]' : 'border-transparent text-[var(--foreground)]/60 hover:text-[var(--foreground)]'}`}
                    >
                      Test Results
                    </button>
                    {results && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        results.every((r: any) => r.status === "Accepted") 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-red-500/20 text-red-400"
                      }`}>
                        {results.filter((r: any) => r.status === "Accepted").length}/{results.length} Passed
                      </span>
                    )}
                  </div>
                  <button 
                    className="text-[var(--foreground)]/60 hover:text-[var(--foreground)] cursor-pointer"
                    title={editorAndConsoleSizes[1] < 5 ? "Show Console" : "Hide Console"}
                  >
                    {editorAndConsoleSizes[1] < 5 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex-1 overflow-hidden flex">
                  {consoleTab === 'testcases' ? (
                     <div className="flex-1 flex overflow-hidden">
                        {/* Test Case Selector */}
                        <div className="w-40 border-r border-[var(--card-border)] bg-[var(--card-bg)] flex flex-col overflow-y-auto custom-scrollbar">
                            {localTestCases.map((_, idx) => (
                               <button
                                  key={idx}
                                  onClick={() => setActiveTestCaseId(idx)}
                                  className={`px-4 py-3 text-sm text-left flex items-center justify-between gap-2 hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer ${activeTestCaseId === idx ? "bg-[var(--foreground)]/10 text-[var(--foreground)]" : "text-[var(--foreground)]/60"}`}
                               >
                                  <span className="truncate">Case {idx + 1}</span>
                                  <X 
                                    className="w-3 h-3 hover:text-red-500" 
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       const newCases = localTestCases.filter((__, i) => i !== idx);
                                       setLocalTestCases(newCases);
                                       if (activeTestCaseId >= newCases.length) setActiveTestCaseId(Math.max(0, newCases.length - 1));
                                    }} 
                                  />
                               </button>
                            ))}
                            <button
                               onClick={() => {
                                  setLocalTestCases([...localTestCases, { input: "", expectedOutput: "" }]);
                                  setActiveTestCaseId(localTestCases.length);
                               }}
                               className="px-4 py-3 text-sm text-center text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer border-t border-[var(--card-border)]"
                            >
                               + Add Case
                            </button>
                        </div>
                        {/* Test Case Editor */}
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                           {localTestCases.length > 0 && localTestCases[activeTestCaseId] ? (
                              <div className="space-y-4 font-mono text-sm">
                                 <div>
                                    <div className="text-[var(--foreground)]/60 mb-2 text-xs uppercase tracking-wider">Input</div>
                                    <textarea
                                       value={typeof localTestCases[activeTestCaseId].input === 'object' ? JSON.stringify(localTestCases[activeTestCaseId].input) : localTestCases[activeTestCaseId].input}
                                       onChange={(e) => {
                                          const newCases = [...localTestCases];
                                          newCases[activeTestCaseId] = { ...newCases[activeTestCaseId], input: e.target.value };
                                          setLocalTestCases(newCases);
                                       }}
                                       className="w-full p-3 bg-[var(--foreground)]/5 rounded-lg text-[var(--foreground)] outline-none focus:ring-1 focus:ring-[var(--foreground)]/20 resize-y min-h-[100px]"
                                       placeholder="Enter input..."
                                    />
                                 </div>
                                 <div>
                                    <div className="text-[var(--foreground)]/60 mb-2 text-xs uppercase tracking-wider">Expected Output</div>
                                    <textarea
                                       value={typeof localTestCases[activeTestCaseId].expectedOutput === 'object' ? JSON.stringify(localTestCases[activeTestCaseId].expectedOutput) : localTestCases[activeTestCaseId].expectedOutput}
                                       onChange={(e) => {
                                          const newCases = [...localTestCases];
                                          newCases[activeTestCaseId] = { ...newCases[activeTestCaseId], expectedOutput: e.target.value };
                                          setLocalTestCases(newCases);
                                       }}
                                       className="w-full p-3 bg-[var(--foreground)]/5 rounded-lg text-[var(--foreground)] outline-none focus:ring-1 focus:ring-[var(--foreground)]/20 resize-y min-h-[100px]"
                                       placeholder="Enter expected output..."
                                    />
                                 </div>
                              </div>
                           ) : (
                              <div className="text-[var(--foreground)]/60 text-center mt-20">
                                 No test cases selected
                              </div>
                           )}
                        </div>
                     </div>
                  ) : (
                     <>
                        {/* Test Results View (Existing) */}
                        <div className="w-40 border-r border-[var(--card-border)] bg-[var(--card-bg)] flex flex-col overflow-y-auto custom-scrollbar">
                          {results ? (
                            results.map((result: any, idx: number) => (
                              <button
                                key={idx}
                                onClick={() => setActiveTestCaseId(idx)}
                                className={`px-4 py-3 text-sm text-left flex items-center gap-2 hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer ${activeTestCaseId === idx ? "bg-[var(--foreground)]/10 text-[var(--foreground)]" : "text-[var(--foreground)]/60"}`}
                              >
                                {result.status === "Accepted" ? (
                                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                ) : result.status === "Runtime Error" ? (
                                  <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                                )}
                                <span className="truncate">Case {idx + 1}</span>
                              </button>
                            ))
                          ) : (
                            <div className="p-4 text-xs text-[var(--foreground)]/60 text-center">No results yet</div>
                          )}
                        </div>

                        {/* Result Details */}
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                          {results && results[activeTestCaseId] ? (
                            <div className="space-y-4 font-mono text-sm">
                              {results[activeTestCaseId].status === "Accepted" ? (
                                <div className="text-green-500 font-semibold text-lg mb-4">Accepted</div>
                              ) : results[activeTestCaseId].status === "Runtime Error" ? (
                                <div className="text-red-500 font-semibold text-lg mb-4">Runtime Error</div>
                              ) : (
                                <div className="text-red-500 font-semibold text-lg mb-4">Wrong Answer</div>
                              )}

                              {results[activeTestCaseId].error ? (
                                <div className="p-4 bg-red-900/20 border border-red-500/20 text-red-400 rounded-lg whitespace-pre-wrap">
                                  {results[activeTestCaseId].error}
                                </div>
                              ) : (
                                <>
                                  <div>
                                    <div className="text-[var(--foreground)]/60 mb-1 text-xs uppercase tracking-wider">Input</div>
                                    <div className="p-3 bg-[var(--foreground)]/5 rounded-lg text-[var(--foreground)] whitespace-pre-wrap mt-1">
                                      {typeof results[activeTestCaseId].input === 'object' ? JSON.stringify(results[activeTestCaseId].input) : results[activeTestCaseId].input}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-[var(--foreground)]/60 mb-1 text-xs uppercase tracking-wider">Output</div>
                                    <div className={`p-3 rounded-lg ${results[activeTestCaseId].status === "Accepted" ? "bg-[var(--foreground)]/5 text-[var(--foreground)]" : "bg-red-900/20 text-red-300"} whitespace-pre-wrap mt-1`}>
                                      {typeof results[activeTestCaseId].actual === 'object' ? JSON.stringify(results[activeTestCaseId].actual) : results[activeTestCaseId].actual}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-[var(--foreground)]/60 mb-1 text-xs uppercase tracking-wider">Expected</div>
                                    <div className="p-3 bg-[var(--foreground)]/5 rounded-lg text-[var(--foreground)] whitespace-pre-wrap mt-1">
                                      {typeof results[activeTestCaseId].expected === 'object' ? JSON.stringify(results[activeTestCaseId].expected) : results[activeTestCaseId].expected}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="text-[var(--foreground)]/60 text-center mt-20">
                              Run your code to see results
                            </div>
                          )}
                        </div>
                     </>
                  )}
                </div>
              </div>
            </Split>
          )}
        </div>
      </Split>
    )}

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
              <div>
                <h3 className="text-lg font-bold text-[var(--foreground)]">Submission Details</h3>
                <p className="text-xs text-[var(--foreground)]/60">{new Date(selectedSubmission.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowReportDialog(true)}
                  className="px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-md transition-colors flex items-center gap-1.5"
                >
                  <Flag className="w-3.5 h-3.5" /> Report
                </button>
                <button 
                  onClick={() => setSelectedSubmission(null)} 
                  className="p-2 text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {showReportDialog && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                 <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-lg w-full max-w-sm shadow-xl space-y-4">
                    <h4 className="font-bold text-lg text-[var(--foreground)]">Report Submission</h4>
                    <p className="text-sm text-[var(--foreground)]/70">Why are you reporting this submission?</p>
                    <textarea
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        placeholder="e.g. Suspected AI generation..."
                        className="w-full p-3 rounded-md bg-[var(--background)] border border-[var(--card-border)] text-sm focus:border-red-500/50 outline-none resize-none h-24"
                    />
                    <div className="flex justify-end gap-2">
                       <button 
                          onClick={() => setShowReportDialog(false)}
                          className="px-4 py-2 text-sm text-[var(--foreground)]/70 hover:bg-[var(--foreground)]/10 rounded-md"
                       >
                          Cancel
                       </button>
                       <button 
                          onClick={handleReport}
                          disabled={isReporting || !reportReason.trim()}
                          className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                       >
                          {isReporting ? "Submitting..." : "Submit Report"}
                       </button>
                    </div>
                 </div>
              </div>
            )}
            
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
              {/* Status & Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--card-border)] flex flex-col items-center justify-center text-center">
                   <div className="text-xs text-[var(--foreground)]/60 mb-1 uppercase tracking-wider">Status</div>
                   <div className={`font-bold text-lg ${selectedSubmission.status === 'Accepted' ? 'text-green-500' : 'text-red-500'}`}>{selectedSubmission.status}</div>
                </div>
                <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--card-border)] flex flex-col items-center justify-center text-center">
                   <div className="text-xs text-[var(--foreground)]/60 mb-1 uppercase tracking-wider">
                      {problem.type === "SYSTEM_DESIGN" ? "Score" : "Runtime"}
                   </div>
                   <div className={`font-bold text-lg ${problem.type === "SYSTEM_DESIGN" ? 'text-blue-500' : 'text-[var(--foreground)]'}`}>
                      {problem.type === "SYSTEM_DESIGN" 
                        ? (selectedSubmission.score !== null ? `${selectedSubmission.score}%` : 'N/A')
                        : (selectedSubmission.runtime !== null ? `${selectedSubmission.runtime} ms` : 'N/A')
                      }
                   </div>
                </div>
                <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--card-border)] flex flex-col items-center justify-center text-center relative group">
                   <div className="text-xs text-[var(--foreground)]/60 mb-1 uppercase tracking-wider">Time Complexity</div>
                   <div className={`font-bold text-lg text-[var(--foreground)] ${isAnalyzingComplexity ? 'animate-pulse opacity-50' : ''}`}>
                      {selectedSubmission.timeComplexity || 'N/A'}
                   </div>
                </div>
                <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--card-border)] flex flex-col items-center justify-center text-center relative group">
                   <div className="text-xs text-[var(--foreground)]/60 mb-1 uppercase tracking-wider">Space Complexity</div>
                   <div className={`font-bold text-lg text-[var(--foreground)] ${isAnalyzingComplexity ? 'animate-pulse opacity-50' : ''}`}>
                      {selectedSubmission.spaceComplexity || 'N/A'}
                   </div>
                </div>

                {/* AI Method Audit Feedback */}
                <div className={`col-span-2 md:col-span-4 p-4 rounded-lg border flex items-start gap-4 ${
                   selectedSubmission.auditPassed === false 
                   ? "bg-red-500/10 border-red-500/20 text-red-200" 
                   : "bg-green-500/10 border-green-500/20 text-green-200"
                }`}>
                   <div className={`p-2 rounded-full ${selectedSubmission.auditPassed === false ? "bg-red-500/20" : "bg-green-500/20"}`}>
                      {selectedSubmission.auditPassed === false ? <XCircle className="w-5 h-5 text-red-500" /> : <CheckCircle className="w-5 h-5 text-green-500" />}
                   </div>
                   <div>
                      <div className="text-xs font-bold uppercase tracking-widest mb-1 opacity-60">AI Method Audit</div>
                      <p className="text-sm leading-relaxed">{selectedSubmission.auditFeedback || "Your code structure was successfully verified."}</p>
                   </div>
                </div>

                {selectedSubmission.testCaseResults && Array.isArray(selectedSubmission.testCaseResults) && (
                  <div className="col-span-2 md:col-span-4 p-4 bg-[var(--background)] rounded-lg border border-[var(--card-border)]">
                    <div className="text-xs text-[var(--foreground)]/60 mb-3 uppercase tracking-wider font-semibold">Test Case Details</div>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                      {selectedSubmission.testCaseResults.map((result: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] text-sm">
                           <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-[var(--foreground)]/80">Case {idx + 1}</span>
                              <div className="flex items-center gap-2">
                                 {result.status !== "Accepted" && (
                                    <button
                                       onClick={() => {
                                          const newCases = [...localTestCases, { 
                                             input: result.input, 
                                             expectedOutput: result.expected 
                                          }];
                                          setLocalTestCases(newCases);
                                          setConsoleTab('testcases');
                                          setActiveTestCaseId(newCases.length - 1);
                                          setSelectedSubmission(null);
                                          toast.success("Test case added to console");
                                                                                     if (editorAndConsoleSizes[1] < 10) {
                                                                                       setEditorAndConsoleSizes([60, 40]);
                                                                                     }                                       }}
                                       className="text-xs flex items-center gap-1 text-[var(--foreground)]/60 hover:text-[var(--foreground)] bg-[var(--foreground)]/5 px-2 py-1 rounded hover:bg-[var(--foreground)]/10 transition-colors"
                                    >
                                       <PlusCircle className="w-3 h-3" /> Use Test Case
                                    </button>
                                 )}
                                 <span className={`px-2 py-0.5 rounded text-xs font-medium ${result.status === "Accepted" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                                    {result.status}
                                 </span>
                              </div>
                           </div>
                           {(result.status !== "Accepted" || problem.type === "SYSTEM_DESIGN") && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 font-mono text-xs">
                                 <div>
                                    <div className="text-[var(--foreground)]/40 mb-1">Input</div>
                                    <div className="p-2 bg-[var(--foreground)]/5 rounded text-[var(--foreground)]/80 break-words whitespace-pre-wrap">
                                      {typeof result.input === 'object' ? JSON.stringify(result.input) : result.input}
                                    </div>
                                 </div>
                                 <div className="md:col-span-2">
                                    <div className="text-[var(--foreground)]/40 mb-1">
                                       {problem.type === "SYSTEM_DESIGN" ? "AI Feedback" : "Output"}
                                    </div>
                                    <div className={`p-2 rounded break-words whitespace-pre-wrap ${result.status === "Accepted" ? "bg-green-500/5 text-green-600" : "bg-red-500/5 text-red-400"}`}>
                                       {typeof result.actual === 'object' ? JSON.stringify(result.actual) : result.actual}
                                    </div>
                                 </div>
                                 {problem.type !== "SYSTEM_DESIGN" && (
                                    <div>
                                       <div className="text-[var(--foreground)]/40 mb-1">Expected</div>
                                       <div className="p-2 bg-green-500/5 text-green-500 rounded break-all">
                                          {typeof result.expected === 'object' ? JSON.stringify(result.expected) : result.expected}
                                       </div>
                                    </div>
                                 )}
                              </div>
                           )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Code View */}
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-[var(--foreground)]">Source Code</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-[var(--foreground)]/10 px-2 py-1 rounded text-[var(--foreground)]/80">
                      {selectedSubmission.language}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedSubmission.code);
                        toast.success("Code copied to clipboard!");
                      }}
                      className="px-3 py-1 text-xs font-medium text-[var(--foreground)]/70 bg-[var(--background)] hover:bg-[var(--foreground)]/10 rounded-md transition-colors border border-[var(--card-border)]"
                      title="Copy Code"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="rounded-lg overflow-hidden border border-[var(--card-border)] h-[400px]">
                   {problem.type === "SYSTEM_DESIGN" ? (
                      <div className="h-full overflow-y-auto bg-[var(--card-bg)] p-4 custom-scrollbar">
                         <TiptapEditor 
                            description={selectedSubmission.code}
                            onChange={() => {}}
                            editable={false}
                         />
                      </div>
                   ) : (
                      <Editor
                         height="100%"
                         language={selectedSubmission.language}
                         theme={mounted && resolvedTheme === "dark" ? "vs-dark" : mounted && resolvedTheme === "cream" ? "cream" : "light"}
                         value={selectedSubmission.code}
                         options={{ 
                           readOnly: true, 
                           minimap: { enabled: false }, 
                           fontSize: 13,
                           scrollBeyondLastLine: false,
                           padding: { top: 16, bottom: 16 }
                         }}
                      />
                   )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collaboration Modal */}
      <AnimatePresence>
        {showCollabModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.95, opacity: 0 }}
               className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-[var(--card-border)] flex items-center justify-between">
                 <h3 className="font-bold text-[var(--foreground)] flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" /> Live Collaboration
                 </h3>
                 <button onClick={() => setShowCollabModal(false)} className="text-[var(--foreground)]/60 hover:text-[var(--foreground)]">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="p-6 space-y-6">
                 {/* Create New Session */}
                 <div className="space-y-3">
                    <h4 className="text-sm font-medium text-[var(--foreground)]">Start a New Session</h4>
                    <p className="text-xs text-[var(--foreground)]/60">Generate a unique room ID to share with others.</p>
                    <button 
                       onClick={handleStartCollab}
                       className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                       <PlusCircle className="w-4 h-4" /> Create Session
                    </button>
                 </div>

                 <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                       <span className="w-full border-t border-[var(--card-border)]" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                       <span className="bg-[var(--card-bg)] px-2 text-[var(--foreground)]/40">Or join existing</span>
                    </div>
                 </div>

                 {/* Join Session */}
                 <div className="space-y-3">
                    <h4 className="text-sm font-medium text-[var(--foreground)]">Join Session</h4>
                    <div className="flex gap-2">
                       <input 
                          type="text" 
                          value={joinRoomIdInput}
                          onChange={(e) => setJoinRoomIdInput(e.target.value)}
                          placeholder="Enter Room ID..."
                          className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-sm text-[var(--foreground)] focus:ring-2 focus:ring-blue-500 outline-none"
                       />
                       <button 
                          onClick={handleJoinCollab}
                          disabled={!joinRoomIdInput.trim()}
                          className="px-4 py-2 bg-[var(--foreground)]/10 hover:bg-[var(--foreground)]/20 text-[var(--foreground)] font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                       >
                          Join
                       </button>
                    </div>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Session Floater */}
      {collabRoomId && (
         <div className="absolute bottom-4 right-4 z-40 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-xl p-3 flex items-center gap-3 animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-2">
               <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
               </span>
               <div className="flex flex-col">
                  <span className="text-xs font-bold text-[var(--foreground)]">Live Session</span>
                  <span className="text-[10px] text-[var(--foreground)]/60 font-mono">{collabRoomId}</span>
               </div>
            </div>
            <div className="h-6 w-px bg-[var(--card-border)]" />
            <button 
               onClick={() => {
                  navigator.clipboard.writeText(collabRoomId);
                  toast.success("Room ID copied!");
               }}
               className="p-1.5 hover:bg-[var(--foreground)]/10 rounded text-[var(--foreground)]/60 hover:text-[var(--foreground)] cursor-pointer"
               title="Copy ID"
            >
               <Copy className="w-4 h-4" />
            </button>
            <button 
               onClick={handleLeaveCollab}
               className="p-1.5 hover:bg-red-500/10 rounded text-[var(--foreground)]/60 hover:text-red-500 cursor-pointer"
               title="Leave Session"
            >
               <LogOut className="w-4 h-4" />
            </button>
         </div>
      )}
      {/* Participants Modal */}
      <AnimatePresence>
        {showParticipantsModal && (
           <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onClick={() => setShowParticipantsModal(false)}
           >
              <motion.div
                 initial={{ scale: 0.95, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 0.95, opacity: 0 }}
                 className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl w-full max-w-sm shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
                 onClick={(e) => e.stopPropagation()}
              >
                 <div className="p-4 border-b border-[var(--card-border)] flex items-center justify-between shrink-0">
                    <h3 className="font-bold text-[var(--foreground)] flex items-center gap-2">
                       <Users className="w-5 h-5 text-blue-500" /> Participants ({participants.length})
                    </h3>
                    <button onClick={() => setShowParticipantsModal(false)} className="text-[var(--foreground)]/60 hover:text-[var(--foreground)]">
                       <X className="w-5 h-5" />
                    </button>
                 </div>
                 <div className="p-2 overflow-y-auto custom-scrollbar">
                    {participants.map((p) => {
                       const content = (
                         <div className="flex items-center gap-3 p-2 hover:bg-[var(--foreground)]/5 rounded-lg transition-colors cursor-pointer">
                            <div 
                               className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0 bg-cover bg-center"
                               style={{ 
                                  backgroundColor: p.color,
                                  backgroundImage: p.image ? `url(${p.image})` : 'none'
                               }}
                            >
                               {!p.image && p.username.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                               <div className="font-medium text-[var(--foreground)] truncate">{p.username}</div>
                               <div className="text-[10px] text-[var(--foreground)]/60 truncate">ID: {p.id.substring(0, 8)}...</div>
                            </div>
                            {p.username === (session?.user?.name || "Anonymous") && (
                               <span className="text-[10px] font-bold bg-green-500/10 text-green-500 px-2 py-0.5 rounded">YOU</span>
                            )}
                         </div>
                       );

                       return p.dbUserId ? (
                          <Link key={p.id} href={`/profile/${p.dbUserId}`} target="_blank">
                             {content}
                          </Link>
                       ) : (
                          <div key={p.id}>{content}</div>
                       );
                    })}
                 </div>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
