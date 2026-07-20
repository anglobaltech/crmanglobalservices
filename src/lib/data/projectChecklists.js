// Certification service type definitions
export const SERVICE_TYPES = {
  isi: { label: "ISI", color: "bg-blue-100 text-blue-700 border-blue-200" },
  fmcs: { label: "FMCS", color: "bg-purple-100 text-purple-700 border-purple-200" },
  hallmarking: { label: "Hallmarking", color: "bg-amber-100 text-amber-700 border-amber-200" },
  bis_crs: { label: "BIS CRS", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

// ─── Hallmarking: Stage-based Process (No Test Request stage) ────────────────
export const HALLMARKING_STAGES = [
  {
    id: "stage_hm_id",
    label: "BIS Hallmarking ID Generate",
    icon: "id-card",
    steps: [
      { id: "hm_id_done", label: "BIS Hallmarking ID Generated", type: "step" },
    ],
  },
  {
    id: "stage_hm_application",
    label: "Application File",
    icon: "file-text",
    steps: [
      { id: "hm_app_file_submitted", label: "Application File Submitted", type: "step" },
      { id: "hm_marking_fees_paid", label: "Marking Fees Submitted", type: "step" },
    ],
  },
  {
    id: "stage_hm_audit",
    label: "Audit",
    icon: "search",
    steps: [
      { id: "hm_audit_query_received", label: "Query received by BIS", type: "step" },
      { id: "hm_audit_date_granted", label: "Audit Date Granted", type: "date" },
      { id: "hm_audit_done", label: "Audit Done", type: "step" },
    ],
  },
  {
    id: "stage_hm_grant",
    label: "Grant of License",
    icon: "award",
    steps: [
      { id: "hm_license_granted", label: "Hallmarking License Granted", type: "step" },
    ],
  },
];

// ─── Hallmarking: Required Documents (with description and upload slot) ───────
export const HALLMARKING_REQUIRED_DOCUMENTS = [
  {
    id: "doc_hm_1", label: "GST", type: "file",
    description: "GST registration certificate of the center/business. Required for identity and tax compliance verification by BIS.",
    uploadedBy: "Client side",
  },
  {
    id: "doc_hm_2", label: "Proof of Identity of Signatory (Aadhar Card of Owner)", type: "file",
    description: "Aadhar card of the business owner or authorized signatory. Used as official identity proof for BIS registration.",
    uploadedBy: "Client side",
  },
  {
    id: "doc_hm_3", label: "XRF Detection Letter", type: "file",
    description: "Official letter confirming the presence and working condition of the XRF (X-Ray Fluorescence) machine at the center.",
    uploadedBy: "Client side",
  },
  {
    id: "doc_hm_4", label: "CRM (Certified Reference Material)", type: "file",
    description: "Certificate or record of Certified Reference Material used for XRF machine calibration and accuracy verification.",
    uploadedBy: "Client side or both side",
  },
  {
    id: "doc_hm_5", label: "SRM (Standard Reference Material)", type: "file",
    description: "Certificate or record of Standard Reference Material used alongside CRM for quality assurance of testing equipment.",
    uploadedBy: "Client side or both side",
  },
  {
    id: "doc_hm_6", label: "XRF Calibration Certificate", type: "file",
    description: "Valid calibration certificate from an accredited lab for the XRF machine installed at the hallmarking center.",
    uploadedBy: "Client side",
  },
  {
    id: "doc_hm_7", label: "Rent Agreement / CA Certificate", type: "file",
    description: "Premises document — either a registered rent agreement or a Chartered Accountant certificate confirming the center's address.",
    uploadedBy: "Client side",
  },
  {
    id: "doc_hm_8", label: "Logo of Center", type: "file",
    description: "Official logo/trademark of the hallmarking center, required for BIS registration and license display.",
    uploadedBy: "Both side",
  },
  {
    id: "doc_hm_9", label: "Layout Plan", type: "file",
    description: "Scaled layout/floor plan of the hallmarking center showing equipment placement, work areas, and dimensions.",
    uploadedBy: "My side",
  },
  {
    id: "doc_hm_10", label: "Form V, Agreement between BIS and Center, Indemnity Bond", type: "file",
    description: "Three documents on stamp paper: Form V (application), BIS-Center agreement, and indemnity bond — all duly signed and stamped by the client.",
    uploadedBy: "Three stamp paper — Client side",
  },
  {
    id: "doc_hm_11", label: "ILC (Inter-Laboratory Comparison)", type: "file",
    description: "Inter-Laboratory Comparison report demonstrating the center's testing accuracy against a reference lab as mandated by BIS.",
    uploadedBy: "My side",
  },
  {
    id: "doc_hm_12", label: "Insurance", type: "file",
    description: "Insurance policy document covering the hallmarking center premises and equipment as required by BIS norms.",
    uploadedBy: "Both side",
  },
  {
    id: "doc_hm_13", label: "Location Plan", type: "file",
    description: "Map/location plan showing the geographic location of the hallmarking center relative to nearby landmarks.",
    uploadedBy: "My side",
  },
  {
    id: "doc_hm_14", label: "Quality Manual", type: "file",
    description: "Documented quality manual outlining the standard operating procedures, quality objectives, and processes of the center.",
    uploadedBy: "My side",
  },
  {
    id: "doc_hm_15", label: "List of Employees + Aadhaar Card + Degree of Assaying Master", type: "file",
    description: "Employee list with Aadhaar cards and academic/professional degree certificate of the designated Assaying & Hallmarking Master.",
    uploadedBy: "Client side",
  },
  {
    id: "doc_hm_16", label: "Pollution Certificate", type: "file",
    description: "Valid pollution/NOC certificate from the appropriate state pollution control board for the center's operations.",
    uploadedBy: "Both side",
  },
  {
    id: "doc_hm_17", label: "List of Equipment", type: "file",
    description: "Detailed list of all equipment installed at the center including make, model, and serial numbers (XRF, laser, micro-balance, etc.).",
    uploadedBy: "My side",
  },
  {
    id: "doc_hm_18", label: "Electric Meter No.", type: "text",
    description: "Electricity connection meter number of the hallmarking center premises for address and utility verification.",
    placeholder: "Enter electric meter number...",
    uploadedBy: "Client side",
  },
  {
    id: "doc_hm_19", label: "Area of Center (in sq. ft.)", type: "text",
    description: "Total area of the hallmarking center in square feet, required to verify minimum space compliance as per BIS norms.",
    placeholder: "e.g. 500 sq. ft.",
    uploadedBy: "Client side",
  },
  {
    id: "doc_hm_20", label: "Authorized Signatory Aadhar Card", type: "file",
    description: "Aadhar card of the person authorized to sign BIS-related documents on behalf of the center.",
    uploadedBy: "Client side",
  },
  {
    id: "doc_hm_21", label: "Current Location (Geo-tagged Photo)", type: "file",
    description: "Geo-tagged photograph or Google Maps screenshot showing the current physical location of the hallmarking center.",
    uploadedBy: "Client side",
  },
  {
    id: "doc_hm_22", label: "Calibration Certificate (All Equipment)", type: "file",
    description: "Valid calibration certificates for all testing and weighing equipment at the center (micro-balance, weights, etc.).",
    uploadedBy: "Both side",
  },
  {
    id: "doc_hm_23", label: "Integration of XRF Machine, Laser Machine, Micro Balance", type: "file",
    description: "Integration report or certificate confirming that the XRF machine, laser marking machine, and micro-balance are properly set up and operational.",
    uploadedBy: "Client side",
  },
  {
    id: "doc_hm_24", label: "Pollution Certificate with Hazardous Agreement", type: "file",
    description: "Pollution certificate combined with a hazardous waste disposal agreement as required for centers handling chemical/acid processes.",
    uploadedBy: "Client side",
  },
  {
    id: "doc_hm_25", label: "PT (Proficiency Testing)", type: "file",
    description: "Proficiency Testing report from an accredited provider demonstrating the center's competency in gold assaying.",
    uploadedBy: "Both side",
  },
  {
    id: "doc_hm_26", label: "Security Guard", type: "file",
    description: "Agreement or appointment letter from a licensed security agency for deployment of a security guard at the hallmarking center.",
    uploadedBy: "Client side",
  },
];

// ─── ISI: Required Documents ──────────────────────────────────────────────────
// type: "file" (default) = upload button
// type: "text"           = textarea / text input
// type: "table"          = interactive row table; columns define the table headers
export const ISI_REQUIRED_DOCUMENTS = [
  { id: "doc_isi_1", label: "Premises document / Rent Agreement", type: "file" },
  { id: "doc_isi_2", label: "Copy of GST Registration (If Available)", type: "file" },
  { id: "doc_isi_3", label: "Copy of Partnership Deed / MOA (for Pvt. Ltd.)", type: "file" },
  { id: "doc_isi_4", label: "SSI Certificate / CA Certificate", type: "file" },
  { id: "doc_isi_5", label: "Electricity Bill", type: "file" },
  {
    id: "doc_isi_6", label: "List of Machinery", type: "table",
    columns: ["Machinery", "Make", "Capacity", "Number", "Remark"],
  },
  {
    id: "doc_isi_7", label: "List of Raw Material", type: "table",
    columns: ["Raw Material", "Name of Supplier", "With or Without BIS Certification Mark", "Test Certificate of the Supplier", "How Received Batched / Lots Nature of Package"],
  },
  {
    id: "doc_isi_8", label: "List of Testing Equipment's (With Make)", type: "table",
    columns: ["Test Equipment / Chemicals and Identification Numbers (Where Applicable)", "Laser Count & Range (Where Applicable)", "Valid Calibration (Where Required) Yes/No", "Test Used in with Clause Reference", "Remark (Indicate Number of Equipment)"],
  },
  { id: "doc_isi_9", label: "Unit of production per day, per annum and price", type: "text", placeholder: "e.g.  Per Day: 500 units  |  Per Annum: 1,50,000 units  |  Price: ₹250/unit" },
  { id: "doc_isi_10", label: "Process Flow Chart & Detailed Production Process Description", type: "file" },
  { id: "doc_isi_11", label: "Brand Name to be covered", type: "text", placeholder: "Enter brand name(s)..." },
  { id: "doc_isi_12", label: "Authorized Signatory for BIS with Designation", type: "file" },
  { id: "doc_isi_13", label: "Layout Plan", type: "file" },
  { id: "doc_isi_14", label: "Location Plan", type: "file" },
  { id: "doc_isi_15", label: "Weekly Off", type: "text", placeholder: "e.g. Sunday / Second Saturday & Sunday..." },
  { id: "doc_isi_16", label: "Appointment letter of QCI + Qualification Certificate + ID", type: "file" },
  { id: "doc_isi_17", label: "Letter Head", type: "file" },
  { id: "doc_isi_18", label: "E-mail address and permanent contact number", type: "text", placeholder: "Email: example@company.com\nContact: +91-XXXXXXXXXX" },
  { id: "doc_isi_19", label: "Lab dimension and details", type: "file" },
  { id: "doc_isi_20", label: "Office & Factory Address with City, District, State, Area, PIN", type: "text", placeholder: "Office Address: ...\nFactory Address: ..." },
  { id: "doc_isi_21", label: "Calibration Certificate of testing equipment", type: "file" },
  { id: "doc_isi_22", label: "Raw material test certificate with relevant IS", type: "file" },
  { id: "doc_isi_23", label: "Factory Test Report", type: "file" },
  { id: "doc_isi_24", label: "Designation of all members of top management", type: "file" },
  { id: "doc_isi_25", label: "Correspondence Address, scale and sector", type: "text", placeholder: "Correspondence Address:\nScale:\nSector:" },
];

// ─── ISI: Stage-based Process Checklist ─────────────────────────────────────
// type: "step" = single toggle, "date" = toggle + date field
export const ISI_STAGES = [
  {
    id: "stage_bis_id",
    label: "BIS ISI ID Generate",
    icon: "id-card",
    steps: [
      { id: "bis_id_done", label: "BIS ID ISI Generated", type: "step" },
    ],
  },
  {
    id: "stage_test_request",
    label: "Test Request",
    icon: "flask",
    steps: [
      { id: "test_sample_sent_mfr", label: "Sample sent by Manufacturer", type: "step" },
      { id: "test_sample_sent_lab", label: "Sample sent to Lab", type: "step" },
      { id: "test_report_received", label: "Test Report of Sample", type: "step" },
    ],
  },
  {
    id: "stage_application",
    label: "Application File",
    icon: "file-text",
    steps: [
      { id: "app_file_submitted", label: "Application File Submitted", type: "step" },
      { id: "marking_fees_paid", label: "Marking Fees Submitted", type: "step" },
    ],
  },
  {
    id: "stage_audit",
    label: "Audit",
    icon: "search",
    steps: [
      { id: "audit_query_received", label: "Query received by BIS", type: "step" },
      { id: "audit_date_granted", label: "Audit Date Granted", type: "date" },
      { id: "audit_done", label: "Audit Done", type: "step" },
    ],
  },
  {
    id: "stage_grant",
    label: "Grant of License",
    icon: "award",
    steps: [
      { id: "license_granted", label: "License Granted", type: "step" },
    ],
  },
];

// ─── BIS CRS: Stage-based Process (same as ISI but WITHOUT Audit stage) ──────
export const BIS_CRS_STAGES = [
  {
    id: "stage_bis_id",
    label: "BIS CRS ID Generate",
    icon: "id-card",
    steps: [
      { id: "crs_bis_id_done", label: "BIS CRS ID Generated", type: "step" },
    ],
  },
  {
    id: "stage_test_request",
    label: "Test Request",
    icon: "flask",
    steps: [
      { id: "crs_test_sample_sent_mfr", label: "Sample sent by Manufacturer", type: "step" },
      { id: "crs_test_sample_sent_lab", label: "Sample sent to Lab", type: "step" },
      { id: "crs_test_report_received", label: "Test Report of Sample", type: "step" },
    ],
  },
  {
    id: "stage_application",
    label: "Application File",
    icon: "file-text",
    steps: [
      { id: "crs_app_file_submitted", label: "Application File Submitted", type: "step" },
      { id: "crs_marking_fees_paid", label: "Marking Fees Submitted", type: "step" },
    ],
  },
  {
    id: "stage_grant",
    label: "Grant of License",
    icon: "award",
    steps: [
      { id: "crs_license_granted", label: "License Granted", type: "step" },
    ],
  },
];

// ─── BIS CRS: Required Documents (from checklist → now as upload slots) ───────
export const BIS_CRS_REQUIRED_DOCUMENTS = [
  { id: "doc_crs_1", label: "Company Email", section: "ID Creation" },
  { id: "doc_crs_2", label: "Domain (For Foreign manufacturer)", section: "ID Creation" },
  { id: "doc_crs_3", label: "GST / MSME", section: "ID Creation" },
  { id: "doc_crs_4", label: "ISO certificate with product specification", section: "ID Creation" },
  { id: "doc_crs_5", label: "Business License", section: "ID Creation" },
  { id: "doc_crs_6", label: "Trademark License", section: "ID Creation" },
  { id: "doc_crs_7", label: "Company representative name, Contact no., Email ID, Govt. ID proof", section: "ID Creation" },
  { id: "doc_crs_8", label: "Trademark (Brand Logo)", section: "Registration" },
  { id: "doc_crs_9", label: "Product specification including Model name", section: "Registration" },
  { id: "doc_crs_10", label: "Registration certificate (For registered brands)", section: "Registration" },
  { id: "doc_crs_11", label: "Authorization letter/agreement from brand owner (If owned by others)", section: "Registration" },
  { id: "doc_crs_12", label: "Copy of TM application (For un-registered brands, if applied for)", section: "Registration" },
  { id: "doc_crs_13", label: "Authorization letter/agreement from proprietor (For un-registered, if owned by others)", section: "Registration" },
  { id: "doc_crs_14", label: "Nomination Form sealed and signed", section: "AIR & Affidavit" },
  { id: "doc_crs_15", label: "Authorized Indian representative Govt. ID proof, Contact No., Email ID", section: "AIR & Affidavit" },
];

// ─── Other service types (flat checklist, unchanged) ───────────────────────
export const PROJECT_CHECKLISTS = {
  fmcs: [
    { id: "fmcs_1", label: "Government document addressing factory" },
    { id: "fmcs_2", label: "Authorization letter for BIS Signatory" },
    { id: "fmcs_3", label: "Authorization letter for Indian representative with Aadhar Card" },
    { id: "fmcs_4", label: "List of machinery" },
    { id: "fmcs_5", label: "List of testing equipment" },
    { id: "fmcs_6", label: "List of raw material" },
    { id: "fmcs_7", label: "Process flow chart" },
    { id: "fmcs_8", label: "Layout plan" },
    { id: "fmcs_9", label: "Location Plan" },
    { id: "fmcs_10", label: "Appointment letter of Quality in charge" },
    { id: "fmcs_11", label: "Payment receipt in USD (except Nepal country)" },
    { id: "fmcs_12", label: "Raw material certificate" },
    { id: "fmcs_13", label: "Factory test report" },
    { id: "fmcs_14", label: "English translator person present at the time of audit" },
    { id: "fmcs_15", label: "Nomination" },
    { id: "fmcs_16", label: "Agreement" },
    { id: "fmcs_17", label: "Letter head of company" },
  ],

  hallmarking: [
    { id: "hm_1", label: "GST", doneBy: "Client side" },
    { id: "hm_2", label: "Proof of identity of signatory (Aadhar card of Owner)", doneBy: "Aadhar card of Owner" },
    { id: "hm_3", label: "XRF detection Letter", doneBy: "Client side" },
    { id: "hm_4", label: "CRM", doneBy: "Client side or both side" },
    { id: "hm_5", label: "SRM", doneBy: "Client side or both side" },
    { id: "hm_6", label: "XRF calibration certificate", doneBy: "Client side" },
    { id: "hm_7", label: "Rent agreement / CA certificate", doneBy: "Client side" },
    { id: "hm_8", label: "Logo of center", doneBy: "Both side" },
    { id: "hm_9", label: "Layout plan", doneBy: "My side" },
    { id: "hm_10", label: "Form V, agreement between BIS and Center, indemnity bond", doneBy: "Three stamp paper client side" },
    { id: "hm_11", label: "ILC", doneBy: "My side" },
    { id: "hm_12", label: "Insurance", doneBy: "Both side" },
    { id: "hm_13", label: "Location Plan", doneBy: "My side" },
    { id: "hm_14", label: "Quality manual", doneBy: "My side" },
    { id: "hm_15", label: "List of employees + Aadhaar card + degree of assaying master", doneBy: "Client side" },
    { id: "hm_16", label: "Pollution certificate", doneBy: "Both side" },
    { id: "hm_17", label: "List of equipment", doneBy: "My side" },
    { id: "hm_18", label: "Electric meter no", doneBy: "Client side" },
    { id: "hm_19", label: "Area of center", doneBy: "Client side" },
    { id: "hm_20", label: "Authorize signatory Aadhar card", doneBy: "Client side" },
    { id: "hm_21", label: "Current location", doneBy: "Client side" },
    { id: "hm_22", label: "Calibration certificate", doneBy: "Both side" },
    { id: "hm_23", label: "Integration of XRF Machine, Laser Machine, Micro balance", doneBy: "Client side" },
    { id: "hm_24", label: "Pollution certificate with hazardous agreement", doneBy: "Client Side" },
    { id: "hm_25", label: "PT", doneBy: "Both side" },
    { id: "hm_26", label: "Security Guard", doneBy: "Client side" },
  ],

  bis_crs: [
    { id: "crs_1", label: "Company Email", section: "ID Creation" },
    { id: "crs_2", label: "Domain (For Foreign manufacturer)", section: "ID Creation" },
    { id: "crs_3", label: "GST / MSME", section: "ID Creation" },
    { id: "crs_4", label: "ISO certificate with product specification", section: "ID Creation" },
    { id: "crs_5", label: "Business License", section: "ID Creation" },
    { id: "crs_6", label: "Trademark License", section: "ID Creation" },
    { id: "crs_7", label: "Company representative name, Contact no., Email ID, Govt. ID proof", section: "ID Creation" },
    { id: "crs_8", label: "Trademark (Brand Logo)", section: "Registration" },
    { id: "crs_9", label: "Product specification including Model name", section: "Registration" },
    { id: "crs_10", label: "Registration certificate (For registered brands)", section: "Registration" },
    { id: "crs_11", label: "Authorization letter/agreement from brand owner (If owned by others)", section: "Registration" },
    { id: "crs_12", label: "Copy of TM application (For un-registered brands, if applied for)", section: "Registration" },
    { id: "crs_13", label: "Authorization letter/agreement from proprietor (For un-registered, if owned by others)", section: "Registration" },
    { id: "crs_14", label: "Nomination Form sealed and signed", section: "AIR & Affidavit" },
    { id: "crs_15", label: "Authorized Indian representative Govt. ID proof, Contact No., Email ID", section: "AIR & Affidavit" },
  ],
};
