"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Heart, Trophy, Zap, AlertTriangle, HelpCircle,
  BookOpen, Code, Server, Cpu, RefreshCw, Play, ArrowRight,
  TrendingUp, Award, Sparkles, Terminal, LogOut, Check, X,
  Bookmark, CheckCircle2, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import axios from "axios";

interface Obstacle {
  topic: string;
  subtopic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
  question: string;
  codeBlock?: string;
  language?: string;
  options: string[];
  correctOptionIndex: number;
  hint: string;
  explanation: string;
  realWorldConnection: string;
}

const TOPICS = [
  { id: "RANDOM", title: "Omni Arena", desc: "Adaptive challenges across all CS subjects.", icon: Sparkles, color: "from-purple-500 to-indigo-500", border: "border-purple-500/20" },
  { id: "DBMS", title: "Database Systems", desc: "Normalization, Isolation Levels, MVCC, Indexing structures, Execution plans.", icon: Server, color: "from-blue-500 to-cyan-500", border: "border-blue-500/20" },
  { id: "OS", title: "Operating Systems", desc: "Virtual Memory, Kernel Internals, Paging, Scheduling, Concurrency primitives.", icon: Cpu, color: "from-emerald-500 to-teal-500", border: "border-emerald-500/20" },
  { id: "SYSTEM_DESIGN", title: "System Design", desc: "Consistent hashing, Replication protocols, CAP, Cache patterns, Scalability.", icon: BookOpen, color: "from-amber-500 to-orange-500", border: "border-amber-500/20" },
  { id: "OOPS", title: "Object Oriented Design", desc: "vtables, Design patterns, SOLID, Dynamic dispatch, Abstract layouts.", icon: Shield, color: "from-pink-500 to-rose-500", border: "border-pink-500/20" },
  { id: "CODING_LOGIC", title: "Coding & Complexity", desc: "Bitwise hacks, custom hashes (anti-CF tests), Recurrence relations, Complexity bounds.", icon: Code, color: "from-indigo-500 to-blue-500", border: "border-indigo-500/20" }
];

export default function CsCoreArena() {
  const [gameState, setGameState] = useState<"START" | "PLAYING" | "ENDED">("START");
  const [selectedTopic, setSelectedTopic] = useState<string>("RANDOM");
  
  // Gameplay State
  const [currentObstacle, setCurrentObstacle] = useState<Obstacle | null>(null);
  const [loadingObstacle, setLoadingObstacle] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [lives, setLives] = useState<number>(3);
  const [maxLives] = useState<number>(3);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD" | "EXPERT">("MEDIUM");
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [maxTime, setMaxTime] = useState<number>(45);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Interaction State
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);
  const [history, setHistory] = useState<(Obstacle & { userSelected: number | null; wasCorrect: boolean })[]>([]);
  const [recentQuestionTexts, setRecentQuestionTexts] = useState<string[]>([]);
  
  // Visual effects
  const [shakeScreen, setShakeScreen] = useState<boolean>(false);

  // Fetch next question
  const fetchNextObstacle = useCallback(async (currentScore: number, currentStreak: number, currentLevel: number) => {
    setLoadingObstacle(true);
    setShowExplanation(false);
    setShowHint(false);
    setSelectedAnswer(null);

    // Calculate dynamic difficulty
    let targetDifficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT" = "MEDIUM";
    if (currentStreak >= 6 || currentLevel >= 4) {
      targetDifficulty = "EXPERT";
    } else if (currentStreak >= 3 || currentLevel >= 3) {
      targetDifficulty = "HARD";
    } else if (currentStreak <= 1 && currentLevel <= 1) {
      targetDifficulty = "EASY";
    }
    setDifficulty(targetDifficulty);

    try {
      const res = await axios.post("/api/arcade/generate-obstacle", {
        topic: selectedTopic,
        difficulty: targetDifficulty,
        score: currentScore,
        recentQuestions: recentQuestionTexts
      });

      if (res.data) {
        setCurrentObstacle(res.data);
        setRecentQuestionTexts(prev => [...prev.slice(-10), res.data.question]);

        // Calculate dynamic timer limit based on question & code block length
        const qWords = res.data.question.split(/\s+/).filter(Boolean).length;
        const cWords = res.data.codeBlock ? res.data.codeBlock.split(/\s+/).filter(Boolean).length : 0;
        const totalWords = qWords + cWords;
        
        // 2 words per second reading speed + 15 seconds base thinking/answering time
        const readingTime = Math.ceil(totalWords / 2.0);
        const baseThinkingTime = 15;
        const calculatedTime = Math.min(Math.max(readingTime + baseThinkingTime, 20), 80);
        
        setMaxTime(calculatedTime);
        setTimeLeft(calculatedTime);
      }
    } catch (err) {
      toast.error("Failed to load obstacle. Activating fallback generator.");
    } finally {
      setLoadingObstacle(false);
    }
  }, [selectedTopic, recentQuestionTexts]);

  // Start game sequence
  const handleStartGame = () => {
    setScore(0);
    setLevel(1);
    setLives(maxLives);
    setStreak(0);
    setMaxStreak(0);
    setQuestionsAnswered(0);
    setHistory([]);
    setRecentQuestionTexts([]);
    setGameState("PLAYING");
    fetchNextObstacle(0, 0, 1);
  };

  // Timer loop
  useEffect(() => {
    if (gameState === "PLAYING" && !loadingObstacle && !showExplanation && currentObstacle) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, loadingObstacle, showExplanation, currentObstacle]);

  // Handle running out of time
  const handleTimeout = () => {
    if (!currentObstacle) return;
    
    setShakeScreen(true);
    setTimeout(() => setShakeScreen(false), 500);

    setLives((prev) => {
      const nextLives = prev - 1;
      if (nextLives <= 0) {
        triggerEndGame(score);
      }
      return nextLives;
    });

    setStreak(0);
    setSelectedAnswer(-1); // Indicator for timeout
    setShowExplanation(true);
    setQuestionsAnswered((q) => q + 1);

    setHistory(prev => [...prev, {
      ...currentObstacle,
      userSelected: null,
      wasCorrect: false
    }]);

    toast.error("TIME EXPIRED! Systems overloaded.", {
      icon: <AlertCircle className="text-red-500" />
    });
  };

  // Handle answering
  const handleAnswerSelect = async (index: number) => {
    if (selectedAnswer !== null || showExplanation || !currentObstacle) return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedAnswer(index);
    setShowExplanation(true);
    setQuestionsAnswered((q) => q + 1);

    const isCorrect = index === currentObstacle.correctOptionIndex;
    
    // Calculate streak multipliers
    const streakBonus = Math.floor(streak / 2);
    const difficultyMultiplier = 
      difficulty === "EXPERT" ? 2.5 : 
      difficulty === "HARD" ? 1.8 : 
      difficulty === "MEDIUM" ? 1.2 : 1.0;

    if (isCorrect) {
      const pointsEarned = Math.floor(100 * difficultyMultiplier * (1 + streakBonus * 0.2));
      setScore((s) => s + pointsEarned);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > maxStreak) setMaxStreak(nextStreak);
      
      // Heart recovery at streaks of 4
      if (nextStreak % 4 === 0) {
        setLives(l => Math.min(l + 1, maxLives));
        toast.success("STREAK SHIELD ACTIVE: Live recovered!");
      }

      // Check level-up
      const calculatedLevel = Math.floor(questionsAnswered / 3) + 1;
      if (calculatedLevel > level) {
        setLevel(calculatedLevel);
        const confetti = (await import("canvas-confetti")).default;
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 }
        });
        toast.success(`LEVEL UP! You reached Tier ${calculatedLevel}`);
      }

      // Confetti for correct answers on specialist streaks
      if (nextStreak >= 3) {
        const confetti = (await import("canvas-confetti")).default;
        confetti({
          particleCount: 30,
          spread: 40,
          origin: { y: 0.9 }
        });
      }

      toast.success("CORRECT SYSTEM ARCHITECTURE VETTED!", {
        icon: <CheckCircle2 className="text-emerald-500" />
      });

      setHistory(prev => [...prev, {
        ...currentObstacle,
        userSelected: index,
        wasCorrect: true
      }]);

    } else {
      setShakeScreen(true);
      setTimeout(() => setShakeScreen(false), 500);

      // Score deduction
      setScore((s) => Math.max(0, s - 50));
      setStreak(0);
      
      setLives((prev) => {
        const nextLives = prev - 1;
        if (nextLives <= 0) {
          triggerEndGame(score - 50);
        }
        return nextLives;
      });

      toast.error("VULNERABILITY DETECTED! Option compromise.", {
        icon: <AlertTriangle className="text-rose-500" />
      });

      setHistory(prev => [...prev, {
        ...currentObstacle,
        userSelected: index,
        wasCorrect: false
      }]);
    }
  };

  const triggerEndGame = async (finalScore: number) => {
    setGameState("ENDED");
    if (timerRef.current) clearInterval(timerRef.current);
    
    const validatedScore = Math.max(0, finalScore);
    try {
      await axios.post("/api/arcade/score", {
        gameId: "CS_CORE_ARENA",
        score: validatedScore
      });
      toast.success("Neural score indexed on global leaderboard!");
    } catch (error) {
      console.error("Score index failed", error);
    }
  };

  return (
    <div className={`min-h-screen bg-[#09090b] text-gray-100 p-4 md:p-8 flex flex-col items-center justify-start overflow-x-hidden relative ${shakeScreen ? 'animate-shake' : ''}`}>
      {/* Dynamic scanlines & carbon grids */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#09090b] via-transparent to-[#09090b] pointer-events-none z-0" />
      
      {/* Background glow flares */}
      <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[20%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-5xl relative z-10 flex-1 flex flex-col">
        {/* START SCREEN */}
        {gameState === "START" && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col justify-center items-center py-8"
          >
            <div className="text-center space-y-3 mb-8 max-w-2xl px-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] sm:text-xs font-black tracking-[0.25em] uppercase mb-1">
                <Terminal size={12} /> System Sandbox V2.0
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter">
                CS CORE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-500">NEURAL ARENA</span>
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm md:text-base leading-relaxed">
                Step into the high-intensity interview training sandbox. Tackle dynamic, AI-generated technical questions designed to stress-test your DBMS, OS, System Design, OOPS, and Coding Logic.
              </p>
            </div>

            {/* TOPIC SELECTION */}
            <div className="w-full space-y-4 mb-10 px-1">
              <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-gray-500 border-b border-gray-800 pb-2">Select Arena Sector</h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {TOPICS.map((topic) => {
                  const Icon = topic.icon;
                  const isSelected = selectedTopic === topic.id;
                  return (
                    <div
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic.id)}
                      className={`relative p-3.5 sm:p-5 rounded-2xl bg-zinc-900/40 border cursor-pointer transition-all duration-300 group hover:scale-[1.02] flex flex-col justify-between h-28 sm:h-40 ${
                        isSelected 
                          ? "border-cyan-500/70 bg-gradient-to-br from-cyan-950/20 to-zinc-900/40 shadow-[0_0_25px_rgba(6,182,212,0.15)]" 
                          : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/30"
                      }`}
                    >
                      <div className="flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start">
                          <div className={`p-1.5 sm:p-2.5 rounded-xl bg-gradient-to-br ${topic.color} text-white shadow-lg`}>
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          {isSelected && (
                            <span className="text-[8px] sm:text-[10px] bg-cyan-500/20 border border-cyan-500/30 px-1.5 sm:px-2 py-0.5 rounded font-black text-cyan-400 tracking-wider">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-base font-black text-white group-hover:text-cyan-400 transition-colors mt-2 leading-tight">{topic.title}</h4>
                          <p className="text-[10px] text-gray-400 line-clamp-2 mt-1 font-medium hidden sm:block">{topic.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PLAY INITIATE BUTTON */}
            <button
              onClick={handleStartGame}
              className="px-12 py-5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase text-sm tracking-[0.2em] transition-all flex items-center gap-3 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95"
            >
              Initiate Neural Vector <Play size={16} fill="black" />
            </button>
          </motion.div>
        )}

        {/* PLAYING STATE */}
        {gameState === "PLAYING" && (
          <div className="flex-1 flex flex-col gap-6 py-4">
            {/* STATS HEADER */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-md">
              <div className="flex flex-col items-center justify-center p-1.5 sm:p-2 border-r border-zinc-800/50">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1">
                  <Trophy size={10} className="text-amber-500" /> Score
                </span>
                <span className="text-lg sm:text-2xl font-black font-mono text-white mt-0.5 sm:mt-1">{score}</span>
              </div>

              <div className="flex flex-col items-center justify-center p-1.5 sm:p-2 md:border-r border-zinc-800/50">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1">
                  <Zap size={10} className="text-cyan-400" /> Streak
                </span>
                <span className="text-lg sm:text-2xl font-black font-mono text-cyan-400 mt-0.5 sm:mt-1">
                  {streak}x
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-1.5 sm:p-2 border-r border-zinc-800/50">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500">Tier Level</span>
                <span className="text-lg sm:text-2xl font-black font-mono text-white mt-0.5 sm:mt-1">0{level}</span>
              </div>

              <div className="flex flex-col items-center justify-center p-1.5 sm:p-2 md:border-r border-zinc-800/50">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500">Lives</span>
                <div className="flex gap-1 mt-1.5 sm:mt-2">
                  {Array.from({ length: maxLives }).map((_, idx) => (
                    <Heart
                      key={idx}
                      className={`w-3.5 h-3.5 sm:w-[18px] sm:h-[18px] ${idx < lives ? "text-rose-500 fill-rose-500 filter drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]" : "text-zinc-800"}`}
                    />
                  ))}
                </div>
              </div>

              <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center p-1.5 sm:p-2">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500">Difficulty</span>
                <span className={`text-[9px] sm:text-xs font-black tracking-widest uppercase mt-1 sm:mt-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full ${
                  difficulty === "EXPERT" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                  difficulty === "HARD" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                  difficulty === "MEDIUM" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
                  "bg-green-500/10 text-green-400 border border-green-500/20"
                }`}>
                  {difficulty}
                </span>
              </div>
            </div>

            {/* MAIN OBSTACLE SCREEN */}
            {loadingObstacle ? (
              <div className="flex-1 flex flex-col justify-center items-center py-20 bg-zinc-950/20 border border-zinc-900 rounded-3xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.05),transparent)] pointer-events-none" />
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-cyan-500 border-zinc-800 mb-6" />
                <div className="space-y-2 text-center">
                  <h3 className="font-mono text-sm tracking-[0.2em] font-bold text-cyan-400 uppercase animate-pulse">Initializing System Compiler...</h3>
                  <p className="text-xs text-gray-500">Injecting dynamic assessment vector</p>
                </div>
              </div>
            ) : currentObstacle ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col gap-6"
              >
                {/* Timer bar */}
                <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${timeLeft < 10 ? "bg-red-500" : "bg-cyan-500"}`}
                    initial={{ width: "100%" }}
                    animate={{ width: `${(timeLeft / maxTime) * 100}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
                  {/* Obstacle Left Column: Question */}
                  <div className="lg:col-span-7 flex flex-col p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-900/20 border border-zinc-800 justify-between">
                    <div>
                      {/* Topic Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3 sm:mb-4">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {currentObstacle.topic}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-900/50">
                          {currentObstacle.subtopic}
                        </span>
                      </div>

                      {/* Question */}
                      <h2 className="text-sm sm:text-xl font-bold leading-relaxed mb-4 sm:mb-6 text-white font-sans">
                        {currentObstacle.question}
                      </h2>

                      {/* Optional Code Snippet */}
                      {currentObstacle.codeBlock && (
                        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-800/80 bg-[#0c0c0e] p-3.5 sm:p-5 font-mono text-[10px] sm:text-xs text-cyan-300/90 mb-4 sm:mb-6 leading-relaxed max-w-full overflow-x-auto shadow-inner">
                          <pre>{currentObstacle.codeBlock}</pre>
                        </div>
                      )}
                    </div>

                    {/* Hint Section */}
                    <div>
                      <AnimatePresence>
                        {showHint && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-3 sm:p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-300 text-[11px] sm:text-xs mb-3 sm:mb-4 leading-relaxed flex gap-2 items-start"
                          >
                            <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="uppercase font-black text-[8px] sm:text-[9px] tracking-wider text-amber-500 block mb-0.5 sm:mb-1">Decryption Cue:</strong>
                              {currentObstacle.hint}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {!showHint && !showExplanation && (
                        <button
                          onClick={() => setShowHint(true)}
                          className="text-[9px] sm:text-[10px] font-black text-gray-500 hover:text-amber-400 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                        >
                          <HelpCircle size={10} /> Decrypt Hint (-10 Score Penalty)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Obstacle Right Column: Options */}
                  <div className="lg:col-span-5 flex flex-col gap-2.5 sm:gap-3 justify-center">
                    {currentObstacle.options.map((option, idx) => {
                      const isSelected = selectedAnswer === idx;
                      const isCorrect = idx === currentObstacle.correctOptionIndex;
                      const showResult = selectedAnswer !== null;

                      let cardStyle = "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-800/10";
                      let iconElement = null;

                      if (showResult) {
                        if (isCorrect) {
                          cardStyle = "border-emerald-500 bg-emerald-500/5 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
                          iconElement = <Check size={14} className="text-emerald-400 shrink-0" />;
                        } else if (isSelected) {
                          cardStyle = "border-rose-500 bg-rose-500/5 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.1)]";
                          iconElement = <X size={14} className="text-rose-400 shrink-0" />;
                        } else {
                          cardStyle = "border-zinc-900 bg-zinc-900/10 text-gray-600 opacity-50";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={showResult}
                          onClick={() => handleAnswerSelect(idx)}
                          className={`w-full p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all duration-300 flex items-center justify-between gap-3 sm:gap-4 cursor-pointer hover:scale-[1.01] ${cardStyle}`}
                        >
                          <span className="flex gap-2.5 sm:gap-3 items-center">
                            <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center font-bold text-[10px] sm:text-xs ${
                              showResult && isCorrect ? "bg-emerald-500/20 text-emerald-400" :
                              showResult && isSelected ? "bg-rose-500/20 text-rose-400" :
                              "bg-zinc-800 text-zinc-400"
                            }`}>
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span>{option}</span>
                          </span>
                          {iconElement}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* EXPLANATIONS CONTAINER (AFTER CLICK) */}
                <AnimatePresence>
                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Concept Breakdown */}
                        <div className="space-y-2 border-r border-zinc-800/80 pr-0 md:pr-6">
                          <h4 className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400 flex items-center gap-1.5">
                            <BookOpen size={14} /> Concept Validation
                          </h4>
                          <p className="text-sm text-gray-300 leading-relaxed font-medium">
                            {currentObstacle.explanation}
                          </p>
                        </div>

                        {/* Real-World Systems Connection */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-black uppercase tracking-[0.25em] text-purple-400 flex items-center gap-1.5">
                            <Server size={14} /> Real-World Systems Blueprint
                          </h4>
                          <p className="text-sm text-gray-300 leading-relaxed font-medium">
                            {currentObstacle.realWorldConnection}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-zinc-850">
                        <button
                          onClick={() => fetchNextObstacle(score, streak, level)}
                          className="px-8 py-3.5 rounded-xl bg-white text-black font-black uppercase text-xs tracking-wider flex items-center gap-2 hover:bg-gray-150 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          Next Vector Obstacle <ArrowRight size={14} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : null}
          </div>
        )}

        {/* END GAME SUMMARY SCREEN */}
        {gameState === "ENDED" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col py-8"
          >
            {/* Main Stats Block */}
            <div className="text-center p-8 rounded-3xl bg-gradient-to-b from-zinc-900/60 to-zinc-950/40 border border-zinc-800 backdrop-blur-md mb-8">
              <div className="inline-flex p-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 mb-6">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-2">Systems Defeat</h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto mb-8 font-medium">Your node lost all firewall shields. Performance indexed below.</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800">
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Final Score</div>
                  <div className="text-3xl font-black font-mono text-white">{score}</div>
                </div>
                <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800">
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Arcade Points</div>
                  <div className="text-3xl font-black font-mono text-cyan-400">+{Math.floor(score / 10)} AP</div>
                </div>
                <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800">
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Highest Streak</div>
                  <div className="text-3xl font-black font-mono text-purple-400">{maxStreak}x</div>
                </div>
                <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800">
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Obstacles Faced</div>
                  <div className="text-3xl font-black font-mono text-white">{questionsAnswered}</div>
                </div>
              </div>

              <div className="flex justify-center gap-4 mt-10">
                <button
                  onClick={handleStartGame}
                  className="px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase text-xs tracking-wider transition-all hover:scale-105 active:scale-95"
                >
                  Restart Simulation
                </button>
                <Link
                  href="/arcade"
                  className="px-8 py-4 rounded-xl border border-zinc-800 bg-zinc-900/20 text-gray-300 font-black uppercase text-xs tracking-wider hover:bg-zinc-800/40 transition-all flex items-center gap-2"
                >
                  <LogOut size={14} /> Quit Sandbox
                </Link>
              </div>
            </div>

            {/* Questions Review Log */}
            {history.length > 0 && (
              <div className="space-y-4 w-full">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 border-b border-gray-800 pb-2">Arena Log File & Decryptions</h3>
                <div className="space-y-4">
                  {history.map((item, idx) => (
                    <div key={idx} className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex gap-2">
                            <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                              {item.topic}
                            </span>
                            <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded bg-zinc-850 text-cyan-400">
                              {item.subtopic}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-white mt-2 leading-relaxed">{item.question}</h4>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1.5 ${
                          item.wasCorrect 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          {item.wasCorrect ? <Check size={12} /> : <X size={12} />} {item.wasCorrect ? "Resolved" : "Breached"}
                        </span>
                      </div>

                      {item.codeBlock && (
                        <pre className="p-4 rounded-xl bg-[#0c0c0e] border border-zinc-850 font-mono text-xs text-cyan-300/80 leading-relaxed overflow-x-auto max-w-full">
                          {item.codeBlock}
                        </pre>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-gray-400 border-t border-zinc-850 pt-4 leading-relaxed">
                        <div className="space-y-1">
                          <strong className="text-[10px] uppercase font-black tracking-wider text-cyan-500 block mb-1">Deep Assessment:</strong>
                          <p>{item.explanation}</p>
                        </div>
                        <div className="space-y-1">
                          <strong className="text-[10px] uppercase font-black tracking-wider text-purple-400 block mb-1">Production System Impact:</strong>
                          <p>{item.realWorldConnection}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}
