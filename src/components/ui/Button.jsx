import clsx from 'clsx'

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}) {
  return (
    <button
      className={clsx(
        'cursor-pointer rounded-xl font-medium transition',
        variant === 'primary' &&
          'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
        variant === 'outline' &&
          'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100',
        variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
        size === 'sm' && 'px-3 py-2 text-sm',
        size === 'md' && 'px-4 py-2.5 text-sm',
        size === 'lg' && 'px-5 py-3 text-base',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
