import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { updatePassword } from '../services/authService.js'
import { Button } from '../components/ui/Button.jsx'
import { Input } from '../components/ui/Input.jsx'

const schema = z
  .object({
    password: z.string().min(8, 'Password minimal 8 karakter'),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Konfirmasi password tidak sama',
  })

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
      <form
        className="mt-5 space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await updatePassword(values.password)
            toast.success('Password berhasil diperbarui')
            navigate('/login')
          } catch (error) {
            toast.error(error.message)
          }
        })}
      >
        <Input
          label="Password Baru"
          type="password"
          error={form.formState.errors.password?.message}
          {...form.register('password')}
        />
        <Input
          label="Konfirmasi Password"
          type="password"
          error={form.formState.errors.confirmPassword?.message}
          {...form.register('confirmPassword')}
        />
        <Button type="submit" className="w-full">
          Simpan Password
        </Button>
      </form>
    </div>
  )
}
