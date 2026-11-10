"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PortalLayout } from "../../components/layout/PortalLayout";
import { StatCards } from "../../components/dashboard/StatCards";
import { ReferralTrendChart } from "../../components/dashboard/ReferralTrendChart";
import { StatCardsShimmer, ChartsShimmer } from "../../components/ui/Shimmer";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useAuth } from "../../lib/auth-context";
import {
  fetchDoctorReports,
  fetchDoctorAnalytics,
} from "../../lib/api-client";
import { DoctorReport, DoctorAnalytics } from "../../lib/types";
import {
  Stethoscope,
  FileText,
  Users,
  BadgePercent,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const { doctor, token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<DoctorReport[]>([]);
  const [analytics, setAnalytics] = useState<DoctorAnalytics | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (token) {
      setLoading(true);
      Promise.all([
        fetchDoctorReports(token, { per_page: 8 }),
        fetchDoctorAnalytics(token),
      ])
        .then(([reportsData, analyticsData]) => {
          if (isMounted) {
            if (reportsData.success && Array.isArray(reportsData.reports)) {
              setReports(reportsData.reports);
            }
            if (analyticsData.success) {
              setAnalytics(analyticsData);
            }
          }
        })
        .catch((err) => {
          console.warn("Could not fetch dashboard data:", err);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [token]);

  const metrics = analytics?.metrics || {
    total_patients: reports.length > 0 ? new Set(reports.map((r) => r.patient?.id)).size : 0,
    total_reports: reports.length,
    verified_reports: reports.filter((r) => r.status === "VERIFIED" || r.status === "APPROVED" || r.status === "RELEASED").length,
    pending_reports: reports.filter((r) => r.status !== "VERIFIED" && r.status !== "APPROVED" && r.status !== "RELEASED").length,
    completion_rate: 100,
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Welcome Doctor Banner (Lightweight Soft Green Apothecary Aesthetic) */}
        <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-slate-50 border border-emerald-200/80 rounded-3xl p-6 sm:p-8 text-slate-800 shadow-2xs relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-bold mb-3 shadow-2xs">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-700" />
              <span>Doctor Referral Dashboard</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome, {doctor?.name || "Doctor"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
              Real-time pathology reports, turnaround metrics, and diagnostic findings for all your referred patients.
            </p>

            {/* Quick Action Badges */}
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <Link href="/reports">
                <Button variant="emerald" size="sm" className="gap-1.5 shadow-xs">
                  <FileText className="w-3.5 h-3.5" />
                  <span>View All Reports</span>
                  <ArrowRight className="w-3 h-3 ml-0.5" />
                </Button>
              </Link>
              <Link href="/patients">
                <Button variant="outline" size="sm" className="gap-1.5 bg-white/80 hover:bg-white">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>Referred Patients</span>
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600 hover:text-slate-900">
                  <BadgePercent className="w-3.5 h-3.5 text-slate-500" />
                  <span>Referral Commission</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {loading ? (
          <>
            <StatCardsShimmer />
            <ChartsShimmer fullWidth />
          </>
        ) : (
          <>
            {/* 1. KPI Stats Cards */}
            <StatCards metrics={metrics} />

            {/* 2. Full-Width Monthly Referral Volume Chart */}
            <div className="w-full">
              <ReferralTrendChart trends={analytics?.monthly_trends} />
            </div>
          </>
        )}
      </div>
    </PortalLayout>
  );
}
