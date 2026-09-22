import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("ch_token") || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe() {
    const res = await api.get("/api/ch/users/me");
    setUser(res.data.user);
  }

  useEffect(() => {
    (async () => {
      try {
        if (token) {
          await fetchMe();
        } else {
          setUser(null);
        }
      } catch {
        localStorage.removeItem("ch_token");
        setToken("");
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email, password) {
    const res = await api.post("/api/auth/login", { email, password });
    const t = res.data.token;
    localStorage.setItem("ch_token", t);
    setToken(t);
    await fetchMe();
  }

  // Signup now only creates the account, does NOT log in.
  async function signup(payload) {
    await api.post("/api/auth/signup", payload);
  }

  function logout() {
    localStorage.removeItem("ch_token");
    setToken("");
    setUser(null);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      signup,
      logout,
      refreshMe: fetchMe,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}