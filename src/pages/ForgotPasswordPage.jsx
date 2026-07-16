import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { requestResetPassword } from '../services/authService.js'
import { Button } from '../components/ui/Button.jsx'
import { Input } from '../components/ui/Input.jsx'
import toast from 'react-hot-toast'

const schema = z.object({
  email: z.email('Email tidak valid'),
})

export default function ForgotPasswordPage() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Forgot Password</h1>
      <p className="mt-1 text-sm text-slate-600">
        Masukkan email akun Anda untuk reset password.
      </p>
      <form
        className="mt-5 space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await requestResetPassword(values.email)
            toast.success('Email reset password telah dikirim.')
          } catch (error) {
            toast.error(error.message)
          }
        })}
      >
        <Input label="Email" error={form.formState.errors.email?.message} {...form.register('email')} />
        <Button type="submit" className="w-full">
          Kirim Link Reset
        </Button>
      </form>
    </div>
  )
}
