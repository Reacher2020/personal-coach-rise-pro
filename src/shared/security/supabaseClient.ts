// src/shared/security/supabaseClient.ts
import { createClient } from "@supabase/supabase-js"
import { env } from "@/shared/lib/env"

export function createSupabaseClient(accessToken?: string) {
  return createClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {},
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  )
}
