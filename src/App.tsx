import { AuthProvider } from "@/modules/auth/AuthProvider"
import DebugRoot from "./DebugRoot"

export default function App() {
  return (
    <AuthProvider>
      <DebugRoot />
    </AuthProvider>
  )
}
