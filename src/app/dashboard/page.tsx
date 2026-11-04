"use client";

import React, { useState, useEffect } from "react";
import { PortalLayout } from "../../components/layout/PortalLayout";
import { StatCards } from "../../components/dashboard/StatCards";
import { ReferralTrendChart } from "../../components/dashboard/ReferralTrendChart";
import { TopTestsCard } from "../../components/dashboard/TopTestsCard";
import { StatCardsShimmer, ChartsShimmer } from "../../components/ui/Shimmer";
import { useAuth } from "../../lib/auth-context";
import {
  fetchDoctorReports,
  fetchDoctorAnalytics,
} from "../../lib/api-client";
import { DoctorReport, DoctorAnalytics } from "../../lib/types";
import { Stethoscope } from "lucide-react";

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
        {/* Welcome Doctor Banner (Clean Apothecary Aesthetic) */}
        <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-slate-50 border border-emerald-200/80 rounded-3xl p-6 sm:p-8 text-slate-800 shadow-sm relative overflow-hidden">
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
          </div>
        </div>

        {loading ? (
          <>
            <StatCardsShimmer />
            <ChartsShimmer />
          </>
        ) : (
          <>
            {/* 1. KPI Stats Cards */}
            <StatCards metrics={metrics} />

            {/* 2. Referral Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ReferralTrendChart trends={analytics?.monthly_trends} />
              </div>
              <div>
                <TopTestsCard topTests={analytics?.top_tests} />
              </div>
            </div>
          </>
        )}
      </div>
    </PortalLayout>
  );
}
