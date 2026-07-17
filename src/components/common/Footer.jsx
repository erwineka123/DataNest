export function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="container-main py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} DataNest.
      </div>
    </footer>
  )
}
