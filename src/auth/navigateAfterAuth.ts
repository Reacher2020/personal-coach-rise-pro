import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router-dom";

export const useNavigateAfterAuth = () => {
  const { session, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session || !userRole) return;

    switch (userRole) {
      case "client":
        navigate("/client/dashboard");
        break;
      case "coach":
        navigate("/dashboard");
        break;
      case "admin":
        navigate("/admin/dashboard");
        break;
      default:
        navigate("/index");
        break;
    }
  }, [session, userRole, navigate]);
};
