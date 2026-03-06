import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");

    if (!storedUser) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      JSON.parse(storedUser);
      navigate("/dashboard", { replace: true });
    } catch {
      localStorage.removeItem("auth_user");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return null; // No UI needed, this is just a redirect handler
}