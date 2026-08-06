"use client";
import { useState } from "react";
import { X, TruckIcon, Camera, Video, Upload, CheckCircle2, XCircle } from "lucide-react";
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

import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Loader2 } from "lucide-react";

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

const YesNo = ({ value, onChange }) => (
  <div className="flex gap-2 mt-1">
    {[true, false].map((v) => (
      <button
        key={String(v)}
        type="button"
        onClick={() => onChange(value === v ? null : v)}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
          value === v
            ? v
              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
              : "bg-red-500 text-white border-red-500 shadow-sm"
            : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
        }`}
      >
        {v ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
        {v ? "Yes" : "No"}
      </button>
    ))}
  </div>
);

const MediaUpload = ({ label, value, onChange, accept, icon: Icon, hint, uploading }) => {
  const isVideo = accept?.includes("video");
  const iconBg = isVideo ? "bg-purple-50 text-purple-500" : "bg-blue-50 text-blue-500";
  return (
    <div>
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-black shadow-sm">
          <div className="flex items-center justify-between px-2 py-1 bg-gray-900">
            <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">{label}</span>
            <button type="button" onClick={() => onChange(null)}
              className="w-5 h-5 bg-white/10 hover:bg-red-500 rounded-full flex items-center justify-center cursor-pointer transition-colors">
              <X size={9} className="text-white" />
            </button>
          </div>
          {isVideo
            ? <video src={value} controls playsInline className="w-full max-h-24 object-contain" />
            : <img src={value} alt={label} className="w-full max-h-24 object-cover" />
          }
        </div>
      ) : (
        <div className="border border-dashed border-gray-200 rounded-xl p-2.5 hover:border-blue-300 bg-white transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-7 h-7 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Icon size={13} />}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-600 leading-tight">{label}</p>
              {hint && <p className="text-[9px] text-gray-400 leading-tight mt-0.5">{uploading ? "Uploading to storage..." : hint}</p>}
            </div>
          </div>
          {!uploading && (
            <div className="flex gap-2">
              <label className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
                <Camera size={11} className="text-gray-500" />
                <span className="text-[9px] font-semibold text-gray-600">Camera</span>
                <input type="file" accept={accept} capture="environment" className="hidden"
                  onChange={e => { if (e.target.files[0]) onChange(e.target.files[0]); }}
                />
              </label>
              <label className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
                <Upload size={11} className="text-gray-500" />
                <span className="text-[9px] font-semibold text-gray-600">Storage</span>
                <input type="file" accept={accept} className="hidden"
                  onChange={e => { if (e.target.files[0]) onChange(e.target.files[0]); }}
                />
              </label>
            </div>
          )}
          {uploading && (
            <div className="flex items-center justify-center py-2">
              <Loader2 size={14} className="animate-spin text-blue-500 mr-2" />
              <span className="text-[10px] text-blue-500 font-semibold">Uploading to Firebase...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SectionBlock = ({ num, title, children, color = "orange" }) => {
  const colors = {
    orange: "bg-orange-100 text-orange-700",
    blue:   "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    gray:   "bg-gray-100 text-gray-600",
    emerald: "bg-emerald-100 text-emerald-700",
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
    // Buyer Details
    buyerName: "", buyerCompanyName: "", buyerPhone: "", buyerGst: "", buyerFssaiNumber: "",
    // Invoice/Document
    invoiceDocNumber: "", ewayBillApplicable: null, ewayBillNumber: "",
    // Product Details
    productName: "", batchNumber: "", qtyDispatched: "", packagingType: "", totalValue: "",
    // References & Destination
    destination: "", stockEntryRef: "", gateEntryRef: "",
    // Transport Mode
    transportMode: "transporter", transporterName: "", vehicleNumber: "", driverName: "", driverPhone: "", driverId: "",
    exitDate: new Date().toISOString().split("T")[0], remarks: "",
    // Media Evidence
    vehiclePhoto: null, itemPhoto: null, itemVideo: null,
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
        ["vehiclePhoto", "itemPhoto", "itemVideo"].map(async (key) => {
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
        vehiclePhoto: uploadedUrls.vehiclePhoto || null,
        itemPhoto: uploadedUrls.itemPhoto || null,
        itemVideo: uploadedUrls.itemVideo || null,
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

          {/* Buyer Details */}
          <SectionBlock num={1} title="Buyer Details" color="blue">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Buyer Name">
                <Input placeholder="Buyer name" value={form.buyerName} onChange={e => set("buyerName", e.target.value)} />
              </Field>
              <Field label="Company Name">
                <Input placeholder="Company name" value={form.buyerCompanyName} onChange={e => set("buyerCompanyName", e.target.value)} />
              </Field>
              <Field label="Buyer Phone">
                <Input placeholder="Contact number" value={form.buyerPhone} onChange={e => set("buyerPhone", e.target.value)} />
              </Field>
              <Field label="Buyer GSTIN">
                <Input placeholder="15-digit GSTIN" value={form.buyerGst} onChange={e => set("buyerGst", e.target.value)} />
              </Field>
              <Field label="FSSAI No">
                <Input placeholder="FSSAI License number" value={form.buyerFssaiNumber} onChange={e => set("buyerFssaiNumber", e.target.value)} />
              </Field>
            </div>
          </SectionBlock>

          {/* Invoice/Document Details */}
          <SectionBlock num={2} title="Invoice & Document Details" color="emerald">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Invoice / Document No">
                <Input placeholder="Invoice/Doc number" value={form.invoiceDocNumber} onChange={e => set("invoiceDocNumber", e.target.value)} />
              </Field>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">E-Way Bill Applicable?</p>
                <YesNo value={form.ewayBillApplicable} onChange={v => set("ewayBillApplicable", v)} />
              </div>
              {form.ewayBillApplicable === true && (
                <div className="sm:col-span-2 p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                  <Field label="E-Way Bill Number">
                    <Input placeholder="E-way bill number" value={form.ewayBillNumber} onChange={e => set("ewayBillNumber", e.target.value)} />
                  </Field>
                </div>
              )}
            </div>
          </SectionBlock>

          {/* Product Details */}
          <SectionBlock num={3} title="Product Details" color="orange">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Name of Product" required>
                <Input placeholder="Product name" value={form.productName} onChange={e => set("productName", e.target.value)} />
              </Field>
              <Field label="Lot No / Batch No">
                <Input placeholder="e.g. BATCH-001" value={form.batchNumber} onChange={e => set("batchNumber", e.target.value)} />
              </Field>
              <Field label="Quantity Dispatched" required>
                <Input type="number" min="0" placeholder="0" value={form.qtyDispatched} onChange={e => set("qtyDispatched", e.target.value)} />
              </Field>
              <Field label="Type of Packaging">
                <Input placeholder="e.g. 50kg bags, Box" value={form.packagingType} onChange={e => set("packagingType", e.target.value)} />
              </Field>
              <Field label="Total Value of Goods">
                <Input type="number" min="0" placeholder="0.00" value={form.totalValue} onChange={e => set("totalValue", e.target.value)} />
              </Field>
              <Field label="Exit Date">
                <Input type="date" value={form.exitDate} onChange={e => set("exitDate", e.target.value)} />
              </Field>
            </div>
          </SectionBlock>

          {/* Transport Mode & Details */}
          <SectionBlock num={4} title="Transport Mode & Details" color="purple">
            <div className="mb-3">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Mode of Transport</p>
              <div className="flex gap-2">
                {["buyer self", "transporter"].map(mode => (
                  <button key={mode} type="button" onClick={() => set("transportMode", mode)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border capitalize transition-colors ${
                      form.transportMode === mode ? "bg-purple-600 text-white border-purple-600" : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            
            {form.transportMode === "transporter" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
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
                <Field label="Driver ID">
                  <Input placeholder="Driver ID / License number" value={form.driverId} onChange={e => set("driverId", e.target.value)} />
                </Field>
              </div>
            )}
          </SectionBlock>

          {/* Media Evidence */}
          <SectionBlock num={5} title="Media Evidence" color="gray">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {form.transportMode === "transporter" && (
                <MediaUpload label="Photo of Vehicle with Driver" icon={Camera} accept="image/*" value={form.vehiclePhoto} uploading={uploading} onChange={file => handleMediaChange("vehiclePhoto", file)} />
              )}
              <MediaUpload label="Photo of Item" icon={Camera} accept="image/*" value={form.itemPhoto} uploading={uploading} onChange={file => handleMediaChange("itemPhoto", file)} />
              <div className="sm:col-span-2">
                <MediaUpload label="Video of Item" icon={Video} accept="video/*" value={form.itemVideo} uploading={uploading} onChange={file => handleMediaChange("itemVideo", file)} />
              </div>
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
