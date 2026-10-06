"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Upload, Trash2, Download, Activity,
  Calendar, Users, ChevronDown, CheckCircle2, Clock,
  FolderOpen, FileText, Image as ImgIcon, File as FileIcon2,
  MessageSquare, Eye, ChevronLeft, ChevronRight,
  Award, FlaskConical, BadgeCheck, Search, ClipboardList,
  Plus, BookOpen, Edit2, Save, X, Info, IndianRupee,
  AlertOctagon, ShieldAlert, RefreshCw
} from "lucide-react";

import { useProject } from "@/hooks/useProject";
import { SERVICE_TYPES } from "@/lib/data/projectChecklists";

import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import EditProjectModal from "./EditProjectModal";

const STATUS_OPTIONS = [
  { value: "in_progress", label: "Running",   color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "on_hold",     label: "Hold",      color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "overdue",     label: "Overdue",   color: "bg-red-100 text-red-700 border-red-200" },
  { value: "completed",   label: "Completed", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
];

// Fallback for old statuses still in DB
const STATUS_FALLBACK = {
  pending: { label: "Pending",     color: "bg-slate-100 text-slate-600 border-slate-200" },
  review:  { label: "Review",      color: "bg-purple-100 text-purple-700 border-purple-200" },
};

const STAGE_ICONS = {
  stage_bis_id:         BadgeCheck,
  stage_hm_id:          BadgeCheck,
  stage_test_request:   FlaskConical,
  stage_application:    ClipboardList,
  stage_hm_application: ClipboardList,
  stage_audit:          Search,
  stage_hm_audit:       Search,
  stage_grant:          Award,
  stage_hm_grant:       Award,
};

const ACTIVITY_COLORS = {
  created:        "bg-blue-100 text-blue-600",
  assigned:       "bg-purple-100 text-purple-600",
  status_changed: "bg-indigo-100 text-indigo-600",
  stage:          "bg-emerald-100 text-emerald-600",
  checklist:      "bg-emerald-100 text-emerald-600",
  remark:         "bg-amber-100 text-amber-600",
  comment:        "bg-gray-100 text-gray-600",
  document:       "bg-sky-100 text-sky-600",
  payment:        "bg-green-100 text-green-600",
};

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function fmtDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function FileTypeIcon({ name = "" }) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (["jpg","jpeg","png","gif","webp"].includes(ext)) return <ImgIcon size={16} className="text-sky-500" />;
  if (ext === "pdf") return <FileText size={16} className="text-red-500" />;
  return <FileIcon2 size={16} className="text-gray-400" />;
}

function RemarkBox({ stepId, stepLabel, onSubmit }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await onSubmit({ message: text.trim(), stepId, stepLabel });
      setText("");
      setOpen(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-2">
      {!open ? (
        <button onClick={e => { e.stopPropagation(); setOpen(true); }}
          className="text-xs text-gray-400 hover:text-amber-600 transition flex items-center gap-1 cursor-pointer">
          <Plus size={11} /> Add remark
        </button>
      ) : (
        <div className="flex gap-2 mt-1" onClick={e => e.stopPropagation()}>
          <input value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            autoFocus
            placeholder="Enter remark..."
            className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400" />
          <button onClick={submit} disabled={sending || !text.trim()}
            className="px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition disabled:opacity-40 cursor-pointer">
            {sending ? "…" : "Post"}
          </button>
          <button onClick={() => { setOpen(false); setText(""); }}
            className="px-2 py-1.5 text-xs text-gray-400 hover:text-gray-700 cursor-pointer">✕</button>
        </div>
      )}
    </div>
  );
}

function ActivityFeed({ activity, actTotal, actPage, actPageSize, onPageChange }) {
  const totalPages = Math.ceil(actTotal / actPageSize);

  if (activity.length === 0) return <EmptyState title="No activity yet" className="py-10" />;

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {activity.map(act => (
          <div key={act.id} className="flex items-start gap-3 px-5 py-3.5">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${ACTIVITY_COLORS[act.type] || "bg-gray-100 text-gray-600"}`}>
              {(act.performedByName || "?")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                {act.code && (
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 rounded px-1.5 py-0.5">
                    {act.code}
                  </span>
                )}
                {act.stepLabel && (
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{act.stepLabel}</p>
                )}
              </div>
              <p className="text-sm text-gray-800 leading-snug">{act.message}</p>
              <p className="text-xs text-gray-400 mt-0.5">{act.performedByName} · {fmtDateTime(act.createdAt)}</p>
            </div>
            {act.type === "remark" && (
              <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 rounded-md px-2 py-0.5 font-bold flex-shrink-0">REMARK</span>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-gray-400">Page {actPage} of {totalPages} · {actTotal} entries</p>
          <div className="flex items-center gap-1">
            <button onClick={() => onPageChange(actPage - 1)} disabled={actPage === 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition cursor-pointer">
              <ChevronLeft size={14} className="text-gray-600" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - actPage) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && arr[idx - 1] !== p - 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`d${i}`} className="text-xs text-gray-400 px-1">…</span>
                ) : (
                  <button key={p} onClick={() => onPageChange(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition cursor-pointer ${actPage === p ? "bg-gray-900 text-white" : "hover:bg-gray-100 text-gray-600"}`}>
                    {p}
                  </button>
                )
              )}
            <button onClick={() => onPageChange(actPage + 1)} disabled={actPage === totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition cursor-pointer">
              <ChevronRight size={14} className="text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TextSlotRow({ slot, idx, updateIsiDocSlot }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(slot.value || "");
  const [saving, setSaving] = useState(false);
  const hasValue = !!slot.value?.trim();

  const save = async () => {
    setSaving(true);
    try {
      await updateIsiDocSlot(slot.id, draft.trim());
      setEditing(false);
    } catch { alert("Save failed"); }
    finally { setSaving(false); }
  };

  const cancel = () => { setDraft(slot.value || ""); setEditing(false); };

  return (
    <div className={`border-b border-gray-50 last:border-0 transition ${hasValue ? "bg-emerald-50/20" : "hover:bg-gray-50/30"}`}>
      {/* Header row */}
      <div className="flex flex-col sm:grid sm:grid-cols-[auto_1fr_auto] sm:items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3">
        <span className="text-xs font-bold text-gray-300 w-7 text-right">{String(idx + 1).padStart(2, "0")}</span>
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-800 font-medium">{slot.label}</p>
          {hasValue && <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />}
          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-500 border border-indigo-100 rounded px-1.5 py-0.5">TEXT INPUT</span>
        </div>
        <div className="flex items-center gap-1.5">
          {!editing ? (
            <button onClick={() => { setDraft(slot.value || ""); setEditing(true); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition cursor-pointer">
              <Edit2 size={11} /> {hasValue ? "Edit" : "Enter"}
            </button>
          ) : (
            <>
              <button onClick={save} disabled={saving}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer">
                <Save size={11} /> {saving ? "Saving…" : "Save"}
              </button>
              <button onClick={cancel}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"><X size={13} /></button>
            </>
          )}
        </div>
      </div>
      {/* Value area */}
      {editing ? (
        <div className="px-5 pb-4">
          <textarea
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder={slot.placeholder || "Enter value..."}
            rows={3}
            className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400 resize-none"
          />
        </div>
      ) : hasValue ? (
        <div className="px-5 pb-3">
          <p className="text-sm text-gray-600 whitespace-pre-line bg-gray-50 rounded-xl px-3 py-2">{slot.value}</p>
        </div>
      ) : null}
    </div>
  );
}

function TableSlotRow({ slot, idx, updateIsiDocSlot }) {
  const cols = slot.columns || [];
  const existingRows = Array.isArray(slot.value) ? slot.value : [];
  const [rows, setRows] = useState(existingRows);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const hasRows = rows.length > 0;

  const makeEmptyRow = () => Object.fromEntries(cols.map(c => [c, ""]));

  const addRow = () => setRows(r => [...r, makeEmptyRow()]);
  const removeRow = (i) => setRows(r => r.filter((_, ri) => ri !== i));
  const setCell = (ri, col, val) => setRows(r => r.map((row, i) => i === ri ? { ...row, [col]: val } : row));

  const startEdit = () => {
    setRows(existingRows.length > 0 ? existingRows : [makeEmptyRow()]);
    setEditing(true);
  };

  const save = async () => {
    const clean = rows.filter(row => cols.some(c => row[c]?.trim()));
    setSaving(true);
    try {
      await updateIsiDocSlot(slot.id, clean);
      setEditing(false);
    } catch { alert("Save failed"); }
    finally { setSaving(false); }
  };

  const cancel = () => { setRows(existingRows); setEditing(false); };

  const displayRows = editing ? rows : existingRows;

  return (
    <div className={`border-b border-gray-50 last:border-0 transition ${hasRows ? "bg-emerald-50/10" : "hover:bg-gray-50/30"}`}>
      {/* Header row */}
      <div className="flex flex-col sm:grid sm:grid-cols-[auto_1fr_auto] sm:items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3">
        <span className="text-xs font-bold text-gray-300 w-7 text-right">{String(idx + 1).padStart(2, "0")}</span>
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-800 font-medium">{slot.label}</p>
          {hasRows && <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />}
          <span className="text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 rounded px-1.5 py-0.5">TABLE</span>
          {hasRows && <span className="text-[10px] text-gray-400">{existingRows.length} row{existingRows.length !== 1 ? "s" : ""}</span>}
        </div>
        <div className="flex items-center gap-1.5">
          {!editing ? (
            <button onClick={startEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition cursor-pointer">
              <Edit2 size={11} /> {hasRows ? "Edit" : "Fill Table"}
            </button>
          ) : (
            <>
              <button onClick={save} disabled={saving}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer">
                <Save size={11} /> {saving ? "Saving…" : "Save"}
              </button>
              <button onClick={cancel} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer">
                <X size={13} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Table area */}
      {(editing || hasRows) && (
        <div className="px-5 pb-4 overflow-x-auto">
          <table className="w-full text-xs border border-gray-200 rounded-xl overflow-hidden" style={{ minWidth: cols.length * 120 }}>
            <thead>
              <tr className="bg-gray-50">
                {cols.map(col => (
                  <th key={col} className="px-3 py-2 text-left font-bold text-gray-500 border-b border-gray-200 whitespace-normal leading-tight" style={{ minWidth: 100 }}>
                    {col}
                  </th>
                ))}
                {editing && <th className="px-2 py-2 border-b border-gray-200 w-8" />}
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  {cols.map(col => (
                    <td key={col} className="border-b border-gray-100 last:border-0 px-1 py-1">
                      {editing ? (
                        <input
                          type="text"
                          value={row[col] || ""}
                          onChange={e => setCell(ri, col, e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                          placeholder="—"
                        />
                      ) : (
                        <span className="px-2 py-1 text-gray-700">{row[col] || <span className="text-gray-300">—</span>}</span>
                      )}
                    </td>
                  ))}
                  {editing && (
                    <td className="border-b border-gray-100 px-1 py-1 text-center">
                      <button onClick={() => removeRow(ri)}
                        className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition cursor-pointer">
                        <Trash2 size={11} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {editing && (
            <button onClick={addRow}
              className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition cursor-pointer">
              <Plus size={12} /> Add Row
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function IsiDocumentsTab({ project, isManager, uploadIsiDocSlot, removeIsiDocSlot, updateIsiDocSlot }) {
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});

  const slots = project.isiDocSlots || [];
  const isHallmarking = project.serviceType === "hallmarking";

  const completedCount = slots.filter(s => {
    if (s.type === "text") return !!s.value?.trim();
    if (s.type === "table") return Array.isArray(s.value) && s.value.length > 0;
    return !!s.file;
  }).length;

  const handleUpload = async (slotId, file) => {
    if (!file) return;
    setUploadingSlot(slotId);
    setUploadProgress(p => ({ ...p, [slotId]: 0 }));
    try {
      await uploadIsiDocSlot(slotId, file, pct =>
        setUploadProgress(p => ({ ...p, [slotId]: pct }))
      );
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingSlot(null);
      setUploadProgress(p => { const n = { ...p }; delete n[slotId]; return n; });
    }
  };

  const uploadedByColor = (by = "") => {
    const b = by.toLowerCase();
    if (b.includes("my side") || b.includes("our side")) return "bg-blue-50 text-blue-600 border-blue-100";
    if (b.includes("client")) return "bg-amber-50 text-amber-700 border-amber-100";
    if (b.includes("both")) return "bg-purple-50 text-purple-600 border-purple-100";
    if (b.includes("stamp")) return "bg-rose-50 text-rose-600 border-rose-100";
    return "bg-gray-50 text-gray-500 border-gray-200";
  };

  if (slots.length === 0) {
    return <EmptyState icon={FolderOpen} title="Documents not initialized yet" description="Reload the page to initialize document slots." />;
  }

  return (
    <div className="space-y-3">
      {/* Progress summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">Required Documents & Data</p>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{completedCount} / {slots.length} filled</span>
          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${slots.length > 0 ? Math.round((completedCount / slots.length) * 100) : 0}%` }} />
          </div>
        </div>
      </div>

      {isHallmarking && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mr-1">Responsibility:</span>
          {[
            { label: "Client Side", color: "bg-amber-50 text-amber-700 border-amber-100" },
            { label: "My Side", color: "bg-blue-50 text-blue-600 border-blue-100" },
            { label: "Both Side", color: "bg-purple-50 text-purple-600 border-purple-100" },
            { label: "Stamp Paper", color: "bg-rose-50 text-rose-600 border-rose-100" },
          ].map(({ label, color }) => (
            <span key={label} className={`text-[10px] font-bold border rounded px-2 py-0.5 ${color}`}>{label}</span>
          ))}
        </div>
      )}

      {/* Slots — grouped by section for FMCS, flat for others */}
      {(() => {
        const hasSections = slots.some(s => s.section);


        const renderSlot = (slot, idx) => {
          if (slot.type === "text") {
            return (
              <div key={slot.id} className="border-b border-gray-50 last:border-0">
                <TextSlotRow slot={slot} idx={idx} updateIsiDocSlot={updateIsiDocSlot} />
                {isHallmarking && (slot.description || slot.uploadedBy) && (
                  <div className="flex flex-wrap items-start gap-3 px-5 pb-3 -mt-1">
                    {slot.description && (
                      <p className="text-xs text-gray-400 flex items-start gap-1 flex-1">
                        <Info size={11} className="mt-0.5 flex-shrink-0 text-gray-300" />
                        {slot.description}
                      </p>
                    )}
                    {slot.uploadedBy && (
                      <span className={`text-[10px] font-bold border rounded px-2 py-0.5 flex-shrink-0 ${uploadedByColor(slot.uploadedBy)}`}>
                        {slot.uploadedBy}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          }

          if (slot.type === "table") {
            return (
              <div key={slot.id} className="border-b border-gray-50 last:border-0">
                <TableSlotRow slot={slot} idx={idx} updateIsiDocSlot={updateIsiDocSlot} />
                {isHallmarking && (slot.description || slot.uploadedBy) && (
                  <div className="flex flex-wrap items-start gap-3 px-5 pb-3 -mt-1">
                    {slot.description && (
                      <p className="text-xs text-gray-400 flex items-start gap-1 flex-1">
                        <Info size={11} className="mt-0.5 flex-shrink-0 text-gray-300" />
                        {slot.description}
                      </p>
                    )}
                    {slot.uploadedBy && (
                      <span className={`text-[10px] font-bold border rounded px-2 py-0.5 flex-shrink-0 ${uploadedByColor(slot.uploadedBy)}`}>
                        {slot.uploadedBy}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          }

          const isDone = !!slot.file;
          return (
            <div key={slot.id}
              className={`border-b border-gray-50 last:border-0 transition ${isDone ? "bg-emerald-50/30" : "hover:bg-gray-50/50"}`}>
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-3.5">
                <span className="text-xs font-bold text-gray-300 w-7 text-right">{String(idx + 1).padStart(2, "00")}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-800 font-medium leading-snug">{slot.label}</p>
                    {isDone && <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />}
                    {slot.prevDone && !isDone && (
                      <span className="text-[10px] text-amber-500 font-semibold">(was checked)</span>
                    )}
                  </div>
                  {isHallmarking && slot.description && (
                    <p className="text-xs text-gray-400 mt-1 flex items-start gap-1">
                      <Info size={11} className="mt-0.5 flex-shrink-0 text-gray-300" />
                      {slot.description}
                    </p>
                  )}
                  {slot.file && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                       {slot.file.name}  ·  {fmtDate(slot.file.uploadedAt)}
                      {slot.file.size && ` · ${(slot.file.size / 1024).toFixed(0)} KB`}
                    </p>
                  )}
                  {slot.requiresValidity && (
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {slot.validityDate ? (() => {
                        const vDate = new Date(slot.validityDate);
                        const now = new Date();
                        const threshold = new Date(now.getTime() + (slot.validityMonths || 1) * 30 * 24 * 60 * 60 * 1000);
                        const isExp = vDate <= now;
                        const isNear = vDate <= threshold && vDate > now;
                        return (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isExp ? "bg-red-100 text-red-700 animate-pulse border border-red-200" : isNear ? "bg-amber-100 text-amber-700 animate-pulse border border-amber-200" : "bg-emerald-100 text-emerald-700 border border-emerald-200"}`}>
                            {isExp ? "⚠️ EXPIRED" : isNear ? "⚠️ Expiring soon" : "Valid"}: {fmtDate(slot.validityDate)}
                          </span>
                        );
                      })() : (
                        <span className="text-[9px] bg-gray-100 text-gray-500 border border-gray-200 px-1.5 py-0.5 rounded font-bold">No Expiry Set</span>
                      )}
                      {isManager && (
                        <input type="date" className="text-[10px] px-1.5 py-0.5 border border-gray-200 rounded focus:outline-none focus:border-blue-400 text-gray-600"
                          value={slot.validityDate || ""}
                          onChange={(e) => updateIsiDocSlot(slot.id, { validityDate: e.target.value })}
                        />
                      )}
                    </div>
                  )}
                  {uploadingSlot === slot.id && (
                    <div className="mt-1">
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${uploadProgress[slot.id] || 0}%` }} />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">Uploading {uploadProgress[slot.id] || 0}%…</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isDone ? (
                    <>
                      <a href={slot.file.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition cursor-pointer">
                        <Eye size={12} /> View
                      </a>
                      <a href={slot.file.url} download target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer" title="Download">
                        <Download size={13} />
                      </a>
                      <label className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer relative" title="Replace">
                        <Upload size={13} />
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer"
                          disabled={uploadingSlot === slot.id}
                          onChange={e => { if (e.target.files[0]) handleUpload(slot.id, e.target.files[0]); e.target.value = ""; }} />
                      </label>
                      {isManager && (
                        <button onClick={() => { if (confirm("Remove this file?")) removeIsiDocSlot(slot.id); }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition cursor-pointer" title="Remove">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </>
                  ) : (
                    <label className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition cursor-pointer">
                      <Upload size={12} /> Upload
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={uploadingSlot === slot.id}
                        onChange={e => { if (e.target.files[0]) handleUpload(slot.id, e.target.files[0]); e.target.value = ""; }} />
                    </label>
                  )}
                </div>
              </div>
            </div>
          );
        };

        if (!hasSections) {
          return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-2.5 border-b border-gray-100 bg-gray-50/60">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider w-7">#</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Document / Information Required</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Action</span>
              </div>
              {slots.map((slot, idx) => renderSlot(slot, idx))}
            </div>
          );
        }

        // Section-grouped layout for FMCS
        const sectionColors = {
          "FMCS Documents":    "bg-blue-50 text-blue-700 border-blue-100",
          "AIR Details":       "bg-purple-50 text-purple-700 border-purple-100",
          "BIS Bank Guarantee":"bg-amber-50 text-amber-700 border-amber-100",
        };
        const sectionOrder = ["FMCS Documents", "AIR Details", "BIS Bank Guarantee"];
        const grouped = {};
        slots.forEach((s, i) => {
          const sec = s.section || "Other";
          if (!grouped[sec]) grouped[sec] = [];
          grouped[sec].push({ slot: s, origIdx: i });
        });
        const orderedKeys = [...sectionOrder.filter(k => grouped[k]), ...Object.keys(grouped).filter(k => !sectionOrder.includes(k))];

        return (
          <div className="space-y-3">
            {orderedKeys.map(sec => {
              const entries = grouped[sec] || [];
              const sectionDone = entries.filter(({ slot: s }) => {
                if (s.type === "text") return !!s.value?.trim();
                if (s.type === "table") return Array.isArray(s.value) && s.value.length > 0;
                return !!s.file;
              }).length;
              const colorCls = sectionColors[sec] || "bg-gray-50 text-gray-700 border-gray-200";
              return (
                <div key={sec} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className={`flex items-center justify-between px-5 py-3 border-b border-gray-100 ${colorCls.split(" ")[0]}/40`}>
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${colorCls.split(" ").slice(1).join(" ")}`}>{sec}</h3>
                    <span className="text-[10px] text-gray-400 font-semibold">{sectionDone}/{entries.length} filled</span>
                  </div>
                  {entries.map(({ slot, origIdx }) => renderSlot(slot, origIdx))}
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}

function IsiStagesTab({ project, isManager, toggleIsiStep, addRemark, activeCode, setActiveCode }) {
  const [stepModal, setStepModal] = useState(null);
  const [modalDate, setModalDate] = useState("");
  const [modalRemark, setModalRemark] = useState("");
  const [saving, setSaving] = useState(false);

  const isCodes = project.isCodes || [];
  const currentCodeObj = isCodes.find(c => c.code === activeCode) || isCodes[0];
  const isiStages = currentCodeObj ? (currentCodeObj.stages || []) : (project.isiStages || []);

  const totalSteps = isiStages.reduce((a, s) => a + s.steps.length, 0);
  const doneSteps  = isiStages.reduce((a, s) => a + s.steps.filter(st => st.done).length, 0);
  const pct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

  const openModal = (step) => {
    setStepModal(step);
    setModalDate(step.dateValue || "");
    setModalRemark("");
  };

  const handleToggle = async () => {
    if (!stepModal) return;
    setSaving(true);
    try {
      await toggleIsiStep(stepModal.id, {
        dateValue: stepModal.type === "date" ? modalDate : undefined,
        remark: modalRemark.trim() || undefined,
        code: currentCodeObj ? currentCodeObj.code : undefined,
      });
      setStepModal(null);
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (isiStages.length === 0) {
    return <EmptyState icon={ClipboardList} title="Stages not initialized yet" description="Reload the page to initialize stages." />;
  }

  return (
    <>
      {isCodes.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
          {isCodes.map(c => (
            <button key={c.code} onClick={() => setActiveCode(c.code)}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer border ${c.code === activeCode ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
              {c.code || "Default IS Code"}
            </button>
          ))}
        </div>
      )}

      {/* Summary progress */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-4">
        <ProgressBar progress={pct} label={`${doneSteps} of ${totalSteps} steps completed for ${currentCodeObj?.code || 'this code'}`} showPercentage />
      </div>

      {/* Stage cards */}
      <div className="space-y-3">
        {isiStages.map((stage, stageIdx) => {
          const StageIcon = STAGE_ICONS[stage.id] || ClipboardList;
          const stageDone    = stage.steps.every(st => st.done);
          const stagePartial = stage.steps.some(st => st.done) && !stageDone;

          return (
            <div key={stage.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${stageDone ? "border-emerald-200" : "border-gray-100"}`}>
              {/* Stage header */}
              <div className={`flex items-center gap-3 px-5 py-3.5 border-b ${stageDone ? "bg-emerald-50/50 border-emerald-100" : "bg-gray-50/40 border-gray-100"}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${stageDone ? "bg-emerald-100 text-emerald-600" : stagePartial ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                  {stageDone ? <CheckCircle2 size={18} /> : <StageIcon size={18} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stage {stageIdx + 1}</span>
                    {stageDone && <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">COMPLETED</span>}
                  </div>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{stage.label}</p>
                </div>
              </div>

              {/* Steps */}
              <div className="divide-y divide-gray-50">
                {stage.steps.map(step => (
                  <div key={step.id} className={`px-5 py-3.5 ${step.done ? "bg-emerald-50/20" : ""}`}>
                    <div className="flex items-start gap-3">
                      {/* Toggle button */}
                      <button onClick={() => openModal(step)}
                        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition cursor-pointer
                          ${step.done ? "bg-emerald-500 border-emerald-500 hover:bg-emerald-600" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"}`}>
                        {step.done && <CheckCircle2 size={12} className="text-white" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium leading-snug ${step.done ? "text-gray-400 line-through" : "text-gray-800"}`}>
                          {step.label}
                        </p>
                        {step.type === "date" && step.dateValue && (
                          <p className="text-xs text-blue-600 mt-0.5 font-medium"> {fmtDate(step.dateValue)}</p>
                        )}
                        {step.done && step.doneByName && (
                          <p className="text-xs text-emerald-600 mt-0.5">✓ {step.doneByName} · {fmtDate(step.doneAt)}</p>
                        )}
                        {step.remarks && step.remarks.length > 0 && (
                          <div className="mt-2 space-y-1.5">
                            {step.remarks.map((rmk, idx) => (
                              <div key={idx} className="bg-amber-50/50 border border-amber-100 rounded-md p-2">
                                <p className="text-[11px] text-gray-700 font-medium italic">"{rmk.message}"</p>
                                <p className="text-[9px] text-gray-500 mt-1 font-semibold uppercase tracking-wider">
                                  — {rmk.addedByName} {rmk.addedAt ? `· ${fmtDate(rmk.addedAt)}` : ''}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                        <RemarkBox stepId={step.id} stepLabel={step.label} onSubmit={addRemark} />
                      </div>

                      {step.type === "date" && (
                        <span className="text-[10px] bg-blue-50 text-blue-500 border border-blue-100 rounded px-2 py-0.5 font-bold flex-shrink-0 mt-0.5">DATE</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {stepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.5)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Update Step</p>
              <h3 className="text-base font-bold text-gray-900">{stepModal.label}</h3>
              <p className="text-xs text-gray-400 mt-1">
                Currently: <span className={stepModal.done ? "text-emerald-600 font-semibold" : "text-gray-500"}>
                  {stepModal.done ? "Done" : "Not done"}
                </span>
              </p>
            </div>
            <div className="p-6 space-y-4">
              {stepModal.type === "date" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    {stepModal.id === "audit_date_granted" ? "Audit Date" : "Date"}
                  </label>
                  <input type="date" value={modalDate} onChange={e => setModalDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Remark (Optional)
                </label>
                <textarea value={modalRemark} onChange={e => setModalRemark(e.target.value)}
                  rows={2} placeholder="Add a note or update about this step..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setStepModal(null)}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer">
                Cancel
              </button>
              <button onClick={handleToggle} disabled={saving}
                className={`flex-1 px-5 py-2.5 text-sm font-semibold rounded-xl transition disabled:opacity-50 cursor-pointer ${
                  stepModal.done ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}>
                {saving ? "Saving…" : stepModal.done ? "Mark as Undone" : "Mark as Done"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FlatChecklistTab({ project, toggleChecklistItem }) {
  const checklist = project.checklist || [];

  const sections = {};
  checklist.forEach(item => {
    const sec = item.section || "Items";
    if (!sections[sec]) sections[sec] = [];
    sections[sec].push(item);
  });

  return (
    <div className="space-y-4">
      {Object.entries(sections).map(([sectionName, items]) => (
        <div key={sectionName} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {Object.keys(sections).length > 1 && (
            <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/60">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{sectionName}</h3>
            </div>
          )}
          <div className="divide-y divide-gray-50">
            {items.map((item, idx) => (
              <div key={item.id} onClick={() => toggleChecklistItem(item.id)}
                className={`flex items-start gap-4 px-5 py-4 cursor-pointer group transition ${item.done ? "bg-emerald-50/30" : "hover:bg-gray-50"}`}>
                <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${item.done ? "bg-emerald-500 border-emerald-500" : "border-gray-300 group-hover:border-blue-400"}`}>
                  {item.done && <CheckCircle2 size={13} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${item.done ? "line-through text-gray-400" : "text-gray-800"}`}>
                    <span className="text-gray-400 text-xs mr-2">{idx + 1}.</span>
                    {item.label}
                  </p>
                  {item.done && item.doneByName && (
                    <p className="text-xs text-emerald-600 mt-0.5">✓ {item.doneByName} · {fmtDate(item.doneAt)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function FmcsDateInlineEditor({ label, value, onSave }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const [saving, setSaving] = useState(false);

  if (!open) {
    return (
      <button onClick={() => { setDraft(value || ""); setOpen(true); }}
        className="text-[10px] text-blue-500 hover:text-blue-700 font-semibold underline underline-offset-2 cursor-pointer">
        {label}
      </button>
    );
  }
  return (
    <div className="flex items-center gap-1.5 bg-white border border-blue-200 rounded-lg px-2 py-1">
      <input type="date" value={draft} onChange={e => setDraft(e.target.value)}
        className="text-xs border-0 outline-none bg-transparent" />
      <button onClick={async () => { setSaving(true); try { await onSave(draft); setOpen(false); } catch {} finally { setSaving(false); } }}
        disabled={saving}
        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer disabled:opacity-50">
        {saving ? "…" : "Save"}
      </button>
      <button onClick={() => setOpen(false)} className="text-gray-300 hover:text-gray-500 cursor-pointer"><X size={10} /></button>
    </div>
  );
}

function PaymentsTab({ project, isManager, addPaymentInstallment, deletePaymentInstallment, updateProjectField }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ amount: "", date: new Date().toISOString().split("T")[0], note: "", referenceId: "", excessReason: "" });
  const [saving, setSaving] = useState(false);
  const [editNeeded, setEditNeeded] = useState(false);
  const [neededDraft, setNeededDraft] = useState("");
  const [savingNeeded, setSavingNeeded] = useState(false);

  const payments = project.payments || [];
  const totalNeeded = project.totalPaymentNeeded || 0;
  const totalReceived = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const balance = totalNeeded - totalReceived;
  const pct = totalNeeded > 0 ? Math.min(100, Math.round((totalReceived / totalNeeded) * 100)) : 0;

  const isExcess = totalNeeded > 0 && (Number(form.amount || 0) > balance);

  const handleAdd = async () => {
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) return alert("Enter a valid amount");
    if (isExcess && (!form.excessReason || !form.excessReason.trim())) return alert("Please provide a reason for the extra payment.");
    
    setSaving(true);
    try {
      await addPaymentInstallment({ 
        amount: Number(form.amount), 
        date: form.date, 
        note: form.note, 
        referenceId: form.referenceId,
        excessReason: isExcess ? form.excessReason.trim() : ""
      });
      setForm({ amount: "", date: new Date().toISOString().split("T")[0], note: "", referenceId: "", excessReason: "" });
      setShowAdd(false);
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleSaveNeeded = async () => {
    if (isNaN(Number(neededDraft)) || Number(neededDraft) < 0) return alert("Enter a valid amount");
    setSavingNeeded(true);
    try {
      await updateProjectField({ totalPaymentNeeded: Number(neededDraft) || null });
      setEditNeeded(false);
    } catch (err) { alert(err.message); }
    finally { setSavingNeeded(false); }
  };

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-gray-800">Payment Summary</p>
          {isManager && (
            <button onClick={() => { setNeededDraft(String(totalNeeded || "")); setEditNeeded(true); }}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer">
              <Edit2 size={11} /> Set Total
            </button>
          )}
        </div>

        {editNeeded ? (
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
              <input type="number" min="0" value={neededDraft} onChange={e => setNeededDraft(e.target.value)}
                placeholder="Total payment needed"
                className="w-full pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <button onClick={handleSaveNeeded} disabled={savingNeeded}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
              {savingNeeded ? "Saving…" : "Save"}
            </button>
            <button onClick={() => setEditNeeded(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 cursor-pointer"><X size={14} /></button>
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Total Needed</p>
            <p className="text-lg font-bold text-gray-900">₹{totalNeeded.toLocaleString("en-IN")}</p>
          </div>
          <div className="text-center p-3 bg-emerald-50 rounded-xl">
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1">Received</p>
            <p className="text-lg font-bold text-emerald-700">₹{totalReceived.toLocaleString("en-IN")}</p>
          </div>
          <div className={`text-center p-3 rounded-xl ${balance > 0 ? "bg-red-50" : "bg-emerald-50"}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${balance > 0 ? "text-red-500" : "text-emerald-600"}`}>Balance Due</p>
            <p className={`text-lg font-bold ${balance > 0 ? "text-red-600" : "text-emerald-700"}`}>₹{Math.abs(balance).toLocaleString("en-IN")}</p>
          </div>
        </div>

        {totalNeeded > 0 && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Payment progress</span><span className="font-semibold">{pct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-emerald-500" : pct >= 50 ? "bg-blue-500" : "bg-amber-500"}`}
                style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Add installment */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-gray-800">Installments ({payments.length})</p>
          <button onClick={() => setShowAdd(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition cursor-pointer">
            <Plus size={12} /> Add Payment
          </button>
        </div>

        {showAdd && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Amount (₹) *</label>
                <input type="number" min="1" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="e.g. 50000"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Date *</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Note (Optional)</label>
                <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="e.g. Advance payment..."
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Reference ID (Optional)</label>
                <input value={form.referenceId} onChange={e => setForm(f => ({ ...f, referenceId: e.target.value }))}
                  placeholder="e.g. UTR/Txn number"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>
            </div>
            {isExcess && (
              <div>
                <label className="block text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Reason for Extra Amount *</label>
                <input value={form.excessReason || ""} onChange={e => setForm(f => ({ ...f, excessReason: e.target.value }))}
                  placeholder="e.g. Additional testing required..."
                  className="w-full px-3 py-2 bg-amber-50 border border-amber-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 cursor-pointer">Cancel</button>
              <button onClick={handleAdd} disabled={saving}
                className="px-5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 cursor-pointer">
                {saving ? "Adding…" : "Add Installment"}
              </button>
            </div>
          </div>
        )}

        {payments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No payments recorded yet.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {[...payments].reverse().map((p, idx) => (
              <div key={p.id} className="flex items-center gap-3 py-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <IndianRupee size={13} className="text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-emerald-700">₹{p.amount.toLocaleString("en-IN")}</p>
                    {p.referenceId && <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Ref: {p.referenceId}</span>}
                    {p.note && <span className="text-xs text-gray-500">— {p.note}</span>}
                  </div>
                  {p.excessReason && (
                    <div className="mt-1">
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                        Extra Payment Reason: {p.excessReason}
                      </span>
                    </div>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1">{fmtDate(p.date)} · by {p.addedByName}</p>
                </div>
                {isManager && (
                  <button onClick={() => { if (confirm("Remove this installment?")) deletePaymentInstallment(p.id); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition cursor-pointer">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CalibrationDocs({ project, isManager, addCalibrationDoc, removeCalibrationDoc, updateCalibrationDoc }) {
  const [machineName, setMachineName] = useState("");
  const [validityDate, setValidityDate] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const docs = project.calibrationDocs || [];

  const handleAdd = async () => {
    if (!machineName.trim() || !validityDate || !file) return alert("Please fill all fields and select a file.");
    setUploading(true);
    setProgress(0);
    try {
      await addCalibrationDoc(machineName.trim(), validityDate, file, setProgress);
      setMachineName("");
      setValidityDate("");
      setFile(null);
    } catch(err) {
      alert("Failed to upload: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/40">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Calibration Documents</h3>
        <span className="text-[10px] text-gray-400 font-semibold">{docs.length} uploaded</span>
      </div>

      <div className="divide-y divide-gray-50">
        {docs.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">No calibration documents uploaded yet.</div>
        ) : (
          docs.map((doc, idx) => {
            const vDate = new Date(doc.validityDate);
            const now = new Date();
            const threshold = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 1 month
            const isExp = vDate <= now;
            const isNear = vDate <= threshold && vDate > now;

            return (
              <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold text-gray-300 w-5">{idx + 1}.</span>
                    <p className="text-sm font-bold text-gray-800">{doc.machineName}</p>
                    {isManager && (
                      <input type="date" className="text-[10px] px-1.5 py-0.5 border border-gray-200 rounded focus:outline-none text-gray-600"
                        value={doc.validityDate}
                        onChange={e => updateCalibrationDoc(doc.id, { validityDate: e.target.value })}
                      />
                    )}
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isExp ? "bg-red-100 text-red-700 animate-pulse border border-red-200" : isNear ? "bg-amber-100 text-amber-700 animate-pulse border border-amber-200" : "bg-emerald-100 text-emerald-700 border border-emerald-200"}`}>
                      {isExp ? "⚠️ EXPIRED" : isNear ? "⚠️ Expiring soon" : "Valid"}: {fmtDate(doc.validityDate)}
                    </span>
                  </div>
                  <div className="pl-7">
                    <a href={doc.file.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                      <Eye size={12}/> {doc.file.name}
                    </a>
                    <p className="text-[10px] text-gray-400 mt-1">Uploaded {fmtDate(doc.file.uploadedAt)} by {doc.file.uploadedBy}</p>
                  </div>
                </div>
                {isManager && (
                  <button onClick={() => { if(confirm("Remove this document?")) removeCalibrationDoc(doc.id); }}
                    className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition flex-shrink-0">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {isManager && (
        <div className="p-5 bg-gray-50/50 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wider">Add New Calibration Document</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="text" placeholder="Machine Name" value={machineName} onChange={e => setMachineName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" />
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-gray-500 font-semibold">Validity:</span>
              <input type="date" value={validityDate} onChange={e => setValidityDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div className="relative flex-shrink-0">
              <input type="file" onChange={e => setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
              <div className={`px-4 py-2 border rounded-xl text-sm font-semibold flex items-center gap-2 transition ${file ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>
                <Upload size={14} /> {file ? file.name.substring(0, 15) + '...' : 'Select File'}
              </div>
            </div>
            <button onClick={handleAdd} disabled={uploading || !file || !machineName || !validityDate}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed">
              {uploading ? `Uploading ${progress}%` : "Add"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const {
    project, loading, error, isManager,
    activity, actTotal, actPage, actPageSize, fetchActivity,
    toggleChecklistItem, toggleIsiStep,
    addRemark, addComment, updateStatus,
    uploadDocument, deleteDocument,
    uploadIsiDocSlot, removeIsiDocSlot, updateIsiDocSlot,
    addCalibrationDoc, removeCalibrationDoc, updateCalibrationDoc,
    ACT_PAGE_SIZE, deleteProject, updateProject, refetchAll,
    addPaymentInstallment, deletePaymentInstallment, updateProjectField,
  } = useProject(id);

  const [activeTab, setActiveTab]     = useState(null); 
  const [editingStatus, setEditingStatus] = useState(false);
  const [comment, setComment]         = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [toast, setToast]             = useState(null);
  const [showEdit, setShowEdit]       = useState(false);
  
  const [activeCode, setActiveCode] = useState(() => {
    const codes = project?.isCodes || [];
    return codes.length > 0 ? codes[0].code : "";
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) return <LoadingSpinner className="min-h-screen" />;
  if (!project) return <EmptyState title="Project not found" className="min-h-screen" />;

  const isIsi = project.serviceType === "isi";
  const isBisCrs = project.serviceType === "bis_crs";
  const isHallmarking = project.serviceType === "hallmarking";
  const isFmcs = project.serviceType === "fmcs";
  const usesStages = isIsi || isBisCrs || isHallmarking || isFmcs; 
  const typeConfig = SERVICE_TYPES[project.serviceType] || { label: project.serviceType, color: "bg-gray-100 text-gray-600 border-gray-200" };
  const statusConfig = STATUS_OPTIONS.find(s => s.value === project.status)
    || (STATUS_FALLBACK[project.status] ? { label: STATUS_FALLBACK[project.status].label, color: STATUS_FALLBACK[project.status].color } : null)
    || { label: project.status, color: "bg-gray-100 text-gray-600 border-gray-200" };

  const isCodes = project.isCodes || [];
  const defaultCode = isCodes.length > 0 ? isCodes[0].code : "";
  const currentCode = isCodes.find(c => c.code === activeCode) ? activeCode : defaultCode;
  
  const allStages = isCodes.length > 0 ? isCodes.flatMap(c => c.stages || []) : (project.isiStages || []);
  const isiDocSlots = project.isiDocSlots || [];
  const flatChecklist = project.checklist || [];

  const overallTotalSteps = allStages.reduce((a, s) => a + (s.steps ? s.steps.length : 0), 0);
  const overallDoneSteps  = allStages.reduce((a, s) => a + (s.steps ? s.steps.filter(st => st.done).length : 0), 0);
  const isiPct = overallTotalSteps > 0 ? Math.round((overallDoneSteps / overallTotalSteps) * 100) : 0;

  const currentCodeObj = isCodes.find(c => c.code === currentCode) || isCodes[0];
  const activeStages = currentCodeObj ? (currentCodeObj.stages || []) : (project.isiStages || []);
  const activeTotalSteps = activeStages.reduce((a, s) => a + (s.steps ? s.steps.length : 0), 0);
  const activeDoneSteps  = activeStages.reduce((a, s) => a + (s.steps ? s.steps.filter(st => st.done).length : 0), 0);


  const flatDone = flatChecklist.filter(i => i.done).length;
  const flatPct  = flatChecklist.length > 0 ? Math.round((flatDone / flatChecklist.length) * 100) : 0;

  const progress = usesStages ? isiPct : flatPct;

  const defaultTab = usesStages ? "stages" : "checklist";
  const currentTab = activeTab || defaultTab;

  const docSlotsCompleted = isiDocSlots.filter(s => {
    if (s.type === "text") return !!s.value?.trim();
    if (s.type === "table") return Array.isArray(s.value) && s.value.length > 0;
    return !!s.file;
  }).length;

  const tabs = usesStages
    ? [
        { key: "stages",    label: `Process Stages (${activeDoneSteps}/${activeTotalSteps})`, icon: ClipboardList },
        { key: "documents", label: `Documents Required (${docSlotsCompleted}/${isiDocSlots.length})`, icon: BookOpen },
        { key: "payments",  label: `Payments`, icon: IndianRupee },
        { key: "activity",  label: `Activity (${actTotal})`, icon: Activity },
      ]
    : [
        { key: "checklist", label: `Checklist (${flatDone}/${flatChecklist.length})`, icon: ClipboardList },
        { key: "documents", label: `Documents (${(project.documents || []).length})`, icon: FolderOpen },
        { key: "payments",  label: `Payments`, icon: IndianRupee },
        { key: "activity",  label: `Activity (${actTotal})`, icon: Activity },
      ];

  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;
    setSendingComment(true);
    try {
      await addComment(comment.trim());
      setComment("");
    } catch { alert("Failed to post comment"); }
    finally { setSendingComment(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-5xl mx-auto space-y-3">

        <div className="flex items-center justify-between">
          <button onClick={() => router.push("/projects")}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-medium transition cursor-pointer">
            <ArrowLeft size={14} /> Back to Projects
          </button>

          <div className="flex items-center gap-2">
            {isManager && (
              <button onClick={() => setShowEdit(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition cursor-pointer">
                <Edit2 size={12} /> Edit Project
              </button>
            )}
            {isManager && (
              <button onClick={async () => {
                if (window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
                  try {
                    await deleteProject();
                    showToast("Project deleted successfully");
                    setTimeout(() => router.push("/projects"), 1000);
                  } catch(err) { 
                    showToast(err.message || "Failed to delete project", "error"); 
                  }
                }
              }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition cursor-pointer">
                <Trash2 size={12} /> Delete Project
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className={`h-1 ${progress === 100 ? "bg-emerald-500" : "bg-blue-600"}`} />
          <div className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge label={typeConfig.label} colorClass={typeConfig.color} />
                  <span className="text-[11px] text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded">{project.id}</span>
                  {project.status === "completed" && (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={10} /> DONE
                    </span>
                  )}
                </div>
                <h1 className="text-lg font-bold text-gray-900">{project.projectName}</h1>
                <p className="text-xs text-gray-500 mt-0.5">{project.clientName}</p>
                {project.isCode && (
                  <p className="text-xs text-indigo-600 font-semibold mt-1">IS Code: {project.isCode}</p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                {/* Status dropdown */}
                <div className="relative">
                  <button onClick={() => setEditingStatus(v => !v)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${statusConfig.color}`}>
                    {statusConfig.label} <ChevronDown size={12} />
                  </button>
                  {editingStatus && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden min-w-[210px]">
                      {/* Overdue lock banner for non-managers */}
                      {project.status === "overdue" && !isManager && (
                        <div className="px-3 py-2.5 bg-red-50 border-b border-red-100 flex items-start gap-2">
                          <AlertOctagon size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
                          <p className="text-[10px] text-red-600 font-semibold leading-snug">
                            This project is <span className="font-bold">Overdue</span>. Contact{" "}
                            <span className="font-bold">Aayush Sir</span> for approval to resume.
                          </p>
                        </div>
                      )}
                      {STATUS_OPTIONS.map(s => {
                        // Non-managers cannot move OUT of overdue to Running or Hold
                        const isOverdueGate = project.status === "overdue" && !isManager
                          && (s.value === "in_progress" || s.value === "on_hold");
                        return (
                          <button key={s.value}
                            onClick={() => { if (!isOverdueGate) { updateStatus(s.value); setEditingStatus(false); } }}
                            disabled={!!isOverdueGate}
                            className={`w-full text-left flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition
                              ${s.value === project.status ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}
                              ${isOverdueGate ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.color.split(" ")[0].replace("bg-", "bg-")}`} />
                            {s.label}
                            {isOverdueGate && <span className="ml-auto text-[9px] text-red-500 font-bold bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">LOCKED</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Contact info block */}
                {(project.name || project.phone || project.email) && (
                  <div className="text-[11px] text-right text-gray-500 bg-gray-50 rounded-lg p-2 border border-gray-100">
                    {project.name && <p className="font-medium text-gray-700">{project.name}</p>}
                    {project.phone && <p className="mt-0.5"><a href={`tel:${project.phone}`} className="hover:text-blue-600 transition">{project.phone}</a></p>}
                    {project.email && <p className="mt-0.5"><a href={`mailto:${project.email}`} className="hover:text-blue-600 transition">{project.email}</a></p>}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3">
              <ProgressBar
                progress={progress}
                label={usesStages ? "Stage Progress" : "Checklist Progress"}
                showPercentage
              />
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Users size={12} className="text-gray-400" />
                <span>{project.assignedToNames?.join(", ") || "Unassigned"}</span>
              </div>
              {project.dueDate && (
                <div className={`flex items-center gap-1 ${new Date(project.dueDate) < new Date() && project.status !== "completed" ? "text-red-600" : ""}`}>
                  <Calendar size={12} className="text-gray-400" />
                  <span>Due {fmtDate(project.dueDate)}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-gray-400" />
                <span>Created {fmtDate(project.createdAt)}</span>
              </div>
              {project.address && (
                <div className="flex items-center gap-1 w-full sm:w-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span className="text-gray-600">{project.address}</span>
                </div>
              )}
            </div>
            {project.notes && (
              <div className="mt-2 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600">{project.notes}</div>
            )}

            {/* Certificate Validity Warnings */}
            {(isFmcs || project.serviceType === "isi" || project.serviceType === "hallmarking" || project.serviceType === "bis_crs") && (() => {
              const now = new Date();
              const certDateStr = project.certValidityDate || project.fmcsCertValidityDate;
              const certDate = certDateStr ? new Date(certDateStr) : null;
              const bgDate   = project.bankGuaranteeValidityDate ? new Date(project.bankGuaranteeValidityDate) : null;
              
              let thresholdDays = 0;
              if (project.serviceType === "fmcs") thresholdDays = 120; // 4 months
              else if (project.serviceType === "hallmarking") thresholdDays = 60; // 2 months
              else if (project.serviceType === "bis_crs") thresholdDays = 60; // 2 months
              else if (project.serviceType === "isi") thresholdDays = 30; // 1 month

              const thresholdDate = new Date(now.getTime() + thresholdDays * 24 * 60 * 60 * 1000);
              const sixMonthsFromNow  = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

              const certNearExpiry = certDate && certDate <= thresholdDate && certDate > now;
              const certExpired    = certDate && certDate <= now;
              const bgNearExpiry   = bgDate && bgDate <= sixMonthsFromNow && bgDate > now;
              const bgExpired      = bgDate && bgDate <= now;

              return (
                <div className="mt-3 space-y-2">
                  {/* Certificate Validity */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-500 font-semibold">Certificate Validity Date:</span>
                    {certDate ? (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                        certExpired ? "bg-red-100 text-red-700 animate-pulse" :
                        certNearExpiry ? "bg-amber-100 text-amber-700 animate-pulse" :
                        "bg-emerald-100 text-emerald-700"
                      }`}>
                        {certExpired ? "⚠️ EXPIRED" : certNearExpiry ? "⚠️ Expires soon —" : ""} {fmtDate(certDateStr)}
                      </span>
                    ) : <span className="text-xs text-gray-400">Not set</span>}
                    {isManager && (
                      <FmcsDateInlineEditor
                        label="Set Certificate Validity Date"
                        value={certDateStr || ""}
                        onSave={val => updateProjectField({ certValidityDate: val })}
                      />
                    )}
                  </div>

                  {/* BIS Bank Guarantee Validity (FMCS Only) */}
                  {isFmcs && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500 font-semibold">BIS Bank Guarantee Validity:</span>
                      {bgDate ? (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                          bgExpired ? "bg-red-100 text-red-700 animate-pulse" :
                          bgNearExpiry ? "bg-orange-100 text-orange-700 animate-pulse" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {bgExpired ? "🚨 EXPIRED" : bgNearExpiry ? "⚠️ Expiring soon —" : ""} {fmtDate(project.bankGuaranteeValidityDate)}
                        </span>
                      ) : <span className="text-xs text-gray-400">Not set</span>}
                      {isManager && (
                        <FmcsDateInlineEditor
                          label="Set BG validity"
                          value={project.bankGuaranteeValidityDate || ""}
                          onSave={val => updateProjectField({ bankGuaranteeValidityDate: val })}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {project.status === "completed" && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-2.5">
            <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Award size={15} className="text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-emerald-800 text-xs">Project Completed! </p>
              <p className="text-[11px] text-emerald-600">This project is now in the Completed section.</p>
            </div>
          </div>
        )}

        {/* Overdue Warning Banner */}
        {project.status === "overdue" && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2.5">
            <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertOctagon size={15} className="text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-red-800 text-xs">Project Overdue</p>
              <p className="text-[11px] text-red-600">
                This project has been marked as overdue. You must contact <span className="font-bold">Aayush Sir</span> for permission to resume it.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto no-scrollbar pb-1">
          {tabs.map(t => {
            const Icon = t.icon;
            const isActive = currentTab === t.key;
            return (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${isActive ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"}`}>
                <Icon size={14} className={isActive ? "text-blue-600" : "text-gray-400"} />
                {t.label}
              </button>
            );
          })}
        </div>

        {currentTab === "stages" && usesStages && (
          <IsiStagesTab
            project={project}
            isManager={isManager}
            toggleIsiStep={toggleIsiStep}
            addRemark={addRemark}
            activeCode={activeCode}
            setActiveCode={setActiveCode}
          />
        )}

        {currentTab === "documents" && usesStages && (
          <div className="space-y-6">
            <IsiDocumentsTab
              project={project}
              isManager={isManager}
              uploadIsiDocSlot={uploadIsiDocSlot}
              removeIsiDocSlot={removeIsiDocSlot}
              updateIsiDocSlot={updateIsiDocSlot}
            />
            {project.serviceType === "hallmarking" && (
              <CalibrationDocs
                project={project}
                isManager={isManager}
                addCalibrationDoc={addCalibrationDoc}
                removeCalibrationDoc={removeCalibrationDoc}
                updateCalibrationDoc={updateCalibrationDoc}
              />
            )}
          </div>
        )}

        {currentTab === "checklist" && !usesStages && (
          <FlatChecklistTab project={project} toggleChecklistItem={toggleChecklistItem} />
        )}

        {currentTab === "payments" && (
          <PaymentsTab
            project={project}
            isManager={isManager}
            addPaymentInstallment={addPaymentInstallment}
            deletePaymentInstallment={deletePaymentInstallment}
            updateProjectField={updateProjectField}
          />
        )}

        {currentTab === "documents" && !usesStages && (
          <div className="space-y-4">
            <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-gray-300 bg-white transition">
              <Upload size={28} className="text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-700">Click or drop to upload</p>
              <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, Images — any type</p>
              <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={e => { if (e.target.files[0]) uploadDocument(e.target.files[0], () => {}); e.target.value = ""; }} />
            </label>
            {(project.documents || []).length === 0 ? (
              <EmptyState icon={FolderOpen} title="No documents uploaded yet" />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                {(project.documents || []).map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition group">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <FileTypeIcon name={doc.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {doc.uploadedBy} · {fmtDate(doc.uploadedAt)}{doc.size ? ` · ${(doc.size / 1024).toFixed(0)} KB` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition cursor-pointer">
                        <Download size={16} />
                      </a>
                      {isManager && (
                        <button onClick={() => { if (confirm(`Delete "${doc.name}"?`)) deleteDocument(doc); }}
                          className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition cursor-pointer">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentTab === "activity" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <MessageSquare size={14} className="text-gray-400" />
              </div>
              <div className="flex-1 flex gap-2">
                <input value={comment} onChange={e => setComment(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleCommentSubmit()}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                <button onClick={handleCommentSubmit} disabled={sendingComment || !comment.trim()}
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition disabled:opacity-40 cursor-pointer">
                  Post
                </button>
              </div>
            </div>
            <ActivityFeed
              activity={activity}
              actTotal={actTotal}
              actPage={actPage}
              actPageSize={ACT_PAGE_SIZE}
              onPageChange={fetchActivity}
            />
          </div>
        )}
      </div>

      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${toast.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
          {toast.type === "error" ? <X size={16} /> : <CheckCircle2 size={16} />} 
          {toast.msg}
        </div>
      )}

      {showEdit && (
        <EditProjectModal 
          project={project} 
          onClose={() => setShowEdit(false)} 
          updateProject={updateProject} 
          onUpdated={() => {
            showToast("Project updated successfully");
            refetchAll();
          }} 
        />
      )}
    </div>
  );
}
