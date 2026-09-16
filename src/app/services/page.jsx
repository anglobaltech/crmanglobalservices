"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Plus, Search, Filter, RefreshCw, Wrench,
  Clock, CheckCircle2, AlertTriangle, Users,
  TrendingUp, Calendar, ChevronRight, ChevronLeft,
  Eye, Trash2, MoreVertical, ArrowUpDown,
  Upload, X, FileText
} from "lucide-react";

import DataTable, { OverflowCell } from "@/components/common/DataTable";

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

function KpiCard({ icon: Icon, label, value, color, selected, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl border ${selected ? "border-blue-500 ring-2 ring-blue-500/20 shadow-md" : "border-gray-200"} shadow-sm p-4 flex items-center gap-4 hover:border-gray-300 hover:shadow-md transition-all ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={20} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5 truncate">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-gray-900">{value ?? "—"}</p>
        </div>
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
  const [kpiFilter, setKpiFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const ALL_SERVICE_COLUMNS = ["id", "clientName", "serviceName", "assignedToName", "priority", "status", "dueDate", "progress", "actions"];
  const [selectedCols, setSelectedCols] = useState(ALL_SERVICE_COLUMNS);

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
      if (kpiFilter) params.set("kpiFilter", kpiFilter);
      const res = await fetch(`${API}/api/services?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setServices(data.services || []);
      setTotal(data.total || 0);
    } catch { setServices([]); } finally { setLoading(false); }
  }, [token, page, pageSize, search, statusFilter, priorityFilter, kpiFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchServices(); }, [fetchServices]);

  const totalPages = Math.ceil(total / pageSize);

  const handleDeleteService = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const res = await fetch(`${API}/api/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchServices();
        fetchStats();
      } else {
        alert("Failed to delete service");
      }
    } catch (err) {
      alert(err.message || "Failed to delete service.");
    }
  };

  const columns = [
    { label: "Service ID", key: "id", render: (s) => <span className="font-mono text-xs font-bold text-blue-600">{s.id}</span> },
    { label: "Client", key: "clientName", render: (s) => <OverflowCell value={s.clientName} /> },
    { label: "Service Name", key: "serviceName", render: (s) => <OverflowCell value={s.serviceName} /> },
    { label: "Assigned To", key: "assignedToName", render: (s) => s.assignedToName || <span className="text-gray-300 italic">Unassigned</span> },
    { label: "Priority", key: "priority", render: (s) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${PRIORITY_CONFIG[s.priority]?.className || "bg-gray-100 text-gray-600"}`}>
          {PRIORITY_CONFIG[s.priority]?.label || s.priority}
        </span>
      )
    },
    { label: "Status", key: "status", render: (s) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${STATUS_CONFIG[s.status]?.className || "bg-gray-100 text-gray-600"}`}>
          {STATUS_CONFIG[s.status]?.label || s.status}
        </span>
      )
    },
    { label: "Deadline", key: "dueDate", render: (s) => <DeadlineBadge dueDate={s.dueDate} /> },
    { label: "Progress", key: "progress", render: (s) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[60px]">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${s.progress || 0}%` }} />
          </div>
          <span className="text-xs font-semibold text-gray-500 min-w-[30px]">{s.progress || 0}%</span>
        </div>
      )
    },
    { label: "Actions", key: "actions", render: (s) => (
        <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
          <button onClick={() => router.push(`/services/${s.id}`)} title="View / Edit" className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer">
            <Eye size={16} />
          </button>
          {isManager && (
            <button onClick={(e) => handleDeleteService(s.id, e)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col flex-1 min-w-0 p-4 sm:p-6 lg:p-8 h-full bg-gray-50/50 overflow-hidden" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="flex flex-col flex-1 h-full space-y-6 min-h-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              Services
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Track tasks, deadlines, and team progress</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => { fetchServices(); fetchStats(); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
              <RefreshCw size={14} className="text-gray-500" />
              <span>Refresh</span>
            </button>
            {isManager && (
              <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm cursor-pointer">
                <Plus size={14} />
                <span>New Service</span>
              </button>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
          <KpiCard 
            icon={Wrench} label="Total Services" value={statsLoading ? "..." : stats?.total} color="bg-blue-50 text-blue-600" 
            selected={kpiFilter === ""} onClick={() => { setKpiFilter(""); setPage(1); }} 
          />
          <KpiCard 
            icon={TrendingUp} label="Active" value={statsLoading ? "..." : stats?.active} color="bg-indigo-50 text-indigo-600" 
            selected={kpiFilter === "active"} onClick={() => { setKpiFilter(kpiFilter === "active" ? "" : "active"); setPage(1); }} 
          />
          <KpiCard 
            icon={CheckCircle2} label="Completed" value={statsLoading ? "..." : stats?.completed} color="bg-emerald-50 text-emerald-600" 
            selected={kpiFilter === "completed"} onClick={() => { setKpiFilter(kpiFilter === "completed" ? "" : "completed"); setPage(1); }} 
          />
          <KpiCard 
            icon={AlertTriangle} label="Overdue" value={statsLoading ? "..." : stats?.overdue} color="bg-red-50 text-red-600" 
            selected={kpiFilter === "overdue"} onClick={() => { setKpiFilter(kpiFilter === "overdue" ? "" : "overdue"); setPage(1); }} 
          />
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2 flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text" placeholder="Search by name, client, employee, or ID..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-1.5 bg-transparent border-none text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
            />
          </div>
          <div className="w-px h-5 bg-gray-200 hidden sm:block"></div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-1.5 bg-transparent border-none text-sm font-medium text-gray-700 focus:outline-none focus:ring-0 cursor-pointer appearance-none min-w-[120px]">
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
          </select>
          <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1); }} className="px-3 py-1.5 bg-transparent border-none text-sm font-medium text-gray-700 focus:outline-none focus:ring-0 cursor-pointer appearance-none min-w-[120px]">
            <option value="">All Priorities</option>
            {Object.entries(PRIORITY_CONFIG).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
          </select>
          {(search || statusFilter || priorityFilter || kpiFilter) && (
            <button onClick={() => { setSearch(""); setStatusFilter(""); setPriorityFilter(""); setKpiFilter(""); setPage(1); }} className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors cursor-pointer px-2 py-1.5">
              Clear
            </button>
          )}
        </div>

        {/* Table Area */}
        <div className="flex-1 min-h-0 overflow-hidden px-0 pb-4">
          <DataTable 
            columns={columns} 
            data={services} 
            loading={loading} 
            totalItems={total}
            currentPage={page}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            columnPicker={{
              allColumns: ALL_SERVICE_COLUMNS,
              selected: selectedCols,
              onSelect: setSelectedCols,
            }}
          />
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
    currentStage: "Not Started", files: [],
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

  const handleFileChange = async (e) => {
    const selected = Array.from(e.target.files);
    if (!selected.length) return;

    const filePromises = selected.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            name: file.name,
            size: file.size,
            type: file.type,
            base64: reader.result
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const fileData = await Promise.all(filePromises);
    setForm(f => ({ ...f, files: [...f.files, ...fileData] }));
  };

  const removeFile = (index) => {
    setForm(f => ({ ...f, files: f.files.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.serviceName) { setError("Service Name is required."); return; }
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
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Assign New Service Task</h2>
            <p className="text-sm font-medium text-gray-500 mt-1">Fill in the details, attach relevant files, and assign to a team member</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer bg-gray-50">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/30">
          {error && <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-xl flex items-center gap-2"><AlertTriangle size={16}/> {error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Service Details */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2"><Wrench size={16} className="text-blue-600"/> Service Details</h3>
              
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Service Name *</label>
                <input value={form.serviceName} onChange={e => setForm(f => ({ ...f, serviceName: e.target.value }))} placeholder="Enter service name" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Client Name</label>
                <input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} placeholder="Enter client name" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Category</label>
                <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Enter category" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} placeholder="Provide a detailed description of the service task..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" />
              </div>
            </div>

            {/* Right Column: Assignment & Attachments */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2"><Users size={16} className="text-blue-600"/> Assignment & Attachments</h3>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Assign To</label>
                <select value={form.assignedTo} onChange={e => {
                  const selected = users.find(u => u.id === e.target.value);
                  setForm(f => ({ ...f, assignedTo: e.target.value, assignedToName: selected ? selected.name : "" }));
                }} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer">
                  <option value="">— Unassigned —</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.department})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer">
                    {Object.entries(PRIORITY_CONFIG).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Attachments (Leads, Images, Excel, etc.)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 hover:bg-blue-50/50 transition-colors relative">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        <span>Upload files</span>
                        <input type="file" multiple className="sr-only" onChange={handleFileChange} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">Any file up to 10MB</p>
                  </div>
                </div>

                {form.files.length > 0 && (
                  <ul className="mt-3 divide-y divide-gray-100 bg-gray-50 rounded-lg border border-gray-200">
                    {form.files.map((file, idx) => (
                      <li key={idx} className="flex items-center justify-between py-2 pl-3 pr-4 text-sm">
                        <div className="flex w-0 flex-1 items-center">
                          <FileText className="h-4 w-4 flex-shrink-0 text-gray-400" />
                          <span className="ml-2 w-0 flex-1 truncate text-gray-600">{file.name}</span>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <button type="button" onClick={() => removeFile(idx)} className="font-medium text-red-500 hover:text-red-600 cursor-pointer p-1">
                            <X size={14} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </form>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-lg transition-colors cursor-pointer">Cancel</button>
          <button type="submit" onClick={handleSubmit} disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-2">
            {saving ? <RefreshCw className="animate-spin" size={16}/> : <CheckCircle2 size={16}/>}
            {saving ? "Creating Service..." : "Create & Assign Service"}
          </button>
        </div>
      </div>
    </div>
  );
}
