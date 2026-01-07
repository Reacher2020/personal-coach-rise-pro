import { createSupabaseClient } from "@/shared/security/supabaseClient"
import type { AuthUser } from "./auth.types"

let cachedUser: AuthUser | null = null

export async function getSessionUser(): Promise<AuthUser | null> {
  if (cachedUser) return cachedUser

  const supabase = createSupabaseClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) return null

  const role =
    (data.user.user_metadata?.role as AuthUser["role"]) ?? "client"

  cachedUser = {
    id: data.user.id,
    email: data.user.email ?? "",
    role,
  }

  return cachedUser
}

export function clearSessionCache() {
  cachedUser = null
}
