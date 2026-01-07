import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { UserRoleProvider } from "@/hooks/useUserRole";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleBasedRoute } from "@/components/RoleBasedRoute";
import Index from "./pages/Index";
import Clients from "./pages/Clients";
import CalendarPage from "./pages/Calendar";
import Workouts from "./pages/Workouts";
import Progress from "./pages/Progress";
import Payments from "./pages/Payments";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientSessions from "./pages/client/ClientSessions";
import ClientWorkouts from "./pages/client/ClientWorkouts";
import ClientProgress from "./pages/client/ClientProgress";
import ClientMessages from "./pages/client/ClientMessages";
import ClientProfile from "./pages/client/ClientProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <UserRoleProvider>
            <Routes>
              <Route path="/" element={<Auth />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <AdminUsers />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <AdminSettings />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              
              {/* Client Routes */}
              <Route path="/client" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['client']}>
                    <ClientDashboard />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              <Route path="/client/sessions" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['client']}>
                    <ClientSessions />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              <Route path="/client/workouts" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['client']}>
                    <ClientWorkouts />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              <Route path="/client/progress" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['client']}>
                    <ClientProgress />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              <Route path="/client/messages" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['client']}>
                    <ClientMessages />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              <Route path="/client/profile" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['client']}>
                    <ClientProfile />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              
              {/* Coach Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['coach']}>
                    <Index />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              <Route path="/clients" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['coach']}>
                    <Clients />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['coach']}>
                    <CalendarPage />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              <Route path="/workouts" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['coach']}>
                    <Workouts />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              <Route path="/progress" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['coach']}>
                    <Progress />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              <Route path="/payments" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['coach']}>
                    <Payments />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['coach']}>
                    <Messages />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['coach']}>
                    <Settings />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </UserRoleProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
