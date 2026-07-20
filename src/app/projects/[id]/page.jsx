"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Upload, Trash2, Download, Activity,
  Calendar, Users, ChevronDown, CheckCircle2, Clock,
  FolderOpen, FileText, Image as ImgIcon, File as FileIcon2,
  MessageSquare, Eye, ChevronLeft, ChevronRight,
  Award, FlaskConical, BadgeCheck, Search, ClipboardList,
  Plus, BookOpen, Edit2, Save, X, Info
} from "lucide-react";

import { useProject } from "@/hooks/useProject";
import { SERVICE_TYPES } from "@/lib/data/projectChecklists";

import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";

// ─── Constants ────
const STATUS_OPTIONS = [
  { value: "pending",     label: "Pending",     color: "bg-slate-100 text-slate-600" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-700" },
  { value: "review",      label: "Review",      color: "bg-purple-100 text-purple-700" },
  { value: "on_hold",     label: "On Hold",     color: "bg-amber-100 text-amber-700" },
  { value: "completed",   label: "Completed",   color: "bg-emerald-100 text-emerald-700" },
];

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
};

// ─── Helpers ──
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

// ─── Remark inline input ───
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

// ─── Paginated activity feed ───
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
              {act.stepLabel && (
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{act.stepLabel}</p>
              )}
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

// ─── ISI Documents: Text Input Slot ──
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
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-3">
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

// ─── ISI Documents: Table Input Slot ───
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
    // Remove completely empty rows before saving
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
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-3">
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

// ─── ISI: Documents Required tab ──
function IsiDocumentsTab({ project, isManager, uploadIsiDocSlot, removeIsiDocSlot, updateIsiDocSlot }) {
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});

  const slots = project.isiDocSlots || [];
  const isHallmarking = project.serviceType === "hallmarking";

  // Count "completed" across all types
  const completedCount = slots.filter(s => {
    if (s.type === "text") return !!s.value?.trim();
    if (s.type === "table") return Array.isArray(s.value) && s.value.length > 0;
    return !!s.file; // file type
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

  // Uploaded-by color helper
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

      {/* Hallmarking legend */}
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

      {/* Slots */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-2.5 border-b border-gray-100 bg-gray-50/60">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider w-7">#</span>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Document / Information Required</span>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Action</span>
        </div>

        {slots.map((slot, idx) => {
          // ── TEXT type ──
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

          // ── TABLE type ──
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

          // ── FILE type (default) ──
          const isDone = !!slot.file;
          return (
            <div key={slot.id}
              className={`border-b border-gray-50 last:border-0 transition ${isDone ? "bg-emerald-50/30" : "hover:bg-gray-50/50"}`}>

              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-3.5">
                <span className="text-xs font-bold text-gray-300 w-7 text-right">{String(idx + 1).padStart(2, "0")}</span>

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
                      📎 {slot.file.name}  ·  {fmtDate(slot.file.uploadedAt)}
                      {slot.file.size && ` · ${(slot.file.size / 1024).toFixed(0)} KB`}
                    </p>
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
        })}
      </div>
    </div>
  );
}

// ─── ISI: Process Stages tab ──
function IsiStagesTab({ project, isManager, toggleIsiStep, addRemark }) {
  const [stepModal, setStepModal] = useState(null);
  const [modalDate, setModalDate] = useState("");
  const [modalRemark, setModalRemark] = useState("");
  const [saving, setSaving] = useState(false);

  const isiStages = project.isiStages || [];
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
      {/* Summary progress */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
        <ProgressBar progress={pct} label={`${doneSteps} of ${totalSteps} steps completed`} showPercentage />
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

      {/* Step toggle modal */}
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

// ─── Non-ISI flat checklist tab ───
function FlatChecklistTab({ project, toggleChecklistItem }) {
  const checklist = project.checklist || [];

  // Group by section (for BIS CRS etc.)
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

// ─── Main Page ───
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
    ACT_PAGE_SIZE, deleteProject
  } = useProject(id);

  const [activeTab, setActiveTab]     = useState(null); 
  const [editingStatus, setEditingStatus] = useState(false);
  const [comment, setComment]         = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [toast, setToast]             = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) return <LoadingSpinner className="min-h-screen" />;
  if (!project) return <EmptyState title="Project not found" className="min-h-screen" />;

  const isIsi = project.serviceType === "isi";
  const isBisCrs = project.serviceType === "bis_crs";
  const isHallmarking = project.serviceType === "hallmarking";
  const usesStages = isIsi || isBisCrs || isHallmarking; 
  const typeConfig = SERVICE_TYPES[project.serviceType] || { label: project.serviceType, color: "bg-gray-100 text-gray-600 border-gray-200" };
  const statusConfig = STATUS_OPTIONS.find(s => s.value === project.status) || STATUS_OPTIONS[0];

  // Progress calculation
  const isiStages   = project.isiStages || [];
  const isiDocSlots = project.isiDocSlots || [];
  const flatChecklist = project.checklist || [];

  const isiTotalSteps = isiStages.reduce((a, s) => a + s.steps.length, 0);
  const isiDoneSteps  = isiStages.reduce((a, s) => a + s.steps.filter(st => st.done).length, 0);
  const isiPct = isiTotalSteps > 0 ? Math.round((isiDoneSteps / isiTotalSteps) * 100) : 0;

  const flatDone = flatChecklist.filter(i => i.done).length;
  const flatPct  = flatChecklist.length > 0 ? Math.round((flatDone / flatChecklist.length) * 100) : 0;

  const progress = usesStages ? isiPct : flatPct;

  // Default tab
  const defaultTab = usesStages ? "stages" : "checklist";
  const currentTab = activeTab || defaultTab;

  // Count completed doc slots across all types (for tab label)
  const docSlotsCompleted = isiDocSlots.filter(s => {
    if (s.type === "text") return !!s.value?.trim();
    if (s.type === "table") return Array.isArray(s.value) && s.value.length > 0;
    return !!s.file;
  }).length;

  // Tab definitions
  const tabs = usesStages
    ? [
        { key: "stages",    label: `Process Stages (${isiDoneSteps}/${isiTotalSteps})`, icon: ClipboardList },
        { key: "documents", label: `Documents Required (${docSlotsCompleted}/${isiDocSlots.length})`, icon: BookOpen },
        { key: "activity",  label: `Activity (${actTotal})`, icon: Activity },
      ]
    : [
        { key: "checklist", label: `Checklist (${flatDone}/${flatChecklist.length})`, icon: ClipboardList },
        { key: "documents", label: `Documents (${(project.documents || []).length})`, icon: FolderOpen },
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Top Bar (Back & Actions) ── */}
        <div className="flex items-center justify-between">
          <button onClick={() => router.push("/projects")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition cursor-pointer">
            <ArrowLeft size={16} /> Back to Projects
          </button>

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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition cursor-pointer">
              <Trash2 size={14} /> Delete Project
            </button>
          )}
        </div>

        {/* ── Header Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className={`h-1.5 ${progress === 100 ? "bg-emerald-500" : "bg-blue-600"}`} />
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge label={typeConfig.label} colorClass={typeConfig.color} />
                  <span className="text-xs text-gray-400 font-mono">{project.id}</span>
                  {project.status === "completed" && (
                    <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-full">
                      <CheckCircle2 size={11} /> DONE
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-gray-900 mt-1">{project.projectName}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{project.clientName}</p>
              </div>

              {/* Status dropdown */}
              <div className="relative">
                <button onClick={() => setEditingStatus(v => !v)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${statusConfig.color}`}>
                  {statusConfig.label} <ChevronDown size={14} />
                </button>
                {editingStatus && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden min-w-[180px]">
                    {STATUS_OPTIONS.map(s => (
                      <button key={s.value}
                        onClick={() => { updateStatus(s.value); setEditingStatus(false); }}
                        className={`w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition cursor-pointer ${s.value === project.status ? "bg-blue-50 text-blue-700" : "text-gray-700"}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="mt-5">
              <ProgressBar
                progress={progress}
                label={usesStages ? "Stage Progress" : "Checklist Progress"}
                showPercentage
              />
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-gray-50 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-gray-400" />
                <span>{project.assignedToNames?.join(", ") || "Unassigned"}</span>
              </div>
              {project.dueDate && (
                <div className={`flex items-center gap-1.5 ${new Date(project.dueDate) < new Date() && project.status !== "completed" ? "text-red-600" : ""}`}>
                  <Calendar size={14} className="text-gray-400" />
                  <span>Due {fmtDate(project.dueDate)}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-gray-400" />
                <span>Created {fmtDate(project.createdAt)}</span>
              </div>
            </div>
            {project.notes && (
              <div className="mt-4 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600">{project.notes}</div>
            )}
          </div>
        </div>

        {/* Completion banner */}
        {project.status === "completed" && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Award size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-emerald-800 text-sm">Project Completed! 🎉</p>
              <p className="text-xs text-emerald-600 mt-0.5">This project is now in the Completed section.</p>
            </div>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex border-b border-gray-200 gap-0 overflow-x-auto">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer whitespace-nowrap flex-shrink-0 ${currentTab === key ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* ── ISI / BIS CRS: Process Stages ── */}
        {currentTab === "stages" && usesStages && (
          <IsiStagesTab
            project={project}
            isManager={isManager}
            toggleIsiStep={toggleIsiStep}
            addRemark={addRemark}
          />
        )}

        {/* ── ISI / BIS CRS: Documents Required (upload slots) ── */}
        {currentTab === "documents" && usesStages && (
          <IsiDocumentsTab
            project={project}
            isManager={isManager}
            uploadIsiDocSlot={uploadIsiDocSlot}
            removeIsiDocSlot={removeIsiDocSlot}
            updateIsiDocSlot={updateIsiDocSlot}
          />
        )}

        {/* ── Non-ISI: Checklist ── */}
        {currentTab === "checklist" && !usesStages && (
          <FlatChecklistTab project={project} toggleChecklistItem={toggleChecklistItem} />
        )}

        {/* ── Non-ISI: Documents ── */}
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

        {/* ── Activity ── */}
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

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${toast.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
          {toast.type === "error" ? <X size={16} /> : <CheckCircle2 size={16} />} 
          {toast.msg}
        </div>
      )}
    </div>
  );
}
