"use client";

import { useEffect, useRef, useState } from "react";

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("crm_token") : "";

const API = process.env.NEXT_PUBLIC_API_URL;

const DEPARTMENTS = ["management", "sales", "services", "hr", "accounts", "operations", "it"];

const DEPT_COLORS = {
  management: { bg: "#f5f3ff", text: "#6d28d9", border: "#ddd6fe", dot: "#7c3aed" },
  sales:      { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe", dot: "#2563eb" },
  services:   { bg: "#ecfdf5", text: "#065f46", border: "#a7f3d0", dot: "#059669" },
  hr:         { bg: "#fdf2f8", text: "#9d174d", border: "#fbcfe8", dot: "#db2777" },
  accounts:   { bg: "#fffbeb", text: "#92400e", border: "#fde68a", dot: "#d97706" },
  operations: { bg: "#ecfeff", text: "#155e75", border: "#a5f3fc", dot: "#0891b2" },
  it:         { bg: "#eef2ff", text: "#3730a3", border: "#c7d2fe", dot: "#4f46e5" },
};

const AVATAR_COLORS = [
  "#ef4444","#f97316","#f59e0b","#10b981",
  "#14b8a6","#06b6d4","#3b82f6","#8b5cf6","#ec4899",
];
const avatarColor = (name = "") => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

const emptyForm = {
  name: "", email: "", phone: "", department: "", designation: "",
  employeeId: "", joiningDate: "", salary: "",
  currentAddress: "", permanentAddress: "",
  notes: "", status: "active",
  employeeType: "fresher",
  salarySlipFile: null, salarySlipBase64: "", salarySlipName: "",
  relievingLetterFile: null, relievingLetterBase64: "", relievingLetterName: "",
  salarySlipUrl: "", relievingLetterUrl: "",
};

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const CSS = `
  .ep{min-height:100vh;background:#f8fafc;padding:24px;font-family:'Inter',-apple-system,sans-serif}
  .ep-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
  .ep-title{font-size:20px;font-weight:700;color:#0f172a;letter-spacing:-0.3px}
  .ep-sub{font-size:13px;color:#94a3b8;margin-top:2px}
  .btn-primary{display:flex;align-items:center;gap:6px;background:#0f172a;color:#fff;font-size:13px;font-weight:600;padding:9px 16px;border-radius:8px;border:none;cursor:pointer;transition:background 0.15s;white-space:nowrap}
  .btn-primary:hover{background:#1e293b}
  .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}
  @media(max-width:640px){.stats-grid{grid-template-columns:repeat(2,1fr)}}
  .stat-card{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px 18px}
  .stat-lbl{font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px}
  .stat-val{font-size:26px;font-weight:700;margin-top:4px}
  .filters{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:18px;align-items:center}
  .f-input{flex:1;min-width:200px;border:1px solid #e2e8f0;border-radius:8px;padding:8px 14px;font-size:13px;color:#1e293b;outline:none;background:#fff;transition:border-color 0.15s}
  .f-input:focus{border-color:#94a3b8}
  .f-sel{border:1px solid #e2e8f0;border-radius:8px;padding:8px 12px;font-size:13px;color:#1e293b;background:#fff;cursor:pointer;outline:none}
  .f-sel:focus{border-color:#94a3b8}
  .f-clear{padding:8px 14px;font-size:12px;color:#64748b;border:1px solid #e2e8f0;border-radius:8px;background:#fff;cursor:pointer}
  .f-clear:hover{background:#f1f5f9}
  .f-count{font-size:12px;color:#94a3b8;margin-left:auto}
  .tbl-wrap{background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden}
  .emp-tbl{width:100%;border-collapse:collapse;font-size:13px}
  .emp-tbl thead tr{background:#f8fafc;border-bottom:1px solid #e2e8f0}
  .emp-tbl th{padding:11px 16px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px}
  .emp-tbl th:last-child{text-align:right}
  .emp-tbl tbody tr{border-bottom:1px solid #f1f5f9;transition:background 0.1s}
  .emp-tbl tbody tr:last-child{border-bottom:none}
  .emp-tbl tbody tr:hover{background:#f8fafc}
  .emp-tbl td{padding:12px 16px;vertical-align:middle}
  .av{width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700;flex-shrink:0}
  .em-name{font-weight:600;color:#0f172a;font-size:13px}
  .em-email{font-size:11px;color:#94a3b8;margin-top:1px}
  .badge{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600;border:1px solid transparent}
  .bdot{width:6px;height:6px;border-radius:50%}
  .b-active{background:#f0fdf4;color:#15803d;border-color:#bbf7d0}
  .b-inactive{background:#fef2f2;color:#dc2626;border-color:#fecaca}
  .b-fresher{background:#eff6ff;color:#1d4ed8;border-color:#bfdbfe}
  .b-exp{background:#f5f3ff;color:#6d28d9;border-color:#ddd6fe}
  .act-btn{width:30px;height:30px;border-radius:7px;border:1px solid #e2e8f0;background:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s;color:#64748b}
  .act-btn.v:hover{color:#2563eb;border-color:#bfdbfe;background:#eff6ff}
  .act-btn.e:hover{color:#0f172a;border-color:#cbd5e1;background:#f1f5f9}
  .act-btn.d:hover{color:#dc2626;border-color:#fecaca;background:#fef2f2}
  .st-toggle{border:none;cursor:pointer;background:none;padding:0}
  .empty{padding:56px 0;text-align:center}
  .empty-ico{font-size:32px;display:block;margin-bottom:8px}
  .empty-txt{font-size:13px;color:#94a3b8}
  .mob-cards{display:none}
  @media(max-width:640px){.desk-tbl{display:none}.mob-cards{display:block}}
  .mob-card{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #f1f5f9}
  .mob-card:last-child{border-bottom:none}
  .overlay{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,0.45);backdrop-filter:blur(4px);padding:16px}
  .modal{background:#fff;border-radius:18px;box-shadow:0 24px 64px rgba(0,0,0,0.12);width:100%;max-width:700px;max-height:92vh;overflow-y:auto}
  .modal-hdr{display:flex;align-items:center;justify-content:space-between;padding:24px 28px 0}
  .modal-title{font-size:16px;font-weight:600;color:#334155}
  .modal-x{width:32px;height:32px;border-radius:9px;border:1px solid #e2e8f0;background:#f8fafc;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:17px;transition:all 0.15s}
  .modal-x:hover{background:#f1f5f9;color:#334155}
  .modal-body{padding:22px 28px}
  .modal-foot{padding:18px 28px;border-top:1px solid #f1f5f9;display:flex;gap:12px}
  .fgrid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .fgrid .s2{grid-column:1/-1}
  @media(max-width:480px){.fgrid{grid-template-columns:1fr}.fgrid .s2{grid-column:1}}
  .fg label{display:block;font-size:12px;font-weight:600;color:#334155;margin-bottom:6px}
  .fg label span{color:#ef4444}
  .fi{width:100%;border:1px solid #e2e8f0;border-radius:10px;padding:10px 14px;font-size:13px;color:#1e293b;outline:none;background:#fff;transition:border-color 0.15s;box-sizing:border-box;font-family:inherit}
  .fi:focus{border-color:#94a3b8;background:#fafbfc}
  .fi::placeholder{color:#94a3b8}
  .type-row{display:flex;gap:10px}
  .type-btn{flex:1;padding:11px;border-radius:10px;border:1.5px solid #e2e8f0;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;background:#fff;color:#64748b}
  .type-btn.fa{border-color:#2563eb;background:#eff6ff;color:#1d4ed8}
  .type-btn.ea{border-color:#7c3aed;background:#f5f3ff;color:#6d28d9}
  .sec-lbl{font-size:12px;font-weight:500;color:#94a3b8;margin:16px 0 8px}
  .doc-sec{border:1px solid #e2e8f0;border-radius:12px;padding:18px;background:#fafafa}
  .doc-sec-ttl{font-size:11px;font-weight:700;color:#6d28d9;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px}
  .fdrop{display:flex;align-items:center;gap:10px;border:1.5px dashed #e2e8f0;border-radius:10px;padding:12px 14px;cursor:pointer;transition:border-color 0.15s}
  .fdrop:hover{border-color:#94a3b8}
  .f-nm{font-size:13px;color:#1e293b;font-weight:500}
  .f-hint{font-size:11px;color:#94a3b8;margin-top:1px}
  .f-brs{margin-left:auto;font-size:11px;font-weight:600;color:#64748b;background:#f1f5f9;border:1px solid #e2e8f0;padding:4px 10px;border-radius:7px;flex-shrink:0}
  .btn-cancel{flex:1;border:1px solid #e2e8f0;border-radius:10px;padding:11px;font-size:13px;font-weight:600;color:#475569;background:#fff;cursor:pointer;transition:background 0.15s}
  .btn-cancel:hover{background:#f8fafc}
  .btn-sub{flex:1;border:none;border-radius:10px;padding:11px;font-size:13px;font-weight:600;color:#fff;background:#1e293b;cursor:pointer;transition:background 0.15s}
  .btn-sub:hover:not(:disabled){background:#334155}
  .btn-sub:disabled{opacity:0.5;cursor:not-allowed}
  .vm{max-width:720px}
  .v-hero{background:#fff;border-bottom:1px solid #f1f5f9;border-radius:14px 14px 0 0;padding:24px 28px;position:relative}
  .v-hc{display:flex;gap:16px;align-items:center}
  .v-av{width:52px;height:52px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;font-weight:700;flex-shrink:0}
  .v-name{font-size:17px;font-weight:600;color:#1e293b;line-height:1.3}
  .v-desg{font-size:13px;color:#94a3b8;margin-top:2px;font-weight:400}
  .v-badges{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
  .v-close{position:absolute;top:16px;right:16px;width:28px;height:28px;border-radius:7px;background:#f1f5f9;border:1px solid #e2e8f0;color:#64748b;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;transition:background 0.15s}
  .v-close:hover{background:#e2e8f0;color:#334155}
  .qs{display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid #f1f5f9;background:#fafbfc}
  .qs-item{padding:14px 16px;text-align:center;border-right:1px solid #f1f5f9}
  .qs-item:last-child{border-right:none}
  .qs-lbl{font-size:11px;font-weight:500;color:#94a3b8;letter-spacing:0.3px}
  .qs-val{font-size:13px;font-weight:600;color:#334155;margin-top:3px}
  .tabs{display:flex;border-bottom:1px solid #f1f5f9;padding:0 24px}
  .tab-btn{padding:11px 14px;font-size:13px;font-weight:400;border:none;background:none;cursor:pointer;color:#94a3b8;border-bottom:2px solid transparent;margin-bottom:-1px;transition:color 0.15s}
  .tab-btn.on{color:#334155;font-weight:600;border-bottom-color:#334155}
  .tc{padding:22px 28px}
  .ig{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  @media(max-width:400px){.ig{grid-template-columns:1fr}}
  .ir{display:flex;flex-direction:column;gap:3px;padding:11px 14px;background:#fafbfc;border:1px solid #f1f5f9;border-radius:8px}
  .ir-l{font-size:11px;font-weight:500;letter-spacing:0.2px;color:#94a3b8}
  .ir-v{font-size:13px;font-weight:600;color:#1e293b;margin-top:1px}
  .st-bar{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:8px}
  .st-bar.ab{background:#f0fdf4;border:1px solid #bbf7d0}
  .st-bar.ib{background:#fef2f2;border:1px solid #fecaca}
  .sdot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
  .dc{display:flex;align-items:center;gap:12px;padding:14px 16px;border:1px solid #e2e8f0;border-radius:10px}
  .di{width:38px;height:38px;border-radius:8px;background:#f8fafc;border:1px solid #e2e8f0;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
  .dl{font-size:13px;font-weight:600;color:#0f172a}
  .ds{font-size:11px;color:#94a3b8;margin-top:2px}
  .dv{margin-left:auto;font-size:12px;font-weight:600;color:#fff;background:#6d28d9;border:none;border-radius:7px;padding:6px 12px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:4px}
  .dnu{margin-left:auto;font-size:11px;color:#94a3b8;background:#f1f5f9;border-radius:6px;padding:5px 10px}
  .addr{padding:14px 16px;border-radius:8px;font-size:13px;color:#334155;line-height:1.6}
  .note{background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px;font-size:13px;color:#374151;line-height:1.7;white-space:pre-wrap}
  .del-modal{max-width:380px;padding:28px;text-align:center}
  .del-icon{font-size:36px;margin-bottom:12px}
  .del-title{font-size:16px;font-weight:700;color:#0f172a;margin-bottom:6px}
  .del-desc{font-size:13px;color:#64748b;line-height:1.6;margin-bottom:24px}
  .btn-danger{flex:1;border:none;border-radius:8px;padding:10px;font-size:13px;font-weight:600;color:#fff;background:#dc2626;cursor:pointer;transition:background 0.15s}
  .btn-danger:hover:not(:disabled){background:#b91c1c}
  .btn-danger:disabled{opacity:0.5}
`;

export default function EmployeesPage() {
  const [employees, setEmployees]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [filterDept, setFilterDept]     = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType]     = useState("");
  const [showCreate, setShowCreate]     = useState(false);
  const [showEdit, setShowEdit]         = useState(false);
  const [showDelete, setShowDelete]     = useState(false);
  const [showView, setShowView]         = useState(false);
  const [selected, setSelected]         = useState(null);
  const [form, setForm]                 = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/employees`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch { setEmployees([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const displayed = employees.filter((e) => {
    const q = search.toLowerCase();
    const ms = !search || e.name?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q) || e.designation?.toLowerCase().includes(q) || e.employeeId?.toLowerCase().includes(q);
    return ms && (!filterDept || e.department === filterDept) && (!filterStatus || e.status === filterStatus) && (!filterType || e.employeeType === filterType);
  });

  const buildPayload = (f) => ({
    name: f.name, email: f.email, phone: f.phone, department: f.department, designation: f.designation,
    employeeId: f.employeeId, joiningDate: f.joiningDate, salary: f.salary, status: f.status, employeeType: f.employeeType,
    currentAddress: f.currentAddress, permanentAddress: f.permanentAddress, notes: f.notes,
    salarySlipBase64: f.salarySlipBase64 || undefined, salarySlipName: f.salarySlipName || undefined,
    relievingLetterBase64: f.relievingLetterBase64 || undefined, relievingLetterName: f.relievingLetterName || undefined,
    salarySlipUrl: f.salarySlipUrl || "", relievingLetterUrl: f.relievingLetterUrl || "",
  });

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.department || !form.designation) return alert("Name, Email, Department and Designation are required.");
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/api/employees`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(buildPayload(form)) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShowCreate(false); setForm(emptyForm); fetchEmployees();
    } catch (err) { alert(err.message); }
    finally { setIsSubmitting(false); }
  };

  const openEdit = (emp) => {
    setSelected(emp);
    setForm({ name: emp.name || "", email: emp.email || "", phone: emp.phone || "", department: emp.department || "", designation: emp.designation || "", employeeId: emp.employeeId || "", joiningDate: emp.joiningDate || "", salary: emp.salary || "", currentAddress: emp.currentAddress || emp.address || "", permanentAddress: emp.permanentAddress || "", notes: emp.notes || "", status: emp.status || "active", employeeType: emp.employeeType || "fresher", salarySlipFile: null, salarySlipBase64: "", salarySlipName: "", relievingLetterFile: null, relievingLetterBase64: "", relievingLetterName: "", salarySlipUrl: emp.salarySlipUrl || "", relievingLetterUrl: emp.relievingLetterUrl || "" });
    setShowEdit(true);
  };

  const handleEdit = async () => {
    if (!form.name || !form.email) return alert("Name and Email are required.");
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/api/employees/${selected.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(buildPayload(form)) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShowEdit(false); setSelected(null); setForm(emptyForm); fetchEmployees();
    } catch (err) { alert(err.message); }
    finally { setIsSubmitting(false); }
  };

  const toggleStatus = async (emp) => {
    try {
      const res = await fetch(`${API}/api/employees/${emp.id}/status`, { method: "PATCH", headers: { Authorization: `Bearer ${getToken()}` } });
      if (!res.ok) throw new Error("Failed");
      fetchEmployees();
    } catch (err) { alert(err.message); }
  };

  const openDelete = (emp) => { setSelected(emp); setShowDelete(true); };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/api/employees/${selected.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
      if (!res.ok) throw new Error("Delete failed");
      setShowDelete(false); setSelected(null); fetchEmployees();
    } catch (err) { alert(err.message); }
    finally { setIsSubmitting(false); }
  };

  const openView = (emp) => { setSelected(emp); setShowView(true); };

  const activeCount      = employees.filter((e) => e.status === "active").length;
  const fresherCount     = employees.filter((e) => e.employeeType === "fresher").length;
  const experiencedCount = employees.filter((e) => e.employeeType === "experienced").length;

  const IcoEye  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/></svg>;
  const IcoEdit = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
  const IcoDel  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
  const IcoPlus = () => <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;

  const DeptBadge = ({ dept }) => {
    const dc = DEPT_COLORS[dept];
    if (!dc) return <span style={{ color: "#94a3b8" }}>—</span>;
    return (
      <span className="badge" style={{ background: dc.bg, color: dc.text, borderColor: dc.border }}>
        <span className="bdot" style={{ background: dc.dot }} />{cap(dept)}
      </span>
    );
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="ep">
        <div className="ep-hdr">
          <div>
            <h1 className="ep-title">Employee Management</h1>
            <p className="ep-sub">Manage your team, roles and records</p>
          </div>
          <button className="btn-primary" onClick={() => { setForm(emptyForm); setShowCreate(true); }}>
            <IcoPlus /> Add Employee
          </button>
        </div>

        <div className="stats-grid">
          {[
            { label: "Total",       value: employees.length,   color: "#0f172a" },
            { label: "Active",      value: activeCount,         color: "#15803d" },
            { label: "Freshers",    value: fresherCount,        color: "#1d4ed8" },
            { label: "Experienced", value: experiencedCount,    color: "#6d28d9" },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <p className="stat-lbl">{s.label}</p>
              <p className="stat-val" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="filters">
          <input className="f-input" placeholder="Search name, email, designation, ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="f-sel" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{cap(d)}</option>)}
          </select>
          <select className="f-sel" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select className="f-sel" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            <option value="fresher">Fresher</option>
            <option value="experienced">Experienced</option>
          </select>
          {(search || filterDept || filterStatus || filterType) && (
            <button className="f-clear" onClick={() => { setSearch(""); setFilterDept(""); setFilterStatus(""); setFilterType(""); }}>Clear</button>
          )}
          <span className="f-count">{displayed.length} of {employees.length}</span>
        </div>

        <div className="tbl-wrap">
          <div className="desk-tbl">
            <table className="emp-tbl">
              <thead>
                <tr>{["Employee","Type","Department","Designation","Emp ID","Joined","Status","Actions"].map((h) => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8}><div className="empty"><span className="empty-txt">Loading employees…</span></div></td></tr>
                ) : displayed.length === 0 ? (
                  <tr><td colSpan={8}><div className="empty"><span className="empty-ico">👥</span><p className="empty-txt">No employees found</p></div></td></tr>
                ) : displayed.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div className="av" style={{ background: avatarColor(e.name) }}>{e.name?.charAt(0).toUpperCase()}</div>
                        <div><p className="em-name">{e.name}</p><p className="em-email">{e.email}</p></div>
                      </div>
                    </td>
                    <td><span className={`badge ${e.employeeType === "experienced" ? "b-exp" : "b-fresher"}`}>{e.employeeType === "experienced" ? "Experienced" : "Fresher"}</span></td>
                    <td><DeptBadge dept={e.department} /></td>
                    <td style={{ color:"#334155", fontWeight:500 }}>{e.designation || "—"}</td>
                    <td style={{ color:"#94a3b8", fontFamily:"monospace", fontSize:12 }}>{e.employeeId || "—"}</td>
                    <td style={{ color:"#94a3b8", fontSize:12 }}>{e.joiningDate || "—"}</td>
                    <td>
                      <button className="st-toggle" onClick={() => toggleStatus(e)} title={e.status === "active" ? "Click to deactivate" : "Click to activate"}>
                        <span className={`badge ${e.status === "active" ? "b-active" : "b-inactive"}`}>
                          <span className="bdot" style={{ background: e.status === "active" ? "#16a34a" : "#dc2626" }} />
                          {e.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </button>
                    </td>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:6 }}>
                        <button className="act-btn v" onClick={() => openView(e)} title="View"><IcoEye /></button>
                        <button className="act-btn e" onClick={() => openEdit(e)} title="Edit"><IcoEdit /></button>
                        <button className="act-btn d" onClick={() => openDelete(e)} title="Delete"><IcoDel /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mob-cards">
            {loading ? (
              <div className="empty"><span className="empty-txt">Loading…</span></div>
            ) : displayed.length === 0 ? (
              <div className="empty"><span className="empty-ico">👥</span><p className="empty-txt">No employees found</p></div>
            ) : displayed.map((e) => (
              <div key={e.id} className="mob-card">
                <div className="av" style={{ background: avatarColor(e.name) }}>{e.name?.charAt(0).toUpperCase()}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p className="em-name">{e.name}</p>
                  <p className="em-email">{e.designation}</p>
                  <div style={{ display:"flex", gap:5, marginTop:5, flexWrap:"wrap" }}>
                    <DeptBadge dept={e.department} />
                    <span className={`badge ${e.employeeType === "experienced" ? "b-exp" : "b-fresher"}`}>{e.employeeType === "experienced" ? "Experienced" : "Fresher"}</span>
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
                  <button className="st-toggle" onClick={() => toggleStatus(e)}>
                    <span className={`badge ${e.status === "active" ? "b-active" : "b-inactive"}`}>
                      <span className="bdot" style={{ background: e.status === "active" ? "#16a34a" : "#dc2626" }} />
                      {e.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </button>
                  <div style={{ display:"flex", gap:4 }}>
                    <button className="act-btn v" onClick={() => openView(e)}><IcoEye /></button>
                    <button className="act-btn e" onClick={() => openEdit(e)}><IcoEdit /></button>
                    <button className="act-btn d" onClick={() => openDelete(e)}><IcoDel /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <EmployeeModal open={showCreate} title="Add Employee"  form={form} setForm={setForm} onClose={() => { setShowCreate(false); setForm(emptyForm); }}              onSubmit={handleCreate} isSubmitting={isSubmitting} submitLabel="Add Employee"   />
      <EmployeeModal open={showEdit}   title="Edit Employee" form={form} setForm={setForm} onClose={() => { setShowEdit(false); setSelected(null); setForm(emptyForm); }} onSubmit={handleEdit}   isSubmitting={isSubmitting} submitLabel="Save Changes"  />
      {showView && selected && (
        <EmployeeViewModal employee={selected} onClose={() => { setShowView(false); setSelected(null); }} onEdit={() => { setShowView(false); openEdit(selected); }} />
      )}
      {showDelete && (
        <div className="overlay">
          <div className="modal del-modal">
            <div className="del-icon">🗑️</div>
            <h2 className="del-title">Delete Employee</h2>
            <p className="del-desc">Are you sure you want to delete <strong>{selected?.name}</strong>?<br/>This action cannot be undone.</p>
            <div style={{ display:"flex", gap:10 }}>
              <button className="btn-cancel" onClick={() => { setShowDelete(false); setSelected(null); }}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete} disabled={isSubmitting}>{isSubmitting ? "Deleting…" : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EmployeeModal({ open, title, form, setForm, onClose, onSubmit, isSubmitting, submitLabel }) {
  if (!open) return null;
  const F = (field, value) => setForm({ ...form, [field]: value });
  const slipRef    = useRef(null);
  const relieveRef = useRef(null);

  const handleFileChange = async (field, nameField, base64Field, file) => {
    if (!file) return;
    const base64 = await toBase64(file);
    setForm((prev) => ({ ...prev, [field]: file, [nameField]: file.name, [base64Field]: base64 }));
  };

  const isExperienced = form.employeeType === "experienced";

  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-hdr">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-x" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="fgrid">
            <div className="fg s2">
              <label>Employee Type <span>*</span></label>
              <div className="type-row">
                {["fresher","experienced"].map((t) => (
                  <button key={t} type="button" onClick={() => F("employeeType", t)}
                    className={`type-btn ${form.employeeType === t ? (t === "fresher" ? "fa" : "ea") : ""}`}>
                    {cap(t)}
                  </button>
                ))}
              </div>
            </div>
            <div className="fg s2">
              <label>Full Name <span>*</span></label>
              <input className="fi" value={form.name} onChange={(e) => F("name", e.target.value)} placeholder="Enter full name" />
            </div>
            <div className="fg">
              <label>Email <span>*</span></label>
              <input className="fi" type="email" value={form.email} onChange={(e) => F("email", e.target.value)} placeholder="email@company.com" />
            </div>
            <div className="fg">
              <label>Phone</label>
              <input className="fi" value={form.phone} onChange={(e) => F("phone", e.target.value)} placeholder="+91 00000 00000" />
            </div>
            <div className="fg">
              <label>Department <span>*</span></label>
              <select className="fi" value={form.department} onChange={(e) => F("department", e.target.value)}>
                <option value="">Select</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{cap(d)}</option>)}
              </select>
            </div>
            <div className="fg">
              <label>Designation <span>*</span></label>
              <input className="fi" value={form.designation} onChange={(e) => F("designation", e.target.value)} placeholder="e.g. Senior Executive" />
            </div>
            <div className="fg">
              <label>Employee ID</label>
              <input className="fi" value={form.employeeId} onChange={(e) => F("employeeId", e.target.value)} placeholder="e.g. ANGS-001" />
            </div>
            <div className="fg">
              <label>Joining Date</label>
              <input className="fi" type="date" value={form.joiningDate} onChange={(e) => F("joiningDate", e.target.value)} />
            </div>
            <div className="fg">
              <label>Salary (₹)</label>
              <input className="fi" type="number" value={form.salary} onChange={(e) => F("salary", e.target.value)} placeholder="0" />
            </div>
            <div className="fg">
              <label>Status</label>
              <select className="fi" value={form.status} onChange={(e) => F("status", e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="fg s2">
              <label>Current Address</label>
              <textarea className="fi" rows={2} value={form.currentAddress} onChange={(e) => F("currentAddress", e.target.value)} placeholder="Current / residential address" style={{ resize:"none" }} />
            </div>
            <div className="fg s2">
              <label>Permanent Address</label>
              <textarea className="fi" rows={2} value={form.permanentAddress} onChange={(e) => F("permanentAddress", e.target.value)} placeholder="Permanent / home address" style={{ resize:"none" }} />
            </div>
            {isExperienced && (
              <div className="fg s2">
                <div className="doc-sec">
                  <p className="doc-sec-ttl">Experience Documents</p>
                  <input ref={slipRef} type="file" accept=".pdf,image/*" style={{ display:"none" }} onChange={(ev) => handleFileChange("salarySlipFile","salarySlipName","salarySlipBase64",ev.target.files[0])} />
                  <div style={{ marginBottom:10 }}>
                    <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#475569", marginBottom:5 }}>Salary Slip</label>
                    <div className="fdrop" onClick={() => slipRef.current?.click()}>
                      <span style={{ fontSize:20 }}>📄</span>
                      <div>
                        {form.salarySlipName ? <p className="f-nm" style={{ color:"#6d28d9" }}>{form.salarySlipName}</p>
                          : form.salarySlipUrl ? <p className="f-nm"><a href={form.salarySlipUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color:"#2563eb" }}>View current file</a></p>
                          : <p className="f-nm" style={{ color:"#94a3b8" }}>Click to upload salary slip</p>}
                        <p className="f-hint">PDF, JPG, PNG</p>
                      </div>
                      <span className="f-brs">Browse</span>
                    </div>
                  </div>
                  <input ref={relieveRef} type="file" accept=".pdf,image/*" style={{ display:"none" }} onChange={(ev) => handleFileChange("relievingLetterFile","relievingLetterName","relievingLetterBase64",ev.target.files[0])} />
                  <div>
                    <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#475569", marginBottom:5 }}>Relieving Letter</label>
                    <div className="fdrop" onClick={() => relieveRef.current?.click()}>
                      <span style={{ fontSize:20 }}>📋</span>
                      <div>
                        {form.relievingLetterName ? <p className="f-nm" style={{ color:"#6d28d9" }}>{form.relievingLetterName}</p>
                          : form.relievingLetterUrl ? <p className="f-nm"><a href={form.relievingLetterUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color:"#2563eb" }}>View current file</a></p>
                          : <p className="f-nm" style={{ color:"#94a3b8" }}>Click to upload relieving letter</p>}
                        <p className="f-hint">PDF, JPG, PNG</p>
                      </div>
                      <span className="f-brs">Browse</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="fg s2">
              <label>Notes</label>
              <textarea className="fi" rows={3} value={form.notes} onChange={(e) => F("notes", e.target.value)} placeholder="Any additional notes…" style={{ resize:"none" }} />
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-sub" onClick={onSubmit} disabled={isSubmitting}>{isSubmitting ? "Saving…" : submitLabel}</button>
        </div>
      </div>
    </div>
  );
}

function EmployeeViewModal({ employee: e, onClose, onEdit }) {
  const [tab, setTab]   = useState("overview");
  const dc              = DEPT_COLORS[e.department];
  const isExperienced   = e.employeeType === "experienced";

  return (
    <div className="overlay">
      <div className="modal vm">
        <div className="v-hero">
          <button className="v-close" onClick={onClose}>×</button>
          <div className="v-hc">
            <div className="v-av" style={{ background: avatarColor(e.name) }}>{e.name?.charAt(0).toUpperCase()}</div>
            <div>
              <h2 className="v-name">{e.name}</h2>
              <p className="v-desg">{e.designation || "—"}</p>
              <div className="v-badges">
                {dc && <span className="badge" style={{ background:dc.bg, color:dc.text, borderColor:dc.border }}><span className="bdot" style={{ background:dc.dot }} />{cap(e.department)}</span>}
                <span className={`badge ${isExperienced ? "b-exp" : "b-fresher"}`}>{isExperienced ? "Experienced" : "Fresher"}</span>
                <span className={`badge ${e.status === "active" ? "b-active" : "b-inactive"}`}><span className="bdot" style={{ background: e.status === "active" ? "#16a34a" : "#dc2626" }} />{e.status === "active" ? "Active" : "Inactive"}</span>
                {e.employeeId && <span style={{ fontSize:11, color:"#94a3b8", fontFamily:"monospace" }}>#{e.employeeId}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="qs">
          {[
            { label:"Department", value: e.department ? cap(e.department) : "—" },
            { label:"Salary",     value: e.salary ? `₹${Number(e.salary).toLocaleString("en-IN")}` : "—" },
            { label:"Joined",     value: e.joiningDate ? new Date(e.joiningDate).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—" },
          ].map((s) => (
            <div key={s.label} className="qs-item"><p className="qs-lbl">{s.label}</p><p className="qs-val">{s.value}</p></div>
          ))}
        </div>

        <div className="tabs">
          {[{id:"overview",label:"Overview"},{id:"address",label:"Address"},{id:"documents",label:"Documents"},{id:"notes",label:"Notes"}].map((t) => (
            <button key={t.id} className={`tab-btn ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}
              {t.id === "documents" && isExperienced && <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:"#7c3aed", marginLeft:5, verticalAlign:"middle" }} />}
            </button>
          ))}
        </div>

        <div className="tc">
          {tab === "overview" && (
            <div>
              <p className="sec-lbl">Personal Information</p>
              <div className="ig">
                {[
                  {label:"Full Name",    value:e.name},
                  {label:"Email",        value:e.email},
                  {label:"Phone",        value:e.phone},
                  {label:"Employee ID",  value:e.employeeId},
                ].map((i) => (
                  <div key={i.label} className="ir">
                    <span className="ir-l">{i.label}</span>
                    <span className="ir-v">{i.value || "—"}</span>
                  </div>
                ))}
              </div>
              <p className="sec-lbl">Job Details</p>
              <div className="ig">
                {[
                  {label:"Designation",   value:e.designation},
                  {label:"Department",    value:e.department ? cap(e.department) : ""},
                  {label:"Joining Date",  value:e.joiningDate ? new Date(e.joiningDate).toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"}) : ""},
                  {label:"Salary",        value:e.salary ? `₹ ${Number(e.salary).toLocaleString("en-IN")}` : ""},
                  {label:"Employee Type", value:isExperienced ? "Experienced" : "Fresher"},
                ].map((i) => (
                  <div key={i.label} className="ir">
                    <span className="ir-l">{i.label}</span>
                    <span className="ir-v">{i.value || "—"}</span>
                  </div>
                ))}
              </div>
              <p className="sec-lbl">Employment Status</p>
              <div className={`st-bar ${e.status === "active" ? "ab" : "ib"}`}>
                <span className="sdot" style={{ background: e.status === "active" ? "#16a34a" : "#dc2626" }} />
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color: e.status === "active" ? "#15803d" : "#dc2626" }}>{e.status === "active" ? "Active Employee" : "Inactive Employee"}</p>
                  <p style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{e.status === "active" ? "Currently working in the organization" : "No longer active"}</p>
                </div>
              </div>
            </div>
          )}

          {tab === "address" && (
            <div>
              <p className="sec-lbl">Contact</p>
              <div className="ig" style={{ marginBottom:16 }}>
                <div className="ir"><span className="ir-l">Email</span><span className="ir-v">{e.email || "—"}</span></div>
                <div className="ir"><span className="ir-l">Phone</span><span className="ir-v">{e.phone || "—"}</span></div>
              </div>
              <p className="sec-lbl">Current Address</p>
              {(e.currentAddress || e.address)
                ? <div className="addr" style={{ background:"#eff6ff", border:"1px solid #bfdbfe" }}>{e.currentAddress || e.address}</div>
                : <p style={{ fontSize:13, color:"#94a3b8", padding:"12px 0" }}>No current address added</p>}
              <p className="sec-lbl" style={{ marginTop:16 }}>Permanent Address</p>
              {e.permanentAddress
                ? <div className="addr" style={{ background:"#fffbeb", border:"1px solid #fde68a" }}>{e.permanentAddress}</div>
                : <p style={{ fontSize:13, color:"#94a3b8", padding:"12px 0" }}>No permanent address added</p>}
            </div>
          )}

          {tab === "documents" && (
            <div>
              {!isExperienced ? (
                <div style={{ textAlign:"center", padding:"40px 0", color:"#94a3b8" }}>
                  <p style={{ fontSize:28, marginBottom:8 }}>📁</p>
                  <p style={{ fontSize:13, fontWeight:600 }}>No documents applicable</p>
                  <p style={{ fontSize:12, marginTop:4 }}>Documents are for experienced employees only</p>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <p className="sec-lbl">Experience Documents</p>
                  {[
                    {label:"Salary Slip",      sub:"Last employer salary document",          url:e.salarySlipUrl,      icon:"📄"},
                    {label:"Relieving Letter",  sub:"Previous employer relieving document",  url:e.relievingLetterUrl, icon:"📋"},
                  ].map((doc) => (
                    <div key={doc.label} className="dc">
                      <div className="di">{doc.icon}</div>
                      <div style={{ flex:1 }}><p className="dl">{doc.label}</p><p className="ds">{doc.sub}</p></div>
                      {doc.url
                        ? <a href={doc.url} target="_blank" rel="noreferrer" className="dv">↗ View</a>
                        : <span className="dnu">Not uploaded</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "notes" && (
            <div>
              <p className="sec-lbl">Notes & Remarks</p>
              {e.notes ? <div className="note">{e.notes}</div> : (
                <div style={{ textAlign:"center", padding:"40px 0", color:"#94a3b8" }}>
                  <p style={{ fontSize:28, marginBottom:8 }}>📝</p>
                  <p style={{ fontSize:13 }}>No notes added</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-foot">
          <button className="btn-cancel" onClick={onClose}>Close</button>
          <button className="btn-sub" onClick={onEdit}>Edit Employee</button>
        </div>
      </div>
    </div>
  );
}
