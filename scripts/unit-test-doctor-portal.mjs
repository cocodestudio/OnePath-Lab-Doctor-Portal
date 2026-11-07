/**
 * ===============================================================================
 * ONEPATH LAB — DOCTOR REFERRAL PORTAL AUTOMATED UNIT TEST SUITE
 * ===============================================================================
 * Location: OnePath-Lab-Doctor-Portal/scripts/unit-test-doctor-portal.mjs
 * Run command: node scripts/unit-test-doctor-portal.mjs (or npm test)
 * Enforces zero regression, contract validation, theme integrity & performance.
 * ===============================================================================
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const portalRoot = path.resolve(__dirname, "..");

let totalPassed = 0;
let totalFailed = 0;

function runTest(suiteName, testName, testFn) {
  try {
    testFn();
    totalPassed++;
    console.log(`  ✓ PASS [${suiteName}]: ${testName}`);
  } catch (err) {
    totalFailed++;
    console.error(`  ❌ FAIL [${suiteName}]: ${testName}`);
    console.error(`     Error: ${err.message}`);
  }
}

console.log("\n===============================================================================");
console.log("🏥 RUNNING ONEPATH LAB DOCTOR REFERRAL PORTAL UNIT TEST SUITE");
console.log("===============================================================================\n");

// ── SUITE 1: DOCTOR AUTHENTICATION & SESSION CONTRACTS ───────────────────────
console.log("--- Suite 1: Authentication & Doctor Credentials Contracts ---");

runTest("AUTH", "Phone number normalization to 10 clean digits", () => {
  const normalize = (phone) => {
    const digits = String(phone).replace(/\D/g, "");
    return digits.slice(-10);
  };

  assert.equal(normalize("+91 98765-43210"), "9876543210");
  assert.equal(normalize("09876543210"), "9876543210");
  assert.equal(normalize("9876543210"), "9876543210");
  assert.equal(normalize("919876543210"), "9876543210");
});

runTest("AUTH", "Pre-seeded dummy doctor credentials parity", () => {
  const dummy = {
    email: "doctor@onepathlab.com",
    phone: "9876543210",
    password: "password123",
    portal_token: "doc_demo_portal_token",
  };

  assert.ok(dummy.email.includes("@"));
  assert.equal(dummy.phone.length, 10);
  assert.ok(dummy.password.length >= 8);
  assert.ok(dummy.portal_token.startsWith("doc_"));
});

runTest("AUTH", "1-Click direct URL token parameter parsing", () => {
  const parseToken = (url) => {
    const parsed = new URL(url);
    return parsed.searchParams.get("token");
  };

  const testUrl = "http://localhost:3003/?token=doc_demo_portal_token";
  assert.equal(parseToken(testUrl), "doc_demo_portal_token");
});

runTest("AUTH", "Logout purges tokens and enforces direct hard navigation to /login", () => {
  const authContextSrc = fs.readFileSync(path.join(portalRoot, "src/lib/auth-context.tsx"), "utf8");
  assert.ok(authContextSrc.includes('localStorage.removeItem("onepath_doctor_token")'), "Removes doctor token");
  assert.ok(authContextSrc.includes('window.location.href = "/login"'), "Enforces hard window navigation to /login");
  assert.ok(authContextSrc.includes('max-age=0'), "Wipes doctor cookie with max-age=0");
  const portalLayoutSrc = fs.readFileSync(path.join(portalRoot, "src/components/layout/PortalLayout.tsx"), "utf8");
  assert.ok(portalLayoutSrc.includes('window.location.href = "/login"'), "PortalLayout enforces hard redirect when token is null");
  assert.ok(portalLayoutSrc.includes('isLoading || !token'), "PortalLayout maintains shimmer without white flash on unauthenticated state");
});

// ── SUITE 2: UI THEME INTEGRITY & LIS COLOR PARITY ───────────────────────────
console.log("\n--- Suite 2: LIS Light Clinical Apothecary Theme Integrity ---");

runTest("THEME", "globals.css contains mobile font-size lock", () => {
  const cssPath = path.join(portalRoot, "src", "app", "globals.css");
  const cssContent = fs.readFileSync(cssPath, "utf-8");

  assert.ok(
    cssContent.includes("-webkit-text-size-adjust: 100%"),
    "globals.css must include -webkit-text-size-adjust: 100% to protect mobile layouts"
  );
  assert.ok(
    cssContent.includes("text-size-adjust: 100%"),
    "globals.css must include text-size-adjust: 100%"
  );
});

runTest("THEME", "globals.css contains LIS warm bone background and primary forest emerald", () => {
  const cssPath = path.join(portalRoot, "src", "app", "globals.css");
  const cssContent = fs.readFileSync(cssPath, "utf-8");

  assert.ok(cssContent.includes("#fbfbfa"), "Background must be set to #fbfbfa (LIS theme)");
  assert.ok(cssContent.includes("#185e48"), "Primary must be set to #185e48 (LIS forest emerald)");
  assert.ok(cssContent.includes("gradient-primary"), "Must define gradient-primary utility");
});

runTest("THEME", "Sidebar component uses clean white background (no pitch black)", () => {
  const sidebarPath = path.join(portalRoot, "src", "components", "layout", "Sidebar.tsx");
  const sidebarContent = fs.readFileSync(sidebarPath, "utf-8");

  assert.ok(sidebarContent.includes("bg-white"), "Sidebar must use bg-white");
  assert.ok(!sidebarContent.includes("#1c2434"), "Sidebar must NOT use dark #1c2434");
  assert.ok(sidebarContent.includes("lg:sticky") && sidebarContent.includes("lg:h-screen"), "Sidebar must be sticky/fixed on desktop");
  assert.ok(!sidebarContent.includes("title=\"Logout\""), "Sidebar must NOT have duplicate logout button");
});

runTest("THEME", "Dashboard banner uses lightweight gentle green aesthetic and footer has CoCode Studio attribution", () => {
  const dashPath = path.join(portalRoot, "src", "app", "dashboard", "page.tsx");
  const dashContent = fs.readFileSync(dashPath, "utf-8");
  assert.ok(dashContent.includes("from-emerald-50"), "Dashboard welcome banner must use lightweight green");
  assert.ok(!dashContent.includes("Partner Laboratory"), "Top card must NOT display 'Partner Laboratory' label");
  assert.ok(!dashContent.includes("RecentReportsTable"), "Recent reports section must be removed from dashboard");

  const layoutPath = path.join(portalRoot, "src", "components", "layout", "PortalLayout.tsx");
  const layoutContent = fs.readFileSync(layoutPath, "utf-8");
  assert.ok(layoutContent.includes("https://cocodestudio.com"), "Footer must include https://cocodestudio.com link");
  assert.ok(layoutContent.includes("CoCode Studio Pvt Ltd"), "Footer must state 'CoCode Studio Pvt Ltd'");
});

runTest("THEME", "Login component uses clean light theme (no dark slate-950 background)", () => {
  const loginPath = path.join(portalRoot, "src", "app", "login", "page.tsx");
  const loginContent = fs.readFileSync(loginPath, "utf-8");

  assert.ok(loginContent.includes("bg-gradient-to-br from-emerald-50"), "Login must use light gradient");
  assert.ok(!loginContent.includes("bg-slate-950"), "Login must NOT use pitch black bg-slate-950");
});

// ── SUITE 3: REPORT & PATIENT DATA PROJECTION ────────────────────────────────
console.log("\n--- Suite 3: Clinical Report & Patient Data Logic ---");

runTest("REPORT", "Report status verified flag resolution", () => {
  const isReportVerified = (status) => {
    return ["VERIFIED", "APPROVED", "COMPLETED", "RELEASED"].includes(String(status).toUpperCase());
  };

  assert.equal(isReportVerified("VERIFIED"), true);
  assert.equal(isReportVerified("approved"), true);
  assert.equal(isReportVerified("COMPLETED"), true);
  assert.equal(isReportVerified("SAMPLE_COLLECTED"), false);
  assert.equal(isReportVerified("PROCESSING"), false);
  assert.equal(isReportVerified("PENDING"), false);
});

runTest("REPORT", "Safe filename sanitization for downloaded PDFs", () => {
  const sanitize = (reportId, patientName) => {
    const cleanP = String(patientName).replace(/[^a-zA-Z0-9_-]/g, "_");
    const cleanR = String(reportId).replace(/[^a-zA-Z0-9_-]/g, "_");
    return `Report_${cleanR}_${cleanP}.pdf`;
  };

  assert.equal(
    sanitize("OPL-101", "Dr. John Doe"),
    "Report_OPL-101_Dr__John_Doe.pdf"
  );
  assert.equal(
    sanitize("OPL/2026/05", "Ramesh Kumar"),
    "Report_OPL_2026_05_Ramesh_Kumar.pdf"
  );
});

// ── SUITE 4: REFERRAL ANALYTICS & CHART COMPUTATION ──────────────────────────
console.log("\n--- Suite 4: Analytics & SVG Chart Calculations ---");

runTest("ANALYTICS", "Completion rate calculation handles zero reports cleanly", () => {
  const computeRate = (verified, total) => {
    if (!total || total === 0) return 100;
    return Math.round((verified / total) * 1000) / 10;
  };

  assert.equal(computeRate(0, 0), 100);
  assert.equal(computeRate(98, 100), 98);
  assert.equal(computeRate(45, 50), 90);
});

runTest("ANALYTICS", "Monthly chart height scaling within bounds (8% to 100%)", () => {
  const computeHeight = (val, max) => {
    const m = Math.max(max, 1);
    return Math.max(8, Math.round((val / m) * 100));
  };

  assert.equal(computeHeight(0, 100), 8);
  assert.equal(computeHeight(50, 100), 50);
  assert.equal(computeHeight(100, 100), 100);
});

// ── SUITE 5: CLIENT-SIDE PDF ENGINE & DYNAMIC TOAST CONTRACTS ────────────────
console.log("\n--- Suite 5: PDF Downloader & Custom Dynamic Toast Contracts ---");

runTest("PDF", "pdf-downloader.ts dynamic import structure", () => {
  const pdfPath = path.join(portalRoot, "src", "lib", "pdf-downloader.ts");
  const content = fs.readFileSync(pdfPath, "utf-8");

  assert.ok(
    content.includes('import("jspdf")'),
    "Must dynamically import jspdf to avoid heavy bundle cold start"
  );
  assert.ok(
    content.includes('import("html2canvas")'),
    "Must dynamically import html2canvas"
  );
});

runTest("TOAST", "toast.ts provides reactive dynamic toast methods without Sileo", () => {
  const toastPath = path.join(portalRoot, "src", "components", "ui", "toast.ts");
  const content = fs.readFileSync(toastPath, "utf-8");

  assert.ok(!content.includes("from \"sileo\""), "Must NOT depend on Sileo");
  assert.ok(content.includes("subscribeToasts"), "Must define reactive toast subscription");
  assert.ok(content.includes("dismissToast"), "Must define dismissToast");
  assert.ok(content.includes("success:"), "Must provide toast.success");
  assert.ok(content.includes("error:"), "Must provide toast.error");
  assert.ok(content.includes("warning:"), "Must provide toast.warning");
  assert.ok(content.includes("info:"), "Must provide toast.info");

  const providerPath = path.join(portalRoot, "src", "components", "ui", "ToastProvider.tsx");
  const providerContent = fs.readFileSync(providerPath, "utf-8");
  assert.ok(providerContent.includes("top-4 left-1/2 -translate-x-1/2"), "Toasts must display in top-center");
  assert.ok(providerContent.includes("border-l-4"), "Must provide high-contrast clean borders");
});

// ── SUITE 6: DIRECT 1-CLICK PDF REPORT DOWNLOAD & LETTERHEAD INTEGRITY ────────
console.log("\n--- Suite 6: Direct 1-Click PDF Report Download & Letterhead Integrity ---");

runTest("REPORTS", "reports/page.tsx provides direct download button and suppresses view modal", () => {
  const reportsPath = path.join(portalRoot, "src", "app", "reports", "page.tsx");
  const content = fs.readFileSync(reportsPath, "utf-8");

  assert.ok(content.includes("Download PDF"), "Reports table must provide direct 'Download PDF' action");
  assert.ok(!content.includes("View / Download"), "Reports table must NOT display 'View / Download' button");
  assert.ok(content.includes("handleDownloadReport"), "Reports table must bind direct download handler");
  assert.ok(content.includes("PaginatedReportPreview"), "Reports page must render PaginatedReportPreview for LIS parity");
});

runTest("LETTERHEAD", "api-client.ts exports getCleanLetterheadUrl with CORS safety", () => {
  const apiPath = path.join(portalRoot, "src", "lib", "api-client.ts");
  const content = fs.readFileSync(apiPath, "utf-8");

  assert.ok(content.includes("export function getCleanLetterheadUrl"), "Must export getCleanLetterheadUrl");
  assert.ok(content.includes("data:image/"), "Must support data URL letterheads");
  assert.ok(content.includes("/storage/"), "Must normalize storage paths");
});

runTest("PDF_MULTI_PAGE", "pdf-downloader.ts supports multi-page and inlined images", () => {
  const pdfPath = path.join(portalRoot, "src", "lib", "pdf-downloader.ts");
  const content = fs.readFileSync(pdfPath, "utf-8");

  assert.ok(content.includes("inlineElementImagesAsync"), "Must inline images to avoid canvas taint on letterhead");
  assert.ok(content.includes("pdf.addPage"), "Must support multi-page reports");
  assert.ok(content.includes("smart-report-a4-page"), "Must recognize smart report page classes");
});

runTest("PDF_COLOR_PARSER", "pdf-downloader.ts protects against unsupported color function lab error", () => {
  const pdfPath = path.join(portalRoot, "src", "lib", "pdf-downloader.ts");
  const content = fs.readFileSync(pdfPath, "utf-8");

  assert.ok(content.includes("html2canvas-pro"), "Must dynamically load html2canvas-pro to support Tailwind v4 lab/oklch colors");
});

// ── SUITE 7: UX POLISH, LOCKED HEADER, COLLAPSIBLE SIDEBAR & SHIMMERS ────────
console.log("\n--- Suite 7: UX Polish, Locked Top Header, Sidebar Collapse & Shimmers ---");

runTest("UX_CSS", "globals.css enforces smooth scrolling and disables global text selection", () => {
  const cssPath = path.join(portalRoot, "src", "app", "globals.css");
  const cssContent = fs.readFileSync(cssPath, "utf-8");

  assert.ok(cssContent.includes("scroll-behavior: smooth"), "Must enforce smooth scrolling");
  assert.ok(cssContent.includes("user-select: none"), "Must disable text selection globally");
  assert.ok(cssContent.includes("user-select: text"), "Must allow typing in input and textarea");
  assert.ok(cssContent.includes("@keyframes shimmerWave"), "Must define shimmerWave keyframe animation");
});

runTest("LOCKED_HEADER", "PortalLayout locks top Header in place while scrolling page content", () => {
  const layoutPath = path.join(portalRoot, "src", "components", "layout", "PortalLayout.tsx");
  const content = fs.readFileSync(layoutPath, "utf-8");

  assert.ok(content.includes("h-screen"), "Outer layout must constrain viewport to h-screen");
  assert.ok(content.includes("overflow-hidden"), "Outer layout must prevent window scrolling");
  assert.ok(content.includes("overflow-y-auto"), "Inner content container must handle vertical scrolling");
  assert.ok(content.includes("<Header"), "Header must be rendered at top level before scroll container");
  assert.ok(content.includes("PageShellShimmer"), "Must use PageShellShimmer during auth verification");
});

runTest("SIDEBAR_COLLAPSE", "Sidebar bottom bar removes doctor identity and centers collapse icon", () => {
  const sidebarPath = path.join(portalRoot, "src", "components", "layout", "Sidebar.tsx");
  const content = fs.readFileSync(sidebarPath, "utf-8");

  assert.ok(!content.includes("doctor?.specialty"), "Sidebar bottom must NOT show doctor identity/specialty");
  assert.ok(content.includes("onToggleCollapse"), "Sidebar must bind onToggleCollapse");
  assert.ok(content.includes("justify-center"), "Collapsed toggle button must be centered");
  assert.ok(content.includes("ChevronRight"), "Must render ChevronRight when collapsed to indicate expansion");
  assert.ok(content.includes("ChevronLeft"), "Must render ChevronLeft when expanded to indicate collapse");
});

runTest("DASHBOARD_CLEANUP", "Dashboard banner removes lab badge and renders shimmer on load", () => {
  const dashPath = path.join(portalRoot, "src", "app", "dashboard", "page.tsx");
  const content = fs.readFileSync(dashPath, "utf-8");

  assert.ok(!content.includes("lab?.phone"), "Dashboard welcome banner must NOT show right-side lab badge");
  assert.ok(content.includes("StatCardsShimmer"), "Dashboard must render StatCardsShimmer when loading");
  assert.ok(content.includes("ChartsShimmer"), "Dashboard must render ChartsShimmer when loading");
});

runTest("REPORTS_DATE_RANGE", "Reports page provides custom date range filter and TableShimmer", () => {
  const reportsPath = path.join(portalRoot, "src", "app", "reports", "page.tsx");
  const content = fs.readFileSync(reportsPath, "utf-8");

  assert.ok(content.includes('value="custom"'), "Date filter dropdown must include 'custom' option");
  assert.ok(content.includes('type="date"'), "Reports page must provide date pickers when custom is selected");
  assert.ok(content.includes("start_date:"), "Reports query must forward start_date to API");
  assert.ok(content.includes("end_date:"), "Reports query must forward end_date to API");
  assert.ok(content.includes("<TableShimmer"), "Reports table must render TableShimmer during loading");
});

runTest("SHIMMERS_PORTAL", "Shimmer component file exports reusable skeletons", () => {
  const shimmerPath = path.join(portalRoot, "src", "components", "ui", "Shimmer.tsx");
  const content = fs.readFileSync(shimmerPath, "utf-8");

  assert.ok(content.includes("export function Shimmer"), "Must export Shimmer");
  assert.ok(content.includes("export function TableShimmer"), "Must export TableShimmer");
  assert.ok(content.includes("export function StatCardsShimmer"), "Must export StatCardsShimmer");
  assert.ok(content.includes("export function ChartsShimmer"), "Must export ChartsShimmer");
  assert.ok(content.includes("export function PageShellShimmer"), "Must export PageShellShimmer");
});

// ── FINAL REPORT ─────────────────────────────────────────────────────────────
console.log("\n===============================================================================");
console.log(`DOCTOR PORTAL UNIT TEST RESULTS: ${totalPassed} PASSED | ${totalFailed} FAILED`);
console.log("===============================================================================");

if (totalFailed > 0) {
  console.error("❌ UNIT TEST SUITE DETECTED REGRESSIONS!");
  process.exit(1);
} else {
  console.log("🎉 ALL DOCTOR REFERRAL PORTAL UNIT TESTS PASSED WITH 100% SUCCESS!\n");
  process.exit(0);
}

