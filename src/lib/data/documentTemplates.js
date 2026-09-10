/**
 * Document Templates for CRM AN GLOBAL SERVICES
 *
 * Each template has:
 *  - id: unique key
 *  - name: display name
 *  - serviceType: isi | fmcs | hallmarking | bis_crs
 *  - fields: array of dynamic (fillable) field definitions
 *  - renderTemplate(fields): function that returns the document HTML/structure
 *
 * Fields types: "text" | "date" | "number" | "select"
 */

export const DOCUMENT_TEMPLATES = [
  // ─────────────────────────────────────────────
  // ISI TEMPLATES
  // ─────────────────────────────────────────────
  {
    id: "isi_marking_fee_acceptance",
    name: "Acceptance of Rate of Marking Fee",
    serviceType: "isi",
    fields: [
      { id: "applicationRef",   label: "Application Reference No.", type: "text",   placeholder: "e.g. CM/A-82003019" },
      { id: "isStandard",       label: "IS Standard No.",           type: "text",   placeholder: "e.g. 87633:2022" },
      { id: "unitQuantity",     label: "Unit Quantity",             type: "text",   placeholder: "e.g. 100 pieces" },
      { id: "unitRate",         label: "Unit Rate (Rs.)",           type: "text",   placeholder: "e.g. 44.35" },
      { id: "feeLargeScale",    label: "Min. Fee – Large Scale (Rs.)",  type: "number", placeholder: "e.g. 133000" },
      { id: "feeMediumScale",   label: "Min. Fee – Medium Scale (Rs.)", type: "number", placeholder: "e.g. 107000" },
      { id: "feeSmallScale",    label: "Min. Fee – Small Scale (Rs.)",  type: "number", placeholder: "e.g. 66500" },
      { id: "feeMicroScale",    label: "Min. Fee – Micro Scale (Rs.)",  type: "number", placeholder: "e.g. 26600" },
      { id: "place",            label: "Place",                     type: "text",   placeholder: "e.g. Govindpura, Bhopal-462023" },
      { id: "date",             label: "Date",                      type: "date",   placeholder: "" },
      { id: "signatoryName",    label: "Signatory Name",            type: "text",   placeholder: "e.g. Rajiv Abbott" },
      { id: "designation",      label: "Designation",               type: "text",   placeholder: "e.g. Managing Director" },
    ],
  },
  {
    id: "isi_undertaking_letter",
    name: "Declaration of T&C after Licence",
    serviceType: "isi",
    fields: [
      { id: "bpbo",              label: "BPBO Name",                               type: "text",   placeholder: "e.g. BPBO" },
      { id: "signatoryName",     label: "Applicant Name",                          type: "text",   placeholder: "e.g. Rajiv Abbott" },
      { id: "designation",       label: "Designation",                             type: "text",   placeholder: "e.g. MD" },
      { id: "applicationDate",   label: "Application Date",                        type: "date",   placeholder: "" },
      { id: "productName",       label: "Product Name",                            type: "text",   placeholder: "e.g. Table and Desks" },
      { id: "isStandard",        label: "IS Standard No.",                         type: "text",   placeholder: "e.g. IS 17633:2022" },
      { id: "factoryAddress",    label: "Factory Address",                         type: "text",   placeholder: "e.g. 3A-4, B-SECTOR, INDUSTRIAL AREA, GOVINDPURA, BHOPAL, Madhya Pradesh-462023" },
      { id: "date",              label: "Date of Letter",                          type: "date",   placeholder: "" },
    ],
  },
  {
    id: "isi_brand_name_declaration",
    name: "Brand Name Declaration (ANNEX G – CM/PF307)",
    serviceType: "isi",
    fields: [
      { id: "applicationNo",      label: "Application No. / Licence No.",           type: "text",   placeholder: "e.g. 88002958" },
      { id: "licenceValidUpto",   label: "Licence Valid Upto",                      type: "text",   placeholder: "e.g. NA or DD/MM/YYYY" },
      { id: "companyName",        label: "Name of Manufacturer / Company",          type: "text",   placeholder: "e.g. Abbottsons Impex Pvt Ltd" },
      { id: "address",            label: "Address of Manufacturer",                 type: "text",   placeholder: "e.g. 3A-4, B-SECTOR, INDUSTRIAL AREA, GOVINDPURA, BHOPAL, 462023" },
      { id: "brandNameUsed",      label: "Brand Name / Trademark(s) Being Used",    type: "text",   placeholder: "e.g. ABBOTTSONS IMPEX PVT. LTD." },
      { id: "brandNameMarked",    label: "Brand Name to be Marked on Product (a)",  type: "text",   placeholder: "e.g. ABBOTTSONS IMPEX PVT. LTD." },
      { id: "ownedBy",            label: "Owned by Self or Others",                 type: "text",   placeholder: "e.g. Owned" },
      { id: "registeredStatus",   label: "Registered / Unregistered",               type: "text",   placeholder: "e.g. Registered" },
      { id: "dateOfRegistration", label: "Date of Registration / Introduction",     type: "date",   placeholder: "" },
      { id: "place",              label: "Place",                                   type: "text",   placeholder: "e.g. Govindpura, Bhopal-462011" },
      { id: "date",               label: "Date",                                    type: "date",   placeholder: "" },
      { id: "signatoryName",      label: "Signatory Name",                          type: "text",   placeholder: "e.g. Rajiv Abbott" },
      { id: "designation",        label: "Designation",                             type: "text",   placeholder: "e.g. Managing Director" },
    ],
  },
  {
    id: "isi_scope_of_licence",
    name: "Scope of Licence",
    serviceType: "isi",
    fields: [
      { id: "companyName",         label: "Company / Firm Name",              type: "text", placeholder: "e.g. Abbottsons Impex Pvt Ltd." },
      { id: "address",             label: "Factory Address",                  type: "text", placeholder: "e.g. 3A-4, B-SECTOR, INDUSTRIAL AREA, GOVINDPURA, BHOPAL, Bhopal, Madhya Pradesh, 462023" },
      { id: "productName",         label: "Product Name (in paragraph)",      type: "text", placeholder: "e.g. Table and Desks" },
      { id: "isStandard",          label: "IS Standard No.",                  type: "text", placeholder: "e.g. IS 17633:2022" },
      { id: "tableProductName",    label: "Table – Name of Product",          type: "text", placeholder: "e.g. Table and Desks" },
      { id: "modelName",           label: "Table – Model Name",               type: "text", placeholder: "e.g. WT01" },
      { id: "performanceCategory", label: "Table – Performance Category",     type: "text", placeholder: "e.g. Office Table, Without Caster, Fixed Height." },
      { id: "place",               label: "Place",                            type: "text", placeholder: "e.g. Govindpura Bhopal-462023" },
      { id: "date",                label: "Date",                             type: "date", placeholder: "" },
      { id: "signatoryName",       label: "Signatory Name",                   type: "text", placeholder: "e.g. Rajiv Abbott" },
      { id: "designation",         label: "Designation",                      type: "text", placeholder: "e.g. Managing Director" },
    ],
  },
  {
    id: "isi_sample_offer_letter",
    name: "Sample Offer Letter",
    serviceType: "isi",
    fields: [
      { id: "bpbo",           label: "BIS BPBO / Office",               type: "text", placeholder: "e.g. BPBO-Madhya Pardesh" },
      { id: "isStandard",     label: "IS Standard No.",                 type: "text", placeholder: "e.g. 17633:2022" },
      { id: "inspectionDate", label: "BIS Inspection Visit Date",       type: "date", placeholder: "" },
      { id: "product1Name",   label: "Row 1 – Product Name",            type: "text", placeholder: "e.g. Office Table" },
      { id: "product1Dim",    label: "Row 1 – Dimension",               type: "text", placeholder: "e.g. 1200×600×750 mm" },
      { id: "product1BNo",    label: "Row 1 – Batch No. (B.No.)",       type: "text", placeholder: "e.g. BT-001" },
      { id: "product1Dom",    label: "Row 1 – Date of Mfg. (D.O.M.)",  type: "text", placeholder: "e.g. 01.07.2026" },
      { id: "product1Qty",    label: "Row 1 – Quantity (Pieces)",       type: "text", placeholder: "e.g. 50" },
      { id: "product2Name",   label: "Row 2 – Product Name",            type: "text", placeholder: "e.g. Office Table" },
      { id: "product2Dim",    label: "Row 2 – Dimension",               type: "text", placeholder: "e.g. 1500×750×750 mm" },
      { id: "product2BNo",    label: "Row 2 – Batch No. (B.No.)",       type: "text", placeholder: "e.g. BT-002" },
      { id: "product2Dom",    label: "Row 2 – Date of Mfg. (D.O.M.)",  type: "text", placeholder: "e.g. 15.07.2026" },
      { id: "product2Qty",    label: "Row 2 – Quantity (Pieces)",       type: "text", placeholder: "e.g. 30" },
    ],
  },
  {
    id: "isi_acceptance_sit",
    name: "Acceptance of Scheme of Inspection and Testing",
    serviceType: "isi",
    fields: [
      { id: "topDate",          label: "Top Dated",                 type: "date",   placeholder: "" },
      { id: "productName",      label: "Product Name",              type: "text",   placeholder: "e.g. Table And Desks" },
      { id: "isStandard",       label: "IS Standard No.",           type: "text",   placeholder: "e.g. IS 17633:2022" },
      { id: "schemeReference",  label: "Scheme Reference",          type: "text",   placeholder: "e.g. (PM/IS 17633/3/jan 2026)" },
      { id: "place",            label: "Place",                     type: "text",   placeholder: "e.g. Govindpura, Bhopal-462023" },
      { id: "date",             label: "Date",                      type: "date",   placeholder: "" },
      { id: "signatoryName",    label: "Signatory Name",            type: "text",   placeholder: "e.g. Rajiv Abbott" },
      { id: "designation",      label: "Designation",               type: "text",   placeholder: "e.g. Managing Director" },
    ],
  },

  // ─────────────────────────────────────────────
  // FMCS TEMPLATES
  // ─────────────────────────────────────────────

  {
    id: "fmcs_application_letter",
    name: "FMCS Application Cover Letter",
    serviceType: "fmcs",
    fields: [
      { id: "companyName",      label: "Company / Firm Name",       type: "text",   placeholder: "e.g. ABC Pvt. Ltd." },
      { id: "productName",      label: "Product Name",              type: "text",   placeholder: "e.g. Water Flow Meter" },
      { id: "bisOffice",        label: "BIS Office (Region)",       type: "text",   placeholder: "e.g. Northern Region, New Delhi" },
      { id: "refNo",            label: "Reference No.",             type: "text",   placeholder: "e.g. FMCS/2024/001" },
      { id: "place",            label: "Place",                     type: "text",   placeholder: "e.g. New Delhi" },
      { id: "date",             label: "Date",                      type: "date",   placeholder: "" },
      { id: "signatoryName",    label: "Signatory Name",            type: "text",   placeholder: "e.g. Rajiv Abbott" },
      { id: "designation",      label: "Designation",               type: "text",   placeholder: "e.g. Managing Director" },
    ],
  },

  // ─────────────────────────────────────────────
  // HALLMARKING TEMPLATES
  // ─────────────────────────────────────────────
  {
    id: "hallmarking_undertaking",
    name: "Hallmarking Undertaking Letter",
    serviceType: "hallmarking",
    fields: [
      { id: "jewellerName",     label: "Jeweller Name / Firm",      type: "text",   placeholder: "e.g. Shri Ram Jewellers" },
      { id: "address",          label: "Address",                   type: "text",   placeholder: "e.g. 12, Gold Street, Jaipur" },
      { id: "huid",             label: "HUID (Hallmark Unique ID)", type: "text",   placeholder: "e.g. AH4567" },
      { id: "place",            label: "Place",                     type: "text",   placeholder: "e.g. Jaipur" },
      { id: "date",             label: "Date",                      type: "date",   placeholder: "" },
      { id: "signatoryName",    label: "Signatory Name",            type: "text",   placeholder: "e.g. Ram Prakash" },
    ],
  },

  // ─────────────────────────────────────────────
  // BIS CRS TEMPLATES
  // ─────────────────────────────────────────────
  {
    id: "bis_crs_declaration",
    name: "BIS CRS Declaration of Conformity",
    serviceType: "bis_crs",
    fields: [
      { id: "companyName",      label: "Company / Importer Name",   type: "text",   placeholder: "e.g. Tech Import Pvt. Ltd." },
      { id: "productName",      label: "Product Name",              type: "text",   placeholder: "e.g. LED Luminaire" },
      { id: "modelNo",          label: "Model No.",                 type: "text",   placeholder: "e.g. LED-100W-2024" },
      { id: "crsRegistrationNo",label: "CRS Registration No.",      type: "text",   placeholder: "e.g. CRS/2024/DL/12345" },
      { id: "testReportNo",     label: "Test Report No.",           type: "text",   placeholder: "e.g. TRL/2024/5678" },
      { id: "labName",          label: "Testing Lab Name",          type: "text",   placeholder: "e.g. NABL Accredited Lab, Delhi" },
      { id: "place",            label: "Place",                     type: "text",   placeholder: "e.g. New Delhi" },
      { id: "date",             label: "Date",                      type: "date",   placeholder: "" },
      { id: "signatoryName",    label: "Signatory Name",            type: "text",   placeholder: "e.g. Anita Sharma" },
      { id: "designation",      label: "Designation",               type: "text",   placeholder: "e.g. Director" },
    ],
  },
];

/** Get all templates for a given service type */
export function getTemplatesByServiceType(serviceType) {
  return DOCUMENT_TEMPLATES.filter(t => t.serviceType === serviceType);
}

/** Get a single template by id */
export function getTemplateById(id) {
  return DOCUMENT_TEMPLATES.find(t => t.id === id) || null;
}
