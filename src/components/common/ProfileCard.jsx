import { Avatar } from '../ui/Avatar.jsx'

export function ProfileCard({ profile }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-4">
        <Avatar src={profile.avatar_url} alt={profile.username} size="lg" />
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{profile.display_name}</h1>
          <p className="text-sm text-slate-600">@{profile.username}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-700">{profile.bio || 'Belum ada bio.'}</p>
    </section>
  )
}
