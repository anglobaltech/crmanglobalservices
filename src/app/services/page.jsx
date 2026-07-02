"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Plus, Search, Filter, RefreshCw, Wrench,
  Clock, CheckCircle2, AlertTriangle, Users,
  TrendingUp, Calendar, ChevronRight, ChevronLeft,
  Eye, Trash2, MoreVertical, ArrowUpDown
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

const PRIORITY_CONFIG = {
  low:    { label: "Low",    className: "bg-gray-100 text-gray-600" },
  medium: { label: "Medium", className: "bg-yellow-100 text-yellow-700" },
  high:   { label: "High",   className: "bg-orange-100 text-orange-700" },
  urgent: { label: "Urgent", className: "bg-red-100 text-red-700" },
};

const STATUS_CONFIG = {
  pending:     { label: "Pending",     className: "bg-gray-100 text-gray-600" },
  assigned:    { label: "Assigned",    className: "bg-blue-100 text-blue-700" },
  in_progress: { label: "In Progress", className: "bg-indigo-100 text-indigo-700" },
  waiting:     { label: "Waiting",     className: "bg-yellow-100 text-yellow-700" },
  on_hold:     { label: "On Hold",     className: "bg-orange-100 text-orange-700" },
  review:      { label: "Review",      className: "bg-purple-100 text-purple-700" },
  completed:   { label: "Completed",   className: "bg-emerald-100 text-emerald-700" },
  cancelled:   { label: "Cancelled",   className: "bg-red-100 text-red-700" },
};

function KpiCard({ icon: Icon, label, value, color, subtitle }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value ?? "—"}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function DeadlineBadge({ dueDate }) {
  if (!dueDate) return <span className="text-gray-400 text-xs">—</span>;
  const due = new Date(dueDate);
  const now = new Date();
  const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  const fmt = due.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  if (diff < 0) return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
      <AlertTriangle size={10} /> Overdue
    </span>
  );
  if (diff <= 2) return (
    <div>
      <p className="text-xs text-gray-600">{fmt}</p>
      <span className="text-[10px] font-semibold text-orange-600">{diff === 0 ? "Due Today" : `${diff}d left`}</span>
    </div>
  );
  return <p className="text-xs text-gray-600">{fmt}</p>;
}

export default function ServicesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("crm_token") : "";

  const isManager = user?.department === "management" ||
    user?.permissions?.users === true ||
    user?.roleName?.toLowerCase().includes("manager") ||
    ["Founder & CEO", "Director", "Super Admin"].includes(user?.roleName);

  const [stats, setStats] = useState(null);
  const [services, setServices] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${API}/api/services/stats`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setStats(data);
    } catch { } finally { setStatsLoading(false); }
  }, [token]);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, pageSize });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (priorityFilter) params.set("priority", priorityFilter);
      const res = await fetch(`${API}/api/services?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setServices(data.services || []);
      setTotal(data.total || 0);
    } catch { setServices([]); } finally { setLoading(false); }
  }, [token, page, pageSize, search, statusFilter, priorityFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchServices(); }, [fetchServices]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Wrench size={24} className="text-blue-600" />
              Services
            </h1>
            <p className="text-sm text-gray-500 mt-1">Track tasks, deadlines, and team progress</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { fetchServices(); fetchStats(); }} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
              <RefreshCw size={14} />
              Refresh
            </button>
            {isManager && (
              <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer">
                <Plus size={14} />
                New Service
              </button>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
          <KpiCard icon={Wrench} label="Total Services" value={statsLoading ? "..." : stats?.total} color="bg-blue-100 text-blue-600" />
          <KpiCard icon={TrendingUp} label="Active" value={statsLoading ? "..." : stats?.active} color="bg-indigo-100 text-indigo-600" />
          <KpiCard icon={CheckCircle2} label="Completed" value={statsLoading ? "..." : stats?.completed} color="bg-emerald-100 text-emerald-600" subtitle={statsLoading ? "" : `${stats?.completionRate ?? 0}% rate`} />
          <KpiCard icon={AlertTriangle} label="Overdue" value={statsLoading ? "..." : stats?.overdue} color="bg-red-100 text-red-600" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text" placeholder="Search by name, client, employee, or ID..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer">
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
          </select>
          <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1); }} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer">
            <option value="">All Priorities</option>
            {Object.entries(PRIORITY_CONFIG).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
          </select>
          {(search || statusFilter || priorityFilter) && (
            <button onClick={() => { setSearch(""); setStatusFilter(""); setPriorityFilter(""); setPage(1); }} className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors cursor-pointer">
              Clear Filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">{total} {total === 1 ? "service" : "services"} found</p>
            <p className="text-xs text-gray-400">Page {page} of {totalPages || 1}</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw size={24} className="text-gray-300 animate-spin" />
              <p className="text-sm text-gray-400">Loading services...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Wrench size={28} className="text-gray-300" />
              </div>
              <div>
                <p className="font-semibold text-gray-700">No services found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {isManager ? "Create your first service to get started." : "You have no tasks assigned yet."}
                </p>
              </div>
              {isManager && (
                <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                  Create Service
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Service ID</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Service Name</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned To</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Deadline</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Progress</th>
                    <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {services.map((s, idx) => (
                    <tr key={s.id} className={`hover:bg-blue-50/30 transition-colors cursor-pointer ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/20"}`} onClick={() => router.push(`/services/${s.id}`)}>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600">{s.id}</td>
                      <td className="px-4 py-4 font-medium text-gray-900 max-w-[140px] truncate">{s.clientName}</td>
                      <td className="px-4 py-4 text-gray-700 max-w-[180px] truncate">{s.serviceName}</td>
                      <td className="px-4 py-4 text-gray-600">{s.assignedToName || <span className="text-gray-300 italic">Unassigned</span>}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${PRIORITY_CONFIG[s.priority]?.className || "bg-gray-100 text-gray-600"}`}>
                          {PRIORITY_CONFIG[s.priority]?.label || s.priority}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${STATUS_CONFIG[s.status]?.className || "bg-gray-100 text-gray-600"}`}>
                          {STATUS_CONFIG[s.status]?.label || s.status}
                        </span>
                      </td>
                      <td className="px-4 py-4"><DeadlineBadge dueDate={s.dueDate} /></td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[60px]">
                            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${s.progress || 0}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-gray-500 min-w-[30px]">{s.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center" onClick={e => e.stopPropagation()}>
                        <button onClick={() => router.push(`/services/${s.id}`)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 text-xs rounded-lg border transition-colors cursor-pointer ${p === page ? "bg-blue-600 border-blue-600 text-white font-bold" : "border-gray-200 hover:bg-gray-50 text-gray-600"}`}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateServiceModal
          token={token}
          currentUser={user}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); fetchServices(); fetchStats(); }}
        />
      )}
    </div>
  );
}

function CreateServiceModal({ token, currentUser, onClose, onCreated }) {
  const [form, setForm] = useState({
    serviceName: "", clientName: "", description: "", category: "General",
    priority: "medium", assignedTo: "", assignedToName: "", dueDate: "",
    currentStage: "Not Started",
  });
  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/api/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setUsers(Array.isArray(d.users) ? d.users : Array.isArray(d) ? d : []))
      .catch(() => setUsers([]));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.serviceName || !form.clientName) { setError("Service Name and Client are required."); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API}/api/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      onCreated();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Create New Service</h2>
          <p className="text-sm text-gray-500 mt-1">Fill in the details to assign a new service task</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Service Name *</label>
              <input value={form.serviceName} onChange={e => setForm(f => ({ ...f, serviceName: e.target.value }))} placeholder="e.g. ISI Certificate Renewal" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Client Name *</label>
              <input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} placeholder="e.g. Ravi Industries" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer">
                {Object.entries(PRIORITY_CONFIG).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Category</label>
              <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Certification" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Assign To</label>
              <select value={form.assignedTo} onChange={e => {
                const selected = users.find(u => u.id === e.target.value);
                setForm(f => ({ ...f, assignedTo: e.target.value, assignedToName: selected ? selected.name : "" }));
              }} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer">
                <option value="">— Unassigned —</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.department})</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Provide a brief description of the service task..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer">
              {saving ? "Creating..." : "Create Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
