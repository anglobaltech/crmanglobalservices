"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("crm_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch {}
    setLoading(false);
  }, []);

  // Called after login
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("crm_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("crm_user");
    localStorage.removeItem("crm_token");
    window.location.href = "/login";
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("crm_token");
      const stored = localStorage.getItem("crm_user");
      if (!token || !stored) return;

      const { id } = JSON.parse(stored);
      if (!id) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return;

      const fresh = await res.json();
      setUser(fresh);
      localStorage.setItem("crm_user", JSON.stringify(fresh));
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}