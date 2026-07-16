export function SkeletonLoader({ lines = 3 }) {
  return (
    <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 animate-pulse rounded bg-slate-200"
          style={{ width: `${100 - index * 10}%` }}
        />
      ))}
    </div>
  )
}
