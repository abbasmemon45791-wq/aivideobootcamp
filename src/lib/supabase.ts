import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization — prevents build-time crash when env vars aren't set
let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

function getClient() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('Supabase public env vars not set. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local')
    _supabase = createClient(url, key)
  }
  return _supabase
}

function getAdminClient() {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Supabase service role env vars not set. Add SUPABASE_SERVICE_ROLE_KEY to .env.local')
    _supabaseAdmin = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  }
  return _supabaseAdmin
}

// Export as proxy objects so usage syntax stays the same (supabase.from(...) etc.)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_t, prop) {
    return (getClient() as unknown as Record<string, unknown>)[prop as string]
  }
})

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_t, prop) {
    return (getAdminClient() as unknown as Record<string, unknown>)[prop as string]
  }
})
