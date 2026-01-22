import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { UserRoleProvider } from "@/hooks/useUserRole";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleBasedRoute } from "@/components/RoleBasedRoute";
import Auth from "./pages/";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminMessages from "./pages/admin/AdminMessages";

// Coach pages
import CoachDashboard from "./pages/coach/CoachDashboard";
import CoachClients from "./pages/coach/CoachClients";
import CoachCalendar from "./pages/coach/CoachCalendar";
import CoachWorkouts from "./pages/coach/CoachWorkouts";
import CoachProgress from "./pages/coach/CoachProgress";
import CoachPayments from "./pages/coach/CoachPayments";
import CoachMessages from "./pages/coach/CoachMessages";
import CoachSettings from "./pages/coach/CoachSettings";

// Client pages
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientSessions from "./pages/client/ClientSessions";
import ClientWorkouts from "./pages/client/ClientWorkouts";
import ClientProgress from "./pages/client/ClientProgress";
import ClientMessages from "./pages/client/ClientMessages";
import ClientSettings from "./pages/client/ClientSettings";

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
              <Route path="*" element={<Auth />} />
              
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
              <Route path="/admin/messages" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <AdminMessages />
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
              <Route path="/client/settings" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['client']}>
                    <ClientSettings />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              
              {/* Coach Routes */}
              <Route path="/coach" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['coach']}>
                    <CoachDashboard />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              <Route path="/coach/clients" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['coach']}>
                    <CoachClients />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              <Route path="/coach/calendar" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['coach']}>
                    <CoachCalendar />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              <Route path="/coach/workouts" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['coach']}>
                    <CoachWorkouts />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              <Route path="/coach/progress" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['coach']}>
                    <CoachProgress />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              <Route path="/coach/payments" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['coach']}>
                    <CoachPayments />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              <Route path="/coach/messages" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['coach']}>
                    <CoachMessages />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } />
              <Route path="/coach/settings" element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={['coach']}>
                    <CoachSettings />
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
