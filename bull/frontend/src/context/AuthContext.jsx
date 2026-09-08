import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("invoice_token")));

  useEffect(() => {
    if (!localStorage.getItem("invoice_token")) return;
    api("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem("invoice_token"))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async authenticate(mode, credentials) {
        const data = await api(`/auth/${mode}`, {
          method: "POST",
          body: JSON.stringify(credentials)
        });
        localStorage.setItem("invoice_token", data.token);
        setUser(data.user);
      },
      logout() {
        localStorage.removeItem("invoice_token");
        setUser(null);
      }
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
