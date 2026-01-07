import { Routes, Route } from 'react-router-dom';
import Auth from '@/pages/Auth';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import CoachDashboard from '@/pages/coach/CoachDashboard';
import ClientDashboard from '@/pages/client/ClientDashboard';
import { AuthGuard } from '@/components/AuthGuard';

export const AppRoutes = () => (
  <Routes>
    {/* public route */}
    <Route path="/auth" element={<Auth />} />

    {/* admin routes */}
    <Route
      path="/admin/*"
      element={
        <AuthGuard allowedRoles={['admin']}>
          <AdminDashboard />
        </AuthGuard>
      }
    />

    {/* coach routes */}
    <Route
      path="/"
      element={
        <AuthGuard allowedRoles={['coach']}>
          <CoachDashboard />
        </AuthGuard>
      }
    />

    {/* client routes */}
    <Route
      path="/client/*"
      element={
        <AuthGuard allowedRoles={['client']}>
          <ClientDashboard />
        </AuthGuard>
      }
    />

    {/* fallback */}
    <Route path="*" element={<Auth />} />
  </Routes>
);
