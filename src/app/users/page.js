"use client";

import { useEffect, useState } from "react";
import { DEPARTMENTS, DEPT_COLORS, ROLES_CONFIG } from "@/lib/data/rolesConfig";

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("crm_token") : "";

const API = process.env.NEXT_PUBLIC_API_URL;

const AVATAR_COLORS = [
  "bg-rose-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-pink-500",
];
const avatarColor = (name = "") =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emptyForm = {
    name: "",
    email: "",
    password: "",
    department: "",
    roleId: "",
    roleName: "",
  };
  const [form, setForm] = useState(emptyForm);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/users`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const displayed = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.roleName?.toLowerCase().includes(q);
    const matchDept = !filterDept || u.department === filterDept;
    const matchStatus =
      !filterStatus || (filterStatus === "active" ? u.isActive : !u.isActive);
    return matchSearch && matchDept && matchStatus;
  });

  const filteredRoles = ROLES_CONFIG.filter(
    (r) => r.department === form.department,
  );

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password)
      return alert("Name, email, password required");
    if (!form.roleName) return alert("Select a role");
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShowCreate(false);
      setForm(emptyForm);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (user) => {
    setEditTarget(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      department: user.department,
      roleId: user.roleId || user.roleName,
      roleName: user.roleName,
    });
    setShowEdit(true);
  };

  const handleEdit = async () => {
    if (!form.name || !form.email) return alert("Name and email required");
    setIsSubmitting(true);
    try {
      const body = {
        name: form.name,
        email: form.email,
        department: form.department,
        roleName: form.roleName,
        roleId: form.roleId,
        ...(form.password ? { password: form.password } : {}),
      };
      const res = await fetch(`${API}/api/users/${editTarget.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShowEdit(false);
      setEditTarget(null);
      setForm(emptyForm);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (user) => {
    try {
      const res = await fetch(`${API}/api/users/${user.id}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed");
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const openDelete = (user) => {
    setDeleteTarget(user);
    setShowDelete(true);
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/api/users/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setShowDelete(false);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCount = users.filter((u) => u.isActive).length;
  const inactiveCount = users.length - activeCount;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/*  Page Header  */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            User Management
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage team members, roles and access
          </p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setShowCreate(true);
          }}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 cursor-pointer  text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <span className="text-lg leading-none ">+</span> Add User
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Users", value: users.length, color: "text-gray-900" },
          { label: "Active", value: activeCount, color: "text-emerald-600" },
          { label: "Inactive", value: inactiveCount, color: "text-red-500" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm"
          >
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
              {s.label}
            </p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          {/* <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            🔍
          </span> */}
          <input
            placeholder="Search name, email, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-4 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
          />
        </div>

        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d} className="capitalize">
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 cursor-pointer text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {(search || filterDept || filterStatus) && (
          <button
            onClick={() => {
              setSearch("");
              setFilterDept("");
              setFilterStatus("");
            }}
            className="px-3 py-2 text-xs text-gray-500 hover:text-gray-800 cursor-pointer border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
          >
            Clear filters
          </button>
        )}

        <span className="ml-auto self-center text-xs text-gray-400">
          {displayed.length} of {users.length} users
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-16 text-center text-gray-400 text-sm"
                >
                  Loading users…
                </td>
              </tr>
            ) : displayed.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <span className="text-3xl">👥</span>
                    <p className="text-sm">No users found</p>
                  </div>
                </td>
              </tr>
            ) : (
              displayed.map((u) => {
                const dc = DEPT_COLORS[u.department];
                return (
                  <tr
                    key={u.id}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full ${avatarColor(u.name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                        >
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 leading-tight">
                            {u.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-5 py-3.5">
                      {dc ? (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${dc.bg} ${dc.text} ${dc.border}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${dc.dot}`}
                          />
                          <span className="capitalize">{u.department}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5 text-gray-700 font-medium">
                      {u.roleName || "—"}
                    </td>

                    {/* Status toggle */}
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => toggleStatus(u)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                          u.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                        }`}
                        title={
                          u.isActive
                            ? "Click to deactivate"
                            : "Click to activate"
                        }
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${u.isActive ? "bg-emerald-500" : "bg-red-400"}`}
                        />
                        {u.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit user"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => openDelete(u)}
                          className="p-1.5 text-gray-400 hover:text-red-600 cursor-pointer hover:bg-red-200 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <UserModal
        open={showCreate}
        title="Create User"
        form={form}
        setForm={setForm}
        filteredRoles={filteredRoles}
        onClose={() => {
          setShowCreate(false);
          setForm(emptyForm);
        }}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
        submitLabel="Create User"
        showPassword
      />

      <UserModal
        open={showEdit}
        title="Edit User"
        form={form}
        setForm={setForm}
        filteredRoles={ROLES_CONFIG.filter(
          (r) => r.department === form.department,
        )}
        onClose={() => {
          setShowEdit(false);
          setEditTarget(null);
          setForm(emptyForm);
        }}
        onSubmit={handleEdit}
        isSubmitting={isSubmitting}
        submitLabel="Save Changes"
        showPassword
        passwordOptional
      />

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Delete User
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDelete(false);
                  setDeleteTarget(null);
                }}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UserModal({
  open,
  title,
  form,
  setForm,
  filteredRoles,
  onClose,
  onSubmit,
  isSubmitting,
  submitLabel,
  showPassword,
  passwordOptional,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Full Name
            </label>
            <input
              placeholder="Enter full name"
              value={form.name}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Email Address
            </label>
            <input
              placeholder="Enter email address"
              type="email"
              value={form.email}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          {showPassword && (
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Password{" "}
                {passwordOptional && (
                  <span className="text-gray-400 font-normal">
                    (leave blank to keep current)
                  </span>
                )}
              </label>
              <input
                placeholder={
                  passwordOptional ? "New password (optional)" : "Set password"
                }
                type="password"
                value={form.password}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Department
            </label>
            <select
              value={form.department}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all bg-white"
              onChange={(e) =>
                setForm({
                  ...form,
                  department: e.target.value,
                  roleId: "",
                  roleName: "",
                })
              }
            >
              <option value="">Select Department</option>
              {["management", "sales", "services"].map((d) => (
                <option key={d} value={d} className="capitalize">
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Role
            </label>
            <select
              value={form.roleName}
              disabled={!form.department}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400 transition-all bg-white"
              onChange={(e) =>
                setForm({
                  ...form,
                  roleId: e.target.value,
                  roleName: e.target.value,
                })
              }
            >
              <option value="">Select Role</option>
              {filteredRoles.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
            {!form.department && (
              <p className="text-xs text-gray-400 mt-1">
                Select a department first
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Saving…" : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
