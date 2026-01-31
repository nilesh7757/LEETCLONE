"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Edit3, 
  Globe, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Trash2
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import Link from "next/link";

interface StudyPlanControlsProps {
  planId: string;
  slug: string;
  status: string;
  isCreator: boolean;
  isAdmin: boolean;
}

export default function StudyPlanControls({ planId, slug, status, isCreator, isAdmin }: StudyPlanControlsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePublish = async () => {
    if (!confirm("Are you sure you want to submit this study plan for admin review?")) return;

    setIsSubmitting(true);
    try {
      await axios.patch(`/api/study-plans/${planId}`, { action: "PUBLISH" });
      toast.success("Study plan submitted for review!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to submit for review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this study plan? This action cannot be undone.")) return;

    try {
      await axios.delete(`/api/study-plans/${planId}`);
      toast.success("Study plan deleted.");
      router.push("/study-plans");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete study plan.");
    }
  };

  if (!isCreator && !isAdmin) return null;

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {/* Edit Button */}
      <Link
        href={`/study-plans/${slug}/edit`}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--foreground)] rounded-lg text-sm font-medium transition-colors border border-[var(--card-border)]"
      >
        <Edit3 className="w-4 h-4" /> Edit Plan
      </Link>

      {/* Publish Button */}
      {status === "DRAFT" && isCreator && (
        <button
          onClick={handlePublish}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
          Publish to Library
        </button>
      )}

      {/* Status Badges */}
      {status === "PENDING_PUBLISH" && (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-lg text-sm font-medium">
          <Clock className="w-4 h-4" /> Pending Approval
        </div>
      )}

      {status === "PENDING_UPDATE" && (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-lg text-sm font-medium">
          <AlertCircle className="w-4 h-4" /> Pending Update Review
        </div>
      )}

      {status === "PUBLISHED" && (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg text-sm font-medium">
          <CheckCircle className="w-4 h-4" /> Live on Library
        </div>
      )}

      <button
        onClick={handleDelete}
        className="inline-flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors"
      >
        <Trash2 className="w-4 h-4" /> Delete
      </button>
    </div>
  );
}
