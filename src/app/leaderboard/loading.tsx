export default function LeaderboardLoading() {
  return (
    <div className="w-full max-w-5xl mx-auto animate-pulse">
      {/* Header */}
      <div className="mb-8 space-y-3">
        <div className="h-8 w-40 bg-[var(--muted)] rounded-lg" />
        <div className="h-4 w-64 bg-[var(--muted)] rounded-lg" />
      </div>

      {/* Top 3 podium */}
      <div className="flex justify-center items-end gap-4 mb-10 h-36">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-[var(--muted)]" />
          <div className="w-20 bg-[var(--muted)] rounded-t-xl h-20" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-[var(--muted)]" />
          <div className="w-24 bg-[var(--muted)] rounded-t-xl h-28" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-[var(--muted)]" />
          <div className="w-20 bg-[var(--muted)] rounded-t-xl h-16" />
        </div>
      </div>

      {/* Leaderboard rows */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-4 mb-2 rounded-xl border border-[var(--border)] bg-[var(--card)]"
          style={{ opacity: 1 - i * 0.07 }}
        >
          <div className="w-6 h-4 bg-[var(--muted)] rounded shrink-0" />
          <div className="w-9 h-9 rounded-full bg-[var(--muted)] shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 bg-[var(--muted)] rounded w-32" />
            <div className="h-3 bg-[var(--muted)] rounded w-20" />
          </div>
          <div className="h-4 w-16 bg-[var(--muted)] rounded shrink-0" />
          <div className="h-4 w-12 bg-[var(--muted)] rounded shrink-0" />
        </div>
      ))}
    </div>
  );
}
