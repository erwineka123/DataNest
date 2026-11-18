import { createClient } from '@supabase/supabase-js'

const allowedSorts = new Set([
  'newest',
  'oldest',
  'most_popular',
  'most_viewed',
  'unanswered',
])

function sendJson(res, status, body) {
  res.status(status).json(body)
}

export function formatThreadContent(content) {
  return content
    .replace(/\\u003c/gi, '<')
    .replace(/\\u003e/gi, '>')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li\b[^>]*>/gi, '- ')
    .replace(/<\/(p|div|li|h[1-6]|blockquote|pre|tr)>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;|&#160;|&#xA0;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);|&#x([0-9a-f]+);/gi, (entity, decimal, hexadecimal) => {
      const codePoint = Number.parseInt(decimal ?? hexadecimal, decimal ? 10 : 16)
      return codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : entity
    })
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'apikey, Authorization, Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS')
    return sendJson(res, 405, { error: 'Method tidak diizinkan.' })
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase API environment variables are not configured.')
    return sendJson(res, 500, { error: 'Konfigurasi database belum tersedia.' })
  }

  const params = new URL(req.url, `http://${req.headers.host}`).searchParams
  const pageValue = params.get('page') ?? '1'
  const pageSizeValue = params.get('pageSize') ?? '10'
  const page = Number(pageValue)
  const pageSize = Number(pageSizeValue)
  const category = params.get('category')?.trim() ?? ''
  const search = params.get('search')?.trim().slice(0, 100) ?? ''
  const sort = params.get('sort') ?? 'newest'

  if (!/^[1-9]\d*$/.test(pageValue) || !Number.isSafeInteger(page)) {
    return sendJson(res, 400, { error: 'Parameter page harus berupa bilangan bulat positif.' })
  }

  if (
    !/^[1-9]\d*$/.test(pageSizeValue) ||
    !Number.isSafeInteger(pageSize) ||
    pageSize > 50
  ) {
    return sendJson(res, 400, { error: 'Parameter pageSize harus antara 1 dan 50.' })
  }

  if (category && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category)) {
    return sendJson(res, 400, { error: 'Parameter category harus berupa UUID.' })
  }

  if (!allowedSorts.has(sort)) {
    return sendJson(res, 400, { error: 'Parameter sort tidak valid.' })
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  if (!Number.isSafeInteger(to)) {
    return sendJson(res, 400, { error: 'Nilai pagination terlalu besar.' })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    let query = supabase
      .from('threads')
      .select(
        'id,title,excerpt,content,created_at,comment_count,like_count,view_count,tags,categories!threads_category_id_fkey(id,name,slug),profiles!threads_author_id_fkey(username,avatar_url)',
        { count: 'exact' },
      )
      .range(from, to)

    if (search) {
      const searchPattern = `%${search.replace(/[\\%_]/g, '\\$&')}%`
      query = query.ilike('title', searchPattern)
    }

    if (category) {
      query = query.eq('category_id', category)
    }

    switch (sort) {
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'most_popular':
        query = query.order('like_count', { ascending: false })
        break
      case 'most_viewed':
        query = query.order('view_count', { ascending: false })
        break
      case 'unanswered':
        query = query
          .eq('comment_count', 0)
          .order('created_at', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
    }

    const { data, count, error } = await query
    if (error) throw error

    const total = count ?? 0
    return sendJson(res, 200, {
      data: (data ?? []).map((thread) => ({
        ...thread,
        content: formatThreadContent(thread.content ?? ''),
      })),
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    })
  } catch (error) {
    console.error('Failed to fetch threads from Supabase:', error)
    return sendJson(res, 500, { error: 'Gagal mengambil daftar thread.' })
  }
}
