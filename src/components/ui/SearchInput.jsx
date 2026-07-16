import { Search } from 'lucide-react'

export function SearchInput({ value, onChange, placeholder = 'Cari...' }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2">
      <Search size={18} className="text-slate-500" />
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border-none bg-transparent text-sm outline-none"
      />
    </div>
  )
}
