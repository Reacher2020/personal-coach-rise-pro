import { Navigate } from 'react-router-dom';
import { useUserRole, AppRole } from '@/hooks/useUserRole';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: AppRole[];
  redirectTo?: string;
}

export const RoleBasedRoute = ({ 
  children, 
  allowedRoles, 
  redirectTo = '/auth' 
}: RoleBasedRouteProps) => {
  const { role, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    // Redirect based on role
    if (role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (role === 'coach') {
      return <Navigate to="/" replace />;
    } else if (role === 'client') {
      return <Navigate to="/client" replace />;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
