"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Users, CheckCircle2, PhoneCall, TrendingUp, 
  Wrench, AlertTriangle, ArrowRight, Activity, Clock, XCircle, PhoneOutgoing, Video
} from "lucide-react";
import StockSummaryCard from "./StockSummaryCard";

const API = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_ROLES   = ["Super Admin", "Founder & CEO", "Director"];
const MANAGER_ROLES = ["Branch Manager", "Manager", "Team Manager", "Assistant Manager"];

export default function OverviewTab({ onTabChange }) {
  const { user } = useAuth();
  const token = typeof window !== "undefined" ? localStorage.getItem("crm_token") : "";
  
  const roleName  = user?.roleName || "";
  const isAdmin   = ADMIN_ROLES.includes(roleName);
  const isManager = isAdmin || MANAGER_ROLES.includes(roleName);

  const [salesStats, setSalesStats] = useState({});
  const [servicesStats, setServicesStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const hasServices = false;
  const hasSales = user?.permissions?.sales === true || user?.permissions?.leads === true || isAdmin || isManager;
  const hasStock = user?.permissions?.stock === true || isAdmin || isManager;

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const promises = [];
      const headers = { Authorization: `Bearer ${token}` };
      
      if (hasSales) {
        promises.push(
          fetch(`${API}/api/activity/stats?dateFrom=${today}&dateTo=${today}`, { headers })
            .then(r => r.json()).then(data => setSalesStats(data || {}))
        );
      }
      
      if (hasServices) {
        promises.push(
          fetch(`${API}/api/services/stats`, { headers })
            .then(r => r.json()).then(data => setServicesStats(data))
        );
      }

      await Promise.all(promises);
    } catch {}
    setLoading(false);
  }, [token, hasSales, hasServices]);

  useEffect(() => {
    fetchStats();
    
    // Auto refresh every 10 minutes
    const intervalId = setInterval(() => {
      fetchStats();
    }, 10 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [fetchStats]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {hasSales && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Users size={18} className="text-gray-500" />
              Sales & Leads Snapshot
            </h2>
            <button 
              onClick={() => onTabChange("sales")}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              View Sales <ArrowRight size={14} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={Users} label="Total Updates" value={loading ? "..." : salesStats.totalUpdates || 0} colorClass="text-gray-700" bgClass="bg-gray-100" />
            {(loading || salesStats.converted > 0) && <StatCard icon={CheckCircle2} label="Deals Closed" value={loading ? "..." : salesStats.converted || 0} colorClass="text-green-700" bgClass="bg-green-100" />}
            {(loading || salesStats.interested > 0) && <StatCard icon={TrendingUp} label="Interested" value={loading ? "..." : salesStats.interested || 0} colorClass="text-emerald-700" bgClass="bg-emerald-100" />}
            {(loading || salesStats.callback > 0) && <StatCard icon={Clock} label="Follow-Ups Pending" value={loading ? "..." : salesStats.callback || 0} colorClass="text-amber-700" bgClass="bg-amber-100" />}
            
            {(isAdmin || isManager) && (
              <>
                {(loading || salesStats.contacted > 0) && <StatCard icon={PhoneCall} label="Call Backs" value={loading ? "..." : salesStats.contacted || 0} colorClass="text-purple-700" bgClass="bg-purple-100" />}
                {(loading || salesStats.meeting > 0) && <StatCard icon={Video} label="Meetings" value={loading ? "..." : salesStats.meeting || 0} colorClass="text-cyan-700" bgClass="bg-cyan-100" />}
                {(loading || salesStats.call_update > 0) && <StatCard icon={PhoneOutgoing} label="Call Updates" value={loading ? "..." : salesStats.call_update || 0} colorClass="text-blue-700" bgClass="bg-blue-100" />}
                {(loading || salesStats.not_interested > 0) && <StatCard icon={XCircle} label="Not Interested" value={loading ? "..." : salesStats.not_interested || 0} colorClass="text-rose-700" bgClass="bg-rose-100" />}
              </>
            )}
          </div>
        </div>
      )}

      {hasServices && (
        <div>
          <div className="flex items-center justify-between mb-4 mt-8">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Wrench size={18} className="text-gray-500" />
              Services Overview
            </h2>
            <button 
              onClick={() => onTabChange("services")}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              View Tasks <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={Wrench} label="Total Assigned" value={loading ? "..." : servicesStats?.total ?? 0} colorClass="text-blue-700" bgClass="bg-blue-100" />
            <StatCard icon={Activity} label="Active Tasks" value={loading ? "..." : servicesStats?.active ?? 0} colorClass="text-indigo-700" bgClass="bg-indigo-100" />
            <StatCard icon={CheckCircle2} label="Completed" value={loading ? "..." : servicesStats?.completed ?? 0} colorClass="text-emerald-700" bgClass="bg-emerald-100" />
            <StatCard icon={AlertTriangle} label="Overdue" value={loading ? "..." : servicesStats?.overdue ?? 0} colorClass="text-rose-700" bgClass="bg-rose-100" />
          </div>
        </div>
      )}

      {hasStock && <StockSummaryCard token={token} />}
      
      {!hasSales && !hasServices && !hasStock && !loading && (
        <div className="py-20 text-center border border-gray-200 rounded-lg bg-white mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Welcome to CRM</h3>
          <p className="text-sm text-gray-500">You do not have access to any dashboard modules. Contact your administrator.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, colorClass = "text-gray-600", bgClass = "bg-gray-100" }) {
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
