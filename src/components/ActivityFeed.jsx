"use client";

import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw, Calendar, X, Eye, TrendingUp, PhoneCall,
  CheckCircle2, XCircle, Clock, Video, Trophy, AlertCircle,
  Users, ArrowUpRight, PhoneOutgoing, ChevronRight,
} from "lucide-react";
import api from "@/services/api";
import DataTable, { OverflowCell } from "@/components/common/DataTable";

const STATUS_CONFIG = {
  allocated:      { label: "Allocated",     color: "#3b82f6", bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200" },
  contacted:      { label: "Call Back",     color: "#8b5cf6", bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200" },
  interested:     { label: "Interested",    color: "#10b981", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  not_interested: { label: "Not Interested",color: "#ef4444", bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200" },
  callback:       { label: "Follow Up",     color: "#f59e0b", bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200" },
  converted:      { label: "Deal Done",     color: "#16a34a", bg: "bg-green-50",   text: "text-green-700",   border: "border-green-200" },
  meeting:        { label: "Meeting",       color: "#06b6d4", bg: "bg-cyan-50",    text: "text-cyan-700",    border: "border-cyan-200" },
  call_update:    { label: "Call Update",   color: "#6366f1", bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200" },
};

const STAT_CARDS = [
  { key: "totalUpdates",   label: "Total Updates",  icon: Users,         color: "text-gray-900",    bg: "bg-gray-50",    ring: "ring-gray-200" },
  { key: "contacted",      label: "Call Back",      icon: PhoneCall,     color: "text-purple-600",  bg: "bg-purple-50",  ring: "ring-purple-200" },
  { key: "interested",     label: "Interested",     icon: TrendingUp,    color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-200" },
  { key: "converted",      label: "Deal Done",      icon: CheckCircle2,  color: "text-green-600",   bg: "bg-green-50",   ring: "ring-green-200" },
  { key: "callback",       label: "Follow Up",      icon: Clock,         color: "text-amber-600",   bg: "bg-amber-50",   ring: "ring-amber-200" },
  { key: "not_interested", label: "Not Interested", icon: XCircle,       color: "text-red-500",     bg: "bg-red-50",     ring: "ring-red-200" },
  { key: "meeting",        label: "Meeting",        icon: Video,         color: "text-cyan-600",    bg: "bg-cyan-50",    ring: "ring-cyan-200" },
  { key: "call_update",    label: "Call Update",    icon: PhoneOutgoing, color: "text-indigo-600",  bg: "bg-indigo-50",  ring: "ring-indigo-200" },
];

function todayStr() { return new Date().toISOString().split("T")[0]; }

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function timeAgo(iso) {
  if (!iso) return "—";
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function DonutChart({ data, total }) {
  const size = 150, stroke = 20;
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const cx = size / 2, cy = size / 2;
  let currentOffset = 0;
  const segments = data.map(d => {
    const pct  = total > 0 ? d.value / total : 0;
    const dash = pct * circ;
    const seg  = { ...d, dash, gap: circ - dash, offset: currentOffset };
    currentOffset += dash;
    return seg;
  });

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke}/>
        {segments.map((s, i) =>
          s.dash > 0 ? (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={s.color} strokeWidth={stroke}
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={-s.offset}
              style={{ transition: "stroke-dasharray 0.5s ease" }}
            />
          ) : null
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{total}</span>
        <span className="text-xs text-gray-400">Updates</span>
      </div>
    </div>
  );
}

export default function ActivityDashboard() {
  const [logs, setLogs]       = useState([]);
  const [stats, setStats]     = useState({});
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);
  const [users, setUsers]     = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [page, setPage]       = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Default: today — no date selected shows today
  const [dateFrom, setDateFrom] = useState(todayStr());
  const [dateTo,   setDateTo]   = useState(todayStr());
  const [userId,   setUserId]   = useState("");

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem("crm_user") || "{}"); }
    catch { return {}; }
  })();
  const adminRoles   = ["Super Admin", "Founder & CEO", "Director"];
  const managerRoles = ["Branch Manager", "Manager", "Team Manager", "Assistant Manager"];
  const isAdmin   = adminRoles.includes(currentUser?.roleName);
  const isManager = isAdmin || managerRoles.includes(currentUser?.roleName);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/api/activity/stats", {
        params: { dateFrom, dateTo },
      });
      setStats(res.data || {});
    } catch {}
  }, [dateFrom, dateTo]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: pageSize, dateFrom, dateTo };
      if (userId) params.userId = userId;
      const res = await api.get("/api/activity", { params });
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
    } catch {}
    setLoading(false);
  }, [dateFrom, dateTo, userId, page, pageSize]);

  const fetchUsers = useCallback(async () => {
    if (!isManager) return;
    try { const r = await api.get("/api/users"); setUsers(r.data.users || r.data || []); }
    catch {}
  }, [isManager]);

  useEffect(() => { fetchStats(); fetchLogs(); fetchUsers(); }, [fetchStats, fetchLogs, fetchUsers]);

  // Auto-refresh every 30s
  useEffect(() => {
    const t = setInterval(() => { fetchStats(); fetchLogs(); }, 30000);
    return () => clearInterval(t);
  }, [fetchStats, fetchLogs]);

  const resetFilters = () => { setDateFrom(todayStr()); setDateTo(todayStr()); setUserId(""); setPage(1); };
  const isFiltered   = dateFrom !== todayStr() || dateTo !== todayStr() || userId;

  // Donut chart data from logs
  const statusCounts = {};
  logs.forEach(l => {
    const s = l.newData?.status;
    if (s && STATUS_CONFIG[s]) statusCounts[s] = (statusCounts[s] || 0) + 1;
  });
  const chartData  = Object.entries(statusCounts)
    .map(([k, v]) => ({ label: STATUS_CONFIG[k]?.label || k, value: v, color: STATUS_CONFIG[k]?.color || "#94a3b8" }))
    .sort((a, b) => b.value - a.value);
  const chartTotal = chartData.reduce((s, d) => s + d.value, 0);

  // Per-user breakdown from logs
  const userMap = {};
  logs.forEach(l => {
    if (!userMap[l.userName]) userMap[l.userName] = { name: l.userName, role: l.userRole, total: 0, statuses: {} };
    userMap[l.userName].total++;
    const s = l.newData?.status;
    if (s) userMap[l.userName].statuses[s] = (userMap[l.userName].statuses[s] || 0) + 1;
  });
  const userRows = Object.values(userMap).sort((a, b) => b.total - a.total);

  const isToday = dateFrom === todayStr() && dateTo === todayStr();

  const columns = [
    {
      label: "Member",
      render: (log) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
            {log.userName?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-800 whitespace-nowrap text-xs">{log.userName}</p>
            <p className="text-xs text-gray-400">{log.userRole}</p>
          </div>
        </div>
      )
    },
    {
      label: "Lead",
      render: (log) => (
        <div>
          <p className="font-medium text-gray-800 whitespace-nowrap text-xs">{log.leadName}</p>
          <p className="text-xs text-gray-400">{log.leadId}</p>
        </div>
      )
    },
    {
      label: "Status Change",
      render: (log) => {
        const ns = log.newData?.status;
        const os = log.oldData?.status;
        const sc = STATUS_CONFIG[ns] || {};
        const osc = STATUS_CONFIG[os] || {};
        if (os && ns) {
          return (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-xs border ${osc.bg||"bg-gray-50"} ${osc.text||"text-gray-500"} ${osc.border||"border-gray-200"}`}>
                {osc.label || os}
              </span>
              <ChevronRight size={11} className="text-gray-400 flex-shrink-0"/>
              <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${sc.bg||"bg-gray-50"} ${sc.text||"text-gray-500"} ${sc.border||"border-gray-200"}`}>
                {sc.label || ns}
              </span>
            </div>
          )
        } else if (ns) {
          return (
            <span className={`px-2 py-0.5 rounded-full text-xs border ${sc.bg} ${sc.text} ${sc.border}`}>
              {sc.label || ns}
            </span>
          )
        }
        return <span className="text-gray-300 text-xs">—</span>;
      }
    },
    {
      label: "Meeting",
      render: (log) => {
        if (log.newData?.meetingDate) {
          return (
            <div>
              <p className="text-cyan-600 font-medium">{fmtDate(log.newData.meetingDate)}</p>
              {log.newData?.meetingSubType && (
                <p className="text-gray-400 capitalize">
                  {log.newData.meetingSubType === "online" ? "🖥 Online" : log.newData.meetingSubType === "offline" ? "🏢 Offline" : "🔄 Reschedule"}
                </p>
              )}
            </div>
          )
        }
        return <span className="text-gray-300">—</span>;
      }
    },
    {
      label: "Follow-up",
      render: (log) => {
        if (log.newData?.followupDate) {
          return <span className="text-amber-600 font-medium">{fmtDate(log.newData.followupDate)}</span>
        }
        return <span className="text-gray-300">—</span>;
      }
    },
    {
      label: "Remark",
      render: (log) => {
        const text = log.newData?.followUpNote || log.newData?.notes;
        return <OverflowCell value={text} />;
      }
    },
    {
      label: "Time",
      render: (log) => (
        <div className="text-xs text-gray-400 whitespace-nowrap">
          {timeAgo(log.createdAt)}
          <p className="text-gray-300 text-xs mt-0.5">{fmtDate(log.createdAt)}</p>
        </div>
      )
    },
    {
      label: "Details",
      render: (log) => (
        <button onClick={() => setSelectedLog(log)}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap">
          <Eye size={11}/> View
        </button>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-5 md:p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Activity Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {isToday ? "Today's activity" : `${fmtDate(dateFrom)} → ${fmtDate(dateTo)}`}
            {" · "}
            {isAdmin ? "All team" : isManager ? "Your department" : "Your activity"}
          </p>
        </div>
        <button onClick={() => { fetchStats(); fetchLogs(); }}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 cursor-pointer shadow-sm">
          <RefreshCw size={14}/> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
          <Calendar size={13} className="text-gray-400 flex-shrink-0"/>
          <input type="date" value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); setPage(1); }}
            className="text-xs text-gray-700 focus:outline-none bg-transparent cursor-pointer w-28"/>
          <span className="text-gray-300 text-xs">→</span>
          <input type="date" value={dateTo}
            onChange={e => { setDateTo(e.target.value); setPage(1); }}
            className="text-xs text-gray-700 focus:outline-none bg-transparent cursor-pointer w-28"/>
        </div>

        {isManager && (
          <select value={userId} onChange={e => { setUserId(e.target.value); setPage(1); }}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none cursor-pointer">
            <option value="">All Members</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name} — {u.roleName}</option>)}
          </select>
        )}

        {isFiltered && (
          <button onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 cursor-pointer shadow-sm">
            <X size={12}/> Reset to Today
          </button>
        )}

        <span className="ml-auto self-center text-xs text-gray-400 font-medium">{total} updates</span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-6">
        {STAT_CARDS.map(({ key, label, icon: Icon, color, bg, ring }) => (
          <div key={key} className={`bg-white rounded-xl border border-gray-200 px-3 py-2.5 shadow-sm`}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-400 leading-tight">{label}</p>
              <div className={`w-5 h-5 rounded-md ${bg} flex items-center justify-center`}>
                <Icon size={11} className={color}/>
              </div>
            </div>
            <p className={`text-xl font-bold ${color}`}>{stats[key] || 0}</p>
          </div>
        ))}
      </div>

      {/* Empty state — no updates today */}
      {!loading && logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <AlertCircle size={28} className="text-gray-300"/>
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-gray-700">
              {isToday ? "No updates today yet" : "No activity found"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {isToday
                ? "When your team updates leads, activity will appear here"
                : "Try a different date range"}
            </p>
          </div>
          {!isToday && (
            <button onClick={resetFilters}
              className="px-4 py-2 bg-gray-900 text-white text-sm rounded-xl cursor-pointer hover:bg-gray-700">
              Back to Today
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Donut + Team performance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

            {/* Donut */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Update Breakdown</h3>
              {chartData.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-gray-300 text-sm">No data</div>
              ) : (
                <div className="flex items-center gap-5">
                  <DonutChart data={chartData} total={chartTotal}/>
                  <div className="flex-1 space-y-2">
                    {chartData.map(d => (
                      <div key={d.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }}/>
                          <span className="text-xs text-gray-600">{d.label}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-gray-800">{d.value}</span>
                          <span className="text-xs text-gray-400">
                            {chartTotal > 0 ? `(${Math.round(d.value/chartTotal*100)}%)` : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Team table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">
                {isAdmin ? "All Members" : isManager ? "Team Performance" : "My Performance"}
              </h3>
              {userRows.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-gray-300 text-sm">No activity</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {["Member","Total","Call Back","Interested","Deal Done","Follow Up","Not Int.","Meeting","Call Update"].map(h => (
                          <th key={h} className="pb-2 px-2 text-left font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {userRows.map((u, i) => (
                        <tr key={u.name} className="hover:bg-gray-50">
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                                {u.name?.[0]?.toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-800 whitespace-nowrap">{u.name}</span>
                            </div>
                          </td>
                          <td className="py-2 px-2 font-bold text-gray-900">{u.total}</td>
                          {["contacted","interested","converted","callback","not_interested","meeting","call_update"].map(s => (
                            <td key={s} className="py-2 px-2">
                              <span className={`text-xs font-medium ${u.statuses[s] ? STATUS_CONFIG[s]?.text : "text-gray-300"}`}>
                                {u.statuses[s] || 0}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Activity Log Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Activity Log</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isToday ? "Today's updates" : `${fmtDate(dateFrom)} – ${fmtDate(dateTo)}`}
                </p>
              </div>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{total} records</span>
            </div>

            <DataTable 
              columns={columns} 
              data={logs} 
              loading={loading}
              totalItems={total}
              currentPage={page}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
            />
          </div>
        </>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="text-base font-bold text-gray-900">Activity Details</h2>
                <p className="text-xs text-gray-400 mt-0.5">{fmtDateTime(selectedLog.createdAt)}</p>
              </div>
              <button onClick={()=>setSelectedLog(null)} className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"><X size={18}/></button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              {/* Member */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                  {selectedLog.userName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedLog.userName}</p>
                  <p className="text-xs text-gray-500">{selectedLog.userRole} · {selectedLog.department}</p>
                </div>
              </div>

              {/* Lead */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 mb-0.5">Lead Name</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedLog.leadName}</p>
                  <p className="text-xs text-gray-400">#{selectedLog.leadId}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 mb-0.5">Action</p>
                  <p className="text-sm font-semibold text-gray-800 capitalize">{selectedLog.action?.replace("_"," ")}</p>
                </div>
              </div>

              {/* Status change */}
              {selectedLog.oldData?.status && selectedLog.newData?.status && (
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 mb-2">Status Change</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border
                      ${STATUS_CONFIG[selectedLog.oldData.status]?.bg||"bg-gray-50"}
                      ${STATUS_CONFIG[selectedLog.oldData.status]?.text||"text-gray-600"}
                      ${STATUS_CONFIG[selectedLog.oldData.status]?.border||"border-gray-200"}`}>
                      {STATUS_CONFIG[selectedLog.oldData.status]?.label || selectedLog.oldData.status}
                    </span>
                    <ChevronRight size={14} className="text-gray-400"/>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border
                      ${STATUS_CONFIG[selectedLog.newData.status]?.bg||"bg-gray-50"}
                      ${STATUS_CONFIG[selectedLog.newData.status]?.text||"text-gray-600"}
                      ${STATUS_CONFIG[selectedLog.newData.status]?.border||"border-gray-200"}`}>
                      {STATUS_CONFIG[selectedLog.newData.status]?.label || selectedLog.newData.status}
                    </span>
                  </div>
                </div>
              )}

              {/* Meeting details */}
              {selectedLog.newData?.meetingDate && (
                <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl">
                  <p className="text-xs text-cyan-600 font-medium mb-1"> Meeting Scheduled</p>
                  <p className="text-sm text-cyan-800 font-semibold">{fmtDateTime(selectedLog.newData.meetingDate)}</p>
                  {selectedLog.newData?.meetingSubType && (
                    <p className="text-xs text-cyan-600 mt-1 capitalize">
                      {selectedLog.newData.meetingSubType === "online" ? "🖥 Online" : selectedLog.newData.meetingSubType === "offline" ? "🏢 Offline" : "🔄 Reschedule"}
                    </p>
                  )}
                  {selectedLog.newData?.meetingNote && <p className="text-xs text-cyan-700 mt-1">{selectedLog.newData.meetingNote}</p>}
                </div>
              )}

              {/* Follow-up */}
              {selectedLog.newData?.followupDate && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-600 font-medium mb-1"> Follow-up Date</p>
                  <p className="text-sm text-amber-800 font-semibold">{fmtDate(selectedLog.newData.followupDate)}</p>
                </div>
              )}

              {/* Follow-up note */}
              {selectedLog.newData?.followUpNote && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-600 font-medium mb-1"> Remark</p>
                  <p className="text-sm text-amber-800">{selectedLog.newData.followUpNote}</p>
                </div>
              )}

              {/* Conversation notes */}
              {selectedLog.newData?.notes && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-xs text-gray-500 font-medium mb-1">Conversation Notes</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedLog.newData.notes}</p>
                </div>
              )}
            </div>

            <div className="px-6 pb-5 pt-3 border-t border-gray-100 flex-shrink-0">
              <button onClick={()=>setSelectedLog(null)}
                className="w-full py-2.5 bg-gray-900 hover:bg-gray-700 text-white rounded-xl text-sm font-medium cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}