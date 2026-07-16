export function Dropdown({ value, options, onChange, className = '' }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm ${className}`}
    >
      {options.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  )
}
