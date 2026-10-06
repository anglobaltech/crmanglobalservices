import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const API = process.env.NEXT_PUBLIC_API_URL;

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

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

  const toggleIsiStep = async (stepId, { dateValue, remark, code } = {}) => {
    try {
      const res = await fetch(`${API}/api/projects/${id}/stage/${stepId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ dateValue: dateValue || null, remark: remark || null, code: code || "" }),
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
      const serviceType = (project?.serviceType || "unknown").toLowerCase();
      const projectId = id;
      const storagePath = `projects/${serviceType}/${projectId}/${Date.now()}_${file.name}`;
      
      const base64File = await fileToBase64(file);
      
      const uploadRes = await fetch(`${API}/api/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ base64File, storagePath })
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) throw new Error(uploadData.message || "Failed to upload file");
      
      const url = uploadData.url;
      if (onProgress) onProgress(100);
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

  const addCalibrationDoc = async (machineName, validityDate, file, onProgress) => {
    if (!file) return;
    try {
      const docId = 'cal_' + Date.now();
      const serviceType = (project?.serviceType || "hallmarking").toLowerCase();
      const projectId = id;
      const storagePath = `projects/${serviceType}/${projectId}/${docId}_${file.name}`;
      
      const base64File = await fileToBase64(file);
      
      const uploadRes = await fetch(`${API}/api/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ base64File, storagePath })
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) throw new Error(uploadData.message || "Failed to upload file");
      
      const url = uploadData.url;
      if (onProgress) onProgress(100);
      const newDoc = {
        id: docId,
        machineName,
        validityDate,
        file: { name: file.name, url, storagePath, uploadedBy: user?.name || user?.email || "Unknown", uploadedAt: new Date().toISOString(), size: file.size }
      };

      const newDocs = [...(project.calibrationDocs || []), newDoc];
      await updateProjectField({ 
        calibrationDocs: newDocs,
        comment: `Calibration document "${file.name}" was uploaded for machine "${machineName}"`
      });
    } catch(e) { throw e; }
  };

  const removeCalibrationDoc = async (docId) => {
    // File is kept in Firebase Storage; only the Firestore reference is removed.
    const docs = project.calibrationDocs || [];
    const removedDoc = docs.find(d => d.id === docId);
    const newDocs = docs.filter(d => d.id !== docId);
    await updateProjectField({ 
      calibrationDocs: newDocs,
      comment: `Calibration document for machine "${removedDoc?.machineName || 'Unknown'}" was removed from project`
    });
  };

  const updateCalibrationDoc = async (docId, updates) => {
    const docs = project.calibrationDocs || [];
    const updatedDoc = docs.find(d => d.id === docId);
    const newDocs = docs.map(d => d.id === docId ? { ...d, ...updates } : d);
    await updateProjectField({ 
      calibrationDocs: newDocs,
      comment: `Calibration document details for machine "${updatedDoc?.machineName || 'Unknown'}" were updated`
    });
  };

  const uploadIsiDocSlot = async (slotId, file, onProgress) => {
    if (!file) return;
    try {
      const serviceType = (project?.serviceType || "unknown").toLowerCase();
      const projectId = id;
      const storagePath = `projects/${serviceType}/${projectId}/${slotId}_${Date.now()}_${file.name}`;
      
      const base64File = await fileToBase64(file);
      
      const uploadRes = await fetch(`${API}/api/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ base64File, storagePath })
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) throw new Error(uploadData.message || "Failed to upload file");
      
      const url = uploadData.url;
      if (onProgress) onProgress(100);
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
    // File is kept in Firebase Storage; only the Firestore slot reference is cleared.
    try {
      const slot = (project.isiDocSlots || []).find((s) => s.id === slotId);
      const isiDocSlots = (project.isiDocSlots || []).map((s) =>
        s.id === slotId ? { ...s, file: null } : s
      );
      await fetch(`${API}/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          isiDocSlots,
          comment: `Document slot "${slot?.label || slotId}" was cleared` 
        }),
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
      const slot = (project.isiDocSlots || []).find((s) => s.id === slotId);
      await fetch(`${API}/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          isiDocSlots,
          comment: `Document text slot "${slot?.label || slotId}" was updated`
        }),
      });
      fetchProject();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteDocument = async (doc) => {
    // File is kept in Firebase Storage; only the Firestore reference is removed.
    try {
      const updatedDocs = (project.documents || []).filter((d) => d.storagePath !== doc.storagePath);
      await fetch(`${API}/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          documents: updatedDocs,
          comment: `General document "${doc.name || 'Unknown'}" was removed from project`
        }),
      });
      fetchProject();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const addPaymentInstallment = async ({ amount, date, note, referenceId, excessReason }) => {
    try {
      const res = await fetch(`${API}/api/projects/${id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, date, note, referenceId, excessReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add payment");
      fetchProject();
      fetchActivity(1);
      return data.installment;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deletePaymentInstallment = async (installmentId) => {
    try {
      const res = await fetch(`${API}/api/projects/${id}/payment/${installmentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to remove installment");
      fetchProject();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateProjectField = async (fields) => {
    try {
      const res = await fetch(`${API}/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");
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
    updateProjectField,
    uploadDocument,
    deleteDocument,
    uploadIsiDocSlot,
    removeIsiDocSlot,
    updateIsiDocSlot,
    deleteProject,
    refetchAll,
    addPaymentInstallment,
    deletePaymentInstallment,
  };
}

