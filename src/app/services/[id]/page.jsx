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
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/services")} className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors shadow-sm cursor-pointer">
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-gray-900">{service.serviceName}</h1>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${PRIORITY_CONFIG[service.priority]?.className || "bg-gray-100 text-gray-600"}`}>
                  {PRIORITY_CONFIG[service.priority]?.label || service.priority}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="font-mono text-xs text-blue-600 font-bold">{service.id}</span>
                <span>•</span>
                <span>{service.clientName}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${statusCfg.color}`} />
                  {statusCfg.label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {editMode ? (
              <>
                <button onClick={() => setEditMode(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-2">
                  <Save size={14} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <button onClick={() => setEditMode(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
                <Edit2 size={14} />
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Details & Progress */}
          <div className="lg:col-span-2 space-y-4">

            {/* Access Summary */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Progress & Status</h3>
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Progress */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Completion</span>
                    <span className="text-lg font-bold text-blue-600">{editMode ? localProgress : service.progress || 0}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${editMode ? localProgress : service.progress || 0}%` }} />
                  </div>
                  {editMode && (
                    <input type="range" min="0" max="100" value={localProgress} onChange={e => setLocalProgress(Number(e.target.value))} className="w-full accent-blue-600 cursor-pointer" />
                  )}
                  <p className="text-xs text-gray-400 mt-1">Stage: {service.currentStage || "Not Started"}</p>
                </div>

                {/* Status */}
                <div className="min-w-[180px]">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Status</p>
                  {editMode ? (
                    <select value={localStatus} onChange={e => setLocalStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer">
                      {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold`}>
                      <div className={`w-2 h-2 rounded-full ${statusCfg.color}`} />
                      {statusCfg.label}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Service Info */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Service Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Service Name</p>
                  <p className="font-semibold text-gray-900">{service.serviceName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Client</p>
                  <p className="font-semibold text-gray-900">{service.clientName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Category</p>
                  <p className="font-semibold text-gray-900">{service.category || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Priority</p>
                  {editMode && isManager ? (
                    <select value={localPriority} onChange={e => setLocalPriority(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer">
                      {Object.entries(PRIORITY_CONFIG).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
                    </select>
                  ) : (
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${PRIORITY_CONFIG[service.priority]?.className || "bg-gray-100 text-gray-600"}`}>
                      {PRIORITY_CONFIG[service.priority]?.label || service.priority}
                    </span>
                  )}
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 font-medium mb-1">Description</p>
                  <p className="text-gray-700 leading-relaxed">{service.description || <span className="text-gray-400 italic">No description provided</span>}</p>
                </div>
              </div>
            </div>

            {/* Assignment */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Assignment</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Assigned To</p>
                  {editMode && isManager ? (
                    <select value={localAssignedTo} onChange={e => {
                      const sel = users.find(u => u.id === e.target.value);
                      setLocalAssignedTo(e.target.value);
                      setLocalAssignedToName(sel?.name || "");
                    }} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer">
                      <option value="">— Unassigned —</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  ) : (
                    <p className="font-semibold text-gray-900">{service.assignedToName || <span className="text-gray-400 italic">Unassigned</span>}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Assigned By</p>
                  <p className="font-semibold text-gray-900">{service.assignedByName || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Assigned On</p>
                  <p className="font-semibold text-gray-900">{formatDate(service.assignedAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Created By</p>
                  <p className="font-semibold text-gray-900">{service.createdByName || "—"}</p>
                </div>
              </div>
            </div>

            {/* Add Comment */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Add Update / Comment</h3>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="flex-1">
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={3}
                    placeholder="Add a comment, update, or note about this service..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <button onClick={handleAddComment} disabled={!comment.trim() || savingComment} className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer">
                      {savingComment ? "Posting..." : "Post Comment"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Sidebar info + Timeline */}
          <div className="space-y-4">
            {/* Deadline Card */}
            <div className={`bg-white rounded-xl border shadow-sm p-5 ${
              daysRemaining !== null && daysRemaining < 0 ? "border-red-200 bg-red-50/30" :
              daysRemaining !== null && daysRemaining <= 2 ? "border-orange-200 bg-orange-50/30" :
              "border-gray-200"
            }`}>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Deadline</h3>
              {service.dueDate ? (
                <>
                  <p className="text-lg font-bold text-gray-900 mb-1">{formatDate(service.dueDate)}</p>
                  {daysRemaining !== null && (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      daysRemaining < 0 ? "bg-red-100 text-red-700" :
                      daysRemaining <= 2 ? "bg-orange-100 text-orange-700" :
                      "bg-emerald-100 text-emerald-700"
                    }`}>
                      {daysRemaining < 0 ? <AlertTriangle size={12} /> : <Clock size={12} />}
                      {daysRemaining < 0 ? `${Math.abs(daysRemaining)}d Overdue` :
                       daysRemaining === 0 ? "Due Today" :
                       `${daysRemaining} days remaining`}
                    </div>
                  )}
                  {editMode && isManager && (
                    <div className="mt-3">
                      <input type="date" value={localDueDate} onChange={e => setLocalDueDate(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer" />
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-400 italic text-sm">No deadline set</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5"><Calendar size={14} /> Created</span>
                  <span className="font-semibold text-gray-800">{formatDate(service.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5"><Activity size={14} /> Last Updated</span>
                  <span className="font-semibold text-gray-800">{formatDate(service.updatedAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5"><TrendingUp size={14} /> Progress</span>
                  <span className="font-bold text-blue-600">{service.progress || 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5"><MessageSquare size={14} /> Activities</span>
                  <span className="font-semibold text-gray-800">{service.activity?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Activity Timeline</h3>
              </div>
              <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                {(!service.activity || service.activity.length === 0) ? (
                  <p className="text-xs text-gray-400 text-center py-6">No activity yet</p>
                ) : (
                  service.activity.map((a, idx) => {
                    const cfg = ACTIVITY_ICONS[a.type] || ACTIVITY_ICONS.comment;
                    const Icon = cfg.icon;
                    return (
                      <div key={a.id || idx} className="flex gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.color}`}>
                          <Icon size={12} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-700 leading-relaxed">{a.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-gray-400 font-medium">{a.performedByName || "System"}</span>
                            <span className="text-[10px] text-gray-300">•</span>
                            <span className="text-[10px] text-gray-400">{formatDateTime(a.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
