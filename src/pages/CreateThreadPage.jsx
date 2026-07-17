import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { RichTextEditor } from '../components/editor/RichTextEditor.jsx'
import { Button } from '../components/ui/Button.jsx'
import { ErrorState } from '../components/ui/ErrorState.jsx'
import { Input } from '../components/ui/Input.jsx'
import { LoadingSpinner } from '../components/ui/LoadingSpinner.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { getCategories } from '../services/categoryService.js'
import { createThread } from '../services/threadService.js'
import { uploadThreadImage } from '../services/uploadService.js'
import { getSupabase } from '../supabase/client.js'
import { queryKeys } from '../utils/queryKeys.js'

const schema = z.object({
  title: z.string().min(6, 'Judul minimal 6 karakter'),
  categoryId: z.string().uuid('Kategori harus dipilih'),
  tags: z.string().optional(),
})

export default function CreateThreadPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imageUrl, setImageUrl] = useState('')

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      categoryId: '',
      tags: '',
    },
  })

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
  })

  const createMutation = useMutation({
    mutationFn: async (values) => {
      const thread = await createThread({
        userId: user.id,
        payload: {
          ...values,
          tags: values.tags ? values.tags.split(',').map((tag) => tag.trim()) : [],
          content,
        },
      })

      if (imageUrl) {
        const supabase = getSupabase()
        const { error } = await supabase.from('attachments').insert({
          thread_id: thread.id,
          uploader_id: user.id,
          file_url: imageUrl,
          file_type: 'image',
          file_name: imageFile?.name ?? 'thread-image',
        })
        if (error) throw error
      }

      return thread
    },
    onSuccess: (thread) => {
      toast.success('Thread berhasil dipublikasikan')
      queryClient.invalidateQueries({ queryKey: ['forum-threads'] })
      navigate(`/forum/${thread.id}`)
    },
    onError: (error) => toast.error(error.message),
  })

  if (categoriesQuery.isLoading) return <LoadingSpinner />
  if (categoriesQuery.isError) return <ErrorState message={categoriesQuery.error.message} />

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-bold text-slate-900">Buat Thread Baru</h1>
      <p className="mt-2 text-sm text-slate-600">
        Bagikan pertanyaan, ide, atau diskusi baru ke komunitas.
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={form.handleSubmit((values) => {
          if (!content || content.replace(/<[^>]+>/g, '').trim().length < 20) {
            toast.error('Konten minimal 20 karakter')
            return
          }
          createMutation.mutate(values)
        })}
      >
        <Input
          label="Judul"
          placeholder="Masukkan judul thread"
          error={form.formState.errors.title?.message}
          {...form.register('title')}
        />

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Kategori</span>
          <select
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
            {...form.register('categoryId')}
          >
            <option value="">Pilih kategori</option>
            {categoriesQuery.data.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {form.formState.errors.categoryId?.message && (
            <p className="text-xs text-red-600">{form.formState.errors.categoryId.message}</p>
          )}
        </label>

        <Input
          label="Tags (pisahkan dengan koma)"
          placeholder="pekerjaan, data diri, kesehatan"
          {...form.register('tags')}
        />

        <div className="space-y-1.5">
          <p className="text-sm font-medium text-slate-700">Konten</p>
          <RichTextEditor value={content} onChange={setContent} />
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Gambar Thread</span>
          <input
            type="file"
            accept="image/*"
            className="w-full rounded-xl border border-slate-300 p-2 text-sm"
            onChange={async (event) => {
              const file = event.target.files?.[0]
              if (!file) return
              setImageFile(file)
              const url = await uploadThreadImage({ userId: user.id, file })
              setImageUrl(url)
              toast.success('Upload gambar berhasil')
            }}
          />
        </label>

        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Memproses...' : 'Publish'}
        </Button>
      </form>
    </section>
  )
}
