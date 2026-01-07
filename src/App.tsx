import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "@/modules/auth/AuthProvider"
import Routes from "./Routes"

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </BrowserRouter>
  )
}
