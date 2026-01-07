import { useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useInviteRegistration = () => {
  const { setSession, setUserRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerWithInvite = async (token: string, email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // Weryfikacja zaproszenia na backendzie
      const { data: inviteData, error: inviteError } = await supabase
        .from("invitations")
        .select("*")
        .eq("token", token)
        .single();

      if (inviteError || !inviteData) {
        setError("Nieprawidłowy lub wygasły token zaproszenia.");
        setLoading(false);
        return;
      }

      // Tworzenie konta w Supabase
      const { data: userData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Ustawienie sesji w kontekście
      const session = userData?.session ?? null;
      if (session) setSession(session);

      // Ustawienie roli użytkownika z zaproszenia
      setUserRole(inviteData.role);

      setLoading(false);
      return userData;
    } catch (err: any) {
      setError(err.message || "Błąd rejestracji.");
      setLoading(false);
    }
  };

  return { registerWithInvite, loading, error };
};
