"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { SERVICE_TYPES } from "@/lib/data/projectChecklists";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function CreateProjectModal({ onClose, onCreated }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("crm_token") : "";
  const { createProject } = useProjects();
  
  const [form, setForm] = useState({ 
    projectName: "", 
    clientName: "", 
    serviceType: "isi", 
    dueDate: "", 
    notes: "", 
    assignedTo: [], 
    assignedToNames: [] 
  });
  
  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/api/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setUsers(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [token]);

  const toggleUser = (u) => {
    setForm(prev => {
      const ids = prev.assignedTo;
      const names = prev.assignedToNames;
      if (ids.includes(u.id)) {
        return { 
          ...prev, 
          assignedTo: ids.filter(id => id !== u.id), 
          assignedToNames: names.filter(n => n !== u.name) 
        };
      }
      return { 
        ...prev, 
        assignedTo: [...ids, u.id], 
        assignedToNames: [...names, u.name || u.email] 
      };
    });
  };

  const handleSubmit = async () => {
    if (!form.projectName || !form.clientName) return setError("Project name and client name are required");
    setSaving(true); 
    setError("");
    try {
      await createProject(form);
      onCreated();
      onClose();
    } catch (err) { 
      setError(err.message); 
    } finally { 
      setSaving(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.5)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">New Certification Project</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Service Type</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(SERVICE_TYPES).map(([key, { label }]) => (
                <button key={key} onClick={() => setForm(f => ({ ...f, serviceType: key }))}
                  className={`px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition cursor-pointer text-left ${form.serviceType === key ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Project Name</label>
            <input value={form.projectName} onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))}
              placeholder="e.g. ABC Pvt Ltd – ISI Mark"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Client Name</label>
            <input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
              placeholder="Client company name"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Due Date (Optional)</label>
            <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Assign Employees</label>
            <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
              {users.filter(u => u.isActive !== false).map(u => (
                <button key={u.id} onClick={() => toggleUser(u)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition cursor-pointer text-left ${form.assignedTo.includes(u.id) ? "bg-blue-50" : "hover:bg-gray-50"}`}>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${form.assignedTo.includes(u.id) ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}>
                    {form.assignedTo.includes(u.id) && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{u.name || u.email}</p>
                    <p className="text-xs text-gray-400">{u.roleName}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Notes (Optional)</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2} placeholder="Any additional notes..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-6 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer">
            {saving ? "Creating..." : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
