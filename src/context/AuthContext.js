"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("crm_user");
    localStorage.removeItem("crm_token");
    window.location.href = "/login";
  };

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("JWT Parse Error", e);
      return null;
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("crm_user");
      const token = localStorage.getItem("crm_token");
      
      if (stored && token) {
        const payload = parseJwt(token);
        if (!payload || !payload.exp) {
          logout();
          return;
        }

        const timeUntilExpiry = (payload.exp * 1000) - Date.now();
        
        if (timeUntilExpiry <= 0) {
          logout();
          return;
        }

        const parsed = JSON.parse(stored);
        setUser(parsed);

        const timeout = setTimeout(() => {
          logout();
        }, timeUntilExpiry);

        setLoading(false);
        return () => clearTimeout(timeout);
      }
    } catch (e) {
      console.error("Auth init error:", e);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("crm_user", JSON.stringify(userData));
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
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          logout();
        }
        return;
      }

      const fresh = await res.json();
      setUser(fresh);
      localStorage.setItem("crm_user", JSON.stringify(fresh));
    } catch {}
  };

  const managerRoles = [
    "Super Admin",
    "Founder & CEO",
    "Director",
    "Branch Manager",
    "Manager",
    "Team Manager",
    "Assistant Manager",
  ];

  const adminRoles = [
    "Super Admin",
    "Founder & CEO",
    "Director"
  ];

  const isManager = user ? managerRoles.includes(user.roleName) : false;
  const isAdmin = user ? adminRoles.includes(user.roleName) : false;

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, loading, isManager, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}