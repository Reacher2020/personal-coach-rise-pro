import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'admin' | 'coach' | 'client' | null;

interface UserRoleContextType {
  role: AppRole;
  loading: boolean;
  hasRole: (role: AppRole) => boolean;
  isAdmin: boolean;
  isCoach: boolean;
  isClient: boolean;
  refetchRole: () => Promise<void>;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export const UserRoleProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async () => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('get_user_role', { _user_id: user.id });

      if (error) {
        console.error('Error fetching role:', error);
        setRole(null);
      } else {
        setRole(data as AppRole);
      }
    } catch (err) {
      console.error('Error fetching role:', err);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRole();
  }, [user]);

  const hasRole = (checkRole: AppRole) => role === checkRole;
  const isAdmin = role === 'admin';
  const isCoach = role === 'coach';
  const isClient = role === 'client';

  return (
    <UserRoleContext.Provider value={{ 
      role, 
      loading, 
      hasRole, 
      isAdmin, 
      isCoach, 
      isClient,
      refetchRole: fetchRole 
    }}>
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
};
