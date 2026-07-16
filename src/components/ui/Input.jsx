import clsx from 'clsx'

export function Input({ label, error, className, ...props }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
      <input
        className={clsx(
          'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-blue-600',
          error && 'border-red-400',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </label>
  )
}
