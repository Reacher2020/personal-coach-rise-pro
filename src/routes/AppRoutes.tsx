import { Route, Routes } from 'react-router-dom';
import Auth from '@/pages/Auth';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import CoachDashboard from '@/pages/coach/CoachDashboard';
import ClientDashboard from '@/pages/client/ClientDashboard';
import { AuthGuard } from '@/components/AuthGuard';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/auth" element={<Auth />} />

      {/* Admin routes */}
      <Route
        path="/admin/*"
        element={
          <AuthGuard allowedRoles={['admin']}>
            <AdminDashboard />
          </AuthGuard>
        }
      />

      {/* Coach routes */}
      <Route
        path="/"
        element={
          <AuthGuard allowedRoles={['coach']}>
            <CoachDashboard />
          </AuthGuard>
        }
      />

      {/* Client routes */}
      <Route
        path="/client/*"
        element={
          <AuthGuard allowedRoles={['client']}>
            <ClientDashboard />
          </AuthGuard>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Auth />} />
    </Routes>
  );
};
