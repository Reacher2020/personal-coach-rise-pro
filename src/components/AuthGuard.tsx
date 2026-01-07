import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: string; // default redirect
}

export const AuthGuard = ({ children, allowedRoles, fallback = '/auth' }: AuthGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (!user || !role || !allowedRoles.includes(role)) {
      navigate(fallback, { replace: true });
    }
  }, [user, role, authLoading, roleLoading]);

  if (authLoading || roleLoading || !user || !role) return null; // zero flicker
  return <>{children}</>;
};
