"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PortalLayout } from "../../components/layout/PortalLayout";
import { useAuth } from "../../lib/auth-context";
import {
  fetchDoctorReports,
  fetchDoctorSingleReport,
  getCleanLetterheadUrl,
} from "../../lib/api-client";
import { DoctorReport } from "../../lib/types";
import { downloadReportPdf } from "../../lib/pdf-downloader";
import { toast } from "../../components/ui/toast";
import { PaginatedReportPreview, PrintSettings } from "../../components/report-sheet";
import { TableShimmer, PageShellShimmer } from "../../components/ui/Shimmer";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/table";
import {
  FileText,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
  Filter,
} from "lucide-react";

function ReportsContent() {
  const searchParams = useSearchParams();
  const { token, lab: authLab } = useAuth();

  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<DoctorReport[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce search input by 350ms to prevent network lag while typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Direct 1-Click PDF Download State
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<string>("");
  const [renderReportData, setRenderReportData] = useState<any | null>(null);
  const offscreenPrintRef = useRef<HTMLDivElement>(null);

  // Print settings with laboratory letterhead background, header, and margins
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

  const loadReports = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetchDoctorReports(token, {
        search: debouncedSearch.trim() || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        filter: dateFilter !== "all" ? dateFilter : undefined,
        start_date: dateFilter === "custom" && startDate ? startDate : undefined,
        end_date: dateFilter === "custom" && endDate ? endDate : undefined,
        page: currentPage,
        per_page: 15,
      });

      if (res.success && Array.isArray(res.reports)) {
        setReports(res.reports);
        setTotalPages(res.pagination?.last_page || 1);
        setTotalCount(res.pagination?.total || res.reports.length);
      } else {
        setReports([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.warn("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [token, statusFilter, dateFilter, startDate, endDate, currentPage, debouncedSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(searchTerm);
    setCurrentPage(1);
    loadReports();
  };

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

      const pat = fullReport.patient || report.patient || {};
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

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-emerald-600" />
              <span>Referred Patient Reports</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Browse and directly download authentic diagnostic investigation reports with official letterhead.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadReports()}
              disabled={loading}
              className="gap-1.5 shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <Card className="p-4 shadow-2xs">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input with Debounce & Clear */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by patient, phone, patient ID, report ID, barcode, doctor..."
                className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs sm:text-sm transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setDebouncedSearch("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
                  title="Clear Search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Filter Dropdowns & Custom Date Pickers */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-2xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="VERIFIED">Verified & Ready</option>
                <option value="PROCESSING">In Processing</option>
                <option value="SAMPLE_COLLECTED">Sample Collected</option>
              </select>

              {/* Date Range Filter */}
              <select
                value={dateFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setDateFilter(val);
                  if (val !== "custom") {
                    setStartDate("");
                    setEndDate("");
                  }
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-2xs"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this_week">This Week</option>
                <option value="last_week">Last Week</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="custom">Custom Date Range</option>
              </select>

              {/* Custom Date Range Pickers (From / To) */}
              {dateFilter === "custom" && (
                <div className="flex items-center gap-2 flex-wrap bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 px-2.5 py-1.5 rounded-lg text-xs shadow-2xs">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">From:</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="bg-transparent text-slate-800 text-xs font-medium focus:outline-none cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 px-2.5 py-1.5 rounded-lg text-xs shadow-2xs">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">To:</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="bg-transparent text-slate-800 text-xs font-medium focus:outline-none cursor-pointer"
                    />
                  </div>
                  {(startDate || endDate) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStartDate("");
                        setEndDate("");
                        setCurrentPage(1);
                      }}
                      className="text-[11px] text-slate-400 hover:text-rose-600 px-2 h-7 rounded hover:bg-rose-50"
                      title="Clear Date Filters"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Reports Table Card */}
        <Card className="overflow-hidden shadow-2xs">
          <CardHeader className="py-4 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xs uppercase tracking-wider text-slate-600 font-bold">
                Total Reports
              </CardTitle>
              <Badge variant="secondary" className="font-mono text-[11px]">
                {totalCount}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <TableShimmer rows={6} />
            ) : reports.length === 0 ? (
              <div className="py-20 text-center text-slate-500">
                <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-700">No Matching Reports Found</p>
                <p className="text-xs text-slate-400 mt-1">
                  Try adjusting your search criteria or date filter.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[280px]">Patient Details</TableHead>
                    <TableHead>Test Investigations</TableHead>
                    <TableHead className="w-[180px]">Registered Date</TableHead>
                    <TableHead className="w-[140px]">Status</TableHead>
                    <TableHead className="w-[150px] text-right pr-6">Download</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => {
                    const isVerified =
                      report.status === "VERIFIED" ||
                      report.status === "APPROVED" ||
                      report.status === "COMPLETED" ||
                      report.status === "RELEASED";

                    const isDownloadingThis = downloadingId === report.id;
                    const patInitial = report.patient?.name?.charAt(0) || "P";

                    return (
                      <TableRow key={report.id} className="group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 rounded-xl bg-emerald-50 border-emerald-200">
                              <AvatarFallback className="text-emerald-800 font-bold text-xs">
                                {patInitial}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              {report.patient?.id ? (
                                <Link
                                  href={`/patients/${report.patient.id}`}
                                  className="font-bold text-slate-900 hover:text-emerald-700 truncate max-w-[190px] block transition-colors hover:underline"
                                  title="View Patient Clinical History"
                                >
                                  {report.patient?.name || "Patient"}
                                </Link>
                              ) : (
                                <div className="font-bold text-slate-900 truncate max-w-[190px]">
                                  {report.patient?.name || "Patient"}
                                </div>
                              )}
                              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <span>
                                  {report.patient?.age
                                    ? `${report.patient.age} ${report.patient.age_unit || "Y"}`
                                    : ""}
                                </span>
                                {report.patient?.gender && <span>• {report.patient.gender}</span>}
                                {report.custom_id && (
                                  <span className="font-mono text-slate-400">
                                    • #{report.custom_id}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-xs font-medium text-slate-800 line-clamp-2 max-w-xs leading-relaxed">
                            {report.tests_summary?.join(", ") ||
                              report.tests?.join(", ") ||
                              "Diagnostic Profile"}
                          </div>
                        </TableCell>

                        <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{report.date || new Date(report.created_at).toLocaleDateString()}</span>
                          </div>
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          {isVerified ? (
                            <Badge variant="success" className="gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{report.status}</span>
                            </Badge>
                          ) : report.status === "PROCESSING" ? (
                            <Badge variant="info" className="gap-1">
                              <Clock className="w-3 h-3 text-blue-600" />
                              <span>PROCESSING</span>
                            </Badge>
                          ) : (
                            <Badge variant="warning" className="gap-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>{report.status}</span>
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-right whitespace-nowrap pr-6">
                          <Button
                            variant="emerald"
                            size="sm"
                            onClick={() => handleDownloadReport(report)}
                            disabled={Boolean(downloadingId)}
                            className="gap-1.5"
                            title="Download Official Report PDF (with Letterhead)"
                          >
                            {isDownloadingThis ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>{downloadStatus || "Downloading..."}</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-3.5 h-3.5" />
                                <span>Download PDF</span>
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 bg-slate-50/50">
              <div className="font-medium">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="iconSm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || loading}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="iconSm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages || loading}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Offscreen Report Render Container for High-Fidelity Vector PDF Generation */}
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
      </div>
    </PortalLayout>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<PageShellShimmer />}>
      <ReportsContent />
    </Suspense>
  );
}
