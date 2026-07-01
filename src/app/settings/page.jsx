"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { DEPARTMENTS, MODULES, DEPT_COLORS, MODULE_LABELS } from "@/lib/data/rolesConfig";
import { Shield, Settings, Bell, Lock, RotateCw, RefreshCw, Check, Grid, Search, LayoutDashboard, Users, Briefcase, ClipboardList, SlidersHorizontal } from "lucide-react";

const MODULE_ICONS = {
  dashboard: LayoutDashboard,
  users: Users,
  sales: Briefcase,
  allocate: ClipboardList,
  settings: Settings,
};

const MODULE_DESCRIPTIONS = {
  dashboard: "View analytics and system reports",
  users: "Manage users and system access",
  sales: "Manage the sales pipeline and metrics",
  allocate: "Assign and distribute leads to staff",
  settings: "Configure global system preferences",
};

export default function SettingsPage() {
  const { refreshUser } = useAuth();

  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [form, setForm] = useState({
    department: "",
    name: "",
    permissions: {},
  });

  const [activeTab, setActiveTab] = useState("Roles & Permissions");

  const SETTINGS_TABS = [
    { id: "Roles & Permissions", icon: Shield, active: true },
    { id: "Permissions Matrix", icon: Grid, active: true },
    { id: "General Settings", icon: SlidersHorizontal, active: false },
    { id: "Security & Access", icon: Lock, active: false },
    { id: "Notifications", icon: Bell, active: false },
  ];

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("crm_token") : "";

  const fetchRoles = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setRoles(Array.isArray(data) ? data : []);
    } catch {
      setRoles([]);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const seedRoles = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles/seed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await res.json();
      alert(data.message);
      fetchRoles();
    } catch {
      alert("Seed failed");
    }
  };

  const reseedRoles = async () => {
    if (!confirm("Are you sure you want to reseed roles? This will delete all existing roles and recreate them with default permissions.")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles/reseed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await res.json();
      alert(data.message);
      fetchRoles();
    } catch {
      alert("Reseed failed");
    }
  };

  const syncAllUsers = async () => {
    setIsSyncing(true);
    setSyncMsg("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles/sync-users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await res.json();
      setSyncMsg(`✓ ${data.message}`);
      await refreshUser();
      setTimeout(() => setSyncMsg(""), 4000);
    } catch {
      setSyncMsg("✗ Sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredRoles = useMemo(() => {
    return roles.filter(r => {
      const matchDept = selectedDept === "all" || r.department === selectedDept;
      const matchSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDept && matchSearch;
    });
  }, [roles, selectedDept, searchQuery]);

  const handleRoleSelect = (id) => {
    const role = roles.find((r) => r.id === id);
    if (!role) return;
    setSelectedRoleId(id);
    setForm({
      department: role.department,
      name: role.name,
      permissions: Object.fromEntries(MODULES.map((m) => [m, role.permissions?.[m] ?? false])),
    });
  };

  const togglePermission = (key) =>
    setForm((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: !prev.permissions[key] },
    }));

  const handleSubmit = async () => {
    if (!form.name || !form.department) return alert("Select a role first");
    setIsSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles/${selectedRoleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");

      await fetchRoles();
      await refreshUser(); 
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      handleRoleSelect(selectedRoleId);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const enabledCount = Object.values(form.permissions).filter(Boolean).length;
  const progressPercent = Math.round((enabledCount / MODULES.length) * 100) || 0;

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8 font-sans" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Configure global application preferences</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={syncAllUsers}
              disabled={isSyncing}
              title="Sync all users' permissions based on their assigned roles."
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={14} className={isSyncing ? "animate-spin text-blue-600" : "text-gray-400"} />
              {isSyncing ? "Syncing..." : "Sync Users"}
            </button>
            <button
              onClick={reseedRoles}
              title="Delete all roles and recreate with default permissions"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-gray-700 text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <RotateCw size={14} className="text-gray-400 hover:text-red-600" />
              Re-seed
            </button>
          </div>
        </div>

        {syncMsg && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium border shadow-sm ${syncMsg.startsWith("✓") ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
            {syncMsg}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-[240px] flex-shrink-0">
            <nav className="space-y-1">
              {SETTINGS_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => tab.active && setActiveTab(tab.id)}
                    disabled={!tab.active}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all relative overflow-hidden rounded-lg ${
                      activeTab === tab.id
                        ? "text-blue-700 bg-blue-50/80 shadow-sm"
                        : tab.active
                        ? "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 cursor-pointer"
                        : "text-gray-400 cursor-not-allowed opacity-60"
                    }`}
                  >
                    {activeTab === tab.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md" />
                    )}
                    <Icon size={18} className={activeTab === tab.id ? "text-blue-600" : "text-gray-400"} />
                    <span className={activeTab === tab.id ? "font-bold" : ""}>{tab.id}</span>
                    {!tab.active && (
                      <Lock size={12} className="ml-auto text-gray-300" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {activeTab === "Roles & Permissions" && (
              <div className="flex flex-col xl:flex-row gap-6 h-full">
                
                {/* Roles List Panel */}
                <div className="w-full xl:w-[320px] flex-shrink-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-[calc(100vh-140px)]">
                  <div className="p-4 border-b border-gray-100 bg-white">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Roles</h3>
                    
                    {/* Search */}
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search roles..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                      />
                    </div>

                    {/* Segmented Control */}
                    <div className="flex bg-gray-100/80 p-1 rounded-lg">
                      {["all", ...DEPARTMENTS].map(dept => (
                        <button
                          key={dept}
                          onClick={() => setSelectedDept(dept)}
                          className={`flex-1 text-xs font-medium py-1.5 rounded-md capitalize transition-all duration-200 ${selectedDept === dept ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                          {dept}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredRoles.length === 0 ? (
                      <div className="px-4 py-12 text-center flex flex-col items-center">
                        <Shield className="text-gray-300 mb-3" size={32} />
                        <p className="text-sm text-gray-500 font-medium">{roles.length === 0 ? "No roles configured" : "No matching roles found"}</p>
                        {roles.length === 0 && (
                          <button onClick={seedRoles} className="mt-4 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors cursor-pointer">
                            Seed Default Roles
                          </button>
                        )}
                      </div>
                    ) : (
                      filteredRoles.map(r => (
                        <button
                          key={r.id}
                          onClick={() => handleRoleSelect(r.id)}
                          className={`w-full text-left p-3.5 rounded-lg cursor-pointer transition-all border ${
                            selectedRoleId === r.id 
                              ? "bg-blue-50/50 border-blue-200 shadow-[0_2px_8px_-2px_rgba(59,130,246,0.15)] ring-1 ring-blue-500" 
                              : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`font-semibold text-sm ${selectedRoleId === r.id ? "text-blue-900" : "text-gray-900"}`}>{r.name}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${DEPT_COLORS[r.department]}`}>
                              {r.department}
                            </span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500 font-medium">
                            <span>{Object.values(r.permissions || {}).filter(Boolean).length} modules enabled</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Role Details Panel */}
                <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col relative h-[calc(100vh-140px)]">
                  {!selectedRoleId ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/30">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                        <Shield size={36} className="text-gray-300" strokeWidth={1.5} />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Select a Role</h2>
                      <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
                        Choose a role from the left panel to configure its specific module permissions and access levels.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Details Header */}
                      <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-start justify-between bg-white z-10 gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1.5">
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">{form.name}</h2>
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${DEPT_COLORS[form.department]}`}>
                              {form.department}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">Configure access levels and feature permissions.</p>
                        </div>
                        
                        {/* Summary Card */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 min-w-[220px]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Access Summary</span>
                            <span className="text-sm font-bold text-blue-600">{progressPercent}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
                          </div>
                          <p className="text-xs text-gray-500 font-medium">{enabledCount} of {MODULES.length} modules enabled</p>
                        </div>
                      </div>

                      {/* Feature Cards Grid */}
                      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
                          {MODULES.map(m => {
                            const Icon = MODULE_ICONS[m];
                            const active = form.permissions[m] ?? false;
                            
                            return (
                              <div 
                                key={m} 
                                className={`group relative flex items-start gap-4 p-5 rounded-xl border transition-all duration-200 ${
                                  active 
                                    ? "border-blue-400 bg-blue-50/40 shadow-sm" 
                                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                                }`}
                              >
                                {/* Icon */}
                                <div className={`p-2.5 rounded-lg transition-colors ${active ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"}`}>
                                  <Icon size={20} strokeWidth={2} />
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1">
                                  <h3 className={`text-sm font-bold mb-0.5 capitalize ${active ? "text-blue-900" : "text-gray-900"}`}>{MODULE_LABELS[m]}</h3>
                                  <p className="text-xs text-gray-500 leading-relaxed pr-2">{MODULE_DESCRIPTIONS[m]}</p>
                                </div>
                                
                                {/* Modern Switch */}
                                <button 
                                  onClick={() => togglePermission(m)}
                                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${active ? 'bg-blue-600' : 'bg-gray-200'}`}
                                >
                                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${active ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Sticky Footer */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white/90 backdrop-blur-md flex items-center justify-between">
                        <div className="flex items-center gap-4 pl-2">
                          <button onClick={() => setForm(f => ({ ...f, permissions: Object.fromEntries(MODULES.map((m) => [m, true])) }))} className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors cursor-pointer">
                            Enable All
                          </button>
                          <div className="w-px h-4 bg-gray-300" />
                          <button onClick={() => setForm(f => ({ ...f, permissions: Object.fromEntries(MODULES.map((m) => [m, false])) }))} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">
                            Disable All
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleRoleSelect(selectedRoleId)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                            Cancel
                          </button>
                          <button onClick={handleSubmit} disabled={isSaving} className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm cursor-pointer ${saved ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"} disabled:opacity-50`}>
                            {isSaving ? "Saving..." : saved ? "✓ Saved successfully" : "Save Changes"}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === "Permissions Matrix" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between bg-white gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Permissions Matrix</h2>
                      <p className="text-sm text-gray-500 mt-1">Enterprise overview of all roles and their access levels.</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                      {roles.length} Roles Active
                    </span>
                  </div>
                  {roles.length === 0 ? (
                    <div className="p-16 text-center text-gray-500 text-sm">No roles found. Please seed roles in the Roles & Permissions tab.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left px-6 py-4 text-gray-500 font-bold text-xs uppercase tracking-wider whitespace-nowrap sticky left-0 z-10 bg-gray-50 shadow-[1px_0_0_0_#e5e7eb]">
                              Role Name
                            </th>
                            <th className="text-left px-4 py-4 text-gray-500 font-bold text-xs uppercase tracking-wider">
                              Department
                            </th>
                            {MODULES.map((m) => (
                              <th key={m} className="text-center px-4 py-4 text-gray-500 font-bold text-xs uppercase tracking-wider">
                                {MODULE_LABELS[m]}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {roles.map((r, idx) => (
                            <tr key={r.id} className={`hover:bg-blue-50/40 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                              <td className={`px-6 py-4 font-semibold text-gray-900 sticky left-0 shadow-[1px_0_0_0_#f3f4f6] ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/90"}`}>
                                {r.name}
                              </td>
                              <td className="px-4 py-4">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${DEPT_COLORS[r.department] || "bg-gray-100 text-gray-600"}`}>
                                  {r.department}
                                </span>
                              </td>
                              {MODULES.map((m) => (
                                <td key={m} className="text-center px-4 py-4">
                                  {r.permissions?.[m] ? (
                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
                                      <Check size={14} strokeWidth={3} />
                                    </div>
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-300 flex items-center justify-center mx-auto">
                                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                    </div>
                                  )}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
