"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Wrench, CheckCircle2, TrendingUp, AlertTriangle,
  Calendar, Activity, ArrowRight, FileText
} from "lucide-react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

const STATUS_OPTIONS = [
  { value: "pending",     label: "Pending",     color: "bg-gray-400" },
  { value: "assigned",    label: "Assigned",    color: "bg-blue-600" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-800" },
  { value: "waiting",     label: "Waiting",     color: "bg-gray-600" },
  { value: "on_hold",     label: "On Hold",     color: "bg-gray-500" },
  { value: "review",      label: "Review",      color: "bg-indigo-600" },
  { value: "completed",   label: "Completed",   color: "bg-emerald-600" },
  { value: "cancelled",   label: "Cancelled",   color: "bg-red-600" },
];

const STATUS_CONFIG = Object.fromEntries(STATUS_OPTIONS.map(o => [o.value, o]));

const PRIORITY_CONFIG = {
  low:    { label: "Low",    className: "text-gray-600 border-gray-300 bg-gray-50" },
  medium: { label: "Medium", className: "text-blue-700 border-blue-300 bg-blue-50" },
  high:   { label: "High",   className: "text-orange-700 border-orange-300 bg-orange-50" },
  urgent: { label: "Urgent", className: "text-red-700 border-red-300 bg-red-50" },
};

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function getDaysRemaining(dueDate) {
  if (!dueDate) return null;
  const d = new Date(dueDate);
  if (isNaN(d)) return null;
  return Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
}

export default function ServicesTab() {
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("crm_token") : "";

  const [stats, setStats] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/services/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data);
    } catch {}
  }, [token]);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/services?page=1&pageSize=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setServices(data.services || []);
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
    fetchServices();
  }, [fetchStats, fetchServices]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={Wrench} label="Total Assigned" value={stats?.total ?? "—"} colorClass="text-blue-700" bgClass="bg-blue-100" />
        <KpiCard icon={TrendingUp} label="Active Tasks" value={stats?.active ?? "—"} colorClass="text-indigo-700" bgClass="bg-indigo-100" />
        <KpiCard icon={CheckCircle2} label="Completed" value={stats?.completed ?? "—"} colorClass="text-emerald-700" bgClass="bg-emerald-100" />
        <KpiCard icon={AlertTriangle} label="Overdue" value={stats?.overdue ?? "—"} colorClass="text-rose-700" bgClass="bg-rose-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Tasks List */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Activity size={16} className="text-gray-500" />
              Recent Service Tasks
            </h3>
            <button
              onClick={() => router.push("/services")}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center">
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
                  <span className="text-xs font-medium">Loading tasks…</span>
                </div>
              </div>
            ) : services.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <FileText className="text-gray-300 mb-3" size={32} />
                <h3 className="text-sm font-bold text-gray-700">No Services Found</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
                  You do not have any active services assigned right now.
                </p>
              </div>
            ) : (
              services.map(s => {
                const daysRemaining = getDaysRemaining(s.dueDate);
                const statusCfg = STATUS_CONFIG[s.status] || STATUS_OPTIONS[0];
                return (
                  <div
                    key={s.id}
                    onClick={() => router.push(`/services/${s.id}`)}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-gray-500">{s.id}</span>
                        <h4 className="text-sm font-bold text-gray-900 truncate">{s.serviceName}</h4>
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${PRIORITY_CONFIG[s.priority]?.className || "bg-gray-100 text-gray-600"}`}>
                          {PRIORITY_CONFIG[s.priority]?.label || s.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-2">{s.clientName}</p>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                          <div className={`w-2 h-2 rounded-full ${statusCfg.color}`} />
                          {statusCfg.label}
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 font-medium">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600" style={{ width: `${s.progress || 0}%` }} />
                          </div>
                          {s.progress || 0}%
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-2 shrink-0 border-t border-gray-100 sm:border-0 pt-3 sm:pt-0">
                      {s.dueDate && (
                        <div className={`flex items-center gap-1.5 text-xs font-semibold ${
                          daysRemaining < 0 ? "text-red-600" :
                          daysRemaining <= 2 ? "text-orange-600" :
                          "text-gray-600"
                        }`}>
                          <Calendar size={14} />
                          {formatDate(s.dueDate)}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 font-medium">
                        Assignee: <span className="text-gray-900">{s.assignedToName || "Unassigned"}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Side Info */}
        <div className="space-y-4">
          
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Service Actions</h4>
            <p className="text-sm text-gray-500 mb-4">
              Access the full service module to manage tasks, collaborate, and update statuses.
            </p>
            <button
              onClick={() => router.push("/services")}
              className="w-full py-2 bg-gray-900 text-white text-sm font-semibold rounded-md hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Go to Service Center
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h4 className="text-sm font-bold text-gray-900 mb-3">Status Legend</h4>
            <div className="space-y-2.5">
              {STATUS_OPTIONS.filter(s => !["cancelled"].includes(s.value)).map(s => (
                <div key={s.value} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${s.color}`} />
                  <span className="text-xs font-medium text-gray-700">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, colorClass = "text-gray-600", bgClass = "bg-gray-100" }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3.5 flex items-center gap-3 shadow-sm hover:border-gray-300 transition-colors">
      <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${bgClass} ${colorClass}`}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div>
        <h4 className="text-xl font-bold text-gray-900 leading-tight">{value}</h4>
        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mt-0.5">{label}</p>
      </div>
    </div>
  );
}
