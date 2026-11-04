"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  ChevronRight,
  CheckCircle2,
  Clock,
  Eye,
  Download,
} from "lucide-react";
import { DoctorReport } from "../../lib/types";

interface RecentReportsTableProps {
  reports: DoctorReport[];
  onOpenReport: (report: DoctorReport) => void;
}

export function RecentReportsTable({
  reports,
  onOpenReport,
}: RecentReportsTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Recent Referred Reports</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Latest diagnostic submissions and verified test results
          </p>
        </div>

        <Link
          href="/reports"
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200/60 transition"
        >
          <span>View All Reports</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table Content */}
      {reports.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm">
          <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-slate-700">No Reports Found</p>
          <p className="text-xs text-slate-400 mt-1">
            Referred patient reports will appear here as soon as tests are registered.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 sm:px-6 py-3">Patient Details</th>
                <th className="px-4 py-3">Tests Profile</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 sm:px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.slice(0, 7).map((report) => {
                const isVerified =
                  report.status === "VERIFIED" ||
                  report.status === "APPROVED" ||
                  report.status === "COMPLETED" ||
                  report.status === "RELEASED";

                return (
                  <tr
                    key={report.id}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                    onClick={() => onOpenReport(report)}
                  >
                    <td className="px-5 sm:px-6 py-3.5">
                      <div className="font-bold text-slate-900 truncate max-w-[160px] sm:max-w-xs">
                        {report.patient?.name || "Patient"}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>
                          {report.patient?.age
                            ? `${report.patient.age} ${report.patient.age_unit || "Y"}`
                            : ""}
                        </span>
                        {report.patient?.gender && (
                          <span>• {report.patient.gender}</span>
                        )}
                        {report.custom_id && (
                          <span className="font-mono text-slate-400">
                            • #{report.custom_id}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="text-xs font-medium text-slate-800 truncate max-w-[200px]">
                        {report.tests_summary?.join(", ") ||
                          report.tests?.join(", ") ||
                          "Diagnostic Profile"}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                      {report.date || new Date(report.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isVerified
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {isVerified ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-600" />
                        )}
                        <span>{report.status}</span>
                      </span>
                    </td>

                    <td className="px-5 sm:px-6 py-3.5 text-right whitespace-nowrap">
                      <div
                        className="inline-flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onOpenReport(report)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition cursor-pointer"
                          title="View High-Resolution Report"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

