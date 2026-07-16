import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { Button } from '../components/ui/Button.jsx'
import { Input } from '../components/ui/Input.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { updateMyProfile } from '../services/profileService.js'
import { uploadAvatar } from '../services/uploadService.js'

const schema = z.object({
  display_name: z.string().min(3, 'Nama minimal 3 karakter'),
  bio: z.string().max(160, 'Bio maksimal 160 karakter').optional(),
})

export default function SettingsPage() {
  const { profile, user, refreshProfile } = useAuth()

  const form = useForm({
    resolver: zodResolver(schema),
    values: {
      display_name: profile?.display_name ?? '',
      bio: profile?.bio ?? '',
    },
  })

  const updateMutation = useMutation({
    mutationFn: (values) => updateMyProfile(user.id, values),
    onSuccess: async () => {
      await refreshProfile()
      toast.success('Profil berhasil diperbarui')
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      <p className="mt-1 text-sm text-slate-600">Kelola informasi profil Anda.</p>

      <form
        className="mt-5 space-y-4"
        onSubmit={form.handleSubmit((values) => updateMutation.mutate(values))}
      >
        <Input
          label="Nama"
          error={form.formState.errors.display_name?.message}
          {...form.register('display_name')}
        />
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Bio</span>
          <textarea
            rows={4}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
            {...form.register('bio')}
          />
          {form.formState.errors.bio?.message && (
            <p className="text-xs text-red-600">{form.formState.errors.bio.message}</p>
          )}
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Avatar</span>
          <input
            type="file"
            accept="image/*"
            className="w-full rounded-xl border border-slate-300 p-2 text-sm"
            onChange={async (event) => {
              const file = event.target.files?.[0]
              if (!file) return
              const url = await uploadAvatar({ userId: user.id, file })
              await updateMyProfile(user.id, { avatar_url: url })
              await refreshProfile()
              toast.success('Avatar diperbarui')
            }}
          />
        </label>
        <Button type="submit">Simpan Perubahan</Button>
      </form>
    </section>
  )
}
