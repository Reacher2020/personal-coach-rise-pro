import { createContext, useContext, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  userRole: string | null;
  setSession: (s: Session | null) => void;
  setUserRole: (r: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  userRole: null,
  setSession: () => {},
  setUserRole: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ session, userRole, setSession, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
