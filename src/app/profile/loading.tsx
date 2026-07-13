export default function ProfileLoading() {
  return (
    <div className="w-full max-w-6xl mx-auto animate-pulse space-y-6">
      {/* Profile hero */}
      <div className="flex items-center gap-6 p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <div className="w-20 h-20 rounded-full bg-[var(--muted)] shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-6 w-48 bg-[var(--muted)] rounded-lg" />
          <div className="h-4 w-32 bg-[var(--muted)] rounded" />
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-[var(--muted)] rounded-full" />
            <div className="h-6 w-24 bg-[var(--muted)] rounded-full" />
          </div>
        </div>
        <div className="hidden sm:flex gap-6">
          {[3].map((_, i) => (
            <div key={i} className="text-center space-y-1">
              <div className="h-8 w-12 bg-[var(--muted)] rounded mx-auto" />
              <div className="h-3 w-16 bg-[var(--muted)] rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-3">
            <div className="h-3 w-20 bg-[var(--muted)] rounded" />
            <div className="h-8 w-16 bg-[var(--muted)] rounded-lg" />
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-56 rounded-2xl border border-[var(--border)] bg-[var(--card)]" />
        <div className="h-56 rounded-2xl border border-[var(--border)] bg-[var(--card)]" />
      </div>

      {/* Submission table */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-3">
        <div className="h-5 w-36 bg-[var(--muted)] rounded mb-4" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4" style={{ opacity: 1 - i * 0.12 }}>
            <div className="flex-1 h-4 bg-[var(--muted)] rounded" />
            <div className="h-4 w-16 bg-[var(--muted)] rounded" />
            <div className="h-4 w-20 bg-[var(--muted)] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
