import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("orbit-token");
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("orbit-token");
    if (!token) {
      setLoading(false);
      return;
    }
    api.get("/auth/me")
      .then(({ data }) => setUser(data.data.user))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  useEffect(() => {
    window.addEventListener("orbit:unauthorized", logout);
    return () => window.removeEventListener("orbit:unauthorized", logout);
  }, [logout]);

  const signIn = useCallback((data) => {
    localStorage.setItem("orbit-token", data.token);
    setUser(data.user);
  }, []);

  const value = useMemo(() => ({ user, loading, signIn, logout, setUser }), [user, loading, signIn, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
