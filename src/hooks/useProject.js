import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

const API = process.env.NEXT_PUBLIC_API_URL;

export function useProject(id) {
  const { user } = useAuth();
  const token = typeof window !== "undefined" ? localStorage.getItem("crm_token") : "";

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activity, setActivity] = useState([]);
  const [actTotal, setActTotal] = useState(0);
  const [actPage, setActPage] = useState(1);
  const ACT_PAGE_SIZE = 10;

  const isManager =
    user?.department === "management" ||
    user?.permissions?.users === true ||
    user?.roleName?.toLowerCase().includes("manager") ||
    ["Founder & CEO", "Director", "Super Admin"].includes(user?.roleName);

  const fetchProject = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch project");
      setProject(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  const fetchActivity = useCallback(async (page = 1) => {
    if (!id) return;
    try {
      const res = await fetch(
        `${API}/api/projects/${id}/activity?page=${page}&pageSize=${ACT_PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch activity");
      setActivity(data.activity || []);
      setActTotal(data.total || 0);
      setActPage(page);
    } catch (err) {
      console.error(err);
    }
  }, [id, token]);

  useEffect(() => {
    fetchProject();
    fetchActivity(1);
  }, [fetchProject, fetchActivity]);

  const refetchAll = () => {
    fetchProject();
    fetchActivity(actPage);
  };

  const toggleChecklistItem = async (itemId) => {
    try {
      const res = await fetch(`${API}/api/projects/${id}/checklist/${itemId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to toggle checklist item");
      fetchProject();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleIsiStep = async (stepId, { dateValue, remark } = {}) => {
    try {
      const res = await fetch(`${API}/api/projects/${id}/stage/${stepId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ dateValue: dateValue || null, remark: remark || null }),
      });
      if (!res.ok) throw new Error("Failed to toggle stage step");
      fetchProject();
      fetchActivity(1);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProject = async () => {
    try {
      const res = await fetch(`${API}/api/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete project");
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const addRemark = async ({ message, stepId, stepLabel }) => {
    if (!message?.trim()) return;
    try {
      const res = await fetch(`${API}/api/projects/${id}/remark`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: message.trim(), stepId: stepId || null, stepLabel: stepLabel || null }),
      });
      if (!res.ok) throw new Error("Failed to add remark");
      fetchActivity(1);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const addComment = async (comment) => {
    try {
      const res = await fetch(`${API}/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ comment }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      fetchActivity(1);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateStatus = async (status) => {
    try {
      const res = await fetch(`${API}/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      fetchProject();
      fetchActivity(1);
    } catch (err) {
      console.error(err);
    }
  };

  const updateProject = async (updates) => {
    try {
      const res = await fetch(`${API}/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update project");
      fetchProject();
      fetchActivity(1);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };


  const uploadDocument = async (file, onProgress) => {
    if (!file) return;
    try {
      const sanitize = (str = "") => str.replace(/[\/\\:*?"<>|]/g, "").trim() || "Unknown";
      const serviceType = project?.serviceType ? project.serviceType.toLowerCase().replace(/[\/\\:*?"<>|]/g, "").trim() : "unknown";
      const moduleFolder = `${serviceType}-projects`;
      const companyFolder = sanitize(project?.clientName);
      const storagePath = `${moduleFolder}/${companyFolder}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      const task = uploadBytesResumable(storageRef, file);

      await new Promise((resolve, reject) => {
        task.on(
          "state_changed",
          (snap) => {
            const progress = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
            if (onProgress) onProgress(progress);
          },
          reject,
          resolve
        );
      });

      const url = await getDownloadURL(storageRef);
      const newDoc = {
        name: file.name,
        url,
        storagePath,
        uploadedBy: user?.name || user?.email || "Unknown",
        uploadedAt: new Date().toISOString(),
        size: file.size,
      };

      const updatedDocs = [...(project.documents || []), newDoc];
      await fetch(`${API}/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ documents: updatedDocs, comment: `Document uploaded: "${file.name}"` }),
      });

      fetchProject();
      fetchActivity(1);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const uploadIsiDocSlot = async (slotId, file, onProgress) => {
    if (!file) return;
    try {
      const sanitize = (str = "") => str.replace(/[\/\\:*?"<>|]/g, "").trim() || "Unknown";
      const serviceType = project?.serviceType ? project.serviceType.toLowerCase().replace(/[\/\\:*?"<>|]/g, "").trim() : "unknown";
      const moduleFolder = `${serviceType}-projects`;
      const companyFolder = sanitize(project?.clientName);
      const storagePath = `${moduleFolder}/${companyFolder}/${slotId}_${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      const task = uploadBytesResumable(storageRef, file);

      await new Promise((resolve, reject) => {
        task.on(
          "state_changed",
          (snap) => {
            const progress = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
            if (onProgress) onProgress(progress);
          },
          reject,
          resolve
        );
      });

      const url = await getDownloadURL(storageRef);
      const isiDocSlots = (project.isiDocSlots || []).map((slot) => {
        if (slot.id !== slotId) return slot;
        return {
          ...slot,
          file: {
            name: file.name,
            url,
            storagePath,
            uploadedBy: user?.name || user?.email || "Unknown",
            uploadedAt: new Date().toISOString(),
            size: file.size,
          },
        };
      });

      await fetch(`${API}/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          isiDocSlots,
          comment: `Document "${file.name}" uploaded for required document slot`,
        }),
      });

      fetchProject();
      fetchActivity(1);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const removeIsiDocSlot = async (slotId) => {
    try {
      const slot = (project.isiDocSlots || []).find((s) => s.id === slotId);
      if (slot?.file?.storagePath) {
        try { await deleteObject(ref(storage, slot.file.storagePath)); } catch {}
      }
      const isiDocSlots = (project.isiDocSlots || []).map((s) =>
        s.id === slotId ? { ...s, file: null } : s
      );
      await fetch(`${API}/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isiDocSlots }),
      });
      fetchProject();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateIsiDocSlot = async (slotId, valueOrRows) => {
    try {
      const isiDocSlots = (project.isiDocSlots || []).map((s) =>
        s.id === slotId ? { ...s, value: valueOrRows } : s
      );
      await fetch(`${API}/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isiDocSlots }),
      });
      fetchProject();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteDocument = async (doc) => {
    try {
      if (doc.storagePath) {
        try { await deleteObject(ref(storage, doc.storagePath)); } catch {}
      }
      const updatedDocs = (project.documents || []).filter((d) => d.storagePath !== doc.storagePath);
      await fetch(`${API}/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ documents: updatedDocs }),
      });
      fetchProject();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    project,
    loading,
    error,
    isManager,
    activity,
    actTotal,
    actPage,
    ACT_PAGE_SIZE,
    fetchActivity,
    toggleChecklistItem,
    toggleIsiStep,
    addRemark,
    addComment,
    updateStatus,
    updateProject,
    uploadDocument,
    deleteDocument,
    uploadIsiDocSlot,
    removeIsiDocSlot,
    updateIsiDocSlot,
    deleteProject,
    refetchAll,
  };
}
