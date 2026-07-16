import { getSupabase } from '../supabase/client.js'

export async function loginWithEmail(payload) {
  const client = getSupabase()
  const { data, error } = await client.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  })
  if (error) throw error
  return data
}

export async function registerWithEmail(payload) {
  const client = getSupabase()
  const { data, error } = await client.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        username: payload.username,
        display_name: payload.displayName,
      },
    },
  })
  if (error) throw error
  return data
}

export async function logout() {
  const client = getSupabase()
  const { error } = await client.auth.signOut()
  if (error) throw error
}

export async function requestResetPassword(email) {
  const client = getSupabase()
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw error
}

export async function updatePassword(password) {
  const client = getSupabase()
  const { error } = await client.auth.updateUser({ password })
  if (error) throw error
}
