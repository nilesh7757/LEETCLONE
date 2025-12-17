"use client";

import { useState } from "react";
import { Bell, BellOff, CheckCircle2, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EnrollmentButtonProps {
  planId: string;
  initialEnrolled: boolean;
  initialReminderTime?: string | null;
}

export default function EnrollmentButton({ planId, initialEnrolled, initialReminderTime }: EnrollmentButtonProps) {
  const [enrolled, setEnrolled] = useState(initialEnrolled);
  const [reminderTime, setReminderTime] = useState(initialReminderTime || "");
  const [loading, setLoading] = useState(false);
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const router = useRouter();

  const handleEnroll = async () => {
    setLoading(true);
    try {
      await axios.post("/api/study-plans/enroll", { planId });
      setEnrolled(true);
      toast.success("Enrolled in study plan!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to enroll");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReminder = async () => {
    setLoading(true);
    try {
      await axios.put("/api/study-plans/enroll", { planId, reminderTime });
      toast.success("Reminder updated!");
      setShowReminderSettings(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update reminder");
    } finally {
      setLoading(false);
    }
  };

  if (!enrolled) {
    return (
      <button
        onClick={handleEnroll}
        disabled={loading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enroll Now"}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2 py-3 bg-green-500/10 text-green-500 rounded-xl font-bold border border-green-500/20">
        <CheckCircle2 className="w-5 h-5" /> Enrolled
      </div>
      
      <button
        onClick={() => setShowReminderSettings(!showReminderSettings)}
        className="w-full py-2 text-sm font-medium text-[var(--foreground)]/60 hover:text-[var(--foreground)] flex items-center justify-center gap-2"
      >
        {reminderTime ? <Bell className="w-4 h-4 text-orange-500" /> : <BellOff className="w-4 h-4" />}
        {reminderTime ? `Reminder: ${reminderTime}` : "Set Daily Reminder"}
      </button>

      {showReminderSettings && (
        <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--card-border)] space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--foreground)]/60 mb-2 uppercase">Daily Reminder Time</label>
            <input 
              type="time" 
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
                onClick={() => setShowReminderSettings(false)}
                className="flex-1 py-2 text-xs font-medium bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 rounded-lg"
            >
                Cancel
            </button>
            <button
                onClick={handleUpdateReminder}
                disabled={loading}
                className="flex-1 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
