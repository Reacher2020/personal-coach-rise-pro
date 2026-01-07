import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useUserRole } from "@/hooks/useUserRole"
import { Loader2 } from "lucide-react"

// Pages
import Index from "@/pages/Index"
import Auth from "@/pages/Auth"
import Clients from "@/pages/Clients"
import Calendar from "@/pages/Calendar"
import Payments from "@/pages/Payments"
import Messages from "@/pages/Messages"
import Settings from "@/pages/Settings"
import AdminDashboard from "@/pages/admin/AdminDashboard"
import ClientDashboard from "@/pages/client/ClientDashboard"
import ClientSessions from "@/pages/client/ClientSessions"
import ClientWorkouts from "@/pages/client/ClientWorkouts"
import ClientProgress from "@/pages/client/ClientProgress"
import ClientMessages from "@/pages/client/ClientMessages"
import ClientProfile from "@/pages/client/ClientProfile"
import NotFound from "@/pages/NotFound"

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect based on role
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'client') return <Navigate to="/client" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public route */}
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
      
      {/* Coach routes */}
      <Route path="/" element={<ProtectedRoute allowedRoles={['coach', 'admin']}><Index /></ProtectedRoute>} />
      <Route path="/clients" element={<ProtectedRoute allowedRoles={['coach', 'admin']}><Clients /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute allowedRoles={['coach', 'admin']}><Calendar /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute allowedRoles={['coach', 'admin']}><Payments /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute allowedRoles={['coach', 'admin']}><Messages /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      
      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      
      {/* Client routes */}
      <Route path="/client" element={<ProtectedRoute allowedRoles={['client']}><ClientDashboard /></ProtectedRoute>} />
      <Route path="/client/sessions" element={<ProtectedRoute allowedRoles={['client']}><ClientSessions /></ProtectedRoute>} />
      <Route path="/client/workouts" element={<ProtectedRoute allowedRoles={['client']}><ClientWorkouts /></ProtectedRoute>} />
      <Route path="/client/progress" element={<ProtectedRoute allowedRoles={['client']}><ClientProgress /></ProtectedRoute>} />
      <Route path="/client/messages" element={<ProtectedRoute allowedRoles={['client']}><ClientMessages /></ProtectedRoute>} />
      <Route path="/client/profile" element={<ProtectedRoute allowedRoles={['client']}><ClientProfile /></ProtectedRoute>} />
      
      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
