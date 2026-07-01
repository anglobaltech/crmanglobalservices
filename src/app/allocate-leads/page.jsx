"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, Upload, Plus, Search, Filter, CheckSquare, Square,
  ChevronDown, X, Download, RefreshCw, UserCheck, AlertCircle,
  Check, Trash2, Building2,
} from "lucide-react";
import * as XLSX from "xlsx";
import api from "@/services/api";
import DataTable from "@/components/common/DataTable";

const SOURCES = ["manual","excel","website","tradeindia","justdial","google-ads"];

export default function AllocateLeadsPage() {
  const [leads, setLeads]   = useState([]);
  const [users, setUsers]   = useState([]);
  const [stats, setStats]   = useState({ total: 0, unallocated: 0, allocated: 0 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());

  const [filters, setFilters] = useState({ status: "unallocated", source: "", state: "", productInterest: "", search: "" });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [modal, setModal]       = useState(null);
  const [assignUser, setAssignUser] = useState(null);
  const [toast, setToast]       = useState(null);

  const [form, setForm] = useState({
    name: "", phone: "", email: "", companyName: "",
    source: "manual", city: "", state: "", productInterest: "", notes: "",
  });

  const [importRows, setImportRows]       = useState([]);
  const [importPreview, setImportPreview] = useState([]);
  const [importing, setImporting]         = useState(false);
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleting, setDeleting]           = useState(false);

  const confirmDelete = (ids) => setDeleteTarget({ ids });

  const doDelete = async () => {
    if (!deleteTarget?.ids?.length) return;
    setDeleting(true);
    try {
      const { ids } = deleteTarget;
      if (ids.length === 1) {
        await api.delete(`/api/leads/${ids[0]}`);
        showToast("Lead deleted successfully");
      } else {
        await Promise.all(ids.map((id) => api.delete(`/api/leads/${id}`)));
        showToast(`${ids.length} leads deleted`);
      }
      setDeleteTarget(null);
      setSelected(new Set());
      fetchLeads();
      fetchStats();
    } catch {
      showToast("Delete failed", "error");
    }
    setDeleting(false);
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries({ ...filters, page, limit: pageSize }).filter(([_, v]) => v !== "" && v !== null),
      );
      const res = await api.get("/api/leads", { params });
      setLeads(res.data.leads);
      setTotal(res.data.total);
    } catch {
      showToast("Failed to load leads", "error");
    }
    setLoading(false);
  }, [filters, page, pageSize]);

  const fetchStats = useCallback(async () => {
    const res = await api.get("/api/leads/stats");
    setStats(res.data);
  }, []);

  const fetchUsers = useCallback(async () => {
    const res = await api.get("/api/users");
    setUsers(res.data.users || res.data);
  }, []);

  useEffect(() => { fetchLeads(); fetchStats(); fetchUsers(); }, [fetchLeads, fetchStats, fetchUsers]);
  useEffect(() => { setSelected(new Set()); }, [filters, page]);

  const toggleSelect = (id) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => selected.size === leads.length ? setSelected(new Set()) : setSelected(new Set(leads.map((l) => l.id)));

  const doAssign = async () => {
    if (!assignUser) return showToast("Please select a user", "error");
    const ids = selected.size > 0 ? [...selected] : null;
    try {
      if (ids && ids.length > 1) {
        await api.patch("/api/leads/bulk-assign", { leadIds: ids, assignedTo: assignUser.id, assignedToName: assignUser.name });
        showToast(`${ids.length} leads assigned to ${assignUser.name}`);
      } else if (ids && ids.length === 1) {
        await api.patch(`/api/leads/${ids[0]}/assign`, { assignedTo: assignUser.id, assignedToName: assignUser.name });
        showToast(`Lead assigned to ${assignUser.name}`);
      }
      setModal(null); setAssignUser(null); setSelected(new Set());
      fetchLeads(); fetchStats();
    } catch {
      showToast("Assignment failed", "error");
    }
  };

  const submitLead = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/leads", form);
      showToast("Lead added successfully");
      setModal(null);
      setForm({ name: "", phone: "", email: "", companyName: "", source: "manual", city: "", state: "", productInterest: "", notes: "" });
      fetchLeads(); fetchStats();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to add lead", "error");
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws);
      setImportRows(rows);
      setImportPreview(rows.slice(0, 5));
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{
      name: "John Doe", phone: "9876543210", email: "john@example.com",
      companyName: "ABC Pvt Ltd", source: "excel", city: "Mumbai",
      state: "Maharashtra", productInterest: "ISI Mark Certification",
      notes: "Interested in certification",
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, "leads_template.xlsx");
  };

  const submitImport = async () => {
    if (!importRows.length) return;
    setImporting(true);
    try {
      const res = await api.post("/api/leads/import", { leads: importRows });
      showToast(`Imported ${res.data.imported} leads. Duplicates: ${res.data.duplicates}`);
      setModal(null); setImportRows([]); setImportPreview([]);
      fetchLeads(); fetchStats();
    } catch {
      showToast("Import failed", "error");
    }
    setImporting(false);
  };

  const setFilter = (k, v) => { setFilters((prev) => ({ ...prev, [k]: v })); setPage(1); };
  const clearFilters = () => { setFilters({ status: "unallocated", source: "", state: "", productInterest: "", search: "" }); setPage(1); };
  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v && k !== "status").length;
  const totalPages = Math.ceil(total / pageSize);

  const columns = [
    {
      label: (
        <button onClick={toggleAll}>
          {selected.size === leads.length && leads.length > 0
            ? <CheckSquare size={16} className="text-gray-900" />
            : <Square size={16} className="text-gray-300" />}
        </button>
      ),
      render: (lead) => (
        <button onClick={() => toggleSelect(lead.id)}>
          {selected.has(lead.id) ? <CheckSquare size={16} className="text-gray-900" /> : <Square size={16} className="text-gray-300" />}
        </button>
      ),
    },
    { label: "Lead ID", key: "leadId" },
    { label: "Name",    key: "name"   },
    { label: "Company", key: "companyName" },
    { label: "Phone", key: "phone" },
    { label: "Email", key: "email" },
    {
      label: "Source",
      render: (lead) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          lead.source === "tradeindia" ? "bg-orange-100 text-orange-700" :
          lead.source === "justdial"   ? "bg-blue-100 text-blue-700"   :
          lead.source === "google-ads" ? "bg-green-100 text-green-700" :
          lead.source === "website"    ? "bg-purple-100 text-purple-700":
          lead.source === "excel"      ? "bg-cyan-100 text-cyan-700"   :
          "bg-gray-100 text-gray-600"
        }`}>{lead.source}</span>
      ),
    },
    { label: "Location", key: "state" },
    { label: "Services", key: "productInterest" },
    {
      label: "Status",
      render: (lead) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${lead.status === "allocated" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
          {lead.status}
        </span>
      ),
    },
    { label: "Assigned To", render: (lead) => lead.assignedToName || "—" },
    {
      label: "Actions",
      render: (lead) => lead.status === "unallocated" ? (
        <button onClick={() => { setSelected(new Set([lead.id])); setModal("assign"); }}
          className="px-3 py-1 bg-black cursor-pointer text-white rounded-lg text-xs">
          Assign
        </button>
      ) : null,
    },
  ];

  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden p-6 h-full">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${toast.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
          {toast.type === "error" ? <AlertCircle size={16} /> : <Check size={16} />} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Allocate Leads</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage and assign leads to CRM users</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setModal("import")}
            className="flex items-center gap-2 px-4 py-2.5 cursor-pointer bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium transition-colors shadow-sm">
            <Upload size={15} /> Import Excel
          </button>
          <button onClick={() => setModal("add")}
            className="flex items-center gap-2 px-4 py-2.5 cursor-pointer bg-gray-900 hover:bg-gray-700 rounded-xl text-sm font-medium text-white transition-colors shadow-sm">
            <Plus size={15} /> Add Lead
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          {["unallocated","allocated",""].map((s) => (
            <button key={s || "all"} onClick={() => setFilter("status", s)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${filters.status === s ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800"}`}>
              {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search name, phone, company..." value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white" />
        </div>
        <select value={filters.source} onChange={(e) => setFilter("source", e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-700">
          <option value="">All Sources</option>
          {SOURCES.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="px-3 py-2 text-xs text-gray-500 hover:text-gray-800 cursor-pointer border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">Clear filters</button>
        )}
        <button onClick={fetchLeads} className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"><RefreshCw size={15} /></button>
        <span className="ml-auto self-center text-xs text-gray-400">{total} leads</span>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="text-blue-700 text-sm font-medium">{selected.size} lead{selected.size > 1 ? "s" : ""} selected</span>
          <button onClick={() => setModal("assign")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-700 rounded-lg text-xs font-medium text-white cursor-pointer transition-colors">
            <UserCheck size={13} /> Assign
          </button>
          <button onClick={() => confirmDelete([...selected])}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-medium text-white cursor-pointer transition-colors">
            <Trash2 size={13} /> Delete
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-gray-400 hover:text-gray-700 cursor-pointer"><X size={16} /></button>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden px-0 pb-4">
        <DataTable 
          columns={columns} 
          data={leads} 
          loading={loading} 
          totalItems={total}
          currentPage={page}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><Trash2 size={22} className="text-red-600" /></div>
            <h2 className="text-lg font-bold text-gray-900 text-center mb-1">Delete {deleteTarget.ids.length > 1 ? `${deleteTarget.ids.length} Leads` : "Lead"}?</h2>
            <p className="text-sm text-gray-500 text-center mb-6">{deleteTarget.ids.length > 1 ? `These ${deleteTarget.ids.length} leads will be permanently removed.` : "This lead will be permanently removed."} This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 text-sm font-medium cursor-pointer">Cancel</button>
              <button onClick={doDelete} disabled={deleting} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl text-white text-sm font-medium cursor-pointer">{deleting ? "Deleting…" : "Yes, Delete"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {modal === "assign" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Assign {selected.size} Lead{selected.size > 1 ? "s" : ""}</h2>
              <button onClick={() => { setModal(null); setAssignUser(null); }} className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {users.map((u) => (
                <button key={u.id || u.uid} onClick={() => setAssignUser({ id: u.id || u.uid, name: u.name || u.displayName })}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors text-left cursor-pointer ${assignUser?.id === (u.id || u.uid) ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"}`}>
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm flex-shrink-0">{(u.name || u.displayName || "?")[0]?.toUpperCase()}</div>
                  <div><div className="text-sm font-semibold text-gray-900">{u.name || u.displayName}</div><div className="text-xs text-gray-400">{u.email}</div></div>
                  {assignUser?.id === (u.id || u.uid) && <Check size={16} className="ml-auto text-gray-900" />}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setModal(null); setAssignUser(null); }} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 text-sm font-medium cursor-pointer">Cancel</button>
              <button onClick={doAssign} disabled={!assignUser} className="flex-1 py-2.5 bg-gray-900 hover:bg-gray-700 disabled:opacity-40 rounded-xl text-white text-sm font-medium cursor-pointer">Assign</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {modal === "add" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Add New Lead</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={submitLead} className="space-y-3">
              {/* Name */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Full Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              {/* Company Name — NEW */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Company Name</label>
                <div className="relative">
                  <input type="text" placeholder="enter company name" value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
              </div>
              {/* Phone */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Phone *</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              {/* Email */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              {/* Location */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Address / Location</label>
                <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              {/* Source */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Source</label>
                <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white cursor-pointer">
                  {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {/* Product Interest */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Product Interest</label>
                <input type="text" placeholder="e.g., ISI Mark, BIS Certification" value={form.productInterest}
                  onChange={(e) => setForm({ ...form, productInterest: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              {/* Notes */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 text-sm font-medium cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-gray-900 hover:bg-gray-700 rounded-xl text-white text-sm font-medium cursor-pointer">Add Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      {modal === "import" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Import Leads from Excel</h2>
              <button onClick={() => { setModal(null); setImportRows([]); setImportPreview([]); }}
                className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-800 font-semibold">Download Template</p>
                <p className="text-xs text-gray-400 mt-0.5">Includes companyName column — use for correct format</p>
              </div>
              <button onClick={downloadTemplate} className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium cursor-pointer">
                <Download size={14} /> Template
              </button>
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center mb-4 hover:border-gray-300 transition-colors">
              <Upload size={28} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm mb-3">Drag & drop or click to upload .xlsx / .xls</p>
              <input type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" id="xlfile" />
              <label htmlFor="xlfile" className="cursor-pointer px-4 py-2 bg-gray-900 hover:bg-gray-700 rounded-lg text-sm text-white font-medium transition-colors">Choose File</label>
            </div>
            {importRows.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-700 font-medium mb-2">Preview — {importRows.length} rows found, showing first 5</p>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {["name","phone","email","companyName","source","city","state","productInterest"].map((h) => (
                          <th key={h} className="px-3 py-2 text-gray-500 text-left font-semibold uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {importPreview.map((r, i) => (
                        <tr key={i}>
                          {["name","phone","email","companyName","source","city","state","productInterest"].map((h) => (
                            <td key={h} className="px-3 py-2 text-gray-600">{r[h] || "—"}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setModal(null); setImportRows([]); setImportPreview([]); }}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 text-sm font-medium cursor-pointer">Cancel</button>
              <button onClick={submitImport} disabled={!importRows.length || importing}
                className="flex-1 py-2.5 bg-gray-900 hover:bg-gray-700 disabled:opacity-40 rounded-xl text-white text-sm font-medium cursor-pointer">
                {importing ? "Importing..." : `Import ${importRows.length} Leads`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}