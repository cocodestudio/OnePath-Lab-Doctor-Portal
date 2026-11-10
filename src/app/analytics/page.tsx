"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PortalLayout } from "../../components/layout/PortalLayout";
import { useAuth } from "../../lib/auth-context";
import { fetchDoctorAnalytics } from "../../lib/api-client";
import { DoctorAnalytics, CommissionBillItem, DoctorCommissionSummary } from "../../lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
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
import { TableShimmer } from "../../components/ui/Shimmer";
import {
  BadgePercent,
  TrendingUp,
  Receipt,
  Search,
  Calendar,
  Filter,
  RefreshCw,
  Phone,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  IndianRupee,
  Layers,
  ArrowRight,
  X,
  Printer,
} from "lucide-react";

export default function ReferralCommissionPage() {
  const { token, doctor } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<DoctorAnalytics | null>(null);

  // Filters state
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input by 350ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const loadCommissionData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetchDoctorAnalytics(token, {
        filter: dateFilter !== "all" ? dateFilter : undefined,
        start_date: dateFilter === "custom" && startDate ? startDate : undefined,
        end_date: dateFilter === "custom" && endDate ? endDate : undefined,
        search: debouncedSearch.trim() || undefined,
      });

      if (res.success) {
        setAnalytics(res);
      }
    } catch (err) {
      console.warn("Could not load referral commission:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommissionData();
  }, [token, dateFilter, startDate, endDate, debouncedSearch]);

  const summary: DoctorCommissionSummary = analytics?.commission_summary || {
    total_patients: 0,
    total_bills: 0,
    total_gross: 0,
    total_discount: 0,
    total_net_sales: 0,
    total_paid: 0,
    total_due: 0,
    total_doctor_commission: 0,
    average_commission_per_patient: 0,
    base_commission_percent: 0,
  };

  const bills: CommissionBillItem[] = analytics?.bills || [];

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-1.5 shadow-2xs">
              <BadgePercent className="w-3.5 h-3.5 text-emerald-600" />
              <span>LIS Referral Settlement</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Referral Commission & Earnings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Itemized patient commission ledger calculated per laboratory rates set in Admin LIS.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadCommissionData}
              disabled={loading}
              className="gap-1.5 shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
              <span>Refresh</span>
            </Button>
            <Button
              variant="softEmerald"
              size="sm"
              onClick={() => {
                if (typeof window !== "undefined") window.print();
              }}
              className="gap-1.5 shadow-2xs hidden sm:inline-flex"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Ledger</span>
            </Button>
          </div>
        </div>

        {/* 4 Key Summary KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Commission Earned (Highlight Card) */}
          <Card className="bg-gradient-to-br from-emerald-50/90 via-teal-50/30 to-white border-emerald-200/90 shadow-2xs">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  Total Commission
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-emerald-950 mt-2 font-mono">
                ₹{summary.total_doctor_commission.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                <span>Total clinician payout cut</span>
              </div>
            </CardContent>
          </Card>

          {/* 2. Total Net Clinical Billing */}
          <Card className="shadow-2xs">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Referred Sales
                </span>
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shadow-2xs">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 font-mono">
                ₹{summary.total_net_sales.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Across {summary.total_bills} patient bills
              </div>
            </CardContent>
          </Card>

          {/* 3. Base Commission Rate */}
          <Card className="shadow-2xs">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Base Commission Rate
                </span>
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/80 flex items-center justify-center shadow-2xs">
                  <BadgePercent className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-teal-900 mt-2 font-mono">
                {summary.base_commission_percent}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Set in Admin Cases & Referral
              </div>
            </CardContent>
          </Card>

          {/* 4. Average Commission Per Case */}
          <Card className="shadow-2xs">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Avg Yield / Patient
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center justify-center shadow-2xs">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 font-mono">
                ₹{summary.average_commission_per_patient.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Across {summary.total_patients} referred patients
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter & Search Toolbar */}
        <Card className="p-4 shadow-2xs bg-white">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by patient name, phone, or bill ID..."
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-xs sm:text-sm placeholder:text-slate-400 transition-all shadow-2xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Date Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-xl px-2.5 py-1.5 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
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
              </div>

              {dateFilter === "custom" && (
                <div className="flex items-center gap-2 flex-wrap animate-in fade-in-50">
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 px-2.5 py-1.5 rounded-lg text-xs shadow-2xs">
                    <span className="text-slate-400 font-bold text-[10px] uppercase">From:</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-transparent text-slate-800 text-xs font-medium focus:outline-none cursor-pointer"
                    >
                    </input>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 px-2.5 py-1.5 rounded-lg text-xs shadow-2xs">
                    <span className="text-slate-400 font-bold text-[10px] uppercase">To:</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-transparent text-slate-800 text-xs font-medium focus:outline-none cursor-pointer"
                    >
                    </input>
                  </div>
                  {(startDate || endDate) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStartDate("");
                        setEndDate("");
                      }}
                      className="text-[11px] text-slate-400 hover:text-rose-600 px-2 h-7"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Itemized Patient Referral Commission Table */}
        <Card className="overflow-hidden shadow-2xs">
          <CardHeader className="py-4 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xs uppercase tracking-wider text-slate-600 font-bold flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>Patient Referral Commission Ledger</span>
              </CardTitle>
              <Badge variant="secondary" className="font-mono text-[11px]">
                {bills.length} Records
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <TableShimmer rows={6} />
            ) : bills.length === 0 ? (
              <div className="py-20 text-center text-slate-500">
                <BadgePercent className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-700">No Commission Records Found</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Commission entries are automatically recorded as your referred patients register and complete billing at the laboratory.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[240px]">Patient Details</TableHead>
                    <TableHead className="w-[170px]">Bill No & Date</TableHead>
                    <TableHead>Investigation Tests</TableHead>
                    <TableHead className="w-[120px] text-right">Net Billed</TableHead>
                    <TableHead className="w-[90px] text-center">Rate</TableHead>
                    <TableHead className="w-[150px] text-right font-bold text-emerald-800">Doctor Commission</TableHead>
                    <TableHead className="w-[110px] text-center pr-5">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.map((b) => {
                    const patInitial = b.patient_name?.charAt(0) || "P";
                    return (
                      <TableRow key={b.bill_id} className="hover:bg-slate-50/70">
                        {/* Patient Details */}
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="w-8 h-8 rounded-xl bg-emerald-50 border-emerald-200">
                              <AvatarFallback className="text-emerald-800 font-bold text-xs">
                                {patInitial}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              {b.patient_id ? (
                                <Link
                                  href={`/patients/${b.patient_id}`}
                                  className="font-bold text-xs text-slate-900 hover:text-emerald-700 truncate max-w-[170px] block transition-colors hover:underline"
                                  title="View Patient Clinical History"
                                >
                                  {b.patient_name}
                                </Link>
                              ) : (
                                <div className="font-bold text-xs text-slate-900 truncate max-w-[170px]">
                                  {b.patient_name}
                                </div>
                              )}
                              <div className="text-[10.5px] text-slate-400 font-mono mt-0.5">
                                {b.patient_code ? `#${b.patient_code}` : ""}
                                {b.patient_phone ? ` • ${b.patient_phone}` : ""}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Bill Number & Date */}
                        <TableCell>
                          <div className="font-mono font-bold text-xs text-slate-800">
                            #{b.bill_number}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {b.date || "—"}
                          </div>
                        </TableCell>

                        {/* Investigation Tests */}
                        <TableCell>
                          <div className="text-xs font-medium text-slate-700 line-clamp-2 leading-relaxed">
                            {b.tests && b.tests.length > 0
                              ? b.tests.join(", ")
                              : "Diagnostic Investigation Panel"}
                          </div>
                        </TableCell>

                        {/* Net Billed */}
                        <TableCell className="text-right font-mono text-xs font-semibold text-slate-700">
                          ₹{b.net_amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>

                        {/* Applied Commission Rate */}
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-mono text-[11px] bg-slate-50 font-bold">
                            {b.commission_percent}%
                          </Badge>
                        </TableCell>

                        {/* Doctor Commission Cut */}
                        <TableCell className="text-right font-mono text-sm font-extrabold text-emerald-800">
                          ₹{b.doctor_commission.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>

                        {/* Payment Status Badge */}
                        <TableCell className="text-center pr-5">
                          {b.status === "PAID" ? (
                            <Badge variant="success" className="gap-1 text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>PAID</span>
                            </Badge>
                          ) : b.status === "PARTIAL" ? (
                            <Badge variant="warning" className="gap-1 text-[10px]">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>PARTIAL</span>
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1 text-[10px]">
                              <AlertCircle className="w-3 h-3" />
                              <span>UNPAID</span>
                            </Badge>
                          )}
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
    </PortalLayout>
  );
}
