"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Briefcase, Wrench, ChevronRight } from "lucide-react";
import ActivityDashboard from "@/components/ActivityFeed";
import ServicesTab from "@/components/dashboard/ServicesTab";
import OverviewTab from "@/components/dashboard/OverviewTab";

export default function MasterDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "sales", "services"

  const hasServices = user?.permissions?.services === true;
  const hasSales = user?.permissions?.sales === true || user?.permissions?.leads === true;

  // Fallback if no permissions (e.g. fresh user)
  useEffect(() => {
    if (!hasServices && activeTab === "services") setActiveTab("overview");
  }, [hasServices, activeTab]);

  return (
    <div className="min-h-screen bg-gray-50/50" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Personalized Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 ">
          {/* Navigation Tabs */}
          <div className="mt-8 flex items-center gap-6 border-b border-gray-100 overflow-x-auto no-scrollbar pb-1">
            <TabButton 
              active={activeTab === "overview"} 
              onClick={() => setActiveTab("overview")} 
              icon={LayoutDashboard} 
              label="Overview" 
            />
            {(hasSales || true) && ( // Default showing for now, customize based on true permissions later
              <TabButton 
                active={activeTab === "sales"} 
                onClick={() => setActiveTab("sales")} 
                icon={Briefcase} 
                label="Sales & Leads" 
              />
            )}
            {hasServices && (
              <TabButton 
                active={activeTab === "services"} 
                onClick={() => setActiveTab("services")} 
                icon={Wrench} 
                label="Services & Tasks" 
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === "overview" && <OverviewTab onTabChange={setActiveTab} />}
        {activeTab === "sales" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             {/* Wrap ActivityFeed so it looks contained in this layout, or ActivityFeed might be full width */}
            <ActivityDashboard />
          </div>
        )}
        {activeTab === "services" && <ServicesTab />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap
        ${active ? "text-blue-600" : "text-gray-500 hover:text-gray-900"}
      `}
    >
      <Icon size={16} className={active ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"} />
      {label}
      {/* Active Indicator Line */}
      {active && (
        <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-600 rounded-t-full shadow-[0_-2px_8px_rgba(37,99,235,0.4)]" />
      )}
    </button>
  );
}
