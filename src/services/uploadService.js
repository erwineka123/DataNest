import { getSupabase } from '../supabase/client.js'

function createFilePath(userId, file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9-_.]/g, '_')
  return `${userId}/${Date.now()}-${safeName}`
}

export async function uploadAvatar({ userId, file }) {
  const client = getSupabase()
  const filePath = createFilePath(userId, file)
  const { error } = await client.storage.from('avatars').upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
  })
  if (error) throw error
  const { data } = client.storage.from('avatars').getPublicUrl(filePath)
  return data.publicUrl
}

export async function uploadThreadImage({ userId, file }) {
  const client = getSupabase()
  const filePath = createFilePath(userId, file)
  const { error } = await client.storage
    .from('thread-images')
    .upload(filePath, file, { cacheControl: '3600' })
  if (error) throw error
  const { data } = client.storage.from('thread-images').getPublicUrl(filePath)
  return data.publicUrl
}
