import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Button } from '../components/ui/Button.jsx'
import { Input } from '../components/ui/Input.jsx'
import { useAuth } from '../hooks/useAuth.js'

const schema = z
  .object({
    username: z.string().min(3, 'Username minimal 3 karakter'),
    displayName: z.string().min(3, 'Nama minimal 3 karakter'),
    email: z.email('Email tidak valid'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Konfirmasi password tidak sama',
  })

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Register</h1>
      <p className="mt-1 text-sm text-slate-600">Buat akun baru untuk bergabung ke forum.</p>

      <form
        className="mt-5 space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await register(values)
            navigate('/login')
          } catch (error) {
            toast.error(error.message)
          }
        })}
      >
        <Input label="Username" error={form.formState.errors.username?.message} {...form.register('username')} />
        <Input
          label="Nama Lengkap"
          error={form.formState.errors.displayName?.message}
          {...form.register('displayName')}
        />
        <Input label="Email" error={form.formState.errors.email?.message} {...form.register('email')} />
        <Input
          label="Password"
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
          Daftar
        </Button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Sudah punya akun?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          Login di sini
        </Link>
      </p>
    </div>
  )
}
