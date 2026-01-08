import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { ErrorBoundary } from "@/shared/security/ErrorBoundary"
import { AuthProvider } from "@/hooks/useAuth"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
)

