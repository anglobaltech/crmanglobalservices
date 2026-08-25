"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Briefcase, Wrench, Package } from "lucide-react";
import ActivityDashboard from "@/components/ActivityFeed";
import ServicesTab from "@/components/dashboard/ServicesTab";
import OverviewTab from "@/components/dashboard/OverviewTab";

const ADMIN_ROLES   = ["Super Admin", "Founder & CEO", "Director"];
const MANAGER_ROLES = ["Branch Manager", "Manager", "Team Manager", "Assistant Manager"];



export default function MasterDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const roleName  = user?.roleName || "";
  const isAdmin   = ADMIN_ROLES.includes(roleName);
  const isManager = isAdmin || MANAGER_ROLES.includes(roleName);

  const hasServices = false; 
  const hasSales    = user?.permissions?.sales === true || user?.permissions?.leads === true || isAdmin || isManager;

  useEffect(() => {
    if (!hasServices && activeTab === "services") setActiveTab("overview");
  }, [hasServices, activeTab]);

  const tabs = [
    { key: "overview", icon: LayoutDashboard, label: "Overview" },
    ...(hasSales ? [{ key: "sales", icon: Briefcase, label: "Sales & Leads" }] : []),
    ...(hasServices ? [{ key: "services", icon: Wrench, label: "Services & Tasks" }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "Inter, sans-serif" }}>

      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">


          {/* Tab Navigation */}
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pt-4">
            {tabs.map(({ key, icon: Icon, label }) => (
              <TabButton
                key={key}
                active={activeTab === key}
                onClick={() => setActiveTab(key)}
                icon={Icon}
                label={label}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === "overview" && <OverviewTab onTabChange={setActiveTab} />}
        
        {activeTab === "sales" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
      className={`relative flex items-center gap-2 pb-3 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap
        ${active ? "text-blue-600" : "text-gray-500 hover:text-gray-900"}
      `}
    >
      <Icon size={16} className={active ? "text-blue-600" : "text-gray-400"} />
      {label}
      {active && (
        <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-600" />
      )}
    </button>
  );
}
