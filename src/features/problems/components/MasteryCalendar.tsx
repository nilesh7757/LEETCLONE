"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Calendar, 
  Trophy, 
  CheckSquare, 
  Square,
  Target,
  Sparkles,
  X,
  Clock,
  ArrowRight,
  PlusCircle
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface Goal {
  id: string;
  title: string;
  date: string;
  isDone: boolean;
}

interface Contest {
  id: string;
  title: string;
  startTime: string;
}

export default function MasteryCalendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-indexed
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Goal Form inside popover state
  const [showAddForm, setShowAddForm] = useState(false);

  // Range Mode States
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [rangeEndDate, setRangeEndDate] = useState<string>(
    today.toISOString().split("T")[0]
  );

  // Floating Popover / Modal State
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Mobile Drawer State
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const [goals, setGoals] = useState<Goal[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const fetchMonthData = useCallback(async (month: number, year: number) => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`/api/goals?month=${month}&year=${year}`);
      setGoals(data.goals || []);
      setContests(data.contests || []);
    } catch (error) {
      console.error("Failed to fetch calendar data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonthData(currentMonth, currentYear);
  }, [currentMonth, currentYear, fetchMonthData]);

  const [dailyProblem, setDailyProblem] = useState<{ title: string; slug: string; difficulty: string; isSolved?: boolean } | null>(null);
  const [loadingDaily, setLoadingDaily] = useState(false);

  useEffect(() => {
    if (isPopoverOpen && selectedDate) {
      const fetchDaily = async () => {
        setLoadingDaily(true);
        try {
          const yyyy = selectedDate.getFullYear();
          const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
          const dd = String(selectedDate.getDate()).padStart(2, '0');
          const formattedDate = `${yyyy}-${mm}-${dd}`;
          const { data } = await axios.get(`/api/problems/daily?date=${formattedDate}`);
          if (data.problem) {
            setDailyProblem({ ...data.problem, isSolved: data.isSolved });
          } else {
            setDailyProblem(null);
          }
        } catch (err) {
          console.error("Failed to fetch daily challenge for selected date:", err);
          setDailyProblem(null);
        } finally {
          setLoadingDaily(false);
        }
      };
      fetchDaily();
    }
  }, [selectedDate, isPopoverOpen]);

  // Calendar math
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    const day = new Date(year, month - 1, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayIndex = getFirstDayOfMonth(currentMonth, currentYear);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const getGoalsForDate = (date: Date) => {
    return goals.filter((g) => {
      const gDate = new Date(g.date);
      return (
        gDate.getDate() === date.getDate() &&
        gDate.getMonth() === date.getMonth() &&
        gDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getContestsForDate = (date: Date) => {
    return contests.filter((c) => {
      const cDate = new Date(c.startTime);
      return (
        cDate.getDate() === date.getDate() &&
        cDate.getMonth() === date.getMonth() &&
        cDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Get next 5 upcoming goals chronologically (from tomorrow onwards)
  const getUpcomingGoals = () => {
    const startOfTomorrow = new Date(today);
    startOfTomorrow.setDate(today.getDate() + 1);
    startOfTomorrow.setHours(0, 0, 0, 0);

    return goals
      .filter((g) => new Date(g.date) >= startOfTomorrow && !g.isDone)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const formattedDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        12, 0, 0
      );

      const payload: Record<string, string | boolean> = {
        title: newGoalTitle,
        date: formattedDate.toISOString(),
      };

      if (isRangeMode && rangeEndDate) {
        payload.endDate = new Date(rangeEndDate + "T12:00:00").toISOString();
      }

      const { data } = await axios.post("/api/goals", payload);
      
      if (Array.isArray(data)) {
        setGoals((prev) => [...prev, ...data]);
        toast.success(`Goal range added across ${data.length} days!`);
      } else {
        setGoals((prev) => [...prev, data]);
        toast.success("Goal added!");
      }

      setNewGoalTitle("");
      setShowAddForm(false);
    } catch (error) {
      toast.error("Failed to add goal.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleGoal = async (goal: Goal) => {
    try {
      const nextStatus = !goal.isDone;
      setGoals((prev) =>
        prev.map((g) => (g.id === goal.id ? { ...g, isDone: nextStatus } : g))
      );
      await axios.patch(`/api/goals/${goal.id}`, { isDone: nextStatus });
    } catch (error) {
      toast.error("Failed to update status.");
      console.error(error);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      setGoals((prev) => prev.filter((g) => g.id !== id));
      await axios.delete(`/api/goals/${id}`);
      toast.success("Goal deleted.");
    } catch (error) {
      toast.error("Failed to delete goal.");
      console.error(error);
    }
  };

  const selectedDateGoals = getGoalsForDate(selectedDate);
  const selectedDateContests = getContestsForDate(selectedDate);
  const upcomingGoals = getUpcomingGoals();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Close floating popover if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile drawer if clicked outside
  useEffect(() => {
    function handleDrawerClickOutside(event: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setIsMobileDrawerOpen(false);
      }
    }
    if (isMobileDrawerOpen) {
      document.addEventListener("mousedown", handleDrawerClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleDrawerClickOutside);
  }, [isMobileDrawerOpen]);

  // Calendar Component Core JSX
  const renderCalendarCard = () => (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-5 shadow-2xl relative select-none w-full h-full flex flex-col justify-between">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--primary)]/30 to-transparent" />
      
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-[var(--primary)] shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/80">Goal Tracker</span>
        </div>
        <div className="flex items-center justify-end gap-2 shrink-0">
          <button 
            type="button"
            onClick={handlePrevMonth}
            className="p-1 hover:bg-white/5 rounded-lg border border-[var(--border)]/30 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all shrink-0"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs font-black font-mono text-[var(--foreground)] truncate w-16 text-center">
            {monthNames[currentMonth - 1].slice(0, 3)} {currentYear}
          </span>
          <button 
            type="button"
            onClick={handleNextMonth}
            className="p-1 hover:bg-white/5 rounded-lg border border-[var(--border)]/30 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all shrink-0"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* CALENDAR GRID */}
      <div className="grid grid-cols-7 gap-1 text-center mb-4 w-full">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => (
          <span key={idx} className="text-[9px] font-black text-[var(--muted-foreground)]/40 uppercase py-1">
            {day}
          </span>
        ))}

        {Array.from({ length: firstDayIndex }).map((_, idx) => (
          <span key={`empty-${idx}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;
          const cellDate = new Date(currentYear, currentMonth - 1, dayNum);
          const isToday = isSameDay(cellDate, today);
          const isSelected = isSameDay(cellDate, selectedDate);
          
          const dayGoals = getGoalsForDate(cellDate);
          const dayContests = getContestsForDate(cellDate);

          const hasActiveGoals = dayGoals.length > 0 && dayGoals.some(g => !g.isDone);
          const hasCompletedGoals = dayGoals.length > 0 && dayGoals.every(g => g.isDone);
          const hasContests = dayContests.length > 0;

          const getNumberColorClass = () => {
            if (isSelected) return "text-[var(--primary)] font-black";
            if (hasActiveGoals) return "text-blue-500 dark:text-blue-400 font-black";
            if (hasContests) return "text-amber-500 dark:text-amber-400 font-black";
            if (hasCompletedGoals) return "text-emerald-500 dark:text-emerald-400 font-black";
            if (isToday) return "text-white font-bold";
            return "text-[var(--muted-foreground)] hover:text-[var(--foreground)]";
          };

          return (
            <button
              key={`day-${dayNum}`}
              type="button"
              onClick={() => {
                setSelectedDate(cellDate);
                setIsPopoverOpen(true);
              }}
              className={`aspect-square w-full rounded-lg text-[10px] font-mono flex flex-col items-center justify-center relative cursor-pointer transition-all border ${
                isSelected
                  ? "bg-[var(--primary)]/20 border-[var(--primary)]/40 shadow-md scale-105"
                  : isToday
                  ? "bg-white/5 border-white/20"
                  : "bg-transparent border-transparent hover:bg-white/5"
              } ${hasContests ? "ring-1 ring-amber-500/40 border-amber-500/25" : ""} ${getNumberColorClass()}`}
            >
              {dayNum}
            </button>
          );
        })}
      </div>

      {/* QUICK STATS INSTEAD OF BOTTOM INPUT */}
      <div className="border-t border-[var(--border)]/20 pt-3 flex items-center justify-between text-[9px] font-mono text-[var(--muted-foreground)]/60">
        <div className="flex items-center gap-1.5">
          <span className="text-blue-500 dark:text-blue-400 font-black">12</span>
          <span>Active Tasks</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-emerald-500 dark:text-emerald-400 font-black">28</span>
          <span>All Completed</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full">
      {/* 1. DESKTOP VIEW (Visible on lg and larger) */}
      <div className="hidden lg:block w-full h-full">
        {renderCalendarCard()}
      </div>

      {/* 2. MOBILE VIEW (Visible on mobile/tablet) */}
      <div className="lg:hidden">
        {/* Floating Calendar Icon Button */}
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all border border-blue-400/20"
          title="Open Mastery Calendar"
        >
          <Calendar className="w-6 h-6 animate-pulse" />
        </button>

        {/* Mobile Slide-Over Tray */}
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" />
            
            {/* Drawer Content */}
            <div 
              ref={drawerRef}
              className="relative w-80 max-w-[90vw] h-full bg-[#0e0e11] border-l border-white/10 p-5 shadow-2xl overflow-y-auto flex flex-col gap-4 animate-in slide-in-from-right duration-300"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Mastery Planner</span>
                <button 
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 hover:bg-white/5 rounded-full text-gray-400 hover:text-[var(--foreground)] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              
              {renderCalendarCard()}
            </div>
          </div>
        )}
      </div>

      {/* 3. FLOATING DETAILS MODAL / POPUP (Common to both Mobile & Desktop) */}
      {isPopoverOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div 
            ref={dropdownRef}
            className="bg-[#0e0e11] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col gap-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-yellow-500" />
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} Goals
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsPopoverOpen(false);
                  setShowAddForm(false);
                }}
                className="p-1 hover:bg-white/5 rounded-full text-gray-400 hover:text-[var(--foreground)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Daily Challenge of this date */}
            <div className="bg-zinc-900/40 border border-zinc-800/60 p-4 rounded-2xl flex flex-col gap-2">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={11} className="text-amber-500 animate-pulse" /> Daily Challenge
              </span>
              {loadingDaily ? (
                <div className="h-10 bg-white/5 border border-white/5 rounded-xl animate-pulse" />
              ) : dailyProblem ? (
                <Link
                  href={`/problems/${dailyProblem.slug}`}
                  onClick={() => setIsPopoverOpen(false)}
                  className="flex items-center justify-between p-3 bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-amber-500/30 rounded-xl transition-all group"
                >
                  <div className="flex flex-col min-w-0 gap-1.5 pl-0.5">
                    <span className="text-xs font-bold text-zinc-200 truncate group-hover:text-purple-300 transition-colors">
                      {dailyProblem.title}
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[8px] font-black uppercase tracking-widest ${
                        dailyProblem.difficulty === 'Easy' ? 'text-emerald-500' : dailyProblem.difficulty === 'Medium' ? 'text-amber-500' : 'text-rose-500'
                      }`}>
                        {dailyProblem.difficulty}
                      </span>
                      {dailyProblem.isSolved && (
                        <span className="text-[7.5px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-md animate-pulse">
                          ✓ Solved
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight size={12} className="text-amber-500 shrink-0 group-hover:translate-x-0.5 transition-transform animate-pulse" />
                </Link>
              ) : (
                <p className="text-[10px] text-zinc-500 italic">No challenge available for this date.</p>
              )}
            </div>

            {/* Todays Tasks Header with Plus Button */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                  Daily checklist ({selectedDateGoals.length})
                </span>
                
                <button
                  type="button"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-1 text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-wider transition-colors"
                >
                  <PlusCircle size={14} />
                  Add Goal
                </button>
              </div>

              {/* Toggleable Goal Add Form */}
              {showAddForm && (
                <form onSubmit={handleAddGoal} className="p-3.5 bg-white/5 border border-white/5 rounded-2xl space-y-3 animate-in slide-in-from-top-2 duration-250">
                  <div className="text-[9px] font-black uppercase tracking-widest text-gray-400">Create New Goal</div>
                  
                  <input
                    type="text"
                    required
                    autoFocus
                    disabled={isSubmitting}
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    placeholder="Goal title (e.g. Solve 3 Graph problems)"
                    className="w-full bg-[var(--background)] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 font-medium"
                  />

                  {/* Range select inside details box */}
                  <div className="space-y-2 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={isRangeMode}
                        onChange={(e) => setIsRangeMode(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-white/15 text-blue-600 bg-black/20 focus:ring-blue-500"
                      />
                      <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Repeat over multiple days?</span>
                    </label>

                    {isRangeMode && (
                      <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-200">
                        <span className="text-[9px] font-mono text-gray-500 uppercase">End Date:</span>
                        <input 
                          type="date"
                          value={rangeEndDate}
                          min={selectedDate.toISOString().split("T")[0]}
                          onChange={(e) => setRangeEndDate(e.target.value)}
                          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !newGoalTitle.trim()}
                      className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? "Creating..." : "Save Goal"}
                    </button>
                  </div>
                </form>
              )}
              
              {/* Contest markers */}
              {selectedDateContests.map(c => (
                <div key={c.id} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-2">
                  <Trophy size={14} className="text-amber-500 shrink-0" />
                  <span className="text-xs font-bold text-amber-500">Official Contest: {c.title}</span>
                </div>
              ))}

              {/* Goal items list */}
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {selectedDateGoals.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No targets scheduled for today.</p>
                ) : (
                  selectedDateGoals.map(goal => (
                    <div key={goal.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-2xl group">
                      <button 
                        onClick={() => handleToggleGoal(goal)}
                        className="flex items-center gap-3 text-left min-w-0"
                      >
                        {goal.isDone ? <CheckSquare size={14} className="text-emerald-500 shrink-0" /> : <Square size={14} className="shrink-0" />}
                        <span className={`text-xs font-medium truncate ${goal.isDone ? "text-gray-500 line-through" : "text-gray-200"}`}>
                          {goal.title}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 rounded-md hover:bg-red-500/10 shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Upcoming Goals Feed (Next 5 Goals) */}
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-purple-400 uppercase tracking-widest">
                <Clock size={12} />
                Upcoming Goals (Next 5 Days)
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {upcomingGoals.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No future goals scheduled.</p>
                ) : (
                  upcomingGoals.map(goal => {
                    const gDate = new Date(goal.date);
                    return (
                      <div key={goal.id} className="flex items-center justify-between p-2.5 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
                        <div className="min-w-0 flex-1 pr-3">
                          <p className="text-xs font-bold text-white truncate">{goal.title}</p>
                          <p className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-wider mt-0.5">
                            {gDate.getDate()} {monthNames[gDate.getMonth()].slice(0, 3)}
                          </p>
                        </div>
                        <ArrowRight size={12} className="text-purple-400 shrink-0" />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex gap-3 pt-3 border-t border-white/5">
              <button 
                onClick={() => {
                  setIsPopoverOpen(false);
                  setShowAddForm(false);
                }}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
