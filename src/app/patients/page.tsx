"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { PortalLayout } from "../../components/layout/PortalLayout";
import { useAuth } from "../../lib/auth-context";
import { fetchDoctorPatients } from "../../lib/api-client";
import { ReferredPatient } from "../../lib/types";
import { TableShimmer, PageShellShimmer } from "../../components/ui/Shimmer";
import {
  Users,
  Search,
  RefreshCw,
  Phone,
  FileText,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Calendar,
  ArrowRight,
} from "lucide-react";

function PatientsContent() {
  const router = useRouter();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<ReferredPatient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadPatients = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetchDoctorPatients(token, {
        search: searchTerm.trim() || undefined,
        gender: genderFilter !== "ALL" ? genderFilter : undefined,
        page: currentPage,
        per_page: 15,
      });

      if (res.success && Array.isArray(res.patients)) {
        setPatients(res.patients);
        setTotalPages(res.pagination?.last_page || 1);
        setTotalCount(res.pagination?.total || res.patients.length);
      } else {
        setPatients([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.warn("Failed to load patients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [token, genderFilter, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPatients();
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-emerald-600" />
              <span>Referred Patients Directory</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              All patients referred by your clinical practice registered at the diagnostic laboratory.
            </p>
          </div>

          <button
            onClick={() => loadPatients()}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search & Gender Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by patient name, phone or custom ID..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs sm:text-sm"
            />
          </form>

          <select
            value={genderFilter}
            onChange={(e) => {
              setGenderFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="ALL">All Genders</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Patients Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Patients List ({totalCount})
            </span>
          </div>

          {loading ? (
            <TableShimmer rows={6} />
          ) : patients.length === 0 ? (
            <div className="py-20 text-center text-slate-500">
              <UserCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">No Referred Patients Found</p>
              <p className="text-xs text-slate-400 mt-1">
                Patients who register at the laboratory with your referral will show up here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 sm:px-6 py-3.5">Patient Name</th>
                    <th className="px-4 py-3.5">Age & Gender</th>
                    <th className="px-4 py-3.5">Contact Number</th>
                    <th className="px-4 py-3.5">Referred Reports</th>
                    <th className="px-4 py-3.5">Latest Status</th>
                    <th className="px-5 sm:px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((pat) => (
                    <tr
                      key={pat.id}
                      className="hover:bg-slate-50/80 transition cursor-pointer"
                      onClick={() =>
                        router.push(`/reports?search=${encodeURIComponent(pat.name)}`)
                      }
                    >
                      <td className="px-5 sm:px-6 py-4">
                        <div className="font-bold text-slate-900 truncate max-w-[180px]">
                          {pat.name}
                        </div>
                        {pat.custom_id && (
                          <div className="text-[11px] font-mono text-slate-400">
                            #{pat.custom_id}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-medium text-slate-800">
                          {pat.age ? `${pat.age} ${pat.age_unit || "Y"}` : "—"}
                        </span>
                        <span className="text-slate-500 ml-1">
                          ({pat.gender || "N/A"})
                        </span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        {pat.phone ? (
                          <span className="inline-flex items-center gap-1 font-mono text-slate-700">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>+91 {pat.phone}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 font-semibold text-xs text-slate-800 border border-slate-200">
                          <FileText className="w-3 h-3 text-slate-500" />
                          <span>{pat.total_reports} reports</span>
                        </span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            pat.latest_report_status === "VERIFIED" ||
                            pat.latest_report_status === "APPROVED" ||
                            pat.latest_report_status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {pat.latest_report_status || "Registered"}
                        </span>
                      </td>

                      <td className="px-5 sm:px-6 py-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                          <span>View Reports</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <div>
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || loading}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages || loading}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}

export default function PatientsPage() {
  return (
    <Suspense fallback={<PageShellShimmer />}>
      <PatientsContent />
    </Suspense>
  );
}

