"use client";
import { useState, useEffect } from "react";
import { X, ClipboardList, Truck, CheckCircle2, XCircle, Upload, FileText, AlertCircle, Camera, Video, Eye } from "lucide-react";
import api from "@/services/api";

const YesNo = ({ value, onChange }) => (
  <div className="flex gap-2 mt-1">
    {[true, false].map((v) => (
      <button
        key={String(v)}
        type="button"
        onClick={() => onChange(value === v ? null : v)}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
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

const Field = ({ label, children, required, hint }) => (
  <div>
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-[9px] text-gray-400 mt-0.5">{hint}</p>}
  </div>
);

const Input = ({ highlight, ...props }) => (
  <input
    {...props}
    className={`w-full border rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300 transition-colors ${
      highlight
        ? "border-blue-300 bg-blue-50/40 focus:ring-blue-400"
        : "border-gray-200"
    }`}
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    rows={2}
    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300 resize-none"
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

const FileUpload = ({ label, value, onChange, accept, hint, fileName }) => (
  <div>
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">{label}</label>
    <label className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-2.5 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
      <Upload size={12} className="text-gray-400 flex-shrink-0" />
      <span className={`text-xs truncate ${value ? "text-emerald-600 font-semibold" : "text-gray-500"}`}>
        {value ? fileName || "✓ File selected" : "Tap to upload"}
      </span>
      <input type="file" accept={accept} capture="environment" className="hidden"
        onChange={async (e) => {
          if (e.target.files[0]) onChange(await fileToBase64(e.target.files[0]), e.target.files[0].name);
        }}
      />
    </label>
    {hint && <p className="text-[9px] text-gray-400 mt-0.5">{hint}</p>}
  </div>
);

const MediaUpload = ({ label, value, onChange, accept, icon: Icon, hint }) => {
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
        <label className="flex items-center gap-2.5 px-3 py-2.5 border border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group">
          <div className={`w-7 h-7 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
            <Icon size={13} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-600 leading-tight">{label}</p>
            {hint && <p className="text-[9px] text-gray-400 leading-tight mt-0.5">{hint}</p>}
          </div>
          <span className="ml-auto text-[9px] text-gray-400 font-medium flex-shrink-0">Upload</span>
          <input type="file" accept={accept} capture="environment" className="hidden"
            onChange={async (e) => {
              if (e.target.files[0]) onChange(await fileToBase64(e.target.files[0]));
            }}
          />
        </label>
      )}
    </div>
  );
};

const SectionTitle = ({ num, children, badge }) => (
  <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mb-3">
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold flex-shrink-0">{num}</span>
    {children}
    {badge && <span className="ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">{badge}</span>}
  </p>
);

// Auto-filled field pill
const AutoFillPill = ({ text }) => (
  <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full mb-1">
    <FileText size={8} /> Auto-filled from above
  </span>
);


export default function GateEntryModal({ onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    invoiceDocNumber: "",
    invoiceDocPresent: null,
    invoiceFilledNumber: "",    
    ewayBillNumber: "",
    ewayBillPresent: null,
    ewayFilledNumber: "",        
    companyInvoiceNumber: "",
    companyEwayNumber: "",
    vehicleNumber: "",
    invoiceMatchesEway: null,
    vehicleNumberMatch: null,
    fssaiLicenseApplicable: null,
    fssaiFssaiNumber: "",
    fssaiParty: "",
    itemBatchNumber: "",
    coaAvailable: null,
    coaDetails: "",
    coaFile: null,
    coaFileName: "",
    productName: "",
    packagingDetails: "",
    importedBy: "",
    importedByOther: "",
    productMatchesInvoice: null,
    productMatchesEway: null,
    gstNumberSeller: "",
    gstNumberBuyer: "",
    transporterReceiptMatch: null,
    transporterName: "",
    transporterGst: "",
    driverName: "",
    driverPhone: "",
    driverPhoto: null,
    gateOpeningVideo: null,
    productVideo: null,
    productPhoto: null,

    entryDate: new Date().toISOString().split("T")[0],
    remarks: "",
  });

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  useEffect(() => {
    setForm(f => ({
      ...f,
      invoiceFilledNumber: f.invoiceDocNumber,
      companyInvoiceNumber: f.invoiceDocNumber,
    }));
  }, [form.invoiceDocNumber]);

  useEffect(() => {
    setForm(f => ({
      ...f,
      ewayFilledNumber: f.ewayBillNumber,
      companyEwayNumber: f.ewayBillNumber,
    }));
  }, [form.ewayBillNumber]);

  const handleSubmit = async () => {
    if (!form.productName) { setError("Product name is required."); return; }
    setSaving(true); setError("");
    try {
      const payload = {
        invoiceDocNumber: form.invoiceFilledNumber || form.invoiceDocNumber || null,
        invoiceDocPresent: form.invoiceDocPresent,
        ewayBillNumber: form.ewayFilledNumber || form.ewayBillNumber || null,
        ewayBillPresent: form.ewayBillPresent,
        companyInvoiceDetails: form.companyInvoiceNumber || null,
        ewayBillDetails: form.companyEwayNumber || null,
        vehicleNumber: form.vehicleNumber || null,
        invoiceMatchesEway: form.invoiceMatchesEway,
        vehicleNumberMatch: form.vehicleNumberMatch,
        fssaiLicenseApplicable: form.fssaiLicenseApplicable,
        fssaiFssaiNumber: form.fssaiFssaiNumber || null,
        fssaiParty: form.fssaiParty || null,
        itemBatchNumber: form.itemBatchNumber || null,
        coaAvailable: form.coaAvailable,
        coaDetails: form.coaDetails || null,
        coaFile: form.coaFile || null,
        productName: form.productName,
        packagingDetails: form.packagingDetails || null,
        importedBy: form.importedBy === "Others" ? (form.importedByOther || "Others") : (form.importedBy || null),
        productMatchesInvoice: form.productMatchesInvoice,
        productMatchesEway: form.productMatchesEway,
        gstNumberSeller: form.gstNumberSeller || null,
        gstNumberBuyer: form.gstNumberBuyer || null,
        transporterReceiptMatch: form.transporterReceiptMatch,
        transporterName: form.transporterName || null,
        transporterGst: form.transporterGst || null,
        driverName: form.driverName || null,
        driverPhone: form.driverPhone || null,
        driverPhoto: form.driverPhoto || null,
        gateOpeningVideo: form.gateOpeningVideo || null,
        productVideo: form.productVideo || null,
        productPhoto: form.productPhoto || null,
        remarks: form.remarks || null,
        entryDate: form.entryDate,
      };
      await api.post("/api/stock/gate-entries", payload);
      onCreated?.(); onClose();
    } catch (err) { setError(err.response?.data?.message || "Failed to save gate entry"); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-end sm:items-center justify-center sm:p-3">
      <div className="bg-white w-full sm:max-w-2xl flex flex-col rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[93vh] sm:max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <ClipboardList size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">New Gate Entry</h2>
              <p className="text-[10px] text-gray-400">{step === 1 ? "Step 1 of 2 — Checklist" : "Step 2 of 2 — Transport"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer text-gray-400">
            <X size={16} />
          </button>
        </div>

        {/* Step tabs */}
        <div className="flex border-b border-gray-100 flex-shrink-0">
          {[
            { n: 1, label: "Checklist", icon: ClipboardList },
            { n: 2, label: "Transport", icon: Truck },
          ].map(({ n, label, icon: Icon }) => (
            <button key={n} onClick={() => setStep(n)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                step === n ? "border-blue-600 text-blue-600 bg-blue-50" : "border-transparent text-gray-400"
              }`}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {step === 1 && (
            <>
              <Field label="Entry Date">
                <Input type="date" value={form.entryDate} onChange={e => set("entryDate", e.target.value)} />
              </Field>

              <div className="border border-gray-100 rounded-xl p-3.5 space-y-2.5">
                <SectionTitle num={1}>Invoice / Document</SectionTitle>

                <div>
                  <p className="text-[10px] text-gray-500 font-semibold mb-1">Invoice / Document Present?</p>
                  <YesNo value={form.invoiceDocPresent} onChange={v => set("invoiceDocPresent", v)} />
                </div>

                {/* Number input shown only when Present = Yes */}
                {form.invoiceDocPresent === true && (
                  <div className="p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-lg space-y-1.5">
                    <Field label="Invoice / Document Number">
                      <Input
                        placeholder="e.g. INV-2024-001"
                        value={form.invoiceDocNumber}
                        onChange={e => set("invoiceDocNumber", e.target.value)}
                      />
                    </Field>
                  </div>
                )}
              </div>

              <div className="border border-gray-100 rounded-xl p-3.5 space-y-2.5">
                <SectionTitle num={2}>E-Way Bill</SectionTitle>

                <div>
                  <p className="text-[10px] text-gray-500 font-semibold mb-1">E-Way Bill Present?</p>
                  <YesNo value={form.ewayBillPresent} onChange={v => set("ewayBillPresent", v)} />
                </div>

                {/* Number input shown only when Present = Yes */}
                {form.ewayBillPresent === true && (
                  <div className="p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-lg space-y-1.5">
                    <Field label="E-Way Bill Number">
                      <Input
                        placeholder="12-digit e-way bill number"
                        value={form.ewayBillNumber}
                        onChange={e => set("ewayBillNumber", e.target.value)}
                      />
                    </Field>
                  </div>
                )}
              </div>

              <div className="border border-gray-100 rounded-xl p-3.5 space-y-2.5">
                <SectionTitle num={3} badge="Verification">
                  Invoice &amp; E-Way Bill Comparison
                </SectionTitle>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Field label="Invoice Number (for comparison)" hint="Auto-filled from section 1">
                    <Input
                      highlight={!!form.invoiceDocNumber}
                      placeholder="Invoice number"
                      value={form.companyInvoiceNumber}
                      onChange={e => set("companyInvoiceNumber", e.target.value)}
                    />
                  </Field>

                  <Field label="E-Way Bill Number (for comparison)" hint="Auto-filled from section 2">
                    <Input
                      highlight={!!form.ewayBillNumber}
                      placeholder="E-way bill number"
                      value={form.companyEwayNumber}
                      onChange={e => set("companyEwayNumber", e.target.value)}
                    />
                  </Field>
                </div>

                <Field label="Vehicle Number">
                  <Input
                    placeholder="e.g. UP32 AB 1234"
                    value={form.vehicleNumber}
                    onChange={e => set("vehicleNumber", e.target.value)}
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <p className="text-[10px] text-gray-500 font-semibold mb-1">
                      Invoice matches E-Way Bill?
                    </p>
                    <YesNo value={form.invoiceMatchesEway} onChange={v => set("invoiceMatchesEway", v)} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-semibold mb-1">
                      Vehicle number matches?
                    </p>
                    <YesNo value={form.vehicleNumberMatch} onChange={v => set("vehicleNumberMatch", v)} />
                  </div>
                </div>

                {/* Warning if mismatch */}
                {(form.invoiceMatchesEway === false || form.vehicleNumberMatch === false) && (
                  <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle size={12} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-700 font-medium">
                      Mismatch detected. Please verify documents before proceeding.
                    </p>
                  </div>
                )}
              </div>

              <div className="border border-gray-100 rounded-xl p-3.5 space-y-2.5">
                <SectionTitle num={4}>FSSAI License</SectionTitle>
                <div>
                  <p className="text-[10px] text-gray-500 font-semibold mb-1">FSSAI License Applicable?</p>
                  <YesNo value={form.fssaiLicenseApplicable} onChange={v => set("fssaiLicenseApplicable", v)} />
                </div>
                {form.fssaiLicenseApplicable === true && (
                  <div className="space-y-2 p-2.5 bg-gray-50 rounded-lg">
                    <Field label="FSSAI License Number">
                      <Input placeholder="14-digit FSSAI number" value={form.fssaiFssaiNumber} onChange={e => set("fssaiFssaiNumber", e.target.value)} />
                    </Field>
                    <Field label="Seller / Buyer Name">
                      <Input placeholder="Name on FSSAI license" value={form.fssaiParty} onChange={e => set("fssaiParty", e.target.value)} />
                    </Field>
                  </div>
                )}
              </div>

              <div className="border border-gray-100 rounded-xl p-3.5 space-y-2.5">
                <SectionTitle num={5}>Item Batch Number &amp; COA</SectionTitle>

                <Field label="Item Batch Number">
                  <Input placeholder="e.g. BATCH-2024-001" value={form.itemBatchNumber} onChange={e => set("itemBatchNumber", e.target.value)} />
                </Field>

                <div>
                  <p className="text-[10px] text-gray-500 font-semibold mb-1">COA (Certificate of Analysis) Available?</p>
                  <YesNo value={form.coaAvailable} onChange={v => set("coaAvailable", v)} />
                </div>

                {form.coaAvailable === true && (
                  <div className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-lg space-y-2.5">
                    <FileUpload
                      label="Upload COA Document"
                      value={form.coaFile}
                      fileName={form.coaFileName}
                      onChange={(v, name) => {
                        set("coaFile", v);
                        set("coaFileName", name);
                      }}
                      accept="image/*,application/pdf"
                      hint="Upload COA certificate (image or PDF)"
                    />
                  </div>
                )}
              </div>

              <div className="border border-gray-100 rounded-xl p-3.5 space-y-2.5">
                <SectionTitle num={6}>Product Name &amp; Packaging</SectionTitle>
                <Field label="Product Name" required>
                  <Input placeholder="Product name as per invoice" value={form.productName} onChange={e => set("productName", e.target.value)} />
                </Field>
                <Field label="Packaging Details">
                  <Input placeholder="e.g. 50kg bags, 200 units" value={form.packagingDetails} onChange={e => set("packagingDetails", e.target.value)} />
                </Field>

                {/* Imported By */}
                <Field label="Imported By">
                  <Input
                    placeholder="Importer name / company name"
                    value={form.importedByOther}
                    onChange={e => set("importedByOther", e.target.value)}
                  />
                </Field>


                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-gray-500 font-semibold mb-1">Matches Invoice?</p>
                    <YesNo value={form.productMatchesInvoice} onChange={v => set("productMatchesInvoice", v)} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-semibold mb-1">Matches E-Way?</p>
                    <YesNo value={form.productMatchesEway} onChange={v => set("productMatchesEway", v)} />
                  </div>
                </div>
              </div>

              <div className="border border-gray-100 rounded-xl p-3.5 space-y-2.5">
                <SectionTitle num={7}>GST Numbers</SectionTitle>
                <Field label="GST No. of Seller">
                  <Input placeholder="15-digit GSTIN" value={form.gstNumberSeller} onChange={e => set("gstNumberSeller", e.target.value)} />
                </Field>
                <Field label="GST No. of Buyer">
                  <Input placeholder="15-digit GSTIN" value={form.gstNumberBuyer} onChange={e => set("gstNumberBuyer", e.target.value)} />
                </Field>
              </div>

              <div className="border border-gray-100 rounded-xl p-3.5 space-y-2.5">
                <SectionTitle num={8}>Transporter Receipt Verification</SectionTitle>
                <p className="text-[10px] text-gray-400 -mt-2">Does transporter receipt / bill match invoice &amp; e-way bill?</p>
                <YesNo value={form.transporterReceiptMatch} onChange={v => set("transporterReceiptMatch", v)} />
              </div>

              <Field label="Remarks">
                <Textarea placeholder="Additional notes..." value={form.remarks} onChange={e => set("remarks", e.target.value)} />
              </Field>
            </>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
                  <Truck size={13} /> Transporter &amp; Driver Information
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Transporter Name">
                  <Input placeholder="Company/person name" value={form.transporterName} onChange={e => set("transporterName", e.target.value)} />
                </Field>
                <Field label="Transporter GST Number">
                  <Input placeholder="GSTIN of transporter" value={form.transporterGst} onChange={e => set("transporterGst", e.target.value)} />
                </Field>
                <Field label="Driver Name">
                  <Input placeholder="Driver's full name" value={form.driverName} onChange={e => set("driverName", e.target.value)} />
                </Field>
                <Field label="Driver Phone">
                  <Input placeholder="Driver mobile number" value={form.driverPhone} onChange={e => set("driverPhone", e.target.value)} />
                </Field>
              </div>

              {/* Media Evidence — ordered: driver photo → gate video → product photo → product video */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Camera size={11} className="text-gray-400" /> Media Evidence
                  <span className="text-gray-300 font-normal normal-case tracking-normal">· optional</span>
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <MediaUpload
                    label="Photo of Driver"
                    icon={Camera}
                    value={form.driverPhoto}
                    onChange={v => set("driverPhoto", v)}
                    accept="image/*"
                    hint="Driver's face photo"
                  />
                  <MediaUpload
                    label="Video of Gate Opening"
                    icon={Video}
                    value={form.gateOpeningVideo}
                    onChange={v => set("gateOpeningVideo", v)}
                    accept="video/*"
                    hint="Gate entry recording"
                  />
                  <MediaUpload
                    label="Photo of Product"
                    icon={Camera}
                    value={form.productPhoto}
                    onChange={v => set("productPhoto", v)}
                    accept="image/*"
                    hint="Product condition photo"
                  />
                  <MediaUpload
                    label="Video of Product"
                    icon={Video}
                    value={form.productVideo}
                    onChange={v => set("productVideo", v)}
                    accept="video/*"
                    hint="Product unboxing/check"
                  />
                </div>
              </div>
            </div>
          )}

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2"><AlertCircle size={12} className="flex-shrink-0 mt-0.5" />{error}</div>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={step === 1 ? onClose : () => setStep(1)}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            {step === 1 ? "Cancel" : "← Back"}
          </button>
          {step === 1 ? (
            <button onClick={() => setStep(2)}
              className="px-5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Next: Transport Details →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving}
              className="px-5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Gate Entry "}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
