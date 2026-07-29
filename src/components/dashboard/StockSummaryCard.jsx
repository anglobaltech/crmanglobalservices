"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, Truck, PackageCheck, FileCheck, FileX, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function StockSummaryCard({ token }) {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStockStats = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [geRes, seRes, sxRes] = await Promise.all([
        fetch(`${API}/api/stock/gate-entries?limit=500`, { headers }).then(r => r.json()),
        fetch(`${API}/api/stock/entries?limit=500`, { headers }).then(r => r.json()),
        fetch(`${API}/api/stock/exits?limit=500`, { headers }).then(r => r.json()),
      ]);

      const gateEntries  = geRes.entries || [];
      const stockEntries = seRes.entries || [];
      const stockExits   = sxRes.entries || [];

      const approvedQty = stockEntries.reduce((s, e) => s + (Number(e.approvedQty) || 0), 0);
      const rejectedQty = stockEntries.reduce((s, e) => s + (Number(e.rejectedQty) || 0), 0);
      const dispatchedQty = stockExits.reduce((s, e) => s + (Number(e.qtyDispatched) || 0), 0);

      setStats({
        gateCount: gateEntries.length,
        entryCount: stockEntries.length,
        exitCount: stockExits.length,
        approvedQty,
        rejectedQty,
        dispatchedQty,
      });
    } catch { setStats(null); }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchStockStats(); }, [fetchStockStats]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm mt-8">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Package size={18} className="text-gray-500" />
          Stock Overview
        </h2>
        <button
          onClick={() => router.push("/stock")}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
        >
          Manage Stock <ArrowRight size={14} />
        </button>
      </div>

      <div className="p-4 grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCell icon={Package} label="Gate Entries" value={loading ? "..." : stats?.gateCount} colorClass="text-gray-700" bgClass="bg-gray-100" />
        <StatCell icon={PackageCheck} label="Stock In" value={loading ? "..." : stats?.entryCount} colorClass="text-blue-700" bgClass="bg-blue-100" />
        <StatCell icon={Truck} label="Stock Out" value={loading ? "..." : stats?.exitCount} colorClass="text-indigo-700" bgClass="bg-indigo-100" />
        <StatCell icon={FileCheck} label="Approved (kg)" value={loading ? "..." : stats?.approvedQty?.toLocaleString()} colorClass="text-emerald-700" bgClass="bg-emerald-100" />
        <StatCell icon={FileX} label="Rejected (kg)" value={loading ? "..." : stats?.rejectedQty?.toLocaleString()} colorClass="text-rose-700" bgClass="bg-rose-100" />
      </div>
    </div>
  );
}

function StatCell({ icon: Icon, label, value, colorClass = "text-gray-600", bgClass = "bg-gray-100" }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3.5 flex items-center gap-3 shadow-sm hover:border-gray-300 transition-colors">
      <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${bgClass} ${colorClass}`}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div>
        <h4 className="text-xl font-bold text-gray-900 leading-tight">{value ?? "—"}</h4>
        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mt-0.5">{label}</p>
      </div>
    </div>
  );
}
