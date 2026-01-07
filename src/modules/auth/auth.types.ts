export type UserRole = "trainer" | "client"

export interface AuthUser {
  id: string
  email: string
  role: UserRole
}
