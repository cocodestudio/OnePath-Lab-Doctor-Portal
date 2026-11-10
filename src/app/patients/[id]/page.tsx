"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Download,
  CheckCircle2,
  Clock,
  CreditCard,
  AlertCircle,
  Stethoscope,
  ExternalLink,
  Barcode,
  Share2,
  RefreshCw,
  Eye,
  ShieldCheck,
  Receipt,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../../../lib/auth-context";
import {
  fetchDoctorPatientDetails,
  fetchDoctorSingleReport,
  getCleanLetterheadUrl,
} from "../../../lib/api-client";
import { downloadReportPdf } from "../../../lib/pdf-downloader";
import { PaginatedReportPreview, PrintSettings } from "../../../components/report-sheet";
import { PortalLayout } from "../../../components/layout/PortalLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../components/ui/table";
import { Separator } from "../../../components/ui/separator";
import { toast } from "../../../components/ui/toast";
import { DoctorReport, ReferredPatient } from "../../../lib/types";

interface ExtendedPatient extends ReferredPatient {
  uhid?: string | null;
  vial_barcode?: string | null;
  ref_doctor?: string | null;
  city?: string | null;
  pincode?: string | null;
  total_bills?: number;
}

interface BillItem {
  id: string;
  custom_id: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  payment_status: string;
  date: string;
}

function PatientHistoryContent() {
  const params = useParams();
  const router = useRouter();
  const { token, lab: authLab } = useAuth();
  const patientId = String(params?.id || "");

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<ExtendedPatient | null>(null);
  const [reports, setReports] = useState<DoctorReport[]>([]);
  const [bills, setBills] = useState<BillItem[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<string>("");
  const [renderReportData, setRenderReportData] = useState<any | null>(null);

  const offscreenPrintRef = useRef<HTMLDivElement>(null);

  const resolvedPrintSettings: PrintSettings = useMemo(() => {
    const lab = (renderReportData?.lab || authLab || {}) as any;
    const rawBg = lab.printBgImage || lab.print_bg_image || lab.letterhead_url || lab.letterheadUrl || null;
    const hasBg = Boolean(rawBg && rawBg !== "null" && rawBg !== "undefined" && rawBg !== "none");
    const bgImage = hasBg ? getCleanLetterheadUrl(rawBg) : null;

    return {
      bgImage,
      headerHeight: lab.printHeaderHeight ?? lab.print_header_height ?? 185,
      footerHeight: lab.printFooterHeight ?? lab.print_footer_height ?? 95,
      marginLeft: lab.printMarginLeft ?? lab.print_margin_left ?? 32,
      marginRight: lab.printMarginRight ?? lab.print_margin_right ?? 32,
    };
  }, [renderReportData, authLab]);

  // Load Patient Details & Full History
  const loadPatientData = async () => {
    if (!token || !patientId) return;
    setLoading(true);
    try {
      const res = await fetchDoctorPatientDetails(token, patientId);
      if (res.success && res.patient) {
        setPatient(res.patient);
        setReports(res.reports || []);
        setBills(res.bills || []);
      } else {
        toast.error("Not Found", res.error || "Patient details could not be found.");
      }
    } catch (err: any) {
      console.error("Failed to load patient history:", err);
      toast.error("Load Failed", err?.message || "Failed to load patient history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatientData();
  }, [token, patientId]);

  // Direct 1-Click PDF Download: Identical to LIS Admin Reports with Letterhead
  const handleDownloadReport = async (report: DoctorReport) => {
    if (!token) {
      toast.error("Unauthorized", "Session expired. Please log in again.");
      return;
    }

    const reportId = report.id || report.custom_id || "";
    if (!reportId) {
      toast.error("Error", "Report identifier is missing.");
      return;
    }

    try {
      setDownloadingId(report.id);
      setDownloadStatus("Fetching report...");

      const res = await fetchDoctorSingleReport(token, reportId);
      if (!res.success || !res.report) {
        throw new Error(res.error || "Could not retrieve clinical report details.");
      }

      const fullReport = res.report as any;
      const lab = (fullReport.lab || authLab || {}) as any;
      let labReportSettings: any = {};
      const rawSettings = lab.report_settings ?? lab.reportSettings;
      if (typeof rawSettings === "string") {
        try {
          labReportSettings = JSON.parse(rawSettings || "{}");
        } catch {
          labReportSettings = {};
        }
      } else if (rawSettings && typeof rawSettings === "object") {
        labReportSettings = { ...rawSettings };
      }

      const repAny = report as any;
      const formatted = {
        ...fullReport,
        customId: fullReport.custom_id ?? fullReport.customId ?? repAny.customId ?? report.custom_id ?? "Report",
        custom_id: fullReport.custom_id ?? fullReport.customId ?? repAny.customId ?? report.custom_id ?? "Report",
        lab: {
          ...lab,
          report_settings: labReportSettings,
          reportSettings: labReportSettings,
        },
      };

      setRenderReportData(formatted);
      setDownloadStatus("Rendering layout...");

      // Wait 350ms for React to mount PaginatedReportPreview & compute exact page breaks
      await new Promise((r) => setTimeout(r, 350));

      if (!offscreenPrintRef.current) {
        throw new Error("Report rendering container was not ready.");
      }

      const pat = fullReport.patient || patient || report.patient || {};
      const patName = (pat.name || "Patient").replace(/[^a-zA-Z0-9_-]/g, "_");
      const code = (formatted.customId || "Report").replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `LabReport_${code}_${patName}.pdf`;

      await downloadReportPdf({
        element: offscreenPrintRef.current,
        filename,
        onProgress: (status) => setDownloadStatus(status),
      });

      toast.success("Downloaded", `${filename} downloaded successfully!`);
    } catch (err: any) {
      console.error("Direct PDF download error:", err);
      toast.error("Download Failed", err?.message || "Failed to download report PDF.");
    } finally {
      setDownloadingId(null);
      setDownloadStatus("");
    }
  };

  const patientInitial = patient?.name?.replace(/^(mr\.?|mrs\.?|ms\.?|dr\.?)\s+/i, "").charAt(0) || "P";

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Navigation Breadcrumb & Page Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/patients")}
              className="gap-1.5 shadow-2xs text-slate-700 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Patients</span>
            </Button>
            <div className="text-xs font-semibold text-slate-400">/ Patient Clinical History</div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadPatientData}
              disabled={loading}
              className="gap-1.5 shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
              <span>Refresh</span>
            </Button>
            {patient?.name && (
              <Button
                variant="softEmerald"
                size="sm"
                onClick={() => router.push(`/reports?search=${encodeURIComponent(patient.name)}`)}
                className="gap-1.5 shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Search in All Reports</span>
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-40 rounded-2xl bg-white border border-slate-200/90 p-6 flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-slate-100" />
              <div className="space-y-3 flex-1">
                <div className="h-6 w-48 bg-slate-100 rounded" />
                <div className="h-4 w-32 bg-slate-100 rounded" />
                <div className="h-4 w-64 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-64 rounded-2xl bg-white border border-slate-200/90 p-6" />
              <div className="lg:col-span-2 h-64 rounded-2xl bg-white border border-slate-200/90 p-6" />
            </div>
          </div>
        ) : !patient ? (
          <Card className="py-16 text-center shadow-2xs">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-800">Patient Record Not Found</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              The requested patient record could not be located or you may not have permission to view this case.
            </p>
            <Button
              variant="outline"
              className="mt-5 gap-2"
              onClick={() => router.push("/patients")}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Patients Directory</span>
            </Button>
          </Card>
        ) : (
          <>
            {/* Patient Header Banner */}
            <Card className="bg-gradient-to-r from-emerald-50/60 via-white to-teal-50/30 border-emerald-100/80 shadow-2xs overflow-hidden">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="flex items-start sm:items-center gap-4">
                    <Avatar className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-emerald-300 bg-emerald-100/60 shadow-xs">
                      <AvatarFallback className="text-emerald-900 font-extrabold text-2xl">
                        {patientInitial}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                          {patient.name}
                        </h1>
                        {patient.gender && (
                          <Badge variant="secondary" className="font-semibold text-xs capitalize">
                            {patient.gender}
                          </Badge>
                        )}
                        {patient.age && (
                          <Badge variant="outline" className="font-semibold text-xs bg-white">
                            {patient.age} {patient.age_unit || "Y"}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                        {patient.custom_id && (
                          <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                            ID: #{patient.custom_id}
                          </span>
                        )}
                        {patient.uhid && (
                          <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                            UHID: {patient.uhid}
                          </span>
                        )}
                        {patient.registered_at && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            Reg: {patient.registered_at}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Summary Stats Badges */}
                  <div className="flex items-center gap-3">
                    <div className="bg-white border border-slate-200/90 rounded-xl px-4 py-3 text-center shadow-2xs min-w-[100px]">
                      <div className="text-xl font-extrabold text-emerald-800">
                        {reports.length}
                      </div>
                      <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                        Total Reports
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200/90 rounded-xl px-4 py-3 text-center shadow-2xs min-w-[100px]">
                      <div className="text-xl font-extrabold text-slate-800">
                        {bills.length}
                      </div>
                      <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                        Total Invoices
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Content Grid: Left Column (Personal Details & Invoices) / Right Column (Investigation Reports) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Personal Information & Billing */}
              <div className="space-y-6">
                {/* Personal Information Card */}
                <Card className="shadow-2xs">
                  <CardHeader className="py-4 px-5 border-b border-slate-100">
                    <CardTitle className="text-xs uppercase tracking-wider text-slate-600 font-bold flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>Patient Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4 text-xs sm:text-sm">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Full Name
                      </div>
                      <div className="font-bold text-slate-800 mt-0.5">{patient.name}</div>
                    </div>

                    <Separator />

                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Contact Phone
                      </div>
                      {patient.phone ? (
                        <div className="flex items-center justify-between mt-1">
                          <div className="font-mono font-bold text-slate-800 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{patient.phone}</span>
                          </div>
                          <a
                            href={`tel:${patient.phone}`}
                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                          >
                            Call
                          </a>
                        </div>
                      ) : (
                        <div className="text-slate-400 mt-0.5">— Not Provided —</div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Email Address
                      </div>
                      <div className="text-slate-700 mt-0.5 font-medium break-all">
                        {patient.email || "— Not Provided —"}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Residential Address
                      </div>
                      <div className="text-slate-700 mt-0.5 font-medium leading-relaxed">
                        {patient.address || [patient.city, patient.pincode].filter(Boolean).join(", ") || "— Address not registered —"}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Referring Clinician
                      </div>
                      <div className="font-bold text-emerald-800 mt-0.5 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{patient.ref_doctor || "Referring Doctor"}</span>
                      </div>
                    </div>

                    {patient.vial_barcode && (
                      <>
                        <Separator />
                        <div>
                          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Vial Barcode
                          </div>
                          <div className="font-mono font-bold text-slate-700 mt-0.5 flex items-center gap-1.5">
                            <Barcode className="w-3.5 h-3.5 text-slate-500" />
                            <span>{patient.vial_barcode}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Billing & Invoices Overview */}
                <Card className="shadow-2xs">
                  <CardHeader className="py-4 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs uppercase tracking-wider text-slate-600 font-bold flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-emerald-600" />
                      <span>Billing Invoices</span>
                    </CardTitle>
                    <Badge variant="secondary" className="font-mono text-[11px]">
                      {bills.length}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-0">
                    {bills.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        No billing invoices recorded.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {bills.map((b) => (
                          <div key={b.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono font-bold text-xs text-slate-800">
                                #{b.custom_id || b.id.substring(0, 8)}
                              </span>
                              <Badge
                                variant={
                                  b.payment_status === "PAID"
                                    ? "success"
                                    : b.payment_status === "PARTIAL"
                                    ? "warning"
                                    : "destructive"
                                }
                                className="text-[10px]"
                              >
                                {b.payment_status}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                              <span>Total: ₹{b.total_amount.toLocaleString()}</span>
                              <span className="text-[11px]">{b.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Investigation Reports History */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-2xs overflow-hidden">
                  <CardHeader className="py-4 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span>All Diagnostic Investigation Reports</span>
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Current and historical pathology/radiology reports with letterhead.
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {reports.length} Reports
                    </Badge>
                  </CardHeader>

                  <CardContent className="p-0">
                    {reports.length === 0 ? (
                      <div className="py-16 text-center text-slate-400">
                        <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-700">No Reports Available Yet</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Investigation reports will appear here once registered and generated.
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[180px]">Report ID & Date</TableHead>
                            <TableHead>Test Investigations</TableHead>
                            <TableHead className="w-[120px]">Status</TableHead>
                            <TableHead className="w-[140px] text-right pr-6">Download</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reports.map((rep) => {
                            const isDownloading = downloadingId === rep.id;
                            const isVerified =
                              rep.status === "VERIFIED" ||
                              rep.status === "APPROVED" ||
                              rep.status === "COMPLETED";

                            return (
                              <TableRow key={rep.id} className="hover:bg-slate-50/60">
                                <TableCell>
                                  <div className="font-mono font-bold text-xs text-slate-900">
                                    {rep.custom_id || rep.barcode || "Report"}
                                  </div>
                                  <div className="text-[11px] text-slate-400 mt-0.5">
                                    {rep.date || "—"}
                                  </div>
                                </TableCell>

                                <TableCell>
                                  <div className="font-medium text-xs text-slate-800 line-clamp-2">
                                    {rep.tests && rep.tests.length > 0
                                      ? rep.tests.join(", ")
                                      : "General Diagnostic Panel"}
                                  </div>
                                  {rep.total_tests && rep.total_tests > 1 && (
                                    <div className="text-[10px] text-slate-400 mt-0.5 font-semibold">
                                      {rep.total_tests} Tests Included
                                    </div>
                                  )}
                                </TableCell>

                                <TableCell>
                                  {isVerified ? (
                                    <Badge variant="success" className="gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>{rep.status}</span>
                                    </Badge>
                                  ) : (
                                    <Badge variant="warning" className="gap-1">
                                      <Clock className="w-3 h-3 text-amber-600" />
                                      <span>{rep.status || "PENDING"}</span>
                                    </Badge>
                                  )}
                                </TableCell>

                                <TableCell className="text-right pr-6">
                                  <Button
                                    variant={isVerified ? "emerald" : "outline"}
                                    size="sm"
                                    onClick={() => handleDownloadReport(rep)}
                                    disabled={isDownloading}
                                    className="gap-1.5 shadow-2xs text-xs font-semibold"
                                  >
                                    <Download
                                      className={`w-3.5 h-3.5 ${
                                        isDownloading ? "animate-bounce" : ""
                                      }`}
                                    />
                                    <span>
                                      {isDownloading
                                        ? downloadStatus || "Generating..."
                                        : "Download PDF"}
                                    </span>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>

      {/* OFFSCREEN CONTAINER FOR DIRECT PDF RENDERING (LETTERHEAD INCLUDED) */}
      <div
        style={{
          position: "fixed",
          left: "-9999px",
          top: "0px",
          width: "794px",
          zIndex: -9999,
          opacity: 1,
          pointerEvents: "none",
        }}
        aria-hidden
      >
        {renderReportData && (
          <PaginatedReportPreview
            ref={offscreenPrintRef}
            report={renderReportData}
            settings={resolvedPrintSettings}
            scale={1}
            autoFitToFooter={true}
          />
        )}
      </div>
    </PortalLayout>
  );
}

export default function PatientHistoryPage() {
  return (
    <Suspense
      fallback={
        <PortalLayout>
          <div className="py-24 text-center text-slate-400 animate-pulse text-sm">
            Loading patient clinical profile...
          </div>
        </PortalLayout>
      }
    >
      <PatientHistoryContent />
    </Suspense>
  );
}
