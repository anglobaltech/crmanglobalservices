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
    address: "",
    name: "",
    phone: "",
    email: "",
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
    if (!form.projectName) return setError("Company name is required");
    // Automatically set clientName same as projectName if left empty since they requested to replace Project Name with Company Name
    const finalForm = { ...form, clientName: form.clientName || form.projectName };
    setSaving(true); 
    setError("");
    try {
      await createProject(finalForm);
      onCreated();
      onClose();
    } catch (err) { 
      setError(err.message); 
    } finally { 
      setSaving(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">New Certification Project</h2>
            <p className="text-sm text-gray-500 mt-1">Fill in the details to start a new project</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>
        
        {/* Form Body */}
        <div className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Service Type (Full width) */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Service Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(SERVICE_TYPES).map(([key, { label }]) => (
                  <button key={key} onClick={() => setForm(f => ({ ...f, serviceType: key }))}
                    className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer text-center flex items-center justify-center ${form.serviceType === key ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-white"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Company Name (Full width) */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Company Name <span className="text-red-500">*</span></label>
              <input value={form.projectName} onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))}
                placeholder="Enter company name"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all focus:bg-white placeholder-gray-400" />
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Contact Person Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Enter contact person name"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all focus:bg-white placeholder-gray-400" />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="Enter phone number"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all focus:bg-white placeholder-gray-400" />
            </div>

            {/* Email ID */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Email ID</label>
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="Enter email address"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all focus:bg-white placeholder-gray-400" />
            </div>

            {/* Address */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Address</label>
              <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Enter complete address"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all focus:bg-white placeholder-gray-400" />
            </div>

            {/* Assign Employees */}
            <div className="md:col-span-1">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Assign Employees</label>
              <div className="h-[120px] overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100 bg-gray-50">
                {users.filter(u => u.isActive !== false).map(u => (
                  <button key={u.id} onClick={() => toggleUser(u)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all cursor-pointer text-left ${form.assignedTo.includes(u.id) ? "bg-blue-50/50" : "hover:bg-white"}`}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${form.assignedTo.includes(u.id) ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}>
                      {form.assignedTo.includes(u.id) && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{u.name || u.email}</p>
                      <p className="text-[11px] text-gray-500">{u.roleName}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="md:col-span-1">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Notes (Optional)</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Any additional notes or instructions..."
                className="w-full h-[120px] px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none focus:bg-white placeholder-gray-400" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl mt-auto">
          <button onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-all cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-8 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2">
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating...
              </>
            ) : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
