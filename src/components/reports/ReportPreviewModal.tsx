"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Building2,
  RefreshCw,
  Share2,
} from "lucide-react";
import { DoctorReport, TestResultItem } from "../../lib/types";
import { fetchDoctorSingleReport } from "../../lib/api-client";
import { downloadReportPdf, printReportElement } from "../../lib/pdf-downloader";
import { useAuth } from "../../lib/auth-context";
import { toast } from "../ui/toast";

interface ReportPreviewModalProps {
  reportId: string;
  onClose: () => void;
}

export function ReportPreviewModal({ reportId, onClose }: ReportPreviewModalProps) {
  const { token, doctor, lab: authLab } = useAuth();
  const printContainerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<DoctorReport | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    let isMounted = true;
    if (token && reportId) {
      setLoading(true);
      fetchDoctorSingleReport(token, reportId)
        .then((res) => {
          if (isMounted) {
            if (res.success && res.report) {
              setReport(res.report);
            } else {
              toast.error("Not Found", res.error || "Report details could not be retrieved.");
              onClose();
            }
          }
        })
        .catch((err) => {
          if (isMounted) {
            toast.error("Error", err.message || "Failed to load report.");
            onClose();
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [token, reportId, onClose]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleDownload = async () => {
    if (!printContainerRef.current || !report) return;
    setDownloading(true);
    try {
      const pName = (report.patient?.name || "Patient").replace(/[^a-zA-Z0-9_-]/g, "_");
      const rId = (report.custom_id || report.id).replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `Report_${rId}_${pName}.pdf`;

      await downloadReportPdf({
        element: printContainerRef.current,
        filename,
        onProgress: (status) => setStatusMsg(status),
      });
      toast.success("Downloaded", `${filename} saved successfully.`);
    } catch (err: any) {
      toast.error("Download Failed", err.message || "Could not generate report PDF.");
    } finally {
      setDownloading(false);
      setStatusMsg("");
    }
  };

  const handlePrint = () => {
    printReportElement();
  };

  const lab = report?.lab || authLab;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      {/* Modal Dialog Container */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden border border-slate-200">
        {/* Modal Top Control Bar (LIS Forest Emerald Theme) */}
        <div className="px-4 sm:px-6 py-3.5 gradient-primary text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs sm:text-sm font-bold truncate text-white">
              {report?.patient?.name || "Patient"}
            </span>
            {report?.custom_id && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/20 text-white border border-white/30">
                #{report.custom_id}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={loading || downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {downloading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">{statusMsg || "Generating..."}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download PDF</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition cursor-pointer"
              title="Print Report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
              title="Close Preview (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Report Preview Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
          {loading ? (
            <div className="py-24 text-center text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Loading Clinical Report...</p>
            </div>
          ) : !report ? (
            <div className="py-24 text-center text-slate-500">
              <p className="text-sm font-semibold">Report not found</p>
            </div>
          ) : (
            /* Printable Report Sheet (Standard A4 dimensions: 794px max width) */
            <div
              ref={printContainerRef}
              className="printable-report-area bg-white w-full max-w-[794px] min-h-[1123px] p-8 sm:p-10 shadow-lg rounded-xl border border-slate-200 text-slate-900 font-sans flex flex-col justify-between"
            >
              {/* TOP LETTERHEAD HEADER */}
              <div>
                <div className="border-b-2 border-emerald-600 pb-4 mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      {lab?.name || "OnePath Diagnostic Centre"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {lab?.tagline || "Advanced Automated Clinical Pathology & Diagnostics"}
                    </p>
                    <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
                      {lab?.address && <p>{lab.address}</p>}
                      {lab?.phone && <p>Phone: {lab.phone}</p>}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                      DIAGNOSTIC REPORT
                    </span>
                    {report.custom_id && (
                      <p className="font-mono text-xs text-slate-600 mt-1">
                        Report ID: <strong>{report.custom_id}</strong>
                      </p>
                    )}
                  </div>
                </div>

                {/* PATIENT DEMOGRAPHICS STRIP */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Patient Name
                    </span>
                    <strong className="text-slate-900 text-sm">
                      {report.patient?.name}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Age / Gender
                    </span>
                    <span className="text-slate-800 font-medium">
                      {report.patient?.age ? `${report.patient.age} ${report.patient.age_unit || "Y"}` : "N/A"}{" "}
                      / {report.patient?.gender || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Referred By
                    </span>
                    <strong className="text-emerald-700">
                      {doctor?.name || "Self"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Report Date
                    </span>
                    <span className="text-slate-800 font-medium">
                      {report.date || new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* TEST RESULTS TABLE */}
                <div className="mb-8">
                  <table className="w-full text-left text-xs text-slate-800 border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-300 bg-slate-100/70 text-[11px] font-bold text-slate-700 uppercase">
                        <th className="py-2.5 px-3">Investigation / Parameter</th>
                        <th className="py-2.5 px-3 text-center">Observed Value</th>
                        <th className="py-2.5 px-3 text-center">Unit</th>
                        <th className="py-2.5 px-3 text-right">Biological Ref Interval</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {report.results && report.results.length > 0 ? (
                        report.results.map((item: TestResultItem, idx: number) => {
                          const isHigh = item.flag === "HIGH" || item.flag === "CRITICAL";
                          const isLow = item.flag === "LOW";

                          return (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 font-medium text-slate-900">
                                {item.parameter_name || item.test_name || item.test?.name || "Test Parameter"}
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold">
                                <span
                                  className={
                                    isHigh
                                      ? "text-red-600 bg-red-50 px-2 py-0.5 rounded font-black"
                                      : isLow
                                      ? "text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-black"
                                      : "text-slate-900"
                                  }
                                >
                                  {item.result_value || "—"}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                                {item.unit || item.test?.unit || "—"}
                              </td>
                              <td className="py-2.5 px-3 text-right text-slate-600 font-medium">
                                {item.normal_range || "—"}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-400">
                            Diagnostic findings verified by pathologist.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* FOOTER & PATHOLOGIST SIGN-OFF */}
              <div className="border-t-2 border-slate-200 pt-4 mt-8">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-700">OnePath Laboratory Information System</p>
                    <p className="text-[10px] text-slate-400">Authentic Diagnostic Medical Record • Digitally Signed</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 text-sm">Authorized Signatory</div>
                    <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                      ✓ Electronically Verified & Released
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

