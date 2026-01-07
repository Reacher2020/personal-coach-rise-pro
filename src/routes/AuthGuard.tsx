import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: string;
}

export const AuthGuard = ({ children, allowedRoles, fallback = '/auth' }: AuthGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (!user || !role || !allowedRoles.includes(role)) {
      toast({
        title: 'Brak dostępu',
        description: 'Nie masz uprawnień do tej strony',
        variant: 'destructive',
      });
      navigate(fallback, { replace: true });
    }
  }, [user, role, authLoading, roleLoading]);

  if (authLoading || roleLoading || !user || !role) return null; // zero flicker
  return <>{children}</>;
};
