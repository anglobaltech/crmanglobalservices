"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileText, ChevronDown, ChevronUp, Printer, Download,
  Edit3, Eye, Plus, X, Check, BookOpen, Layers,
  Award, BadgeCheck, FlaskConical, ClipboardList,
  Anchor, Settings, ChevronRight
} from "lucide-react";
import { DOCUMENT_TEMPLATES, getTemplatesByServiceType } from "@/lib/data/documentTemplates";
import { SERVICE_TYPES } from "@/lib/data/projectChecklists";


function fmtDate(iso) {
  if (!iso) return "___________";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, ".");
}

function hl(value, placeholder = "___________") {
  return value && value.trim() ? value.trim() : placeholder;
}

function IsiMarkingFeeDoc({ fields }) {
  const f = fields;
  return (
    <div className="doc-body font-serif text-[13px] leading-relaxed text-gray-900" style={{ lineHeight: "1.7" }}>
      <h2 className="text-center font-bold underline text-[15px] mb-8 tracking-wide" style={{ textTransform: "uppercase" }}>
        ACCEPTANCE OF RATE OF MARKING FEE
      </h2>

      <p className="mb-4">
        This is the reference to application <span className="doc-field">{hl(f.applicationRef, "CM/A-________")}</span>
      </p>

      <p className="mb-4">
        We hereby agree to pay marking fee to Bureau of Indian Standards after grant of license to use<br/>
        the Standard Mark on Table and Desks According to <span className="doc-field">{hl(f.isStandard, "____:____")}</span> at the following rates and in the<br/>
        manner stipulated as under :
      </p>

      <div className="mb-4 ml-0">
        <p className="mb-2">i) Rate of Marking Fee:</p>
        <div className="ml-10 mb-2 space-y-1">
          <p>
            Unit: <span className="doc-field">{hl(f.unitQuantity, "______ pieces")}</span>
          </p>
          <p>
            Unit Rate: Rs. <span className="doc-field">{hl(f.unitRate, "____.__")}</span> per Unit for all Units
          </p>
          <p>
            With a minimum marking fee of Rs. <span className="doc-field">{hl(f.feeLargeScale, "__________")}</span> for Large Scale, Rs. <span className="doc-field">{hl(f.feeMediumScale, "__________")}</span> for<br/>
            Medium Scale, Rs. <span className="doc-field">{hl(f.feeSmallScale, "__________")}</span> for Small Scale and Rs. <span className="doc-field">{hl(f.feeMicroScale, "__________")}</span> for Micro Scale Units.
          </p>
        </div>
        <p className="mb-2 mt-2">ii) The marking fee is payable as follows:</p>
        <div className="ml-10 space-y-1">
          <div className="flex items-start">
            <span className="mr-3">a)</span>
            <p>Minimum Marking fee for one operative year payable in advance which will be<br/>carried over to next renewal(s).</p>
          </div>
          <div className="flex items-start">
            <span className="mr-3">b)</span>
            <p>Actual marking fee for the first nine month of the operative period calculated on<br/>
            the unit rate on the production marked or the minimum fee whichever is higher<br/>
            shall be payable at Delhi/New Delhi at the time of first renewal of license . For<br/>
            subsequent renewals, the actual marking fee for 12 Months period consisting of<br/>
            last operative year or the minimum fee whichever is higher, shall be payable .<br/>
            GST as applicable shall also be paid.</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-8">
        <div style={{ lineHeight: "2.5" }}>
          <p style={{ background: f.place ? "#fef08a" : "transparent", display: "inline-block", paddingRight: "20px" }}>
            Place:<span className="doc-field">{hl(f.place, "_______________")}</span>
          </p><br/>
          <p style={{ background: f.date ? "#fef08a" : "transparent", display: "inline-block", paddingRight: "20px" }}>
            Date:<span className="doc-field">{f.date ? fmtDate(f.date) : "__________"}</span>
          </p>
        </div>
        <div style={{ lineHeight: "2.5" }}>
          <p style={{ background: "#fef08a", display: "inline-block", paddingRight: "20px" }}>Signature:</p><br/>
          <p style={{ background: f.signatoryName ? "#fef08a" : "transparent", display: "inline-block", paddingRight: "20px" }}>
            Name: <span className="doc-field">{hl(f.signatoryName, "_______________")}</span>
          </p><br/>
          <p style={{ background: f.designation ? "#fef08a" : "transparent", display: "inline-block", paddingRight: "20px" }}>
            Designation: <span className="doc-field">{hl(f.designation, "_______________")}</span>
          </p><br/>
          <p style={{ background: "#fef08a", display: "inline-block", paddingRight: "20px" }}>Seal</p>
        </div>
      </div>
    </div>
  );
}

function IsiUndertakingDoc({ fields }) {
  const f = fields;
  return (
    <div className="doc-body font-serif text-gray-900" style={{ fontSize: "13px", lineHeight: "1.75" }}>

      {/* ── Centred header ── */}
      <p style={{ textAlign: "center", marginBottom: "6px" }}>Annexure-IV</p>
      <p style={{ textAlign: "center", marginBottom: "24px" }}>Undertaking by applicant applying under option 2</p>

      {/* ── Address block ── */}
      <p style={{ marginBottom: "2px" }}>
        The Head <span className="doc-field">{hl(f.bpbo, "BPBO")}</span>
      </p>
      <p style={{ marginBottom: "20px" }}>Bureau of Indian Standards</p>

      <p style={{ marginBottom: "20px" }}>Dear Madam/ Sir,</p>

      {/* ── Main paragraph – fully justified ── */}
      <p style={{ textAlign: "justify", marginBottom: "16px" }}>
        I{" "}<span className="doc-field">{hl(f.signatoryName, "_______________")}</span>,{" "}
        <span className="doc-field">{hl(f.designation, "___")}</span>{" "}
        have applied for a <u>licence</u> under option-2 on{" "}
        <span className="doc-field">{f.applicationDate ? fmtDate(f.applicationDate) : "__________"}</span>{" "}
        to you for use of BIS standered mark on{" "}
        <span className="doc-field">{hl(f.productName, "_______________")}</span>{" "}
        as per IS{" "}<span className="doc-field">{hl(f.isStandard, "____:____")}</span>{" "}
        being manufactured at our factory at{" "}
        <span className="doc-field">{hl(f.factoryAddress, "_______________")}</span>{" "}
        I clearly understand and agree to the conditions that-
      </p>

      {/* ── Conditions (i)–(v) – tight, justified ── */}
      <div style={{ textAlign: "justify", marginBottom: "32px" }}>
        <p style={{ marginBottom: "3px" }}>
          <u>(i)The <u>Licence</u></u> , if granted against the above application shall be put under suspension by BIS , if the sample drown during the verification visits falls to conform to the relevant Indian Standard,
        </p>
        <p style={{ marginBottom: "3px" }}>
          (ii) <u>in</u> such case of suspension, I shall take necessary corrective actions and inform the same to BIS within one month and offer fresh lot of product manufactured after taking corrective actions, from which sample(s) will be drawn by BIS for third party testing
        </p>
        <p style={{ marginBottom: "3px" }}>
          (iii) <u>the</u> revocation of suspension will be considered only on the basis of complete test report(s) of the fresh sample(s) offered, from third party testing laboratory
        </p>
        <p style={{ marginBottom: "3px" }}>
          (iv) <u>the</u> testing fee for testing of sample drawn for consideration of revocation of suspension shall be borne by me, and
        </p>
        <p style={{ marginBottom: "0" }}>
          (v) in case, the fresh sample drawn by BIS for considering revocation of suspension shows non-conformity, or I fail to inform corrective actions within 30 days from the date of suspension, the <u>licence</u> will be processed for cancellation.
        </p>
      </div>

      {/* ── Footer: Date left, Authorised Signatory right ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginTop: "8px" }}>
        <div>
          <p>
            Date:<span className="doc-field">{f.date ? fmtDate(f.date) : "__________"}</span>
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontWeight: "bold", textDecoration: "underline" }}>Authorised Signatory</p>
        </div>
      </div>
    </div>
  );
}


function IsiBrandNameDeclarationDoc({ fields }) {
  const f = fields;
  return (
    <div className="doc-body font-serif text-[13px] text-gray-900" style={{ lineHeight: "1.4" }}>

      {/* ── Page header: ANNEX G centred, CM/PF307 + Oct.1996 top-right ── */}
      <div style={{ position: "relative", textAlign: "center", marginBottom: "12px" }}>
        <p style={{ fontWeight: "normal", fontSize: "13px" }}>ANNEX G</p>
        <div style={{ position: "absolute", right: 0, top: 0, textAlign: "right", fontSize: "12px" }}>
          <p style={{ textDecoration: "underline" }}>CM/PF307</p>
          <p>Oct. 1996</p>
        </div>
      </div>

      <div style={{ height: "8px" }} />

      {/* ── Bold centred title ── */}
      <p style={{ textAlign: "center", fontWeight: "bold", fontSize: "13px", marginBottom: "2px" }}>
        APPLICANT’S / LICENSEE’S DECLARATION OF BRAND NAME/ TRADEMARK
      </p>
      <p style={{ textAlign: "center", fontWeight: "bold", fontSize: "13px", marginBottom: "16px" }}>
        PROPOSED TO BE COVERED UNDER CERTIFICATION
      </p>

      {/* ── Numbered items 1-4 ── */}
      <p style={{ marginBottom: "8px" }}>
        1. Application No./ Licence No. : <span className="doc-field">{hl(f.applicationNo, "_______________")}</span>
      </p>

      <p style={{ marginBottom: "8px" }}>
        2. Licence Valid upto: <span className="doc-field">{hl(f.licenceValidUpto, "NA")}</span>
      </p>

      <p style={{ marginBottom: "8px" }}>
        3. Name of the Manufacturer and Address: <span className="doc-field">
          {f.companyName ? f.companyName : "_______________"}
          {f.companyName && f.address ? ", Address: " + f.address : ""}
        </span>
      </p>

      <p style={{ marginBottom: "12px" }}>
        4. Brand Names/Trademark(s)being used: <span className="doc-field">{hl(f.brandNameUsed, "_______________")}</span>
      </p>

      {/* ── Point 5 + Table ── */}
      <p style={{ marginBottom: "2px" }}>5.</p>

      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "12px",
        marginBottom: "16px"
      }}>
        <thead>
          <tr>
            <th style={{
              border: "1px solid #333", padding: "6px 8px",
              textAlign: "left", fontWeight: "normal",
              verticalAlign: "top", width: "40%"
            }}>
              Brand Names/Trademark(s) which would be marked on<br/>
              the product bearing the BIS Standard Mark (Give actual<br/>
              design depiction of the Brand<br/>
              Name/Trade Mark(s)
            </th>
            <th style={{
              border: "1px solid #333", padding: "6px 8px",
              textAlign: "left", fontWeight: "normal",
              verticalAlign: "top", width: "15%"
            }}>
              Owned by self<br/>or others
            </th>
            <th style={{
              border: "1px solid #333", padding: "6px 8px",
              textAlign: "left", fontWeight: "normal",
              verticalAlign: "top", width: "15%"
            }}>
              Registered/<br/>Unregistered
            </th>
            <th style={{
              border: "1px solid #333", padding: "6px 8px",
              textAlign: "left", fontWeight: "normal",
              verticalAlign: "top", width: "30%"
            }}>
              Date &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;of<br/>Registration/<br/>Introduction
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #333", padding: "8px" }}>
              a) &nbsp;<span className="doc-field">{hl(f.brandNameMarked, "_______________")}</span>
            </td>
            <td style={{ border: "1px solid #333", padding: "8px" }}>
              <span className="doc-field">{hl(f.ownedBy, "Owned")}</span>
            </td>
            <td style={{ border: "1px solid #333", padding: "8px" }}>
              <span className="doc-field">{hl(f.registeredStatus, "Registered")}</span>
            </td>
            <td style={{ border: "1px solid #333", padding: "8px" }}>
              <span className="doc-field">
                {f.dateOfRegistration ? fmtDate(f.dateOfRegistration) : "__________"}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Static clauses 6-10 ── */}
      <div style={{ fontSize: "12px", lineHeight: "1.4", textAlign: "left" }}>
        <p style={{ marginBottom: "8px" }}>6. Other Brand Names/ Trademark (s) used for the same product marketed without BIS Standard Mark. Give reasons.</p>
        <p style={{ marginBottom: "8px" }}>7. In case Brand Names/Trademark(s) of any other party/manufacturer is being used for purposes of the above, give the<br/>design depiction of the Brand Names/Trademark(s) and copy of the agreement authorizing the use of the same.</p>
        <p style={{ marginBottom: "8px" }}>8. I/We undertake to inform BIS in advance as and when we propose to use any other Brand Names/ Trademark(s) in<br/>conjunction with the operation of the BIS Certification Scheme.</p>
        <p style={{ marginBottom: "8px" }}>9. I/We also undertake that, as far as possible, the entire production which conforms to the specification shall be marked<br/>with the BIS Mark, irrespective of the Brand Names/Trademark(s) used.</p>
        <p style={{ marginBottom: "16px" }}>10. I/We understand that the above has been given only as information to BIS, that BIS has no role in permitting/<br/>approving of any Brand Name or Trade Mark, that this is not in any way be interpreted to mean that BIS has<br/>permitted/approved the use of the Brand Names and Trade Marks listed above, and that the responsibility is entirely<br/>mine/ours.</p>
      </div>

      {/* ── Signature block ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "8px" }}>
        <div style={{ lineHeight: "1.6" }}>
          <p style={{ background: f.place ? "#fef08a" : "transparent", display: "inline-block", paddingRight: "20px", marginBottom: "4px" }}>
            Place: <span className="doc-field">{hl(f.place, "_______________")}</span>
          </p><br/>
          <p style={{ background: f.date ? "#fef08a" : "transparent", display: "inline-block", paddingRight: "20px" }}>
            Dated:<span className="doc-field">{f.date ? fmtDate(f.date) : "__________"}</span>
          </p>
        </div>
        <div style={{ lineHeight: "1.6" }}>
          <p style={{ background: "#fef08a", display: "inline-block", paddingRight: "20px", marginBottom: "8px" }}>Signature:</p><br/>
          <p style={{ background: f.signatoryName ? "#fef08a" : "transparent", display: "inline-block", paddingRight: "20px", marginBottom: "4px" }}>
            Name: <span className="doc-field">{hl(f.signatoryName, "_______________")}</span>
          </p><br/>
          <p style={{ background: f.designation ? "#fef08a" : "transparent", display: "inline-block", paddingRight: "20px", marginBottom: "4px" }}>
            Designation: <span className="doc-field">{hl(f.designation, "_______________")}</span>
          </p><br/>
          <p style={{ background: "#fef08a", display: "inline-block", paddingRight: "20px" }}>Seal:</p>
        </div>
      </div>
    </div>
  );
}

function FmcsApplicationDoc({ fields }) {
  const f = fields;
  return (
    <div className="doc-body font-serif text-[13px] leading-relaxed text-gray-900">
      <h2 className="text-center font-bold underline text-[15px] mb-8 tracking-wide">
        COVER LETTER — FMCS APPLICATION
      </h2>
      <p className="mb-2">To,</p>
      <p className="mb-1">The Director / Head</p>
      <p className="mb-4">
        BIS — <span className="doc-field">{hl(f.bisOffice, "____________ Region")}</span>
      </p>
      <p className="mb-4">
        Subject: Application for Foreign Manufacturer Certification Scheme (FMCS) for{" "}
        <span className="doc-field">{hl(f.productName, "_______________")}</span> — Ref:{" "}
        <span className="doc-field">{hl(f.refNo, "________________")}</span>
      </p>
      <p className="mb-4">
        We, <span className="doc-field">{hl(f.companyName, "M/s _______________")}</span>, hereby
        submit our application for FMCS certification for the above-mentioned product and
        request you to kindly process the same at the earliest.
      </p>
      <p className="mb-4">All required documents are enclosed herewith.</p>
      <div className="mt-10 grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <p>Place: <span className="doc-field">{hl(f.place, "_______________")}</span></p>
          <p>Date: <span className="doc-field">{f.date ? fmtDate(f.date) : "___________"}</span></p>
        </div>
        <div className="space-y-4">
          <p className="font-semibold">Signature: <span className="doc-field ml-4">______________</span></p>
          <p>Name: <span className="doc-field">{hl(f.signatoryName, "_______________")}</span></p>
          <p>Designation: <span className="doc-field">{hl(f.designation, "_______________")}</span></p>
          <p className="mt-2">Seal</p>
        </div>
      </div>
    </div>
  );
}

function HallmarkingUndertakingDoc({ fields }) {
  const f = fields;
  return (
    <div className="doc-body font-serif text-[13px] leading-relaxed text-gray-900">
      <h2 className="text-center font-bold underline text-[15px] mb-8 tracking-wide">
        UNDERTAKING — HALLMARKING
      </h2>
      <p className="mb-4">
        I/We, <span className="doc-field">{hl(f.jewellerName, "M/s _______________")}</span>, located
        at <span className="doc-field">{hl(f.address, "_______________")}</span>, hereby undertake
        that the gold/silver articles submitted for hallmarking under HUID{" "}
        <span className="doc-field">{hl(f.huid, "________")}</span> are genuine and of the purity
        as declared.
      </p>
      <p className="mb-4">
        We further undertake that we shall comply with all BIS Hallmarking regulations and
        any violation shall make us liable for action under the BIS Act 2016.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <p>Place: <span className="doc-field">{hl(f.place, "_______________")}</span></p>
          <p>Date: <span className="doc-field">{f.date ? fmtDate(f.date) : "___________"}</span></p>
        </div>
        <div className="space-y-4">
          <p className="font-semibold">Signature: <span className="doc-field ml-4">______________</span></p>
          <p>Name: <span className="doc-field">{hl(f.signatoryName, "_______________")}</span></p>
          <p className="mt-2">Seal</p>
        </div>
      </div>
    </div>
  );
}

function BisCrsDeclarationDoc({ fields }) {
  const f = fields;
  return (
    <div className="doc-body font-serif text-[13px] leading-relaxed text-gray-900">
      <h2 className="text-center font-bold underline text-[15px] mb-8 tracking-wide">
        DECLARATION OF CONFORMITY — BIS CRS
      </h2>
      <p className="mb-4">
        We, <span className="doc-field">{hl(f.companyName, "M/s _______________")}</span>, hereby
        declare that the product{" "}
        <span className="doc-field">{hl(f.productName, "_______________")}</span> with Model No.{" "}
        <span className="doc-field">{hl(f.modelNo, "___________")}</span> bearing CRS Registration
        No. <span className="doc-field">{hl(f.crsRegistrationNo, "________________")}</span>{" "}
        conforms to the applicable Indian Standard.
      </p>
      <p className="mb-4">
        The product has been tested vide Test Report No.{" "}
        <span className="doc-field">{hl(f.testReportNo, "____________")}</span> by{" "}
        <span className="doc-field">{hl(f.labName, "________________")}</span>.
      </p>
      <p className="mb-4">
        We take full responsibility for the conformity of the product with all applicable
        essential requirements and standards.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <p>Place: <span className="doc-field">{hl(f.place, "_______________")}</span></p>
          <p>Date: <span className="doc-field">{f.date ? fmtDate(f.date) : "___________"}</span></p>
        </div>
        <div className="space-y-4">
          <p className="font-semibold">Signature: <span className="doc-field ml-4">______________</span></p>
          <p>Name: <span className="doc-field">{hl(f.signatoryName, "_______________")}</span></p>
          <p>Designation: <span className="doc-field">{hl(f.designation, "_______________")}</span></p>
          <p className="mt-2">Seal</p>
        </div>
      </div>
    </div>
  );
}

// ── Scope of Licence ──────────────────────────────────────────────────────────
function IsiScopeOfLicenceDoc({ fields }) {
  const f = fields;
  const cellStyle = (w) => ({
    border: "1px solid #333",
    padding: "14px 12px",          // taller cells
    verticalAlign: "top",
    width: w || "auto",
    fontSize: "13px",
  });
  const yellowRow = (children) => (
    <p style={{ marginBottom: "10px" }}>
      <span className="doc-field" style={{ display: "block", padding: "8px 10px", minHeight: "32px" }}>
        <strong>{children}</strong>
      </span>
    </p>
  );
  return (
    <div className="doc-body font-serif text-gray-900" style={{ fontSize: "13px", lineHeight: "1.8" }}>

      {/* Title */}
      <p style={{ textAlign: "center", fontWeight: "bold", textDecoration: "underline", fontSize: "15px", marginBottom: "48px" }}>
        Scope of Licence
      </p>

      {/* Opening paragraph – fully justified */}
      <p style={{ textAlign: "justify", marginBottom: "40px" }}>
        We, at{" "}
        <strong><u><span className="doc-field">{hl(f.companyName, "M/s _______________")}</span></u></strong>,{" "}
        <span className="doc-field">{hl(f.address, "_______________")}</span>{" "}
        declare that we are currently seeking the licence for the following varieties of Safety of{" "}
        <span className="doc-field">{hl(f.productName, "_______________")}</span>{" "}
        as per IS{" "}
        <span className="doc-field">{hl(f.isStandard, "____:____")}</span>{" "}
        follows:
      </p>

      {/* Product table */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginBottom: "60px" }}>
        <tbody>
          <tr>
            <td style={cellStyle("45%")}>Name of the product</td>
            <td style={cellStyle()}><span className="doc-field">{hl(f.tableProductName, "_______________")}</span></td>
          </tr>
          <tr>
            <td style={cellStyle()}>Model Name</td>
            <td style={cellStyle()}><span className="doc-field">{hl(f.modelName, "_______________")}</span></td>
          </tr>
          <tr>
            <td style={cellStyle()}>Performance Category</td>
            <td style={cellStyle()}><span className="doc-field">{hl(f.performanceCategory, "_______________")}</span></td>
          </tr>
        </tbody>
      </table>

      {/* Signature block – 4-row grid matching original */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 40px", marginTop: "8px" }}>
        {/* Left: full-width yellow rows */}
        <div>
          {yellowRow(<>Place: {hl(f.place, "_______________")}</>)}
          {yellowRow(<>Date: {f.date ? fmtDate(f.date) : "__________"}</>)}
          {yellowRow(<>&nbsp;</>)}
          {yellowRow(<>&nbsp;</>)}
        </div>
        {/* Right: bold label rows */}
        <div style={{ lineHeight: "2.5" }}>
          <p style={{ marginBottom: "10px" }}><strong>Signature:</strong></p>
          <p style={{ marginBottom: "10px" }}><strong>Name: {hl(f.signatoryName, "_______________")}</strong></p>
          <p style={{ marginBottom: "10px" }}><strong>Designation: {hl(f.designation, "_______________")}</strong></p>
          <p style={{ marginBottom: "10px" }}><strong>Seal:</strong></p>
        </div>
      </div>
    </div>
  );
}

// ── Sample Offer Letter ───────────────────────────────────────────────────────
function IsiSampleOfferLetterDoc({ fields }) {
  const f = fields;
  const thStyle = (w, align) => ({
    border: "1px solid #333",
    padding: "6px 8px",
    fontWeight: "600",
    textAlign: align || "center",
    verticalAlign: "middle",
    width: w || "auto",
    background: "#fef08a",         // yellow header cells
  });
  const tdStyle = (align) => ({
    border: "1px solid #333",
    padding: "6px 8px",
    verticalAlign: "top",
    textAlign: align || "left",
  });
  return (
    <div className="doc-body font-serif text-gray-900" style={{ fontSize: "13px", lineHeight: "1.75" }}>

      {/* Title */}
      <p style={{ textAlign: "center", fontWeight: "bold", textDecoration: "underline", fontSize: "14px", marginBottom: "24px" }}>
        SAMPLE OFFER LETTER
      </p>

      {/* Address block */}
      <p style={{ marginBottom: "4px" }}>To,</p>
      <p style={{ marginBottom: "4px" }}>The Director and Head</p>
      <p style={{ marginBottom: "4px" }}>Branch Office</p>
      <p style={{ marginBottom: "20px" }}>
        BIS,<span className="doc-field">{hl(f.bpbo, "BPBO-_______________")}</span>
      </p>

      {/* Subject */}
      <p style={{ marginBottom: "16px" }}>Sub: To offer Samples for testing from following lots.</p>

      {/* Body */}
      <p style={{ marginBottom: "12px" }}>
        We have manufactured following Lots for BIS Inspection and Testing as per IS{" "}
        <span className="doc-field">{hl(f.isStandard, "____:____")}</span>.
      </p>
      <p style={{ marginBottom: "24px" }}>
        We hereby declare that following Lots were manufactured and tested in our factory and same were
        offer during the BIS inspection visit dated :{" "}
        <span className="doc-field">{f.inspectionDate ? fmtDate(f.inspectionDate) : "__________"}</span>.
      </p>

      {/* Product table */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginBottom: "40px" }}>
        <thead>
          <tr>
            <th style={thStyle("6%")}>S.No.</th>
            <th style={thStyle("20%")}>Product Name</th>
            <th style={thStyle("22%")}>Dimension</th>
            <th style={{ ...thStyle("28%"), verticalAlign: "top" }}>Date of Manufacturing ,B. No. / Lot no.</th>
            <th style={thStyle("14%")}>Quantity (Pieces)</th>
          </tr>
        </thead>
        <tbody>
          {/* Row 1 */}
          <tr>
            <td style={tdStyle("center")}>
              <span className="doc-field">1.</span>
            </td>
            <td style={tdStyle()}>
              <span className="doc-field">{hl(f.product1Name, "_______________")}</span>
            </td>
            <td style={tdStyle()}>
              <span className="doc-field">{hl(f.product1Dim, "")}</span>
            </td>
            <td style={{ ...tdStyle(), textAlign: "center" }}>
              <p>B.No- <span className="doc-field">{hl(f.product1BNo, "")}</span></p>
              <p>D.O.M- <span className="doc-field">{hl(f.product1Dom, "")}</span></p>
            </td>
            <td style={tdStyle()}>
              <span className="doc-field">{hl(f.product1Qty, "")}</span>
            </td>
          </tr>
          {/* Row 2 */}
          <tr>
            <td style={tdStyle("center")}>
              <span className="doc-field">2</span>
            </td>
            <td style={tdStyle()}>
              <span className="doc-field">{hl(f.product2Name, "_______________")}</span>
            </td>
            <td style={tdStyle()}>
              <span className="doc-field">{hl(f.product2Dim, "")}</span>
            </td>
            <td style={{ ...tdStyle(), textAlign: "center" }}>
              <p>B.No- <span className="doc-field">{hl(f.product2BNo, "")}</span></p>
              <p>D.O.M- <span className="doc-field">{hl(f.product2Dom, "")}</span></p>
            </td>
            <td style={tdStyle()}>
              <span className="doc-field">{hl(f.product2Qty, "")}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <p style={{ marginTop: "60px" }}>Thanks &amp; Regards</p>
    </div>
  );
}

// ── Acceptance of Scheme of Inspection and Testing ────────────────────────────
function IsiAcceptanceSitDoc({ fields }) {
  const f = fields;
  return (
    <div className="doc-body font-serif text-[13px] leading-relaxed text-gray-900" style={{ lineHeight: "1.7" }}>
      <p style={{ textAlign: "center", fontWeight: "bold", textDecoration: "underline", fontSize: "14px", marginBottom: "32px", textTransform: "uppercase" }}>
        ACCEPTANCE OF SCHEME OF INSPECTION AND TESTING
      </p>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <p style={{ background: f.topDate ? "#fef08a" : "transparent", display: "inline-block", padding: "0 4px" }}>
          Dated: <span className="doc-field">{f.topDate ? fmtDate(f.topDate) : "__________"}</span>
        </p>
      </div>

      <p style={{ textAlign: "justify", marginBottom: "48px" }}>
        We hereby agree that after license is granted to us for <span className="doc-field">{hl(f.productName, "_______________")}</span> as per <span className="doc-field">{hl(f.isStandard, "____:____")}</span>. We<br/>
        shall follow scheme of Inspection and Testing as per <span className="doc-field">{hl(f.schemeReference, "_______________")}</span> strictly and<br/>
        maintain all records.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginTop: "16px" }}>
        <div style={{ lineHeight: "2.5" }}>
          <p style={{ background: f.place ? "#fef08a" : "transparent", display: "inline-block", paddingRight: "20px", marginBottom: "8px" }}>
            Place: <span className="doc-field">{hl(f.place, "_______________")}</span>
          </p><br/>
          <p style={{ background: f.date ? "#fef08a" : "transparent", display: "inline-block", paddingRight: "20px" }}>
            Date:<span className="doc-field">{f.date ? fmtDate(f.date) : "__________"}</span>
          </p>
        </div>
        <div style={{ lineHeight: "2.5" }}>
          <p style={{ background: "#fef08a", display: "inline-block", paddingRight: "20px" }}>Signature:</p><br/>
          <p style={{ background: f.signatoryName ? "#fef08a" : "transparent", display: "inline-block", paddingRight: "20px" }}>
            Name: <span className="doc-field">{hl(f.signatoryName, "_______________")}</span>
          </p><br/>
          <p style={{ background: f.designation ? "#fef08a" : "transparent", display: "inline-block", paddingRight: "20px" }}>
            Designation: <span className="doc-field">{hl(f.designation, "_______________")}</span>
          </p><br/>
          <p style={{ background: "#fef08a", display: "inline-block", paddingRight: "20px" }}>Seal:</p>
        </div>
      </div>
    </div>
  );
}

// Map template id → renderer component
const RENDERERS = {
  isi_marking_fee_acceptance:    IsiMarkingFeeDoc,
  isi_undertaking_letter:        IsiUndertakingDoc,
  isi_brand_name_declaration:    IsiBrandNameDeclarationDoc,
  isi_scope_of_licence:          IsiScopeOfLicenceDoc,
  isi_sample_offer_letter:       IsiSampleOfferLetterDoc,
  isi_acceptance_sit:            IsiAcceptanceSitDoc,
  fmcs_application_letter:       FmcsApplicationDoc,
  hallmarking_undertaking:       HallmarkingUndertakingDoc,
  bis_crs_declaration:           BisCrsDeclarationDoc,
};

// ─── SERVICE TYPE CONFIG ───────────────────────────────────────────────────────
const SERVICE_CONFIG = {
  isi:         { label: "ISI",         color: "bg-blue-100 text-blue-700 border-blue-200",     accent: "blue",     icon: BadgeCheck },
  fmcs:        { label: "FMCS",        color: "bg-purple-100 text-purple-700 border-purple-200", accent: "purple",  icon: FlaskConical },
  hallmarking: { label: "Hallmarking", color: "bg-amber-100 text-amber-700 border-amber-200",  accent: "amber",    icon: Award },
  bis_crs:     { label: "BIS CRS",     color: "bg-emerald-100 text-emerald-700 border-emerald-200", accent: "emerald", icon: ClipboardList },
};

// ─── Field Input ───────────────────────────────────────────────────────────────
function FieldInput({ field, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {field.label}
        <span className="ml-1 inline-block w-2 h-2 rounded-full bg-yellow-400" title="Dynamic field" />
      </label>
      {field.type === "date" ? (
        <input
          type="date"
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 bg-yellow-50"
        />
      ) : field.type === "number" ? (
        <input
          type="number"
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 bg-yellow-50"
        />
      ) : (
        <input
          type="text"
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 bg-yellow-50"
        />
      )}
    </div>
  );
}

function LetterheadSettings({ config, setConfig }) {
  const [isOpen, setIsOpen] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem("crm_letterheads");
    if (saved) {
      try { setSavedProfiles(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const handleSave = (e) => {
    e.stopPropagation();
    if (!config.companyName.trim()) {
      alert("Please enter a Company Name first to save this letterhead profile.");
      return;
    }
    const updated = { ...savedProfiles, [config.companyName]: config };
    setSavedProfiles(updated);
    localStorage.setItem("crm_letterheads", JSON.stringify(updated));
    alert("Letterhead saved for company: " + config.companyName);
  };

  const handleLoad = (e) => {
    const profile = savedProfiles[e.target.value];
    if (profile) setConfig(profile);
  };

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div 
        className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Settings size={14} className="text-gray-500" />
          <p className="text-xs font-bold text-gray-700">Letterhead & Footer Settings</p>
        </div>
        <div className="flex items-center gap-4">
          <label 
            className="flex items-center gap-2 text-xs cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <input 
              type="checkbox" 
              checked={config.includeText} 
              onChange={(e) => handleChange('includeText', e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="font-semibold text-gray-600">Print Letterhead Text</span>
          </label>
          {isOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
        </div>
      </div>
      
      {isOpen && (
        <div className="p-5 space-y-4 max-h-[50vh] overflow-y-auto bg-gray-50/50">
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm mb-2">
            <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Saved Companies</p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select 
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30 bg-gray-50"
                onChange={handleLoad}
                value=""
              >
                <option value="" disabled>-- Load from saved company --</option>
                {Object.keys(savedProfiles).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <button 
                onClick={handleSave}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-100 transition whitespace-nowrap border border-indigo-200"
              >
                Save Current Details
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Company Name</label>
              <input type="text" value={config.companyName} onChange={e => handleChange('companyName', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">GST No</label>
              <input type="text" value={config.gstNo} onChange={e => handleChange('gstNo', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Office Address</label>
              <input type="text" value={config.address} onChange={e => handleChange('address', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Landline</label>
              <input type="text" value={config.landline} onChange={e => handleChange('landline', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Contact No</label>
              <input type="text" value={config.contactNo} onChange={e => handleChange('contactNo', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Footer Email</label>
              <input type="text" value={config.email} onChange={e => handleChange('email', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Footer Website</label>
              <input type="text" value={config.website} onChange={e => handleChange('website', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DocumentFormatsPage() {
  const [selectedService, setSelectedService] = useState("isi");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const [mode, setMode] = useState("edit"); // "edit" | "preview"
  const printRef = useRef(null);

  const [letterheadConfig, setLetterheadConfig] = useState({
    includeText: true,
    companyName: "",
    address: "",
    gstNo: "",
    landline: "",
    contactNo: "",
    email: "",
    website: ""
  });

  const templates = getTemplatesByServiceType(selectedService);

  const handleSelectTemplate = (t) => {
    setSelectedTemplate(t);
    setFieldValues({});
    setMode("edit");
  };

  const handleFieldChange = (fieldId, value) => {
    setFieldValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handlePrint = () => {
    const printContents = printRef.current?.innerHTML;
    if (!printContents) return;
    const w = window.open("", "_blank");
    w.document.write(`
      <html><head><title>${selectedTemplate?.name || "Document"}</title>
      <style>
        @page { margin: 0; size: A4; }
        body { font-family: 'Times New Roman', serif; font-size: 13px; line-height: 1.8; color: #111; padding: 50px 65px; margin: 0; }
        h2 { text-align:center; font-weight:bold; text-decoration:underline; font-size:15px; letter-spacing:0.05em; margin-bottom:32px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #333; padding: 6px 8px; }
        .doc-field { padding: 1px 4px; font-weight: 600; }
        .print-footer {
          position: fixed !important;
          bottom: 50px !important;
          left: 65px !important;
          right: 65px !important;
          margin-top: 0 !important;
        }
        @media print {
          @page { margin: 0; size: A4; }
          body { padding: 50px 65px; padding-bottom: 100px; }
          .doc-field { background: transparent !important; padding: 0; font-weight: inherit; }
        }
      </style>
      </head><body>${printContents}</body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 300);
  };

  const Renderer = selectedTemplate ? RENDERERS[selectedTemplate.id] : null;

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Page styles */}
      <style>{`
        .doc-body .doc-field {
          background: #fef08a;
          padding: 1px 6px;
          border-radius: 3px;
          font-weight: 600;
        }
        .doc-body { font-family: 'Times New Roman', serif; }
        @media print {
          .doc-body .doc-field {
            background: transparent !important;
            padding: 0;
            border-radius: 0;
            font-weight: inherit;
          }
        }
      `}</style>

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1600px] w-full mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Layers size={22} className="text-indigo-600" />
              Document Formats
            </h1>
            <p className="text-xs text-gray-500 mt-1">Create and fill official document templates</p>
          </div>
          
          {/* Service Types as Horizontal Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {Object.entries(SERVICE_CONFIG).map(([key, cfg]) => {
              const Icon = cfg.icon;
              const isActive = selectedService === key;
              return (
                <button key={key} onClick={() => { setSelectedService(key); setSelectedTemplate(null); setFieldValues({}); }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer whitespace-nowrap border ${
                    isActive ? `bg-${cfg.accent}-50 text-${cfg.accent}-700 border-${cfg.accent}-200 shadow-sm` : "bg-white text-gray-600 hover:bg-gray-50 border-gray-200"
                  }`}>
                  <Icon size={16} />
                  {cfg.label}
                  {isActive && <Check size={14} className="ml-1" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] w-full mx-auto p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left sidebar (Templates) ── */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-[100px]">
              <div className="px-4 py-3.5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Templates</p>
                <span className="text-[10px] bg-white border border-gray-200 text-gray-500 px-2.5 py-0.5 rounded-full font-bold shadow-sm">{templates.length}</span>
              </div>
              <div className="divide-y divide-gray-50 max-h-[calc(100vh-200px)] overflow-y-auto">
                {templates.length === 0 && (
                  <p className="px-4 py-8 text-xs text-center text-gray-400">No templates available.</p>
                )}
                {templates.map(t => (
                  <button key={t.id} onClick={() => handleSelectTemplate(t)}
                    className={`w-full text-left px-4 py-3.5 transition cursor-pointer group ${
                      selectedTemplate?.id === t.id ? "bg-indigo-50/60" : "hover:bg-gray-50"
                    }`}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        selectedTemplate?.id === t.id ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500"
                      }`}>
                        <FileText size={14} />
                      </div>
                      <p className={`text-xs font-semibold leading-relaxed pt-1 ${
                        selectedTemplate?.id === t.id ? "text-indigo-700" : "text-gray-600"
                      }`}>{t.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className="flex-1 min-w-0">
            {!selectedTemplate ? (
              <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border border-dashed border-gray-200">
                <BookOpen size={40} className="text-gray-200 mb-4" />
                <p className="text-gray-400 font-semibold text-sm">Select a template to get started</p>
                <p className="text-gray-300 text-xs mt-1">Choose a service type and template from the left panel</p>
              </div>
            ) : (
              <div className="space-y-4">

                {/* Toolbar */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-0.5">{SERVICE_CONFIG[selectedTemplate.serviceType]?.label}</p>
                    <h2 className="text-sm font-bold text-gray-900">{selectedTemplate.name}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setMode(mode === "edit" ? "preview" : "edit")}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition cursor-pointer">
                      {mode === "edit" ? <><Eye size={13} /> Preview</> : <><Edit3 size={13} /> Edit</>}
                    </button>
                    <button onClick={handlePrint}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer">
                      <Printer size={13} /> Print / Export
                    </button>
                  </div>
                </div>

                <div className={`grid gap-4 ${mode === "edit" ? "grid-cols-[1fr_1.4fr]" : "grid-cols-1"}`}>

                  {/* Fields panel */}
                  {mode === "edit" && (
                    <div className="flex flex-col gap-4">
                      <LetterheadSettings config={letterheadConfig} setConfig={setLetterheadConfig} />
                      
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-1">
                        <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2">
                          <Edit3 size={14} className="text-yellow-500" />
                          <p className="text-xs font-bold text-gray-700">Fill Dynamic Fields</p>
                          <span className="ml-auto text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">
                            {selectedTemplate.fields.length} fields
                          </span>
                        </div>
                        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                          {selectedTemplate.fields.map(field => (
                            <FieldInput
                              key={field.id}
                              field={field}
                              value={fieldValues[field.id] || ""}
                              onChange={val => handleFieldChange(field.id, val)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Document preview */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2">
                      <Eye size={14} className="text-indigo-500" />
                      <p className="text-xs font-bold text-gray-700">Document Preview</p>
                      <span className="ml-auto text-[10px] bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-yellow-400" /> = Dynamic fields
                      </span>
                    </div>
                    <div className="bg-gray-100 flex-1 overflow-y-auto p-4 md:p-8 flex justify-center max-h-[75vh]">
                      <div style={{ zoom: 0.75 }}>
                        <div ref={printRef} className="bg-white shadow-lg border border-gray-200" style={{ width: '210mm', minHeight: '297mm', padding: '60px 75px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
                          <div className="document-wrapper" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            
                            {/* Header */}
                            <div style={{ 
                              visibility: letterheadConfig.includeText ? 'visible' : 'hidden',
                              minHeight: letterheadConfig.includeText ? 'auto' : '120px',
                              marginBottom: '20px',
                              fontFamily: 'sans-serif',
                              fontSize: '13px'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                {/* Removed logo placeholder */}
                                <div style={{ textAlign: 'right', flex: 1 }}>
                                  {letterheadConfig.companyName && (
                                    <div style={{ color: '#1e3a8a', fontWeight: 'bold', fontSize: '18px', marginBottom: '4px', textTransform: 'uppercase' }}>
                                      {letterheadConfig.companyName}
                                    </div>
                                  )}
                                  {letterheadConfig.address && <div><strong>Office:</strong> {letterheadConfig.address}</div>}
                                  {letterheadConfig.gstNo && <div><strong>GST No:</strong> {letterheadConfig.gstNo}</div>}
                                  {letterheadConfig.landline && <div><strong>Landline:</strong> {letterheadConfig.landline}</div>}
                                  {letterheadConfig.contactNo && <div><strong>Contact no:</strong> {letterheadConfig.contactNo}</div>}
                                </div>
                              </div>
                              <div style={{ borderBottom: (letterheadConfig.companyName || letterheadConfig.address || letterheadConfig.gstNo || letterheadConfig.landline || letterheadConfig.contactNo) ? '2px solid #1e3a8a' : 'none', marginTop: '10px' }} />
                            </div>

                            {/* Document Body */}
                            <div style={{ flex: 1 }}>
                              {Renderer ? <Renderer fields={fieldValues} /> : (
                                <p className="text-sm text-gray-400 text-center py-10">No renderer for this template.</p>
                              )}
                            </div>

                            {/* Footer */}
                            <div className="print-footer" style={{ 
                              visibility: letterheadConfig.includeText ? 'visible' : 'hidden',
                              marginTop: '40px',
                              paddingTop: '10px',
                              borderTop: (letterheadConfig.email || letterheadConfig.website) ? '1px dashed #333' : 'none',
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '13px',
                              fontFamily: 'sans-serif'
                            }}>
                              <div>{letterheadConfig.email && <><strong>Email:</strong> {letterheadConfig.email}</>}</div>
                              <div>{letterheadConfig.website && <><strong>Website:</strong> {letterheadConfig.website}</>}</div>
                            </div>
                            
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
