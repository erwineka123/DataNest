import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { getSupabase } from '../supabase/client.js'
import { AuthContext } from './auth-context.js'
import {
  loginWithEmail,
  logout as logoutService,
  registerWithEmail,
} from '../services/authService.js'
import { getProfileByUserId } from '../services/profileService.js'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let supabase
    try {
      supabase = getSupabase()
    } catch (error) {
      toast.error(error.message)
      setLoading(false)
      return () => {}
    }

    supabase.auth.getSession().then(async ({ data, error }) => {
      if (error) {
        setLoading(false)
        throw error
      }
      setSession(data.session)
      setUser(data.session?.user ?? null)
      if (data.session?.user) {
        const profileData = await getProfileByUserId(data.session.user.id)
        setProfile(profileData)
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        setSession(nextSession)
        setUser(nextSession?.user ?? null)
        if (nextSession?.user) {
          const profileData = await getProfileByUserId(nextSession.user.id)
          setProfile(profileData)
        } else {
          setProfile(null)
        }
      },
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      role: profile?.role ?? 'guest',
      loading,
      isAuthenticated: Boolean(user),
      async login(payload) {
        const response = await loginWithEmail(payload)
        toast.success('Login berhasil')
        return response
      },
      async register(payload) {
        const response = await registerWithEmail(payload)
        toast.success('Registrasi berhasil, cek email untuk verifikasi.')
        return response
      },
      async logout() {
        await logoutService()
        toast.success('Berhasil logout')
      },
      async refreshProfile() {
        if (!user) return
        const profileData = await getProfileByUserId(user.id)
        setProfile(profileData)
      },
    }),
    [loading, profile, session, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
