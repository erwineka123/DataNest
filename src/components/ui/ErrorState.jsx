export function ErrorState({ message }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}
