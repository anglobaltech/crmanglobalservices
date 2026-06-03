"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, RefreshCw, X, Check, Phone, Mail, MapPin, Package,
  Clock, CheckCircle2, XCircle, PhoneCall, TrendingUp, AlertCircle,
  Users, FileText, History, Video, Calendar, ChevronRight, Bell,
  PhoneOutgoing, IndianRupee,
} from "lucide-react";
import api from "@/services/api";
import DataTable from "@/components/common/DataTable";

const STATUS_CONFIG = {
  allocated:     { label: "Allocated",     color: "bg-blue-50 text-blue-700 border-blue-200",     dot: "bg-blue-500"    },
  contacted:     { label: "Call Back",     color: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
  interested:    { label: "Interested",    color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  not_interested:{ label: "Not Interested",color: "bg-red-50 text-red-700 border-red-200",         dot: "bg-red-500"     },
  callback:      { label: "Follow Up",     color: "bg-amber-50 text-amber-700 border-amber-200",   dot: "bg-amber-500"   },
  converted:     { label: "Deal Done",     color: "bg-green-50 text-green-700 border-green-200",   dot: "bg-green-600"   },
  meeting:       { label: "Meeting",       color: "bg-cyan-50 text-cyan-700 border-cyan-200",      dot: "bg-cyan-500"    },
  call_update:   { label: "Call Update",   color: "bg-indigo-50 text-indigo-700 border-indigo-200",dot: "bg-indigo-500"  },
};
const ALL_STATUSES = Object.keys(STATUS_CONFIG);

const STAT_CARDS = [
  { key: "total",          label: "Total",       icon: Users,       color: "text-gray-900",    bg: "bg-gray-50"    },
  { key: "contacted",      label: "Call Back",   icon: PhoneCall,   color: "text-purple-600",  bg: "bg-purple-50"  },
  { key: "interested",     label: "Interested",  icon: TrendingUp,  color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "converted",      label: "Deal Done",   icon: CheckCircle2,color: "text-green-600",   bg: "bg-green-50"   },
  { key: "callback",       label: "Follow Up",   icon: Clock,       color: "text-amber-600",   bg: "bg-amber-50"   },
  { key: "not_interested", label: "Not Int.",    icon: XCircle,     color: "text-red-500",     bg: "bg-red-50"     },
  { key: "meeting",        label: "Meeting",     icon: Video,       color: "text-cyan-600",    bg: "bg-cyan-50"    },
  { key: "call_update",    label: "Call Update", icon: PhoneOutgoing,color:"text-indigo-600",  bg: "bg-indigo-50"  },
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

function ExpandCell({ text, prefix = "" }) {
  const [open, setOpen] = useState(false);
  if (!text) return <span className="text-gray-300 text-xs">—</span>;
  return (
    <>
      <div className="max-w-[130px] cursor-pointer" onClick={() => setOpen(true)}>
        <p className="text-xs truncate text-inherit">{prefix ? `${prefix} ${text}` : text}</p>
      </div>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-[200] flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-gray-100" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-800">Full Note</p>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer"><X size={16} /></button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{text}</p>
          </div>
        </div>
      )}
    </>
  );
}

function ContactCell({ lead }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="cursor-pointer" onClick={() => setOpen(true)}>
        <div className="flex items-center gap-1 text-gray-700 whitespace-nowrap text-xs">
          <Phone size={10} className="text-gray-400" />{lead.phone}
        </div>
        {lead.email && (
          <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
            <Mail size={9} /><span className="truncate max-w-[80px]">{lead.email}</span>
          </div>
        )}
      </div>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-[200] flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-gray-100" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-800">Contact Details</p>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer"><X size={16} /></button>
            </div>
            <p className="text-base font-bold text-gray-900 mb-3">{lead.name}</p>
            <div className="space-y-3">
              {lead.phone && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><Phone size={14} className="text-blue-600" /></div>
                  <div><p className="text-xs text-gray-400 mb-0.5">Phone</p>
                    <a href={`tel:${lead.phone}`} className="text-sm font-semibold text-gray-800 hover:text-blue-600" onClick={e => e.stopPropagation()}>{lead.phone}</a>
                  </div>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0"><Mail size={14} className="text-emerald-600" /></div>
                  <div className="min-w-0"><p className="text-xs text-gray-400 mb-0.5">Email</p>
                    <a href={`mailto:${lead.email}`} className="text-sm font-semibold text-gray-800 hover:text-emerald-600 break-all" onClick={e => e.stopPropagation()}>{lead.email}</a>
                  </div>
                </div>
              )}
              {(lead.state || lead.city) && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0"><MapPin size={14} className="text-amber-600" /></div>
                  <div><p className="text-xs text-gray-400 mb-0.5">Location</p>
                    <p className="text-sm font-semibold text-gray-800">{[lead.city, lead.state].filter(Boolean).join(", ")}</p>
                  </div>
                </div>
              )}
              {lead.productInterest && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0"><Package size={14} className="text-purple-600" /></div>
                  <div><p className="text-xs text-gray-400 mb-0.5">Product Interest</p>
                    <p className="text-sm font-semibold text-gray-800">{lead.productInterest}</p>
                  </div>
                </div>
              )}
              {lead.quotationShared !== undefined && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0"><FileText size={14} className="text-indigo-600" /></div>
                  <div><p className="text-xs text-gray-400 mb-0.5">Quotation</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {lead.quotationShared
                        ? <span className="text-emerald-600">Shared{lead.quotationAmount ? ` · ₹${Number(lead.quotationAmount).toLocaleString("en-IN")}` : ""}</span>
                        : <span className="text-red-500">Not Shared</span>}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function LeadHistoryPanel({ leadId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!leadId) return;
    setLoading(true);
    api.get("/api/activity", { params: { leadId } })
      .then(r => setLogs(r.data.logs || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [leadId]);

  if (loading) return (
    <div className="space-y-3 p-1">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-2 animate-pulse">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-200 mt-1 flex-shrink-0" />
          <div className="flex-1 space-y-1.5"><div className="h-2.5 bg-gray-100 rounded w-3/4" /><div className="h-2 bg-gray-100 rounded w-1/2" /></div>
        </div>
      ))}
    </div>
  );
  if (!logs.length) return (
    <div className="py-8 text-center text-gray-400 text-xs">
      <History size={22} className="mx-auto text-gray-200 mb-2" />No history yet
    </div>
  );
  return (
    <div className="relative px-1">
      <div className="absolute left-[5px] top-1 bottom-1 w-px bg-gray-100" />
      <div className="space-y-4">
        {logs.map(log => {
          const ns = log.newData?.status, os = log.oldData?.status, sc = STATUS_CONFIG[ns] || {};
          return (
            <div key={log.id} className="flex gap-3 relative">
              <div className={`w-2.5 h-2.5 rounded-full border-2 border-white flex-shrink-0 mt-1 z-10 ${sc.dot || "bg-gray-300"}`} style={{ boxShadow: "0 0 0 1.5px #e5e7eb" }} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-semibold text-gray-600">{log.userName}</span>
                  <span className="text-xs text-gray-400">{timeAgo(log.createdAt)}</span>
                </div>
                {os && ns && (
                  <div className="flex items-center gap-1 mb-1 flex-wrap">
                    <span className={`px-1.5 py-0.5 rounded-full text-xs border ${STATUS_CONFIG[os]?.color || "bg-gray-100 text-gray-500 border-gray-200"}`}>{STATUS_CONFIG[os]?.label || os}</span>
                    <ChevronRight size={10} className="text-gray-400" />
                    <span className={`px-1.5 py-0.5 rounded-full text-xs border font-medium ${sc.color || "bg-gray-100 text-gray-500 border-gray-200"}`}>{sc.label || ns}</span>
                  </div>
                )}
                {log.newData?.meetingSubType && <p className="text-xs text-cyan-600 mb-0.5">{log.newData.meetingSubType === "online" ? "Online" : log.newData.meetingSubType === "offline" ? "Offline" : "Reschedule"}</p>}
                {log.newData?.followupDate && <p className="text-xs text-blue-600 mb-0.5">Next Follow-up: {fmtDate(log.newData.followupDate)}</p>}
                {log.newData?.meetingDate && <p className="text-xs text-cyan-600 mb-0.5"> {fmtDateTime(log.newData.meetingDate)}</p>}
                {log.newData?.followUpNote && <p className="text-xs text-amber-600 mb-0.5 line-clamp-2">{log.newData.followUpNote}</p>}
                {log.newData?.quotationShared !== undefined && (
                  <p className="text-xs text-indigo-600 mb-0.5">
                    Quotation: {log.newData.quotationShared
                      ? <>Shared{log.newData.quotationAmount ? ` · ₹${Number(log.newData.quotationAmount).toLocaleString("en-IN")}` : ""}</>
                      : "Not Shared"}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-0.5">{fmtDate(log.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FollowupPopup({ leads, onUpdate, onDismiss }) {
  const [idx, setIdx] = useState(0);
  if (!leads.length) return null;
  const lead = leads[idx];
  if (!lead) return null;
  const handleNext = () => { if (idx < leads.length - 1) setIdx(idx + 1); else onDismiss(); };
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-amber-200 overflow-hidden">
        <div className="bg-amber-50 px-5 py-4 border-b border-amber-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0"><Bell size={18} className="text-amber-600" /></div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">Follow-up Reminder</p>
            <p className="text-xs text-amber-600 mt-0.5">
              {leads.length} follow-up{leads.length > 1 ? "s" : ""} pending
              {leads.length > 1 && ` · ${idx + 1} of ${leads.length}`}
            </p>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <p className="text-base font-bold text-gray-900">{lead.name}</p>
            <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-0.5"><Phone size={13} /> {lead.phone}</div>
          </div>
          {/* Show followupDate with overdue indicator */}
          {lead.followupDate && (
            <div className={`rounded-xl px-3 py-2 border ${lead.followupDate < todayStr() ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
              <p className={`text-xs font-medium ${lead.followupDate < todayStr() ? "text-red-700" : "text-amber-700"}`}>
                {lead.followupDate < todayStr() ? `⚠ Overdue: ${fmtDate(lead.followupDate)}` : `Follow-up: Today`}
              </p>
            </div>
          )}
          {lead.followUpNote && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <p className="text-xs text-amber-700 font-medium"> Note</p>
              <p className="text-sm text-amber-800 mt-0.5">{lead.followUpNote}</p>
            </div>
          )}
          {lead.productInterest && <p className="text-xs text-gray-500"> {lead.productInterest}</p>}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_CONFIG[lead.status]?.color || "bg-gray-100 text-gray-600 border-gray-200"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[lead.status]?.dot || "bg-gray-400"}`} />
            {STATUS_CONFIG[lead.status]?.label || lead.status}
          </span>
        </div>
        <div className="px-5 pb-5 flex gap-2">
          <button onClick={() => onUpdate(lead)} className="flex-1 py-2.5 bg-gray-900 hover:bg-gray-700 text-white rounded-xl text-sm font-medium cursor-pointer">Update Now</button>
          {leads.length > 1
            ? <button onClick={handleNext} className="flex-1 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium cursor-pointer">Next ({leads.length - idx - 1} left)</button>
            : <button onClick={onDismiss} className="flex-1 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium cursor-pointer">Dismiss</button>
          }
        </div>
      </div>
    </div>
  );
}

export default function SalesPage() {
  const [leads, setLeads]           = useState([]);
  const [stats, setStats]           = useState({});
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [pageSize, setPageSize]     = useState(20);
  const [viewMode, setViewMode]     = useState("my");
  const [teamStats, setTeamStats]   = useState({});
  const [users, setUsers]           = useState([]);
  const [followupLeads, setFollowupLeads] = useState([]);
  const [showFollowup, setShowFollowup]   = useState(false);

  // FIX: No more one-time ref guard. fetchFollowups is called on mount AND
  // after every successful lead update so bell badge is always accurate.
  const popupShownOnce = useRef(false);

  const [dateFrom, setDateFrom]     = useState(todayStr());
  const [dateTo, setDateTo]         = useState(todayStr());
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch]         = useState("");
  const [userId, setUserId]         = useState("");
  const [modal, setModal]           = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    status: "", notes: "", followupDate: "", followUpNote: "",
    meetingSubType: "", meetingDate: "", meetingNote: "",
    quotationShared: null, quotationAmount: "",
  });
  const [updating, setUpdating] = useState(false);
  const [toast, setToast]       = useState(null);

  const currentUser = (() => { try { return JSON.parse(localStorage.getItem("crm_user") || "{}"); } catch { return {}; } })();
  const managerRoles = ["Super Admin","Founder & CEO","Director","Branch Manager","Manager","Team Manager","Assistant Manager"];
  const isManager = managerRoles.includes(currentUser?.roleName);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  // fetchFollowups — reusable, called on mount + after every update
  const fetchFollowups = useCallback(async () => {
    try {
      const res = await api.get("/api/activity/followups");
      const fl = res.data.leads || [];
      setFollowupLeads(fl);
      return fl;
    } catch {
      return [];
    }
  }, []);

  // On mount: fetch followups, show popup only once on first load
  useEffect(() => {
    fetchFollowups().then(fl => {
      if (fl.length > 0 && !popupShownOnce.current) {
        popupShownOnce.current = true;
        setShowFollowup(true);
      }
    });
  }, [fetchFollowups]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: pageSize };
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo)   params.dateTo   = dateTo;
      if (search)   params.search   = search;
      if (userId)   params.userId   = userId;

      const isFollowupTab  = statusFilter === "callback";
      const isQuotationTab = statusFilter === "quotation";
      if (!["all","callback","quotation"].includes(statusFilter)) params.status = statusFilter;

      let res;
      if (viewMode === "team" && isManager) {
        res = await api.get("/api/sales/team-leads", { params });
        setTeamStats(res.data.teamStats || {});
      } else {
        res = await api.get("/api/sales/my-leads", { params });
        setStats(res.data.stats || {});
      }

      let fl = res.data.leads || [];

      if (isFollowupTab) {
        fl = fl.filter(lead => {
          if (!lead.followupDate) return false;
          const followDate = new Date(lead.followupDate);
          const from = dateFrom ? new Date(dateFrom) : null;
          const to   = dateTo   ? new Date(dateTo)   : null;
          if (from) from.setHours(0,0,0,0);
          if (to)   to.setHours(23,59,59,999);
          return (!from || followDate >= from) && (!to || followDate <= to);
        });
      }
      if (isQuotationTab) fl = fl.filter(lead => lead.quotationShared === true);

      setLeads(fl);
      setTotal(res.data.total || 0);
    } catch {
      showToast("Failed to load leads", "error");
    }
    setLoading(false);
  }, [dateFrom, dateTo, search, statusFilter, userId, page, pageSize, viewMode]);

  const fetchUsers = useCallback(async () => {
    if (!isManager) return;
    try { const r = await api.get("/api/users"); setUsers(r.data.users || r.data || []); } catch {}
  }, [isManager]);

  useEffect(() => { fetchLeads(); fetchUsers(); }, [fetchLeads, fetchUsers]);

  const handlePageSizeChange = (size) => { setPageSize(size); setPage(1); };

  const openUpdate = (lead) => {
    setSelectedLead(lead);
    setUpdateForm({
      status: lead.status || "allocated", notes: lead.notes || "",
      followupDate: "", followUpNote: "", meetingSubType: lead.meetingSubType || "",
      meetingDate: "", meetingNote: "",
      quotationShared: lead.quotationShared ?? null,
      quotationAmount: lead.quotationAmount ? String(lead.quotationAmount) : "",
    });
    setModal("update");
  };
  const openUpdateFromPopup = (lead) => { setShowFollowup(false); openUpdate(lead); };

  const submitUpdate = async () => {
    if (!selectedLead) return;
    setUpdating(true);
    try {
      await api.patch(`/api/sales/leads/${selectedLead.id}/status`, {
        ...updateForm,
        quotationAmount: updateForm.quotationShared === true ? updateForm.quotationAmount : "",
      });
      showToast("Lead updated successfully");
      setModal(null);
      setSelectedLead(null);
      // Re-fetch followups after update so bell badge stays accurate
      fetchFollowups();
      fetchLeads();
    } catch (err) {
      showToast(err.response?.data?.error || "Update failed", "error");
    }
    setUpdating(false);
  };

  const isMeeting    = updateForm.status === "meeting";
  const needsFollowup = ["callback","interested","contacted","not_interested","meeting","call_update"].includes(updateForm.status);
  const isFiltered   = dateFrom !== todayStr() || dateTo !== todayStr() || search || userId || statusFilter !== "all";

  const columns = [
    { label: "Lead ID",    render: lead => <span className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{lead.leadId || lead.id}</span> },
    { label: "Created At", render: lead => <span className="text-xs text-gray-400 whitespace-nowrap">{fmtDate(lead.createdAt)}</span> },
    {
      label: "Name", key: "name",
      render: lead => (
        <div>
          <p className="font-semibold text-gray-900 whitespace-nowrap text-xs">{lead.name}</p>
          {/* Show overdue badge if followupDate is before today */}
          {lead.followupDate && lead.followupDate < todayStr() && (
            <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-100 px-1.5 py-0.5 rounded-full mt-0.5 whitespace-nowrap">
              <Bell size={8} />Overdue Follow-up
            </span>
          )}
          {/* Show today badge if followupDate is exactly today */}
          {lead.followupDate === todayStr() && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full mt-0.5 whitespace-nowrap">
              <Bell size={8} />Follow-up Today
            </span>
          )}
          {lead.meetingDate?.startsWith(todayStr()) && (
            <span className="inline-flex items-center gap-1 text-xs text-cyan-700 bg-cyan-100 px-1.5 py-0.5 rounded-full mt-0.5 whitespace-nowrap">
              <Bell size={8} />Meeting Today
            </span>
          )}
        </div>
      ),
    },
    { label: "Contact", render: lead => <ContactCell lead={lead} /> },
    {
      label: "Product",
      render: lead => (
        <div>
          {lead.productInterest && <div className="text-xs text-gray-700 max-w-[90px] truncate" title={lead.productInterest}>{lead.productInterest}</div>}
          {lead.state && <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5"><MapPin size={9} />{lead.state}</div>}
        </div>
      ),
    },
    {
      label: "Status",
      render: lead => {
        const sc = STATUS_CONFIG[lead.status] || STATUS_CONFIG.allocated;
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${sc.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
          </span>
        );
      },
    },
    {
      label: "Follow-up",
      render: lead => lead.followupDate ? (
        <span className={`font-medium text-xs ${
          lead.followupDate < todayStr() ? "text-red-600" :
          lead.followupDate === todayStr() ? "text-amber-600" : "text-blue-600"
        }`}>
          {lead.followupDate < todayStr() ? `Overdue · ${fmtDate(lead.followupDate)}` :
           lead.followupDate === todayStr() ? "Today" : fmtDate(lead.followupDate)}
        </span>
      ) : <span className="text-gray-300">—</span>,
    },
    {
      label: "Quotation",
      render: lead => {
        if (lead.quotationShared === true) return (
          <div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200"><Check size={10} />Shared</span>
            {lead.quotationAmount && <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-0.5"><IndianRupee size={9} />{Number(lead.quotationAmount).toLocaleString("en-IN")}</p>}
          </div>
        );
        if (lead.quotationShared === false) return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-red-50 text-red-600 border-red-200"><X size={10} />Not Shared</span>
        );
        return <span className="text-gray-300 text-xs">—</span>;
      },
    },
    {
      label: "Last Remark",
      render: lead => lead.followUpNote ? <ExpandCell text={lead.followUpNote} /> : lead.notes ? <ExpandCell text={lead.notes} /> : <span className="text-gray-300 text-xs">—</span>,
    },
    {
      label: "Action",
      render: lead => (
        <button onClick={() => openUpdate(lead)} className="px-2.5 py-1.5 bg-gray-900 hover:bg-gray-700 text-white rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap">Update</button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {showFollowup && <FollowupPopup leads={followupLeads} onUpdate={openUpdateFromPopup} onDismiss={() => setShowFollowup(false)} />}

      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border ${toast.type === "error" ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
          {toast.type === "error" ? <AlertCircle size={16} /> : <Check size={16} />} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sales Panel</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage and track your leads</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Bell shows count of ALL pending followups (today + overdue) */}
          {followupLeads.length > 0 && !showFollowup && (
            <button onClick={() => setShowFollowup(true)} className="relative p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-600 hover:bg-amber-100 cursor-pointer">
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{followupLeads.length}</span>
            </button>
          )}
          {isManager && (
            <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
              {["my","team"].map(m => (
                <button key={m} onClick={() => { setViewMode(m); setPage(1); }}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${viewMode === m ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800"}`}>
                  {m === "my" ? "My Leads" : "Team Leads"}
                </button>
              ))}
            </div>
          )}
          <button onClick={fetchLeads} className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-500 cursor-pointer shadow-sm"><RefreshCw size={15} /></button>
        </div>
      </div>

      {/* Stat Cards */}
      {viewMode === "my" && (
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-5">
          {STAT_CARDS.map(({ key, label, icon: Icon, color, bg }) => (
            <div key={key} onClick={() => { setStatusFilter(key === "total" ? "all" : key); setPage(1); }}
              className={`bg-white rounded-xl border px-3 py-2.5 shadow-sm cursor-pointer transition-all hover:shadow-md ${statusFilter === key || (key === "total" && statusFilter === "all") ? "border-gray-900 ring-1 ring-gray-900" : "border-gray-200 hover:border-gray-300"}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-400 leading-tight">{label}</p>
                <div className={`w-5 h-5 rounded-md ${bg} flex items-center justify-center`}><Icon size={11} className={color} /></div>
              </div>
              <p className={`text-xl font-bold ${color}`}>{stats[key] || 0}</p>
            </div>
          ))}
        </div>
      )}

      {/* Date + Search */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
          <Calendar size={13} className="text-gray-400 flex-shrink-0" />
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="text-xs text-gray-700 focus:outline-none bg-transparent cursor-pointer w-28" />
          <span className="text-gray-300 text-xs">→</span>
          <input type="date" value={dateTo}   onChange={e => { setDateTo(e.target.value);   setPage(1); }} className="text-xs text-gray-700 focus:outline-none bg-transparent cursor-pointer w-28" />
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search name, phone..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white shadow-sm" />
        </div>
        {isManager && viewMode === "team" && (
          <select value={userId} onChange={e => { setUserId(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-700 shadow-sm">
            <option value="">All Members</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        )}
        {isFiltered && (
          <button onClick={() => { setDateFrom(todayStr()); setDateTo(todayStr()); setSearch(""); setUserId(""); setStatusFilter("all"); setPage(1); }}
            className="flex items-center gap-1 px-3 py-2 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg bg-white cursor-pointer shadow-sm">
            <X size={12} /> Reset
          </button>
        )}
        <span className="ml-auto self-center text-xs text-gray-400 font-medium">{total} leads</span>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm flex-wrap mb-5">
        {[{ key: "all", label: "All" }, ...ALL_STATUSES.map(s => ({ key: s, label: STATUS_CONFIG[s].label })), { key: "quotation", label: "Quotation" }]
          .map(({ key, label }) => (
            <button key={key} onClick={() => { setStatusFilter(key); setPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${statusFilter === key ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800"}`}>
              {label}
            </button>
          ))}
      </div>

      {/* Team Performance */}
      {viewMode === "team" && Object.keys(teamStats).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5 overflow-x-auto">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Team Performance</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                {["Member","Total","Call Back","Interested","Deal Done","Follow Up","Not Int.","Meeting","Call Update"].map(h => (
                  <th key={h} className="pb-2 px-2 text-left font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {Object.entries(teamStats).map(([name, s]) => (
                <tr key={name} className="hover:bg-gray-50">
                  <td className="py-2.5 px-2 font-semibold text-gray-800 whitespace-nowrap">{name}</td>
                  <td className="py-2.5 px-2 font-bold text-gray-900">{s.total}</td>
                  <td className="py-2.5 px-2 text-purple-600">{s.contacted||0}</td>
                  <td className="py-2.5 px-2 text-emerald-600">{s.interested||0}</td>
                  <td className="py-2.5 px-2 text-green-600 font-bold">{s.converted||0}</td>
                  <td className="py-2.5 px-2 text-amber-600">{s.callback||0}</td>
                  <td className="py-2.5 px-2 text-red-500">{s.not_interested||0}</td>
                  <td className="py-2.5 px-2 text-cyan-600">{s.meeting||0}</td>
                  <td className="py-2.5 px-2 text-indigo-600">{s.call_update||0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DataTable columns={columns} data={leads} loading={loading} />

      {/* UPDATE MODAL */}
      {modal === "update" && selectedLead && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-100 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="text-base font-bold text-gray-900">Update Lead</h2>
                <p className="text-xs text-gray-400 mt-0.5">{selectedLead.name} · {selectedLead.phone} · {selectedLead.leadId || selectedLead.id}</p>
              </div>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"><X size={18} /></button>
            </div>

            <div className="flex flex-1 min-h-0 overflow-hidden">
              {/* LEFT — form */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 border-r border-gray-100">
                {/* Status */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Status *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {ALL_STATUSES.map(s => {
                      const sc = STATUS_CONFIG[s], active = updateForm.status === s;
                      return (
                        <button key={s} onClick={() => setUpdateForm({ ...updateForm, status: s, meetingSubType: "" })}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer text-left ${active ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 hover:border-gray-400 text-gray-700"}`}>
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? "bg-white" : sc.dot}`} />
                          <span>{sc.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Follow-up date */}
                {needsFollowup && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <label className="text-xs font-semibold text-amber-700 mb-2 block">Next Follow-up Date</label>
                    <input type="date" value={updateForm.followupDate}
                      onChange={e => setUpdateForm({ ...updateForm, followupDate: e.target.value })}
                      className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer" />
                  </div>
                )}

                {/* Meeting block */}
                {isMeeting && (
                  <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-xl space-y-3">
                    <label className="text-xs font-semibold text-cyan-700 block">Meeting Type & Details</label>
                    <div className="flex gap-2">
                      {[{ val:"online",label:"Online",cls:"cyan" },{ val:"offline",label:"Offline",cls:"cyan" },{ val:"reschedule",label:"Reschedule",cls:"orange" }].map(({ val, label, cls }) => (
                        <button key={val} onClick={() => setUpdateForm({ ...updateForm, meetingSubType: val })}
                          className={`flex-1 py-2 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                            updateForm.meetingSubType === val
                              ? cls === "orange" ? "bg-orange-500 text-white border-orange-500" : "bg-cyan-600 text-white border-cyan-600"
                              : cls === "orange" ? "bg-white text-orange-600 border-orange-200 hover:border-orange-400" : "bg-white text-cyan-700 border-cyan-300 hover:border-cyan-500"
                          }`}>{label}</button>
                      ))}
                    </div>
                    <input type="datetime-local" value={updateForm.meetingDate} onChange={e => setUpdateForm({ ...updateForm, meetingDate: e.target.value })}
                      className="w-full border border-cyan-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer" />
                    <input type="text" placeholder={updateForm.meetingSubType === "reschedule" ? "Reason for reschedule..." : "Meeting Conversation / note..."}
                      value={updateForm.meetingNote} onChange={e => setUpdateForm({ ...updateForm, meetingNote: e.target.value })}
                      className="w-full border border-cyan-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                  </div>
                )}

                {/* Quotation block */}
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-3">
                  <label className="text-xs font-semibold text-indigo-700 block flex items-center gap-1.5"><FileText size={13} />Quotation Shared?</label>
                  <div className="flex gap-2">
                    {[{ val:true,label:"Yes",icon:Check },{ val:false,label:"No",icon:X }].map(({ val, label, icon: Icon }) => (
                      <button key={String(val)} onClick={() => setUpdateForm({ ...updateForm, quotationShared: val, quotationAmount: val ? updateForm.quotationAmount : "" })}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                          updateForm.quotationShared === val
                            ? val ? "bg-emerald-600 text-white border-emerald-600" : "bg-red-500 text-white border-red-500"
                            : "bg-white text-gray-600 border-indigo-200 hover:border-indigo-400"
                        }`}><Icon size={13} />{label}</button>
                    ))}
                  </div>
                  {updateForm.quotationShared === true && (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
                      <input type="number" min="0" placeholder="Enter quotation amount" value={updateForm.quotationAmount}
                        onChange={e => setUpdateForm({ ...updateForm, quotationAmount: e.target.value })}
                        className="w-full border border-indigo-200 rounded-lg pl-7 pr-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    </div>
                  )}
                </div>

                {/* Remark */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Remark / Follow-up Note</label>
                  <input type="text" placeholder="Add a update note..." value={updateForm.followUpNote}
                    onChange={e => setUpdateForm({ ...updateForm, followUpNote: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Client Product Note</label>
                  <textarea value={updateForm.notes} onChange={e => setUpdateForm({ ...updateForm, notes: e.target.value })}
                    rows={3} placeholder="What was discussed? Any important details..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
                </div>

                {/* Lead info */}
                <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1 border border-gray-100">
                  <p className="text-gray-400 font-medium mb-1">Lead Details</p>
                  {selectedLead.productInterest && <p> Service Interest: {selectedLead.productInterest}</p>}
                  {selectedLead.state && <p> Location: {selectedLead.state}{selectedLead.city ? `, ${selectedLead.city}` : ""}</p>}
                  {selectedLead.createdAt && <p> Created At: {fmtDate(selectedLead.createdAt)}</p>}
                  {selectedLead.followupDate && <p> Previous follow-up: {fmtDate(selectedLead.followupDate)}</p>}
                </div>
              </div>

              {/* RIGHT — history */}
              <div className="w-72 flex-shrink-0 flex flex-col bg-gray-50/50">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 flex-shrink-0 bg-white">
                  <History size={13} className="text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-700">History</h3>
                  <span className="text-xs text-gray-400 truncate">— {selectedLead.name}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <LeadHistoryPanel leadId={selectedLead.id} />
                </div>
              </div>
            </div>

            <div className="px-6 pb-5 pt-3 border-t border-gray-100 flex gap-3 flex-shrink-0">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 text-sm font-medium cursor-pointer">Cancel</button>
              <button onClick={submitUpdate} disabled={updating || !updateForm.status}
                className="flex-1 py-2.5 bg-gray-900 hover:bg-gray-700 disabled:opacity-40 rounded-xl text-white text-sm font-medium cursor-pointer">
                {updating ? "Saving…" : "Save Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}