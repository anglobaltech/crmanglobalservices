import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL;

export function useProjects(filters = {}) {
  const { user } = useAuth();
  const token = typeof window !== "undefined" ? localStorage.getItem("crm_token") : "";

  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isManager = user?.department === "management" ||
    user?.permissions?.users === true ||
    user?.roleName?.toLowerCase().includes("manager") ||
    ["Founder & CEO", "Director", "Super Admin"].includes(user?.roleName);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/projects/stats`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }, [token]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.serviceType) params.set("serviceType", filters.serviceType);
      if (filters.status) params.set("status", filters.status);
      if (filters.search) params.set("search", filters.search);

      const res = await fetch(`${API}/api/projects?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch projects");
      setProjects(data.projects || []);
    } catch (err) {
      setError(err.message);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [token, filters.serviceType, filters.status, filters.search]);

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchProjects();
    }
  }, [fetchStats, fetchProjects, token]);

  const createProject = async (projectData) => {
    const res = await fetch(`${API}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(projectData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create project");
    fetchStats();
    fetchProjects();
    return data;
  };

  return {
    projects,
    stats,
    loading,
    error,
    isManager,
    refetch: () => {
      fetchStats();
      fetchProjects();
    },
    createProject,
  };
}
