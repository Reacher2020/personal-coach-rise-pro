import { Routes, Route } from 'react-router-dom';
import Auth from '@/pages/Auth';
import AdminPage from '@/pages/Admin';
import CoachPage from '@/pages/Coach';
import ClientPage from '@/pages/Client';
import { AuthGuard } from '@/components/AuthGuard';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />

      <Route
        path="/admin"
        element={
          <AuthGuard allowedRoles={['admin']}>
            <AdminPage />
          </AuthGuard>
        }
      />

      <Route
        path="/"
        element={
          <AuthGuard allowedRoles={['coach']}>
            <CoachPage />
          </AuthGuard>
        }
      />

      <Route
        path="/client"
        element={
          <AuthGuard allowedRoles={['client']}>
            <ClientPage />
          </AuthGuard>
        }
      />

      <Route path="*" element={<Auth />} />
    </Routes>
  );
};
