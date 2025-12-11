"use client";

import { X, UserCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";

interface FollowsModalProps {
  userId: string;
  type: "followers" | "following";
  onClose: () => void;
}

export default function FollowsModal({ userId, type, onClose }: FollowsModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(`/api/users/${userId}/follows?type=${type}`);
        setUsers(data.users);
      } catch (error) {
        console.error("Failed to load users", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [userId, type]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
          <h3 className="font-bold text-[var(--foreground)] capitalize">{type}</h3>
          <button onClick={onClose} className="p-1 hover:bg-[var(--foreground)]/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-[var(--foreground)]" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="p-4 text-center text-[var(--foreground)]/60">Loading...</div>
          ) : users.length === 0 ? (
            <div className="p-4 text-center text-[var(--foreground)]/60">No users found.</div>
          ) : (
            users.map((u) => (
              <Link key={u.id} href={`/profile/${u.id}`} onClick={onClose} className="flex items-center gap-3 p-3 hover:bg-[var(--foreground)]/5 rounded-lg transition-colors">
                <div className="w-10 h-10 rounded-full bg-[var(--foreground)]/10 overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {u.image ? (
                        <img src={u.image} alt={u.name} className="w-full h-full object-cover" />
                    ) : (
                        <UserCircle className="w-full h-full p-1.5 text-[var(--foreground)]/40" />
                    )}
                </div>
                <div>
                    <div className="font-medium text-[var(--foreground)]">{u.name}</div>
                    <div className="text-xs text-[var(--foreground)]/60">Rating: {u.rating}</div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
