"use client";

import { useState, useEffect, useRef } from "react";
import { Search, User as UserIcon, X, Loader2 } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";

interface UserSearchResult {
  id: string;
  name: string | null;
  image: string | null;
  rating: number;
}

export default function UserSearch({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchUsers = useDebouncedCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(`/api/users/search?q=${encodeURIComponent(searchTerm)}`);
      setResults(data.users);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  }, 300);

  useEffect(() => {
    if (query) {
      setLoading(true);
      searchUsers(query);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, searchUsers]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full ${className || 'max-w-xs'}`} ref={containerRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-[var(--foreground)]/50" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          placeholder="Search users..."
          className="w-full py-1.5 pl-9 pr-8 text-sm bg-[var(--background)] border border-[var(--card-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--foreground)]/20 text-[var(--foreground)] placeholder:text-[var(--foreground)]/50 transition-colors"
        />
        {loading ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
             <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--foreground)]/50" />
          </div>
        ) : query && (
          <button 
            onClick={() => { setQuery(""); setResults([]); }}
            className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-[var(--foreground)]/50 hover:text-[var(--foreground)]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && (results.length > 0 || loading) && (
        <div className="absolute top-full left-0 mt-1 w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg shadow-lg overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
           {loading && results.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--foreground)]/60">Searching...</div>
           ) : results.length > 0 ? (
              <div className="max-h-60 overflow-y-auto py-1">
                {results.map((user) => (
                  <Link 
                    key={user.id} 
                    href={`/profile/${user.id}`}
                    onClick={() => { setIsOpen(false); setQuery(""); }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-[var(--foreground)]/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[var(--foreground)]/10 shrink-0">
                      {user.image ? (
                        <Image src={user.image} alt={user.name || "User"} width={32} height={32} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-[var(--foreground)]/40" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[var(--foreground)] truncate">
                        {user.name || "Anonymous User"}
                      </div>
                      <div className="text-xs text-[var(--foreground)]/50">
                        Rating: {user.rating}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
           ) : query.length >= 2 ? (
              <div className="p-4 text-center text-xs text-[var(--foreground)]/60">No users found.</div>
           ) : null}
        </div>
      )}
    </div>
  );
}
