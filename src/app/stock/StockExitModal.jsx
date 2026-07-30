"use client";
import { useState } from "react";
import { X, TruckIcon, Camera } from "lucide-react";
import api from "@/services/api";

const Field = ({ label, children }) => (
  <div>
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">{label}</label>
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

import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Loader2 } from "lucide-react";

// Upload file directly to Firebase Storage, return download URL
async function uploadToFirebase(file, path) {
  const storageRef = ref(storage, path);
  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file);
    task.on("state_changed", null, reject, async () => {
      const url = await getDownloadURL(storageRef);
      resolve(url);
    });
  });
}

const FileUpload = ({ label, value, onChange, accept, uploading }) => (
  <Field label={label}>
    <label className={`flex items-center gap-2 border border-dashed rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${
      uploading ? "border-blue-300 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
    }`}>
      {uploading
        ? <Loader2 size={12} className="text-blue-500 animate-spin flex-shrink-0" />
        : <Camera size={12} className="text-gray-400 flex-shrink-0" />
      }
      <span className={`text-xs truncate ${value ? "text-emerald-600 font-semibold" : uploading ? "text-blue-500" : "text-gray-500"}`}>
        {uploading ? "Uploading..." : value ? "✓ File uploaded" : "Tap to upload"}
      </span>
      <input type="file" accept={accept} className="hidden" disabled={uploading}
        onChange={e => { if (e.target.files[0]) onChange(e.target.files[0]); }}
      />
    </label>
  </Field>
);

const SectionBlock = ({ num, title, children, color = "orange" }) => {
  const colors = {
    orange: "bg-orange-100 text-orange-700",
    blue:   "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    gray:   "bg-gray-100 text-gray-600",
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

export default function StockExitModal({ onClose, onCreated, gateEntries = [], stockEntries = [] }) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    productName: "", qtyDispatched: "", destination: "",
    buyerName: "", buyerPhone: "", buyerGst: "",
    transporterName: "", vehicleNumber: "", driverName: "", driverPhone: "",
    stockEntryRef: "", gateEntryRef: "",
    exitDate: new Date().toISOString().split("T")[0],
    remarks: "", exitPhoto: null, exitVideo: null,
  });

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const [pendingFiles, setPendingFiles] = useState({});

  const handleMediaChange = (key, file) => {
    if (!file) {
      set(key, null);
      setPendingFiles(prev => ({ ...prev, [key]: null }));
      return;
    }
    set(key, URL.createObjectURL(file));
    setPendingFiles(prev => ({ ...prev, [key]: file }));
  };

  const handleSubmit = async () => {
    if (!form.productName)    { setError("Product name is required."); return; }
    if (!form.qtyDispatched)  { setError("Dispatch quantity is required."); return; }
    setSaving(true); setError("");

    try {
      const tempId = `SX-TEMP-${Date.now()}`;
      const folder = `stockmanagement/stockexit/${tempId}`;
      const uploadedUrls = {};

      setUploading(true);
      await Promise.all(
        ["exitPhoto", "exitVideo"].map(async (key) => {
          const file = pendingFiles[key];
          if (!file) return;
          const ext = file.name.split(".").pop();
          try {
            uploadedUrls[key] = await uploadToFirebase(file, `${folder}/${key}.${ext}`);
          } catch (e) {
            console.error(`Failed to upload ${key}`, e);
          }
        })
      );
      setUploading(false);

      const payload = {
        ...form,
        exitPhoto: uploadedUrls.exitPhoto || null,
        exitVideo: uploadedUrls.exitVideo || null,
      };

      await api.post("/api/stock/exits", payload);
      onCreated?.(); onClose();
    } catch (err) {
      setUploading(false);
      setError(err.response?.data?.message || "Failed to save stock exit");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-end sm:items-center justify-center sm:p-3">
      <div className="bg-white w-full sm:max-w-2xl flex flex-col rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[93vh] sm:max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
              <TruckIcon size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">New Stock Exit</h2>
              <p className="text-[10px] text-gray-400">Record goods leaving the warehouse</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer text-gray-400">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">

          {/* Product & Dispatch */}
          <SectionBlock num={1} title="Product & Dispatch Details" color="orange">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Product Name">
                <Input placeholder="Product being dispatched" value={form.productName} onChange={e => set("productName", e.target.value)} />
              </Field>
              <Field label="Qty Dispatched">
                <Input type="number" min="0" placeholder="0" value={form.qtyDispatched} onChange={e => set("qtyDispatched", e.target.value)} />
              </Field>
              <Field label="Exit Date">
                <Input type="date" value={form.exitDate} onChange={e => set("exitDate", e.target.value)} />
              </Field>
              <Field label="Destination">
                <Input placeholder="Delivery destination" value={form.destination} onChange={e => set("destination", e.target.value)} />
              </Field>

              {stockEntries.length > 0 && (
                <Field label="Link Stock Entry">
                  <select value={form.stockEntryRef} onChange={e => set("stockEntryRef", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">— Select stock entry —</option>
                    {stockEntries.map(se => (
                      <option key={se.id} value={se.id}>{se.stockEntryId} — {se.productName || se.invoiceNumber}</option>
                    ))}
                  </select>
                </Field>
              )}
              {gateEntries.length > 0 && (
                <Field label="Link Gate Entry">
                  <select value={form.gateEntryRef} onChange={e => set("gateEntryRef", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">— Select gate entry —</option>
                    {gateEntries.map(ge => (
                      <option key={ge.id} value={ge.id}>{ge.gateEntryId} — {ge.productName || ge.vehicleNumber}</option>
                    ))}
                  </select>
                </Field>
              )}
            </div>
          </SectionBlock>

          {/* Buyer */}
          <SectionBlock num={2} title="Buyer Information" color="blue">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Buyer Name">
                <Input placeholder="Buyer / recipient name" value={form.buyerName} onChange={e => set("buyerName", e.target.value)} />
              </Field>
              <Field label="Buyer Phone">
                <Input placeholder="Contact number" value={form.buyerPhone} onChange={e => set("buyerPhone", e.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Buyer GSTIN">
                  <Input placeholder="15-digit GSTIN" value={form.buyerGst} onChange={e => set("buyerGst", e.target.value)} />
                </Field>
              </div>
            </div>
          </SectionBlock>

          {/* Transport */}
          <SectionBlock num={3} title="Transport Details" color="purple">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Transporter Name">
                <Input placeholder="Transport company / person" value={form.transporterName} onChange={e => set("transporterName", e.target.value)} />
              </Field>
              <Field label="Vehicle Number">
                <Input placeholder="e.g. DL01AB1234" value={form.vehicleNumber} onChange={e => set("vehicleNumber", e.target.value)} />
              </Field>
              <Field label="Driver Name">
                <Input placeholder="Driver's name" value={form.driverName} onChange={e => set("driverName", e.target.value)} />
              </Field>
              <Field label="Driver Phone">
                <Input placeholder="Driver's mobile" value={form.driverPhone} onChange={e => set("driverPhone", e.target.value)} />
              </Field>
            </div>
          </SectionBlock>

          {/* Media */}
          <SectionBlock num={4} title="Media Evidence" color="gray">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FileUpload label="Exit Photo" accept="image/*" value={form.exitPhoto} uploading={uploading} onChange={file => handleMediaChange("exitPhoto", file)} />
                <FileUpload label="Exit Video" accept="video/*" value={form.exitVideo} uploading={uploading} onChange={file => handleMediaChange("exitVideo", file)} />
            </div>
          </SectionBlock>

          <Field label="Remarks">
            <Textarea placeholder="Additional notes..." value={form.remarks} onChange={e => set("remarks", e.target.value)} />
          </Field>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving || uploading}
            className="px-5 py-2 bg-orange-600 text-white text-xs font-semibold rounded-lg hover:bg-orange-700 cursor-pointer disabled:opacity-60 transition-colors flex items-center gap-1.5"
          >
            {uploading ? <><Loader2 size={11} className="animate-spin" /> Uploading...</> : saving ? "Saving..." : "Save Stock Exit"}
          </button>
        </div>
      </div>
    </div>
  );
}
