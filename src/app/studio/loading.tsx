export default function StudioLoading() {
  return (
    <div className="w-full max-w-6xl mx-auto animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-[var(--muted)] rounded-lg" />
          <div className="h-4 w-56 bg-[var(--muted)] rounded" />
        </div>
        <div className="h-10 w-36 bg-[var(--muted)] rounded-xl" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6">
        {[80, 100, 90].map((w, i) => (
          <div key={i} className="h-9 rounded-lg bg-[var(--muted)]" style={{ width: w }} />
        ))}
      </div>

      {/* Problem cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-3"
            style={{ opacity: 1 - i * 0.08 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="h-5 bg-[var(--muted)] rounded flex-1" />
              <div className="h-5 w-14 bg-[var(--muted)] rounded-full shrink-0" />
            </div>
            <div className="h-3 bg-[var(--muted)] rounded w-3/4" />
            <div className="h-3 bg-[var(--muted)] rounded w-1/2" />
            <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
              <div className="h-7 flex-1 bg-[var(--muted)] rounded-lg" />
              <div className="h-7 flex-1 bg-[var(--muted)] rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
