"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { DEPARTMENTS } from "@/lib/data/rolesConfig";
import { MODULES } from "@/lib/data/rolesConfig";
import { DEPT_COLORS } from "@/lib/data/rolesConfig";
import { MODULE_LABELS } from "@/lib/data/rolesConfig";

const MODULE_ICONS = {
  dashboard: "⊞",
  users: "👤",
  sales: "💼",
  leads: "🎯",
  allocate: "📋",
  settings: "⚙️",
};

export default function SettingsPage() {
  const { refreshUser } = useAuth();

  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [form, setForm] = useState({
    department: "",
    name: "",
    permissions: {},
  });

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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/roles/seed`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );
      const data = await res.json();
      alert(data.message);
      fetchRoles();
    } catch {
      alert("Seed failed");
    }
  };

  const reseedRoles = async () => {
    if (
      !confirm(
        "Are you sure you want to reseed roles? This will delete all existing roles and recreate them with default permissions.",
      )
    )
      return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/roles/reseed`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );
      const data = await res.json();
      alert(data.message);
      fetchRoles();
    } catch {
      alert("Reseed failed");
    }
  };

  // Fixes every existing user whose permissions are empty or stale
  const syncAllUsers = async () => {
    setIsSyncing(true);
    setSyncMsg("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/roles/sync-users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );
      const data = await res.json();
      setSyncMsg(`✓ ${data.message}`);
      // refresh the currently logged-in user
      await refreshUser();
      setTimeout(() => setSyncMsg(""), 4000);
    } catch {
      setSyncMsg("✗ Sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredByDept = selectedDept
    ? roles.filter((r) => r.department === selectedDept)
    : roles;

  const handleRoleSelect = (id) => {
    const role = roles.find((r) => r.id === id);
    if (!role) return;
    setSelectedRoleId(id);
    setForm({
      department: role.department,
      name: role.name,
      permissions: Object.fromEntries(
        MODULES.map((m) => [m, role.permissions?.[m] ?? false]),
      ),
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/roles/${selectedRoleId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(form),
        },
      );
      if (!res.ok) throw new Error("Failed to save");

      const data = await res.json();
      await fetchRoles();
      await refreshUser(); 
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);

      // Re-select to show updated state 
      handleRoleSelect(selectedRoleId);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const enabledCount = Object.values(form.permissions).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* ── Header ─── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Role & Permission Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure module access per role
          </p>
        </div>

        {/* Admin Tools */}
        <div className="flex items-center gap-2">
          {/* SYNC ALL USERS */}
          <button
            onClick={syncAllUsers}
            disabled={isSyncing}
            title="Sync all users' permissions based on their assigned roles. Use this after making changes to roles or if you notice permission issues for existing users."
            className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {isSyncing && <span className="animate-spin">↻</span>}
            {isSyncing ? "Syncing…" : "Sync All Users"}
          </button>

          {/* RESEED */}
          <button
            onClick={reseedRoles}
            title="Delete all roles and recreate with default permissions"
            className="px-4 py-2 border border-gray-300 text-gray-600 cursor-pointer text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Re-seed Roles
          </button>
        </div>
      </div>

      {/* Sync status message */}
      {syncMsg && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${syncMsg.startsWith("✓") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
        >
          {syncMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {/* Department filter */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Department
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedDept("");
                  setSelectedRoleId("");
                  setForm({ department: "", name: "", permissions: {} });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-all ${selectedDept === "" ? "bg-gray-900 text-white border-gray-900" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}
              >
                All
              </button>
              {DEPARTMENTS.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setSelectedDept(d);
                    setSelectedRoleId("");
                    setForm({ department: "", name: "", permissions: {} });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer font-medium border capitalize transition-all ${selectedDept === d ? DEPT_COLORS[d] : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Roles list */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Roles ({filteredByDept.length})
              </p>
              {roles.length === 0 && (
                <button
                  onClick={seedRoles}
                  className="text-xs text-blue-600 cursor-pointer hover:underline"
                >
                  + Seed
                </button>
              )}
            </div>

            <div className="divide-y divide-gray-100 max-h-[480px] overflow-y-auto">
              {filteredByDept.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm text-gray-400 mb-3">
                    {roles.length === 0
                      ? "No roles found"
                      : "No roles for this department"}
                  </p>
                  {roles.length === 0 && (
                    <button
                      onClick={seedRoles}
                      className="px-4 py-2 bg-blue-50 text-blue-600 cursor-pointer text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Seed default roles
                    </button>
                  )}
                </div>
              ) : (
                filteredByDept.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleRoleSelect(r.id)}
                    className={`w-full text-left px-4 py-3 text-sm cursor-pointer transition-colors ${selectedRoleId === r.id ? "bg-gray-900 text-white" : "hover:bg-gray-100 text-gray-700"}`}
                  >
                    <div className="font-medium">{r.name}</div>
                    <div
                      className={`text-xs mt-0.5 flex items-center gap-1.5 ${selectedRoleId === r.id ? "text-gray-300" : "text-gray-400"}`}
                    >
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          r.department === "management"
                            ? "bg-purple-400"
                            : r.department === "sales"
                              ? "bg-blue-400"
                              : "bg-emerald-400"
                        }`}
                      />
                      <span className="capitalize">{r.department}</span>
                      <span>•</span>
                      <span>
                        {
                          Object.values(r.permissions || {}).filter(Boolean)
                            .length
                        }
                        /{MODULES.length} modules
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            {!selectedRoleId ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-5xl mb-4">⚙️</div>
                <p className="text-gray-600 font-medium">
                  Select a role to configure
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Choose a role from the left panel
                </p>
              </div>
            ) : (
              <>
                {/* Role header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {form.name}
                    </h2>
                    <span
                      className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${DEPT_COLORS[form.department] || "bg-gray-100 text-gray-600 border-gray-200"}`}
                    >
                      {form.department}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">
                      {enabledCount}
                    </div>
                    <div className="text-xs text-gray-400">
                      of {MODULES.length} modules
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="h-2 bg-gray-100 rounded-full mb-6">
                  <div
                    className="h-full bg-gray-900 rounded-full transition-all duration-500"
                    style={{
                      width: `${(enabledCount / MODULES.length) * 100}%`,
                    }}
                  />
                </div>

                {/* Module toggles */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Module Access
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {MODULES.map((m) => {
                    const active = form.permissions[m] ?? false;
                    return (
                      <button
                        key={m}
                        onClick={() => togglePermission(m)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all ${
                          active
                            ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                            : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-base">{MODULE_ICONS[m]}</span>
                        <span className="capitalize flex-1 text-left">{m}</span>
                        {active ? (
                          <span className="text-xs font-bold">✓</span>
                        ) : (
                          <span className="text-xs opacity-30">○</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Footer actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        permissions: Object.fromEntries(
                          MODULES.map((m) => [m, true]),
                        ),
                      }))
                    }
                    className="text-xs text-gray-500 hover:text-gray-800 underline underline-offset-2"
                  >
                    Enable all
                  </button>
                  <button
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        permissions: Object.fromEntries(
                          MODULES.map((m) => [m, false]),
                        ),
                      }))
                    }
                    className="text-xs text-gray-500 hover:text-gray-800 underline underline-offset-2"
                  >
                    Disable all
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all min-w-[160px] ${
                      saved
                        ? "bg-green-600 text-white"
                        : "bg-gray-900 text-white hover:bg-gray-700"
                    } disabled:opacity-50`}
                  >
                    {isSaving
                      ? "Saving…"
                      : saved
                        ? "✓ Saved"
                        : "Save Permissions"}
                  </button>
                </div>
              </>
            )}
          </div>

          {roles.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  All Roles — Permissions Overview
                </p>
                <span className="text-xs text-gray-400">
                  {roles.length} roles
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-5 py-2.5 text-gray-500 font-medium text-xs whitespace-nowrap">
                        Roles
                      </th>
                      <th className="text-left px-4 py-2.5 text-gray-500 font-medium text-xs">
                        Department
                      </th>
                      {MODULES.map((m) => (
                        <th
                          key={m}
                          className="text-center px-3 py-2.5 text-gray-500 font-medium text-xs"
                          title={m}
                        >
                          {MODULE_LABELS[m]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => handleRoleSelect(r.id)}
                        className={`border-t border-gray-100 cursor-pointer transition-colors ${
                          selectedRoleId === r.id
                            ? "bg-blue-50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-5 py-2.5 font-medium text-gray-800 text-xs whitespace-nowrap">
                          {r.name}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs capitalize border ${DEPT_COLORS[r.department] || "bg-gray-100 text-gray-600 border-gray-200"}`}
                          >
                            {r.department?.slice(0, 10)}
                          </span>
                        </td>
                        {MODULES.map((m) => (
                          <td key={m} className="text-center px-3 py-2.5">
                            {r.permissions?.[m] ? (
                              <span className="text-green-500 font-bold">
                                ✓
                              </span>
                            ) : (
                              <span className="text-gray-200">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
