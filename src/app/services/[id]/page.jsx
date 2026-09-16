"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, Edit2, Clock, CheckCircle2, AlertTriangle,
  User, Calendar, TrendingUp, MessageSquare, Activity,
  Wrench, Tag, Building, FileText, ChevronDown
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

const PRIORITY_CONFIG = {
  low:    { label: "Low",    className: "bg-gray-100 text-gray-600 border border-gray-200" },
  medium: { label: "Medium", className: "bg-yellow-100 text-yellow-700 border border-yellow-200" },
  high:   { label: "High",   className: "bg-orange-100 text-orange-700 border border-orange-200" },
  urgent: { label: "Urgent", className: "bg-red-100 text-red-700 border border-red-200" },
};

const STATUS_OPTIONS = [
  { value: "pending",     label: "Pending",     color: "bg-gray-400" },
  { value: "assigned",    label: "Assigned",    color: "bg-blue-500" },
  { value: "in_progress", label: "In Progress", color: "bg-indigo-500" },
  { value: "waiting",     label: "Waiting",     color: "bg-yellow-500" },
  { value: "on_hold",     label: "On Hold",     color: "bg-orange-500" },
  { value: "review",      label: "Review",      color: "bg-purple-500" },
  { value: "completed",   label: "Completed",   color: "bg-emerald-500" },
  { value: "cancelled",   label: "Cancelled",   color: "bg-red-500" },
];

const STATUS_CONFIG = Object.fromEntries(STATUS_OPTIONS.map(o => [o.value, o]));

const ACTIVITY_ICONS = {
  created:         { icon: Wrench, color: "bg-blue-100 text-blue-600" },
  assigned:        { icon: User, color: "bg-purple-100 text-purple-600" },
  status_changed:  { icon: Activity, color: "bg-indigo-100 text-indigo-600" },
  progress_updated:{ icon: TrendingUp, color: "bg-emerald-100 text-emerald-600" },
  comment:         { icon: MessageSquare, color: "bg-gray-100 text-gray-600" },
};

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  return d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getDaysRemaining(dueDate) {
  if (!dueDate) return null;
  const diff = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function ServiceDetailPage({ params }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("crm_token") : "";

  const isManager = user?.department === "management" ||
    user?.permissions?.users === true ||
    user?.roleName?.toLowerCase().includes("manager") ||
    ["Founder & CEO", "Director", "Super Admin"].includes(user?.roleName);

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingComment, setSavingComment] = useState(false);
  const [users, setUsers] = useState([]);
  const [comment, setComment] = useState("");
  const [editMode, setEditMode] = useState(false);

  const [localProgress, setLocalProgress] = useState(0);
  const [localStatus, setLocalStatus] = useState("");
  const [localAssignedTo, setLocalAssignedTo] = useState("");
  const [localAssignedToName, setLocalAssignedToName] = useState("");
  const [localDueDate, setLocalDueDate] = useState("");
  const [localPriority, setLocalPriority] = useState("medium");

  const fetchService = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/services/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setService(data);
      setLocalProgress(data.progress || 0);
      setLocalStatus(data.status || "pending");
      setLocalAssignedTo(data.assignedTo || "");
      setLocalAssignedToName(data.assignedToName || "");
      setLocalDueDate(data.dueDate ? data.dueDate.substring(0, 10) : "");
      setLocalPriority(data.priority || "medium");
    } catch { router.push("/services"); } finally { setLoading(false); }
  }, [id, token, router]);

  useEffect(() => { fetchService(); }, [fetchService]);

  useEffect(() => {
    if (isManager) {
      fetch(`${API}/api/users`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => setUsers(Array.isArray(d.users) ? d.users : Array.isArray(d) ? d : []))
        .catch(() => setUsers([]));
    }
  }, [isManager, token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        status: localStatus,
        progress: localProgress,
        dueDate: localDueDate || null,
        priority: localPriority,
      };
      if (isManager && localAssignedTo !== service.assignedTo) {
        body.assignedTo = localAssignedTo;
        body.assignedToName = localAssignedToName;
      }
      await fetch(`${API}/api/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      await fetchService();
      setEditMode(false);
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setSavingComment(true);
    try {
      const body = { comment: comment.trim() };
      await fetch(`${API}/api/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      setComment("");
      await fetchService();
    } catch (err) { alert(err.message); } finally { setSavingComment(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading service details...</p>
      </div>
    </div>
  );

  if (!service) return null;

  const daysRemaining = getDaysRemaining(service.dueDate);
  const statusCfg = STATUS_CONFIG[service.status] || STATUS_OPTIONS[0];

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/services")} className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-all cursor-pointer flex-shrink-0">
              <ArrowLeft size={16} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-gray-900 truncate tracking-tight">{service.serviceName}</h1>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex-shrink-0 border ${PRIORITY_CONFIG[service.priority]?.className || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                  {PRIORITY_CONFIG[service.priority]?.label || service.priority}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 flex-wrap">
                <span className="font-mono text-blue-600 font-bold">{service.id}</span>
                <span className="text-gray-300">•</span>
                <span className="truncate flex items-center gap-1"><Building size={12}/> {service.clientName}</span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1.5 flex-shrink-0 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 font-medium">
                  <div className={`w-1.5 h-1.5 rounded-full ${statusCfg.color}`} />
                  {statusCfg.label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {editMode ? (
              <>
                <button onClick={() => setEditMode(false)} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer text-center">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5">
                  <Save size={14} />
                  {saving ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <button onClick={() => setEditMode(true)} className="flex items-center gap-1.5 px-4 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer shadow-sm">
                <Edit2 size={14} />
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1.5"><TrendingUp size={12}/> Progress & Status</h3>
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-gray-700">Completion</span>
                    <span className="text-sm font-bold text-blue-600">{editMode ? localProgress : service.progress || 0}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${editMode ? localProgress : service.progress || 0}%` }} />
                  </div>
                  {editMode && (
                    <input type="range" min="0" max="100" value={localProgress} onChange={e => setLocalProgress(Number(e.target.value))} className="w-full accent-blue-600 cursor-pointer h-1" />
                  )}
                  <p className="text-[11px] font-medium text-gray-500 mt-2">Stage: <span className="text-gray-900">{service.currentStage || "Not Started"}</span></p>
                </div>

                {/* Status */}
                <div className="min-w-[150px]">
                  <p className="text-xs font-semibold text-gray-700 mb-1.5">Current Status</p>
                  {editMode ? (
                    <select value={localStatus} onChange={e => setLocalStatus(e.target.value)} className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-sm focus:outline-none cursor-pointer">
                      {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border border-gray-200 text-xs font-semibold bg-gray-50`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${statusCfg.color}`} />
                      {statusCfg.label}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Service Info */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1.5"><Tag size={12}/> Service Information</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold mb-0.5 uppercase tracking-wider">Service Name</p>
                  <p className="font-medium text-gray-900">{service.serviceName}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold mb-0.5 uppercase tracking-wider">Client</p>
                  <p className="font-medium text-gray-900 flex items-center gap-1"><Building size={12} className="text-gray-400"/> {service.clientName}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold mb-0.5 uppercase tracking-wider">Category</p>
                  <p className="font-medium text-gray-900">{service.category || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold mb-0.5 uppercase tracking-wider">Priority</p>
                  {editMode && isManager ? (
                    <select value={localPriority} onChange={e => setLocalPriority(e.target.value)} className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-sm focus:outline-none cursor-pointer">
                      {Object.entries(PRIORITY_CONFIG).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
                    </select>
                  ) : (
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${PRIORITY_CONFIG[service.priority]?.className || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                      {PRIORITY_CONFIG[service.priority]?.label || service.priority}
                    </span>
                  )}
                </div>
                <div className="col-span-2">
                  <p className="text-[11px] text-gray-500 font-semibold mb-1 uppercase tracking-wider">Description</p>
                  <p className="text-gray-700 text-xs leading-relaxed">{service.description || <span className="text-gray-400 italic">No description provided</span>}</p>
                </div>
              </div>
            </div>

            {/* Assignment */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1.5"><User size={12}/> Assignment</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold mb-0.5 uppercase tracking-wider">Assigned To</p>
                  {editMode && isManager ? (
                    <select value={localAssignedTo} onChange={e => {
                      const sel = users.find(u => u.id === e.target.value);
                      setLocalAssignedTo(e.target.value);
                      setLocalAssignedToName(sel?.name || "");
                    }} className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-sm focus:outline-none cursor-pointer">
                      <option value="">— Unassigned —</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  ) : (
                    <div className="font-medium text-gray-900 flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[9px] font-bold border border-blue-100">
                        {service.assignedToName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      {service.assignedToName || <span className="text-gray-400 italic">Unassigned</span>}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold mb-0.5 uppercase tracking-wider">Assigned By</p>
                  <p className="font-medium text-gray-900">{service.assignedByName || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold mb-0.5 uppercase tracking-wider">Assigned On</p>
                  <p className="font-medium text-gray-900">{formatDate(service.assignedAt)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold mb-0.5 uppercase tracking-wider">Created By</p>
                  <p className="font-medium text-gray-900">{service.createdByName || "—"}</p>
                </div>
              </div>
            </div>

            {/* Attachments Section (NEW) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1.5"><FileText size={12}/> Attachments</h3>
              {(!service.attachments || service.attachments.length === 0) ? (
                <div className="flex items-center justify-center py-4 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                  <p className="text-xs text-gray-400 font-medium">No attachments provided</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {service.attachments.map((file, idx) => (
                    <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 p-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <div className="w-8 h-8 rounded bg-gray-50 text-gray-500 border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <FileText size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-900 truncate">{file.name}</p>
                        <p className="text-[9px] font-medium text-gray-500 uppercase tracking-wider">{(file.size / 1024).toFixed(1)} KB • {formatDate(file.uploadedAt)}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Add Comment */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><MessageSquare size={12}/> Add Update / Comment</h3>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 border border-blue-100 mt-1">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="flex-1">
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={2}
                    placeholder="Add a comment, update, or note..."
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-gray-300 transition-all resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <button onClick={handleAddComment} disabled={!comment.trim() || savingComment} className="px-4 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer">
                      {savingComment ? "Posting..." : "Post"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`rounded-xl border shadow-sm p-4 ${
              daysRemaining !== null && daysRemaining < 0 ? "border-red-200 bg-red-50/80" :
              daysRemaining !== null && daysRemaining <= 2 ? "border-orange-200 bg-orange-50/80" :
              "border-gray-200 bg-white"
            }`}>
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Clock size={12}/> Deadline</h3>
              {service.dueDate ? (
                <div>
                  <p className="text-xl font-bold text-gray-900 mb-2">{formatDate(service.dueDate)}</p>
                  {daysRemaining !== null && (
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-bold ${
                      daysRemaining < 0 ? "bg-red-600 text-white" :
                      daysRemaining <= 2 ? "bg-orange-500 text-white" :
                      "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    }`}>
                      {daysRemaining < 0 ? <AlertTriangle size={12} /> : <Clock size={12} />}
                      {daysRemaining < 0 ? `${Math.abs(daysRemaining)} Days Overdue` :
                       daysRemaining === 0 ? "Due Today!" :
                       `${daysRemaining} days remaining`}
                    </div>
                  )}
                  {editMode && isManager && (
                    <div className="mt-3">
                      <input type="date" value={localDueDate} onChange={e => setLocalDueDate(e.target.value)} className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-sm focus:outline-none cursor-pointer" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-400 bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                  <Calendar size={14} />
                  <p className="text-xs font-medium">No deadline set</p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Activity size={12}/> Quick Info</h3>
              <div className="space-y-3 text-[13px]">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-500 flex items-center gap-1.5 font-medium"><Calendar size={12} className="text-gray-400"/> Created</span>
                  <span className="font-semibold text-gray-900">{formatDate(service.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-500 flex items-center gap-1.5 font-medium"><Activity size={12} className="text-gray-400"/> Updated</span>
                  <span className="font-semibold text-gray-900">{formatDate(service.updatedAt)}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-500 flex items-center gap-1.5 font-medium"><TrendingUp size={12} className="text-blue-500"/> Progress</span>
                  <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{service.progress || 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5 font-medium"><MessageSquare size={12} className="text-purple-500"/> Activities</span>
                  <span className="font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">{service.activity?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/50">
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><Clock size={12}/> Activity Timeline</h3>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                {(!service.activity || service.activity.length === 0) ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <Activity className="text-gray-200 mb-3" size={32} />
                    <p className="text-sm font-medium text-gray-400">No activity yet</p>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
                    {service.activity.map((a, idx) => {
                      const cfg = ACTIVITY_ICONS[a.type] || ACTIVITY_ICONS.comment;
                      const Icon = cfg.icon;
                      return (
                        <div key={a.id || idx} className="relative pl-6">
                          <div className={`absolute -left-[15px] top-0.5 w-7 h-7 rounded-full flex items-center justify-center border-4 border-white ${cfg.color} shadow-sm`}>
                            <Icon size={12} />
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group">
                            <p className="text-sm text-gray-800 font-medium leading-relaxed">{a.message}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{a.performedByName || "System"}</span>
                              <span className="text-[10px] text-gray-300">•</span>
                              <span className="text-[10px] text-gray-400 font-medium">{formatDateTime(a.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
