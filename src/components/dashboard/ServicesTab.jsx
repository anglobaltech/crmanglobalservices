"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Wrench, CheckCircle2, TrendingUp, AlertTriangle, Calendar, Clock, Eye, FileText, Activity } from "lucide-react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

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

const PRIORITY_CONFIG = {
  low:    { label: "Low",    className: "bg-gray-100 text-gray-600 border border-gray-200" },
  medium: { label: "Medium", className: "bg-yellow-100 text-yellow-700 border border-yellow-200" },
  high:   { label: "High",   className: "bg-orange-100 text-orange-700 border border-orange-200" },
  urgent: { label: "Urgent", className: "bg-red-100 text-red-700 border border-red-200" },
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
  const diff = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function ServicesTab() {
  const { user } = useAuth();
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("crm_token") : "";
  
  const [stats, setStats] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/services/stats`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setStats(data);
    } catch {}
  }, [token]);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch top 5 recent services for dashboard view
      const res = await fetch(`${API}/api/services?page=1&pageSize=5`, { headers: { Authorization: `Bearer ${token}` } });
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard icon={Wrench} label="Total Assigned" value={stats?.total ?? "..."} color="bg-blue-100 text-blue-600" />
        <KpiCard icon={TrendingUp} label="Active Tasks" value={stats?.active ?? "..."} color="bg-indigo-100 text-indigo-600" />
        <KpiCard icon={CheckCircle2} label="Completed" value={stats?.completed ?? "..."} color="bg-emerald-100 text-emerald-600" subtitle={`${stats?.completionRate ?? 0}% completion`} />
        <KpiCard icon={AlertTriangle} label="Overdue" value={stats?.overdue ?? "..."} color="bg-red-100 text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Tasks List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Activity size={18} className="text-gray-400" />
              Recent Services
            </h3>
            <button 
              onClick={() => router.push("/services")}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              View All
            </button>
          </div>
          
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="p-8 text-center text-gray-400 text-sm">Loading tasks...</div>
            ) : services.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <FileText className="text-gray-400" size={24} />
                </div>
                <h3 className="text-sm font-medium text-gray-900">No Services Found</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-[200px]">You don&apos;t have any active services assigned right now.</p>
              </div>
            ) : (
              services.map(s => {
                const daysRemaining = getDaysRemaining(s.dueDate);
                const statusCfg = STATUS_CONFIG[s.status] || STATUS_OPTIONS[0];
                return (
                  <div key={s.id} onClick={() => router.push(`/services/${s.id}`)} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-gray-400 group-hover:text-blue-600 transition-colors">{s.id}</span>
                        <h4 className="text-sm font-semibold text-gray-900 truncate">{s.serviceName}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${PRIORITY_CONFIG[s.priority]?.className || "bg-gray-100 text-gray-600"}`}>
                          {PRIORITY_CONFIG[s.priority]?.label || s.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate mb-2">{s.clientName}</p>
                      
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <div className={`w-1.5 h-1.5 rounded-full ${statusCfg.color}`} />
                          {statusCfg.label}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${s.progress || 0}%` }} />
                          </div>
                          {s.progress || 0}%
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {s.dueDate && (
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold ${
                          daysRemaining < 0 ? "bg-red-50 text-red-600 border border-red-100" :
                          daysRemaining <= 2 ? "bg-orange-50 text-orange-600 border border-orange-100" :
                          "bg-gray-50 text-gray-600 border border-gray-200"
                        }`}>
                          <Calendar size={10} />
                          {formatDate(s.dueDate)}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        Assigned: {s.assignedToName || <span className="italic">Unassigned</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions & Summary */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-md p-6 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl pointer-events-none" />
            
            <h3 className="text-lg font-bold mb-2">Service Center</h3>
            <p className="text-blue-100 text-sm mb-6 leading-relaxed">
              Track tasks, update progress, and collaborate with your team to deliver excellence.
            </p>
            
            <button 
              onClick={() => router.push("/services")}
              className="w-full py-2.5 bg-white text-blue-700 text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all active:scale-[0.98]"
            >
              Open Services Module
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, color, subtitle }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between group hover:border-blue-200 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} transition-transform group-hover:scale-105`}>
          <Icon size={20} />
        </div>
      </div>
      <div>
        <h4 className="text-2xl font-bold text-gray-900 mb-0.5">{value}</h4>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
