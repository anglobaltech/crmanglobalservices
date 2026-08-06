"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Search, RefreshCw,
  ClipboardList, PackageCheck, Truck,
  CheckCircle2, XCircle,
  BarChart3, AlertTriangle, Calendar, X,
  SlidersHorizontal, ChevronLeft, ChevronRight,
  User, Car, Building2, Hash, Package, ArrowRight,
  Filter, ChevronDown, Scale,
  FileText, ExternalLink, Eye, Download, Camera, Video,
} from "lucide-react";
import api from "@/services/api";
import DataTable from "@/components/common/DataTable";
import { useAuth } from "@/context/AuthContext";
import GateEntryModal from "./GateEntryModal";
import StockEntryModal from "./StockEntryModal";
import StockExitModal from "./StockExitModal";

const fmtDate = (val) => {
  if (!val) return null;
  try {
    const d = val?.toDate ? val.toDate() : new Date(val);
    return { short: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }), year: d.getFullYear() };
  } catch { return null; }
};

const toDateStr = (val) => {
  if (!val) return "";
  try {
    const d = val?.toDate ? val.toDate() : new Date(val);
    return d.toISOString().split("T")[0];
  } catch { return ""; }
};

const fmtDateFull = (val) => {
  if (!val) return "—";
  try {
    const d = val?.toDate ? val.toDate() : new Date(val);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return "—"; }
};

const kgStr = (v) => (v != null && v !== "") ? `${Number(v).toLocaleString()} kg` : null;

const Tag = ({ children, color = "gray" }) => {
  const styles = {
    green:  "bg-emerald-50 text-emerald-700 ring-emerald-200",
    red:    "bg-red-50 text-red-600 ring-red-200",
    blue:   "bg-blue-50 text-blue-700 ring-blue-200",
    orange: "bg-orange-50 text-orange-700 ring-orange-200",
    gray:   "bg-gray-100 text-gray-600 ring-gray-200",
    amber:  "bg-amber-50 text-amber-700 ring-amber-200",
  };
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ring-1 ring-inset ${styles[color]}`}>
      {children}
    </span>
  );
};

const YesNo = ({ val }) => {
  if (val === true)  return <Tag color="green"><CheckCircle2 size={9} />Yes</Tag>;
  if (val === false) return <Tag color="red"><XCircle size={9} />No</Tag>;
  return <span className="text-gray-300 text-[10px]">—</span>;
};

const DateChip = ({ val }) => {
  const d = fmtDate(val);
  if (!d) return <span className="text-gray-300 text-[10px]">—</span>;
  return (
    <span className="inline-flex items-baseline gap-0.5 text-gray-500 text-[10px]">
      <span className="font-semibold text-gray-700">{d.short}</span>
      <span className="text-gray-400">{d.year}</span>
    </span>
  );
};

const GATE_COLS = [
  { key: "gateEntryId",            label: "ID" },
  { key: "productName",            label: "Product" },
  { key: "itemBatchNumber",        label: "Batch No." },
  { key: "vehicleNumber",          label: "Vehicle" },
  { key: "transporterName",        label: "Transporter" },
  { key: "invoiceDocPresent",      label: "Invoice" },
  { key: "invoiceDocNumber",       label: "Invoice No." },
  { key: "ewayBillPresent",        label: "E-Way" },
  { key: "ewayBillNumber",         label: "E-Way No." },
  { key: "fssaiLicenseApplicable", label: "FSSAI" },
  { key: "coaAvailable",           label: "COA" },
  { key: "importedByOther",        label: "Imported By" },
  { key: "entryDate",              label: "Date" },
  { key: "createdByName",          label: "By" },
];

const ENTRY_COLS = [
  { key: "stockEntryId",   label: "ID" },
  { key: "invoiceNumber",  label: "Invoice No." },
  { key: "productName",    label: "Product" },
  { key: "billFrom",       label: "From" },
  { key: "billTo",         label: "To" },
  { key: "totalBilledQty", label: "Total Qty" },
  { key: "approvedQty",    label: "Approved" },
  { key: "rejectedQty",    label: "Rejected" },
  { key: "entryDate",      label: "Date" },
  { key: "createdByName",  label: "By" },
];

const EXIT_COLS = [
  { key: "stockExitId",      label: "ID" },
  { key: "productName",      label: "Product" },
  { key: "batchNumber",      label: "Batch No." },
  { key: "qtyDispatched",    label: "Qty (kg)" },
  { key: "totalValue",       label: "Total Value" },
  { key: "buyerCompanyName", label: "Company" },
  { key: "transportMode",    label: "Mode" },
  { key: "exitDate",         label: "Date" },
  { key: "createdByName",    label: "By" },
];

const initCols = (defs) => defs.map(c => c.key); 

const YES_NO_KEYS = new Set(["invoiceDocPresent","ewayBillPresent","fssaiLicenseApplicable","coaAvailable",
  "invoiceMatchesEway","vehicleNumberMatch","productMatchesInvoice","productMatchesEway","transporterReceiptMatch"]);
const KG_KEYS     = new Set(["totalBilledQty","approvedQty","rejectedQty","qtyDispatched"]);
const DATE_KEYS   = new Set(["entryDate","exitDate","createdAt"]);
const ID_COLOR    = { gateEntryId: "blue", stockEntryId: "green", stockExitId: "orange" };

function CellValue({ col, entry }) {
  const v = entry[col];
  if (YES_NO_KEYS.has(col)) return <YesNo val={v} />;
  if (DATE_KEYS.has(col))   return <DateChip val={v} />;
  if (ID_COLOR[col]) {
    const c = { blue: "text-blue-700 bg-blue-50", green: "text-emerald-700 bg-emerald-50", orange: "text-orange-700 bg-orange-50" }[ID_COLOR[col]];
    return <span className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded ${c}`}>{v || "—"}</span>;
  }
  if (KG_KEYS.has(col)) {
    if (col === "rejectedQty" && v) {
      return <Tag color="red"><AlertTriangle size={8} />{Number(v).toLocaleString()} kg</Tag>;
    }
    const s = kgStr(v);
    return s ? <span className="text-[11px] font-bold text-gray-800">{s}</span> : <span className="text-gray-300 text-[10px]">—</span>;
  }
  return v ? <span className="text-[11px] text-gray-700">{v}</span> : <span className="text-gray-300 text-[10px]">—</span>;
}

function Pagination({ total, page, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  const start = (page - 1) * pageSize + 1;
  const end   = Math.min(page * pageSize, total);

  const nums = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) nums.push(i);
    else if (nums[nums.length - 1] !== 0) nums.push(0);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white">
      <span className="text-[10px] text-gray-400">{start}–{end} of {total}</span>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        ><ChevronLeft size={13} /></button>
        {nums.map((n, i) => n === 0 ? (
          <span key={`d${i}`} className="w-7 h-7 flex items-center justify-center text-[10px] text-gray-300">…</span>
        ) : (
          <button key={n} onClick={() => onChange(n)}
            className={`w-7 h-7 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              n === page ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"
            }`}
          >{n}</button>
        ))}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        ><ChevronRight size={13} /></button>
      </div>
    </div>
  );
}

function MediaLightbox({ item, onClose }) {
  if (!item) return null;
  const isVideo = item.isVideo;

  const handleDownload = async () => {
    try {
      const resp = await fetch(item.url);
      const blob = await resp.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = item.label.replace(/\s+/g, "_") + (isVideo ? ".mp4" : ".jpg");
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(item.url, "_blank");
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.96)", display: "flex", flexDirection: "column" }}
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", flexShrink: 0, background: "rgba(0,0,0,0.6)" }}
        onClick={e => e.stopPropagation()}
      >
        <span style={{ color: "white", fontSize: 14, fontWeight: 700 }}>{item.label}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleDownload}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "rgba(255,255,255,0.15)", color: "white", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            <Download size={13} /> Download
          </button>
          <button
            onClick={onClose}
            style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", cursor: "pointer" }}
          >
            <X size={15} color="white" />
          </button>
        </div>
      </div>
      {/* Media — takes all remaining space */}
      <div
        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: 8 }}
        onClick={e => e.stopPropagation()}
      >
        {isVideo ? (
          <video
            src={item.url}
            controls
            autoPlay
            playsInline
            style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 12 }}
          />
        ) : (
          <img
            src={item.url}
            alt={item.label}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 12, display: "block" }}
          />
        )}
      </div>
    </div>
  );
}

function MediaCard({ label, url, isVideo, onView }) {
  if (!url) return null;
  const Icon = isVideo ? Video : Camera;
  const colorCls = isVideo
    ? "bg-purple-50 text-purple-600 border-purple-100"
    : "bg-blue-50 text-blue-600 border-blue-100";
  const iconBg = isVideo ? "bg-purple-100" : "bg-blue-100";

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${colorCls} cursor-default`}>
      <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-gray-700 truncate">{label}</p>
        <p className="text-[10px] text-gray-400">{isVideo ? "Video file" : "Image file"}</p>
      </div>
      <button
        onClick={() => onView({ label, url, isVideo })}
        className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-[10px] font-bold rounded-lg cursor-pointer transition-colors flex-shrink-0"
      >
        <Eye size={11} /> View
      </button>
    </div>
  );
}

function DetailModal({ entry, type, onClose }) {
  const [lightbox, setLightbox] = useState(null);
  if (!entry) return null;
  const cfg = {
    gate:  { title: "Gate Entry",  id: entry.gateEntryId,  color: "blue",   Icon: ClipboardList },
    entry: { title: "Stock Entry", id: entry.stockEntryId, color: "emerald", Icon: PackageCheck },
    exit:  { title: "Stock Exit",  id: entry.stockExitId,  color: "orange",  Icon: Truck },
  }[type];
  const hdrBg = { blue: "bg-blue-600", emerald: "bg-emerald-600", orange: "bg-orange-500" }[cfg.color];
  const { Icon } = cfg;

  const Row = ({ label, value, isYN }) => {
    if (!value && value !== 0 && value !== false) return null;
    return (
      <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide w-32 flex-shrink-0 mt-0.5">{label}</span>
        {isYN ? <YesNo val={value} /> : <span className="text-xs text-gray-800 font-medium flex-1">{value}</span>}
      </div>
    );
  };

  const Sec = ({ title, children }) => {
    // Check if children have actual values being passed to them
    // children could be an array of React elements
    const hasContent = React.Children.toArray(children).some(child => {
      if (!child) return false;
      // If it's our Row component, check if its value prop is truthy (or 0 or false)
      if (child.props && child.type === Row) {
        const v = child.props.value;
        return (v !== null && v !== undefined && v !== "");
      }
      return true;
    });
    
    if (!hasContent) return null;
    return (
      <div className="mb-4">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-4">{title}</p>
        <div className="mx-0 bg-white border border-gray-100 rounded-xl px-4 divide-y divide-gray-50">{children}</div>
      </div>
    );
  };

  return (
    <>
      {/* Lightbox */}
      {lightbox && <MediaLightbox item={lightbox} onClose={() => setLightbox(null)} />}

      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center sm:p-4">
        <div className="bg-gray-50 w-full sm:max-w-xl flex flex-col rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh]">
          {/* Header */}
          <div className={`${hdrBg} px-5 py-4 rounded-t-2xl flex-shrink-0`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <Icon size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">{cfg.title}</h2>
                  <p className="text-[11px] text-white/70 font-mono">{cfg.id || "—"}</p>
                </div>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-xl cursor-pointer transition-colors">
                <X size={14} className="text-white" />
              </button>
            </div>
          </div>
          {/* Body */}
          <div className="overflow-y-auto flex-1 py-3">
            {type === "gate" && (
              <>
                {/* 0 ── Media Evidence ──────────────────────────────── */}
                {(entry.driverPhoto || entry.gateOpeningVideo || entry.productPhoto || entry.productVideo) && (
                  <div className="mb-4 px-4">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Media Evidence</p>
                    <div className="space-y-2">
                      <MediaCard label="Driver Photo"       url={entry.driverPhoto}      isVideo={false} onView={setLightbox} />
                      <MediaCard label="Gate Opening Video" url={entry.gateOpeningVideo} isVideo={true}  onView={setLightbox} />
                      <MediaCard label="Product Photo"      url={entry.productPhoto}     isVideo={false} onView={setLightbox} />
                      <MediaCard label="Product Video"      url={entry.productVideo}     isVideo={true}  onView={setLightbox} />
                    </div>
                  </div>
                )}

              {/* 1 ── Product Details ──────────────────────────────── */}
              <Sec title="Product Details">
                <Row label="Product Name"   value={entry.productName} />
                <Row label="Packaging"      value={entry.packagingDetails} />
                <Row label="Batch No."      value={entry.itemBatchNumber} />
                <Row label="Imported By"    value={entry.importedByOther || entry.importedBy} />
              </Sec>

              {/* 2 ── Documents ────────────────────────────────────── */}
              <Sec title="Documents">
                {/* Invoice */}
                <div className="py-2.5 border-b border-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Invoice</span>
                    <YesNo val={entry.invoiceDocPresent} />
                  </div>
                  {(entry.invoiceDocNumber || entry.companyInvoiceDetails) && (
                    <p className="text-xs text-gray-700 font-medium font-mono">
                      # {entry.invoiceDocNumber || entry.companyInvoiceDetails}
                    </p>
                  )}
                </div>

                {/* E-Way Bill */}
                <div className="py-2.5 border-b border-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">E-Way Bill</span>
                    <YesNo val={entry.ewayBillPresent} />
                  </div>
                  {(entry.ewayBillNumber || entry.ewayBillDetails) && (
                    <p className="text-xs text-gray-700 font-medium font-mono">
                      # {entry.ewayBillNumber || entry.ewayBillDetails}
                    </p>
                  )}
                </div>

                {/* Match checks */}
                <div className="py-2 border-b border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Invoice = E-Way Match</span>
                  <YesNo val={entry.invoiceMatchesEway} />
                </div>
                <div className="py-2 border-b border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Vehicle No. Match</span>
                  <YesNo val={entry.vehicleNumberMatch} />
                </div>

                {/* FSSAI */}
                <div className="py-2.5 border-b border-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">FSSAI</span>
                    <YesNo val={entry.fssaiLicenseApplicable} />
                  </div>
                  {entry.fssaiFssaiNumber && (
                    <p className="text-xs text-gray-700 font-mono"># {entry.fssaiFssaiNumber}</p>
                  )}
                  {entry.fssaiParty && (
                    <p className="text-[10px] text-gray-500">{entry.fssaiParty}</p>
                  )}
                </div>

                {/* COA */}
                <div className="py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">COA (Certificate of Analysis)</span>
                    <YesNo val={entry.coaAvailable} />
                  </div>
                  {entry.coaDetails && (
                    <p className="text-xs text-gray-600 mb-1.5">{entry.coaDetails}</p>
                  )}
                  {entry.coaFile && (
                    <a
                      href={entry.coaFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[10px] font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye size={11} />View COA File<ExternalLink size={9} className="opacity-60" />
                    </a>
                  )}
                </div>

                {/* Product verification */}
                <div className="py-2 border-b border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Product Matches Invoice</span>
                  <YesNo val={entry.productMatchesInvoice} />
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Product Matches E-Way</span>
                  <YesNo val={entry.productMatchesEway} />
                </div>
              </Sec>

              {/* 3 ── Driver & Transport ────────────────────────────── */}
              <Sec title="Driver & Transport">
                <Row label="Vehicle No."   value={entry.vehicleNumber} />
                <Row label="Transporter"   value={entry.transporterName} />
                <Row label="Trans. GST"    value={entry.transporterGst} />
                <div className="py-2 border-b border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Receipt Match</span>
                  <YesNo val={entry.transporterReceiptMatch} />
                </div>
                <Row label="Driver Name"   value={entry.driverName} />
                <Row label="Driver Phone"  value={entry.driverPhone} />
              </Sec>

              {/* 4 ── Others ───────────────────────────────────────── */}
              <Sec title="Others">
                <Row label="Seller GST"   value={entry.gstNumberSeller} />
                <Row label="Buyer GST"    value={entry.gstNumberBuyer} />
                <Row label="Entry Date"   value={fmtDateFull(entry.entryDate)} />
                <Row label="Created By"   value={entry.createdByName} />
                <Row label="Remarks"      value={entry.remarks} />
              </Sec>
            </>
          )}
            {type === "entry" && (
              <>
                {/* Media Evidence for Stock Entry */}
                {(entry.rejectedItemPhoto || entry.rejectedItemVideo) && (
                  <div className="mb-4 px-4">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Rejection Evidence</p>
                    <div className="space-y-2">
                      <MediaCard label="Rejected Item Photo" url={entry.rejectedItemPhoto} isVideo={false} onView={setLightbox} />
                      <MediaCard label="Rejected Item Video" url={entry.rejectedItemVideo} isVideo={true}  onView={setLightbox} />
                    </div>
                  </div>
                )}
              <Sec title="Invoice & Details">
                <Row label="Invoice No."  value={entry.invoiceNumber} />
                <Row label="Invoice Date" value={entry.invoiceDate} />
                <Row label="Bill From"    value={entry.billFrom} />
                <Row label="Bill To"      value={entry.billTo} />
              </Sec>
              <Sec title="Product Info">
                <Row label="Product Name" value={entry.productName} />
                <Row label="HSN Code"     value={entry.hsnCode} />
                <Row label="Vehicle No."  value={entry.vehicleNumber} />
              </Sec>
              <Sec title="Quantity">
                <Row label="Total"    value={kgStr(entry.totalBilledQty)} />
                <Row label="Approved" value={kgStr(entry.approvedQty)} />
                <Row label="Rejected" value={kgStr(entry.rejectedQty)} />
                <Row label="Reason"   value={entry.rejectionReason} />
              </Sec>
              <Sec title="Witnesses">
                <Row label="Witness"      value={entry.witnessName} />
                <Row label="W. Phone"     value={entry.witnessPhone} />
                <Row label="Other Party"  value={entry.otherPartyName} />
                <Row label="Party Role"   value={entry.otherPartyRole} />
                <Row label="Party Phone"  value={entry.otherPartyPhone} />
              </Sec>
              <Sec title="Other">
                <Row label="Date"       value={fmtDateFull(entry.entryDate)} />
                <Row label="Created By" value={entry.createdByName} />
                <Row label="Remarks"    value={entry.remarks} />
              </Sec>
            </>
          )}
            {type === "exit" && (
              <>
                {/* Media Evidence for Stock Exit — supports both old (exitPhoto/exitVideo) and new (vehiclePhoto/itemPhoto/itemVideo) field names */}
                {(entry.vehiclePhoto || entry.itemPhoto || entry.itemVideo || entry.exitPhoto || entry.exitVideo) && (
                  <div className="mb-4 px-4">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Exit Evidence</p>
                    <div className="space-y-2">
                      <MediaCard label="Vehicle Photo" url={entry.vehiclePhoto || entry.exitPhoto} isVideo={false} onView={setLightbox} />
                      <MediaCard label="Item Photo"    url={entry.itemPhoto}                        isVideo={false} onView={setLightbox} />
                      <MediaCard label="Item Video"    url={entry.itemVideo || entry.exitVideo}    isVideo={true}  onView={setLightbox} />
                    </div>
                  </div>
                )}
              <Sec title="Product Details">
                <Row label="Product Name" value={entry.productName} />
                <Row label="Batch No."    value={entry.batchNumber} />
                <Row label="Qty (kg)"     value={kgStr(entry.qtyDispatched)} />
                <Row label="Packaging"    value={entry.packagingType} />
                <Row label="Total Value"  value={entry.totalValue} />
              </Sec>
              <Sec title="Buyer Details">
                <Row label="Buyer Name"   value={entry.buyerName} />
                <Row label="Company"      value={entry.buyerCompanyName} />
                <Row label="Phone"        value={entry.buyerPhone} />
                <Row label="GSTIN"        value={entry.buyerGst} />
                <Row label="FSSAI No"     value={entry.buyerFssaiNumber} />
              </Sec>
              <Sec title="Invoice & Document">
                <Row label="Invoice/Doc"  value={entry.invoiceDocNumber} />
                <Row label="E-Way Bill?"  value={entry.ewayBillApplicable} isYN={true} />
                {entry.ewayBillApplicable && <Row label="E-Way No" value={entry.ewayBillNumber} />}
              </Sec>
              <Sec title="Transport">
                <Row label="Mode"         value={entry.transportMode} />
                {/* Show transporter name when mode is transporter OR when old records have transporterName */}
                {(entry.transportMode === "transporter" || (!entry.transportMode && entry.transporterName)) && (
                  <Row label="Transporter"  value={entry.transporterName} />
                )}
                <Row label="Vehicle No"   value={entry.vehicleNumber} />
                <Row label="Driver Name"  value={entry.driverName} />
                <Row label="Driver Phone" value={entry.driverPhone} />
                <Row label="Driver ID"    value={entry.driverId} />
              </Sec>
              <Sec title="Other">
                <Row label="Date"       value={fmtDateFull(entry.exitDate)} />
                <Row label="Created By" value={entry.createdByName} />
                <Row label="Remarks"    value={entry.remarks} />
              </Sec>
              </>
            )}
          </div>
          <div className="px-5 py-3 border-t border-gray-100 flex-shrink-0">
            <button onClick={onClose}
              className="w-full sm:w-auto sm:float-right px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
            >Close</button>
          </div>
        </div>
      </div>
    </>
  );
}

function GateCard({ e, onClick }) {
  const d = fmtDate(e.entryDate);
  return (
    <div onClick={() => onClick(e)}
      className="bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer active:scale-[0.99] hover:shadow-md hover:border-blue-200 transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">{e.gateEntryId}</span>
          <h3 className="text-sm font-bold text-gray-900 mt-1.5 leading-tight">{e.productName || "—"}</h3>
        </div>
        {d && (
          <div className="text-right flex-shrink-0">
            <div className="text-xs font-bold text-gray-700">{d.short}</div>
            <div className="text-[10px] text-gray-400">{d.year}</div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
        {e.vehicleNumber && (
          <div className="flex items-center gap-1.5 text-gray-600">
            <Car size={11} className="text-gray-400 flex-shrink-0" />
            <span className="truncate font-medium">{e.vehicleNumber}</span>
          </div>
        )}
        {e.transporterName && (
          <div className="flex items-center gap-1.5 text-gray-600">
            <Building2 size={11} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{e.transporterName}</span>
          </div>
        )}
        {e.importedByOther && (
          <div className="flex items-center gap-1.5 text-gray-600 col-span-2">
            <User size={11} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{e.importedByOther}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 pt-2.5 border-t border-gray-50">
        <span className="text-[10px] text-gray-400 mr-1">Docs:</span>
        <span className="text-[10px] text-gray-500">Invoice <YesNo val={e.invoiceDocPresent} /></span>
        <span className="text-[10px] text-gray-500">E-Way <YesNo val={e.ewayBillPresent} /></span>
        {e.createdByName && (
          <span className="ml-auto text-[10px] text-gray-400 flex items-center gap-1">
            <User size={9} />{e.createdByName}
          </span>
        )}
      </div>
    </div>
  );
}

function EntryCard({ e, onClick }) {
  const d = fmtDate(e.entryDate);
  const hasRej = (e.rejectedQty || 0) > 0;
  return (
    <div onClick={() => onClick(e)}
      className="bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer active:scale-[0.99] hover:shadow-md hover:border-emerald-200 transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">{e.stockEntryId}</span>
          <h3 className="text-sm font-bold text-gray-900 mt-1.5 leading-tight">{e.productName || "—"}</h3>
        </div>
        {d && (
          <div className="text-right flex-shrink-0">
            <div className="text-xs font-bold text-gray-700">{d.short}</div>
            <div className="text-[10px] text-gray-400">{d.year}</div>
          </div>
        )}
      </div>
      {e.invoiceNumber && (
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-2">
          <Hash size={10} className="text-gray-400" />
          <span className="font-mono">{e.invoiceNumber}</span>
          {e.billFrom && <><ArrowRight size={9} className="text-gray-300" /><span>{e.billFrom}</span></>}
        </div>
      )}
      <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-xl p-2.5 text-center">
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Total</p>
          <p className="text-xs font-bold text-gray-800">{kgStr(e.totalBilledQty) || "—"}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Approved</p>
          <p className="text-xs font-bold text-emerald-700">{kgStr(e.approvedQty) || "—"}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Rejected</p>
          <p className={`text-xs font-bold ${hasRej ? "text-red-600" : "text-gray-300"}`}>{kgStr(e.rejectedQty) || "0 kg"}</p>
        </div>
      </div>
    </div>
  );
}

function ExitCard({ e, onClick }) {
  const d = fmtDate(e.exitDate);
  return (
    <div onClick={() => onClick(e)}
      className="bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer active:scale-[0.99] hover:shadow-md hover:border-orange-200 transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <span className="font-mono text-[11px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md">{e.stockExitId}</span>
          <h3 className="text-sm font-bold text-gray-900 mt-1.5 leading-tight">{e.productName || "—"}</h3>
        </div>
        {d && (
          <div className="text-right flex-shrink-0">
            <div className="text-xs font-bold text-gray-700">{d.short}</div>
            <div className="text-[10px] text-gray-400">{d.year}</div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 flex-wrap text-[11px]">
        {e.qtyDispatched != null && (
          <div className="flex items-center gap-1 bg-orange-50 text-orange-700 px-2.5 py-1 rounded-lg">
            <Scale size={10} /><span className="font-bold">{kgStr(e.qtyDispatched)}</span>
          </div>
        )}
        {e.buyerName && <span className="text-gray-600 flex items-center gap-1"><User size={10} className="text-gray-400" />{e.buyerName}</span>}
        {e.vehicleNumber && <span className="text-gray-600 flex items-center gap-1"><Car size={10} className="text-gray-400" />{e.vehicleNumber}</span>}
        {e.destination && <span className="text-gray-500">→ {e.destination}</span>}
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, color, active, onClick }) {
  const C = {
    blue:   { bg: "bg-blue-50",    icon: "text-blue-600",    ring: "ring-blue-300",    activeBg: "bg-blue-600"   },
    green:  { bg: "bg-emerald-50", icon: "text-emerald-600", ring: "ring-emerald-300", activeBg: "bg-emerald-600"},
    orange: { bg: "bg-orange-50",  icon: "text-orange-500",  ring: "ring-orange-300",  activeBg: "bg-orange-500" },
    red:    { bg: "bg-red-50",     icon: "text-red-500",     ring: "",                 activeBg: ""              },
  }[color] || {};

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`text-left bg-white rounded-2xl border p-3.5 sm:p-4 flex items-center gap-3 transition-all w-full ${
        onClick ? "cursor-pointer" : "cursor-default"
      } ${active
        ? `border-transparent ring-2 ${C.ring} shadow-lg shadow-${color}-100`
        : onClick
        ? "border-gray-100 hover:border-gray-200 hover:shadow-md"
        : "border-gray-100"
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${active ? C.activeBg : C.bg}`}>
        <Icon size={17} className={active ? "text-white" : C.icon} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-gray-500 font-medium leading-tight truncate">{label}</p>
        <p className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mt-0.5">{value ?? "0"}</p>
        {sub && <p className="text-[9px] text-gray-400 hidden sm:block">{sub}</p>}
      </div>
    </button>
  );
}

const PAGE_SIZE = 20;

export default function StockPage() {
  const [tab, setTab]   = useState("gate");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [gateEntries,  setGateEntries]  = useState([]);
  const [stockEntries, setStockEntries] = useState([]);
  const [stockExits,   setStockExits]   = useState([]);
  const [modal,       setModal]       = useState(null);
  const [detailEntry, setDetailEntry] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const [page,     setPage]     = useState(1);
  const [gateCols,  setGateCols]  = useState(() => initCols(GATE_COLS));
  const [entryCols, setEntryCols] = useState(() => initCols(ENTRY_COLS));
  const [exitCols,  setExitCols]  = useState(() => initCols(EXIT_COLS));
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      setCurrentUser(JSON.parse(localStorage.getItem("crm_user") || "{}"));
    } catch {}
  }, []);

  const managerRoles = [
    "Super Admin",
    "Founder & CEO",
    "Director",
    "Branch Manager",
    "Manager",
    "Team Manager",
    "Assistant Manager",
  ];
  const isManager = managerRoles.includes(currentUser?.roleName);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [geRes, seRes, sxRes] = await Promise.all([
        api.get("/api/stock/gate-entries", { params: { limit: 500 } }),
        api.get("/api/stock/entries",      { params: { limit: 500 } }),
        api.get("/api/stock/exits",        { params: { limit: 500 } }),
      ]);
      setGateEntries(geRes.data.entries || []);
      setStockEntries(seRes.data.entries || []);
      setStockExits(sxRes.data.entries || []);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { setPage(1); setSelectedIds([]); }, [tab, search, dateFrom, dateTo]);

  const filter = (list, dateKey = "entryDate") =>
    list.filter(e => {
      const d = toDateStr(e[dateKey] || e.createdAt);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo   && d > dateTo)   return false;
      if (search) {
        const q = search.toLowerCase();
        return Object.values(e).some(v => v && String(v).toLowerCase().includes(q));
      }
      return true;
    });

  const fGate    = filter(gateEntries,  "entryDate");
  const fEntries = filter(stockEntries, "entryDate");
  const fExits   = filter(stockExits,   "exitDate");

  const kpiGate  = fGate.length;
  const kpiEntry = fEntries.length;
  const kpiExit  = fExits.length;
  const kpiApprv = fEntries.reduce((s, e) => s + (Number(e.approvedQty) || 0), 0);
  const kpiRej   = fEntries.reduce((s, e) => s + (Number(e.rejectedQty) || 0), 0);

  const currentList = tab === "gate" ? fGate : tab === "entry" ? fEntries : fExits;
  const pagedList   = currentList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const allColDefs = { gate: GATE_COLS, entry: ENTRY_COLS, exit: EXIT_COLS }[tab];
  const activeCols = { gate: gateCols, entry: entryCols, exit: exitCols }[tab];
  const setActiveCols = { gate: setGateCols, entry: setEntryCols, exit: setExitCols }[tab];
  
  const dataTableCols = allColDefs.map(c => ({
    ...c,
    render: (row) => (
      <div className="cursor-pointer" onClick={() => openDetail(row)}>
        <CellValue col={c.key} entry={row} />
      </div>
    )
  }));
  const colDefs = activeCols.map(key => allColDefs.find(c => c.key === key)).filter(Boolean);

  const datesActive = dateFrom || dateTo;
  const addColors   = { gate: "bg-blue-600 hover:bg-blue-700", entry: "bg-emerald-600 hover:bg-emerald-700", exit: "bg-orange-500 hover:bg-orange-600" }[tab];
  const addLabel    = tab === "gate" ? "Gate Entry" : tab === "entry" ? "Stock Entry" : "Stock Exit";
  const EmptyIcon   = { gate: ClipboardList, entry: PackageCheck, exit: Truck }[tab];

  const openDetail = (entry) => setDetailEntry({ entry, type: tab });

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected record(s)?`)) return;
    setIsDeleting(true);
    try {
      const endpoint = tab === "gate" ? "gate-entries" : tab === "entry" ? "entries" : "exits";
      await api.post(`/api/stock/${endpoint}/bulk-delete`, { ids: selectedIds });
      setSelectedIds([]);
      fetchAll();
    } catch (err) {
      alert("Failed to delete records.");
    }
    setIsDeleting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Stock Management</h1>
            <p className="text-[10px] text-gray-400 hidden sm:block">Gate entry · Inventory · Dispatch</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile filter toggle */}
            <button onClick={() => setShowFilters(v => !v)}
              className={`sm:hidden p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                showFilters || datesActive ? "border-blue-300 text-blue-600 bg-blue-50" : "border-gray-200 text-gray-500"
              }`}
            >
              <Filter size={14} />
            </button>
            {/* Desktop date filter */}
            <div className="hidden sm:flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <Calendar size={12} className="text-gray-400" />
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="bg-transparent text-xs focus:outline-none text-gray-600 w-[115px]" />
              <span className="text-gray-300 text-xs font-medium">→</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="bg-transparent text-xs focus:outline-none text-gray-600 w-[115px]" />
              {datesActive && (
                <button onClick={() => { setDateFrom(""); setDateTo(""); }}
                  className="p-0.5 rounded text-gray-400 hover:text-red-500 cursor-pointer transition-colors">
                  <X size={11} />
                </button>
              )}
            </div>
            <button onClick={fetchAll} disabled={loading}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors cursor-pointer">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            {/* Mobile Add */}
            <button onClick={() => setModal(tab)}
              className={`sm:hidden flex items-center gap-1 px-3 py-2 ${addColors} text-white text-xs font-bold rounded-xl cursor-pointer transition-colors`}>
              <Plus size={13} />
            </button>
          </div>
        </div>
        {/* Mobile date row */}
        {showFilters && (
          <div className="sm:hidden border-t border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
              <Calendar size={12} className="text-gray-400 flex-shrink-0" />
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="bg-transparent text-xs focus:outline-none text-gray-600 flex-1" />
              <span className="text-gray-300 text-xs">→</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="bg-transparent text-xs focus:outline-none text-gray-600 flex-1" />
              {datesActive && (
                <button onClick={() => { setDateFrom(""); setDateTo(""); }}
                  className="p-0.5 text-gray-400 hover:text-red-500 cursor-pointer">
                  <X size={11} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="px-3 sm:px-6 py-3 sm:py-5 space-y-3 sm:space-y-5 max-w-7xl mx-auto">

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          <KpiCard icon={ClipboardList} label="Gate Entries"  value={kpiGate}  color="blue"
            active={tab === "gate"}  onClick={() => setTab("gate")} />
          <KpiCard icon={PackageCheck}  label="Stock Entries" value={kpiEntry} color="green"
            active={tab === "entry"} onClick={() => setTab("entry")} />
          <KpiCard icon={Truck}         label="Stock Exits"   value={kpiExit}  color="orange"
            active={tab === "exit"}  onClick={() => setTab("exit")} />
          <KpiCard icon={BarChart3}     label="Approved"      value={`${kpiApprv.toLocaleString()} kg`} color="green" sub="approved qty" />
          <KpiCard icon={AlertTriangle} label="Rejected"      value={`${kpiRej.toLocaleString()} kg`}   color="red"   sub="rejected qty" />
        </div>

        {/* ── Table Panel ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">

          {/* Toolbar */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-3 border-b border-gray-100">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text"
                placeholder={`Search ${tab === "gate" ? "gate entries" : tab === "entry" ? "stock entries" : "stock exits"}…`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-colors"
              />
            </div>
            {isManager && selectedIds.length > 0 && (
              <button onClick={handleBulkDelete} disabled={isDeleting}
                className="hidden sm:flex items-center gap-1.5 h-9 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors disabled:opacity-50">
                {isDeleting ? "Deleting..." : `Delete Selected (${selectedIds.length})`}
              </button>
            )}
            <button onClick={() => setModal(tab)}
              className={`hidden sm:flex items-center gap-1.5 h-9 px-4 ${addColors} text-white text-xs font-bold rounded-xl cursor-pointer transition-colors`}>
              <Plus size={13} />{addLabel}
            </button>
          </div>

          <div className="px-3 sm:px-4 py-2 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-medium">
              {currentList.length} record{currentList.length !== 1 ? "s" : ""}
              {datesActive ? " · date filtered" : ""}
              {search ? ` · "${search}"` : ""}
            </span>
            {datesActive && (
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Calendar size={9} />Filtered by date
              </span>
            )}
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <RefreshCw size={24} className="text-gray-300 animate-spin" />
                <p className="text-xs text-gray-400">Loading…</p>
              </div>
            ) : pagedList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <EmptyIcon size={32} className="text-gray-200" />
                <p className="text-sm text-gray-400 font-medium">No records found</p>
                <button onClick={() => setModal(tab)}
                  className={`flex items-center gap-1.5 px-4 py-2 ${addColors} text-white text-xs font-bold rounded-xl cursor-pointer`}>
                  <Plus size={13} />{addLabel}
                </button>
              </div>
            ) : (
              <div className="p-3 space-y-2.5">
                {tab === "gate"  && pagedList.map(e => <GateCard  key={e.id} e={e} onClick={openDetail} />)}
                {tab === "entry" && pagedList.map(e => <EntryCard key={e.id} e={e} onClick={openDetail} />)}
                {tab === "exit"  && pagedList.map(e => <ExitCard  key={e.id} e={e} onClick={openDetail} />)}
              </div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block">
            <DataTable
              columns={dataTableCols}
              data={currentList}
              loading={loading}
              columnPicker={{
                allColumns: allColDefs,
                selected: activeCols,
                onSelect: setActiveCols
              }}
              selection={isManager ? {
                selectedIds,
                onSelectChange: setSelectedIds
              } : null}
            />
          </div>
        </div>
      </div>

      {/* Create Modals */}
      {modal === "gate"  && <GateEntryModal  onClose={() => setModal(null)} onCreated={fetchAll} />}
      {modal === "entry" && <StockEntryModal onClose={() => setModal(null)} onCreated={fetchAll} gateEntries={gateEntries} />} 
      {modal === "exit"  && <StockExitModal  onClose={() => setModal(null)} onCreated={fetchAll} gateEntries={gateEntries} stockEntries={stockEntries} />}

      {/* Detail Modal */}
      {detailEntry && (
        <DetailModal entry={detailEntry.entry} type={detailEntry.type} onClose={() => setDetailEntry(null)} />
      )}
    </div>
  );
}
