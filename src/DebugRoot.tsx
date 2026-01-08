import { useAuth } from "@/modules/auth/AuthProvider"

export default function DebugRoot() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div style={{ padding: 40 }}>Loading…</div>
  }

  if (!user) {
    return <div style={{ padding: 40 }}>No user</div>
  }

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 28, color: "green" }}>
        APLIKACJA DZIAŁA
      </h1>

      <p>
        User: <b>{user.email}</b>
      </p>
      <p>
        Rola: <b>{user.role}</b>
      </p>
    </div>
  )
}
