"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { PortalLayout } from "../../components/layout/PortalLayout";
import { useAuth } from "../../lib/auth-context";
import { fetchDoctorPatients } from "../../lib/api-client";
import { ReferredPatient } from "../../lib/types";
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
  X,
  CheckCircle2,
  Clock,
  Eye,
} from "lucide-react";

function PatientsContent() {
  const router = useRouter();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<ReferredPatient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("ALL");
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

  const loadPatients = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetchDoctorPatients(token, {
        search: debouncedSearch.trim() || undefined,
        gender: genderFilter !== "ALL" ? genderFilter : undefined,
        filter: dateFilter !== "all" ? dateFilter : undefined,
        start_date: dateFilter === "custom" && startDate ? startDate : undefined,
        end_date: dateFilter === "custom" && endDate ? endDate : undefined,
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
  }, [token, genderFilter, dateFilter, startDate, endDate, currentPage, debouncedSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(searchTerm);
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadPatients()}
            disabled={loading}
            className="gap-1.5 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Search & Date / Gender Filter Toolbar */}
        <Card className="p-4 shadow-2xs">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input with Debounce & Clear */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by patient, phone, patient ID, barcode, report ID, doctor..."
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

            <div className="flex items-center gap-2 flex-wrap">
              {/* Gender Filter */}
              <select
                value={genderFilter}
                onChange={(e) => {
                  setGenderFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-2xs"
              >
                <option value="ALL">All Genders</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
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

        {/* Patients Table Card */}
        <Card className="overflow-hidden shadow-2xs">
          <CardHeader className="py-4 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xs uppercase tracking-wider text-slate-600 font-bold">
                Patients List
              </CardTitle>
              <Badge variant="secondary" className="font-mono text-[11px]">
                {totalCount}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[280px]">Patient Name</TableHead>
                    <TableHead className="w-[140px]">Age & Gender</TableHead>
                    <TableHead>Contact Number</TableHead>
                    <TableHead className="w-[140px]">Referred Reports</TableHead>
                    <TableHead className="w-[150px]">Latest Status</TableHead>
                    <TableHead className="w-[130px] text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((pat) => {
                    const patInitial = pat.name?.charAt(0) || "P";
                    return (
                      <TableRow
                        key={pat.id}
                        className="group cursor-pointer hover:bg-emerald-50/40"
                        onClick={() => router.push(`/patients/${pat.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 rounded-xl bg-emerald-50 border-emerald-200">
                              <AvatarFallback className="text-emerald-800 font-bold text-xs">
                                {patInitial}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate max-w-[190px] group-hover:text-emerald-800 transition-colors">
                                {pat.name}
                              </div>
                              {pat.custom_id && (
                                <div className="text-[11px] font-mono text-slate-400">
                                  #{pat.custom_id}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          <span className="font-medium text-slate-800">
                            {pat.age ? `${pat.age} ${pat.age_unit || "Y"}` : "—"}
                          </span>
                          {pat.gender && (
                            <span className="text-slate-400 text-xs ml-1">
                              ({pat.gender.charAt(0)})
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          {pat.phone ? (
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{pat.phone}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          <Badge variant="outline" className="font-bold gap-1 bg-slate-50">
                            <FileText className="w-3 h-3 text-slate-500" />
                            <span>{pat.total_reports || 0}</span>
                          </Badge>
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          {pat.latest_report_status === "VERIFIED" ||
                          pat.latest_report_status === "APPROVED" ||
                          pat.latest_report_status === "COMPLETED" ? (
                            <Badge variant="success" className="gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{pat.latest_report_status}</span>
                            </Badge>
                          ) : pat.latest_report_status && pat.latest_report_status !== "NONE" ? (
                            <Badge variant="warning" className="gap-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>{pat.latest_report_status}</span>
                            </Badge>
                          ) : (
                            <span className="text-slate-400 text-xs">No reports</span>
                          )}
                        </TableCell>

                        <TableCell className="text-right whitespace-nowrap pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="emerald"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/patients/${pat.id}`);
                              }}
                              className="gap-1 shadow-2xs text-xs font-semibold"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View History</span>
                            </Button>
                          </div>
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
