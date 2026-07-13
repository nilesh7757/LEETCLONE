export default function ProblemsLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto animate-pulse">
      {/* Header */}
      <div className="mb-8 space-y-3">
        <div className="h-8 w-48 bg-[var(--muted)] rounded-lg" />
        <div className="h-4 w-72 bg-[var(--muted)] rounded-lg" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[120, 90, 110, 80, 100].map((w, i) => (
          <div key={i} className="h-8 rounded-full bg-[var(--muted)]" style={{ width: w }} />
        ))}
      </div>

      {/* Problems table header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 mb-2">
        {["col-span-1", "col-span-5", "col-span-2", "col-span-2", "col-span-2"].map((span, i) => (
          <div key={i} className={`${span} h-3 bg-[var(--muted)] rounded`} />
        ))}
      </div>

      {/* Problem rows */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-12 gap-4 px-4 py-4 mb-2 rounded-xl border border-[var(--border)] bg-[var(--card)]"
          style={{ opacity: 1 - i * 0.055 }}
        >
          <div className="col-span-1 h-4 bg-[var(--muted)] rounded" />
          <div className="col-span-5 space-y-2">
            <div className="h-4 bg-[var(--muted)] rounded w-3/4" />
            <div className="flex gap-2">
              <div className="h-3 w-14 bg-[var(--muted)] rounded-full" />
              <div className="h-3 w-16 bg-[var(--muted)] rounded-full" />
            </div>
          </div>
          <div className="col-span-2 h-4 bg-[var(--muted)] rounded" />
          <div className="col-span-2 h-4 bg-[var(--muted)] rounded w-2/3" />
          <div className="col-span-2 h-4 bg-[var(--muted)] rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
