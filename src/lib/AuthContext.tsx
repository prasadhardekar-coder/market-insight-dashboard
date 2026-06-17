import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Role = "Authority" | "Resident" | "Researcher";

export interface User {
  name: string;
  email: string;
  role: Role;
  airport: string; // preferred airport code
  avatar: string;
}

interface Ctx {
  user: User | null;
  login: (email: string, _password: string) => boolean;
  signup: (u: Omit<User, "avatar">, _password: string) => boolean;
  logout: () => void;
  loading: boolean;
}

const AuthCtx = createContext<Ctx | null>(null);
const KEY = "aerosense.user";

function makeAvatar(name: string) {
  const letters = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "AE";
  return letters;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  const login = useCallback((email: string, _password: string) => {
    if (!email.includes("@")) return false;
    const name = email.split("@")[0].replace(/[._-]/g, " ");
    const u: User = { name, email, role: "Authority", airport: "BLR", avatar: makeAvatar(name) };
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
    return true;
  }, []);

  const signup = useCallback((u: Omit<User, "avatar">, _password: string) => {
    if (!u.email.includes("@") || !u.name) return false;
    const full: User = { ...u, avatar: makeAvatar(u.name) };
    localStorage.setItem(KEY, JSON.stringify(full));
    setUser(full);
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, signup, logout, loading }), [user, login, signup, logout, loading]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}
