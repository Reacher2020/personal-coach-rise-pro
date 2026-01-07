import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "@/hooks/useAuth"
import { UserRoleProvider } from "@/hooks/useUserRole"
import { Toaster } from "@/components/ui/toaster"
import Routes from "./Routes"

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserRoleProvider>
          <Routes />
          <Toaster />
        </UserRoleProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
