"use client";
import { useState } from "react";
import { X, PackageCheck, AlertTriangle, Camera } from "lucide-react";
import api from "@/services/api";

const Field = ({ label, children, required }) => (
  <div>
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const Input = (props) => (
  <input {...props}
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300"
  />
);

const Textarea = (props) => (
  <textarea {...props} rows={2}
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300 resize-none"
  />
);

async function fileToBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

const FileUpload = ({ label, value, onChange, accept }) => (
  <Field label={label}>
    <label className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-2.5 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
      <Camera size={12} className="text-gray-400 flex-shrink-0" />
      <span className="text-xs text-gray-500 truncate">{value ? "✓ File selected" : "Tap to upload"}</span>
      <input type="file" accept={accept} className="hidden"
        onChange={async (e) => { if (e.target.files[0]) onChange(await fileToBase64(e.target.files[0])); }}
      />
    </label>
  </Field>
);

const SectionBlock = ({ num, title, children, color = "emerald" }) => {
  const colors = {
    emerald: "bg-emerald-100 text-emerald-700",
    blue:    "bg-blue-100 text-blue-700",
    amber:   "bg-amber-100 text-amber-700",
    red:     "bg-red-100 text-red-700",
  };
  return (
    <div className="border border-gray-100 rounded-xl p-3.5 space-y-3">
      <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold ${colors[color]}`}>{num}</span>
        {title}
      </p>
      {children}
    </div>
  );
};

export default function StockEntryModal({ onClose, onCreated, gateEntries = [] }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    invoiceNumber: "", billFrom: "", billTo: "", productName: "",
    totalBilledQty: "", approvedQty: "", rejectedQty: "",
    rejectionReason: "", rejectedItemPhoto: null, rejectedItemVideo: null,
    witnessName: "", witnessPhone: "",
    otherPartyName: "", otherPartyPhone: "", otherPartyRole: "seller",
    gateEntryRef: "",
    entryDate: new Date().toISOString().split("T")[0],
    remarks: "",
  });

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const rejected = parseInt(form.rejectedQty) || 0;

  const handleSubmit = async () => {
    if (!form.invoiceNumber) { setError("Invoice number is required."); return; }
    if (!form.totalBilledQty) { setError("Total billed quantity is required."); return; }
    if (!form.approvedQty)    { setError("Approved quantity is required."); return; }
    setSaving(true); setError("");
    try {
      await api.post("/api/stock/entries", form);
      onCreated?.(); onClose();
    } catch (err) { setError(err.response?.data?.message || "Failed to save stock entry"); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-end sm:items-center justify-center sm:p-3">
      <div className="bg-white w-full sm:max-w-2xl flex flex-col rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[93vh] sm:max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
              <PackageCheck size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">New Stock Entry</h2>
              <p className="text-[10px] text-gray-400">Invoice, quantities & inspection</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer text-gray-400">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">

          {/* Invoice Details */}
          <SectionBlock num={1} title="Invoice Details" color="emerald">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Invoice Number" required>
                <Input placeholder="INV-2024-001" value={form.invoiceNumber} onChange={e => set("invoiceNumber", e.target.value)} />
              </Field>
              <Field label="Entry Date">
                <Input type="date" value={form.entryDate} onChange={e => set("entryDate", e.target.value)} />
              </Field>
              <Field label="Bill From" required>
                <Input placeholder="Supplier / sender name" value={form.billFrom} onChange={e => set("billFrom", e.target.value)} />
              </Field>
              <Field label="Bill To">
                <Input placeholder="Recipient / company name" value={form.billTo} onChange={e => set("billTo", e.target.value)} />
              </Field>
              <Field label="Product Name">
                <Input placeholder="Product as per invoice" value={form.productName} onChange={e => set("productName", e.target.value)} />
              </Field>
              {gateEntries.length > 0 && (
                <Field label="Link Gate Entry">
                  <select value={form.gateEntryRef} onChange={e => set("gateEntryRef", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">— Select gate entry —</option>
                    {gateEntries.map(ge => (
                      <option key={ge.id} value={ge.id}>{ge.gateEntryId} — {ge.productName || ge.vehicleNumber || "Entry"}</option>
                    ))}
                  </select>
                </Field>
              )}
            </div>
          </SectionBlock>

          {/* Quantity */}
          <SectionBlock num={2} title="Quantity & Inspection" color="blue">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <Field label="Total Billed Qty" required>
                <Input type="number" min="0" placeholder="0" value={form.totalBilledQty} onChange={e => set("totalBilledQty", e.target.value)} />
              </Field>
              <Field label="Approved Qty" required>
                <Input type="number" min="0" placeholder="0" value={form.approvedQty} onChange={e => set("approvedQty", e.target.value)} />
              </Field>
              <Field label="Rejected Qty">
                <Input type="number" min="0" placeholder="0" value={form.rejectedQty} onChange={e => set("rejectedQty", e.target.value)} />
              </Field>
            </div>
            {form.totalBilledQty && (
              <div className="flex flex-wrap gap-3 p-2.5 bg-gray-50 rounded-lg text-[10px] font-semibold">
                <span className="text-gray-600">Total: <span className="text-gray-900">{form.totalBilledQty}</span></span>
                <span className="text-emerald-600">✓ Approved: {form.approvedQty || 0}</span>
                <span className="text-red-500">✗ Rejected: {form.rejectedQty || 0}</span>
              </div>
            )}
          </SectionBlock>

          {/* Rejection — only when > 0 */}
          {rejected > 0 && (
            <div className="p-3.5 border border-red-100 bg-red-50 rounded-xl space-y-3">
              <p className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                <AlertTriangle size={13} /> Rejection Details
              </p>
              <Field label="Reason for Rejection" required>
                <Textarea placeholder="Describe why items were rejected..." value={form.rejectionReason} onChange={e => set("rejectionReason", e.target.value)} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FileUpload label="Photo of Rejected Items" value={form.rejectedItemPhoto} onChange={v => set("rejectedItemPhoto", v)} accept="image/*" />
                <FileUpload label="Video of Rejected Items" value={form.rejectedItemVideo} onChange={v => set("rejectedItemVideo", v)} accept="video/*" />
              </div>
            </div>
          )}

          {/* Witness */}
          <SectionBlock num={3} title="Witness Information" color="amber">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Our Company Witness Name">
                <Input placeholder="Witness from our side" value={form.witnessName} onChange={e => set("witnessName", e.target.value)} />
              </Field>
              <Field label="Our Company Witness Phone">
                <Input placeholder="Contact number" value={form.witnessPhone} onChange={e => set("witnessPhone", e.target.value)} />
              </Field>
            </div>
            <div className="border-t border-gray-200 pt-3 mt-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Other Party Witness</p>
                <div className="flex gap-1">
                  {["seller", "buyer", "transporter"].map(r => (
                    <button key={r} type="button" onClick={() => set("otherPartyRole", r)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-colors capitalize ${
                        form.otherPartyRole === r ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                      }`}
                    >{r}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={`${form.otherPartyRole.charAt(0).toUpperCase() + form.otherPartyRole.slice(1)} Witness Name`}>
                  <Input placeholder="Representative name" value={form.otherPartyName} onChange={e => set("otherPartyName", e.target.value)} />
                </Field>
                <Field label={`${form.otherPartyRole.charAt(0).toUpperCase() + form.otherPartyRole.slice(1)} Witness Phone`}>
                  <Input placeholder="Contact number" value={form.otherPartyPhone} onChange={e => set("otherPartyPhone", e.target.value)} />
                </Field>
              </div>
            </div>
          </SectionBlock>

          <Field label="Remarks">
            <Textarea placeholder="Additional notes..." value={form.remarks} onChange={e => set("remarks", e.target.value)} />
          </Field>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-4 sm:px-5 py-3 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 cursor-pointer disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Entry ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}
