"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Users, CheckCircle2, PhoneCall, TrendingUp, 
  Wrench, AlertTriangle, ArrowRight, Activity
} from "lucide-react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function OverviewTab({ onTabChange }) {
  const { user } = useAuth();
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("crm_token") : "";
  
  const [salesStats, setSalesStats] = useState({});
  const [servicesStats, setServicesStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const hasServices = user?.permissions?.services === true;
  const hasSales = user?.permissions?.sales === true || user?.permissions?.leads === true;

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const promises = [];
      
      if (hasSales) {
        promises.push(
          fetch(`${API}/api/activity/stats?dateFrom=${today}&dateTo=${today}`, { 
            headers: { Authorization: `Bearer ${token}` } 
          }).then(r => r.json()).then(data => setSalesStats(data || {}))
        );
      }
      
      if (hasServices) {
        promises.push(
          fetch(`${API}/api/services/stats`, { 
            headers: { Authorization: `Bearer ${token}` } 
          }).then(r => r.json()).then(data => setServicesStats(data))
        );
      }

      await Promise.all(promises);
    } catch {}
    setLoading(false);
  }, [token, hasSales, hasServices]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Sales Snapshot */}
      {hasSales && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Today&apos;s Sales Snapshot</h2>
            <button 
              onClick={() => onTabChange("sales")}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View Dashboard <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              icon={Users} 
              label="Total Updates" 
              value={loading ? "..." : salesStats.totalUpdates || 0} 
              color="bg-gray-100 text-gray-700" 
            />
            <StatCard 
              icon={PhoneCall} 
              label="Call Backs" 
              value={loading ? "..." : salesStats.contacted || 0} 
              color="bg-purple-100 text-purple-700" 
            />
            <StatCard 
              icon={TrendingUp} 
              label="Interested" 
              value={loading ? "..." : salesStats.interested || 0} 
              color="bg-emerald-100 text-emerald-700" 
            />
            <StatCard 
              icon={CheckCircle2} 
              label="Deals Done" 
              value={loading ? "..." : salesStats.converted || 0} 
              color="bg-green-100 text-green-700" 
            />
          </div>
        </div>
      )}

      {/* Services Snapshot */}
      {hasServices && (
        <div>
          <div className="flex items-center justify-between mb-4 mt-8">
            <h2 className="text-lg font-bold text-gray-900">Services Overview</h2>
            <button 
              onClick={() => onTabChange("services")}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View Tasks <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              icon={Wrench} 
              label="Total Assigned" 
              value={loading ? "..." : servicesStats?.total ?? 0} 
              color="bg-blue-100 text-blue-700" 
            />
            <StatCard 
              icon={Activity} 
              label="Active Tasks" 
              value={loading ? "..." : servicesStats?.active ?? 0} 
              color="bg-indigo-100 text-indigo-700" 
            />
            <StatCard 
              icon={CheckCircle2} 
              label="Completed" 
              value={loading ? "..." : servicesStats?.completed ?? 0} 
              color="bg-emerald-100 text-emerald-700" 
            />
            <StatCard 
              icon={AlertTriangle} 
              label="Overdue" 
              value={loading ? "..." : servicesStats?.overdue ?? 0} 
              color="bg-red-100 text-red-700" 
            />
          </div>
        </div>
      )}
      
      {/* Empty State Fallback */}
      {!hasSales && !hasServices && !loading && (
        <div className="py-20 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to CRM</h3>
          <p className="text-gray-500">You don&apos;t have access to Sales or Services modules.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-0.5">{label}</p>
        <h4 className="text-2xl font-bold text-gray-900 leading-none">{value}</h4>
      </div>
    </div>
  );
}
