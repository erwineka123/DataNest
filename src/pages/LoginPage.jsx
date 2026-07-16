import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Button } from '../components/ui/Button.jsx'
import { Input } from '../components/ui/Input.jsx'
import { useAuth } from '../hooks/useAuth.js'

const schema = z.object({
  email: z.email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Login</h1>
      <p className="mt-1 text-sm text-slate-600">Masuk ke akun forum Anda.</p>

      <form
        className="mt-5 space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await login(values)
            navigate('/forum')
          } catch (error) {
            toast.error(error.message)
          }
        })}
      >
        <Input label="Email" error={form.formState.errors.email?.message} {...form.register('email')} />
        <Input
          label="Password"
          type="password"
          error={form.formState.errors.password?.message}
          {...form.register('password')}
        />
        <Button type="submit" className="w-full">
          Masuk
        </Button>
      </form>

      <div className="mt-4 flex justify-between text-sm text-slate-600">
        <Link to="/forgot-password" className="text-blue-600 hover:underline">
          Lupa password?
        </Link>
        <Link to="/register" className="text-blue-600 hover:underline">
          Belum punya akun?
        </Link>
      </div>
    </div>
  )
}
