"use client";

import React, { useState, useEffect } from "react";
import { PortalLayout } from "../../components/layout/PortalLayout";
import { ReferralTrendChart } from "../../components/dashboard/ReferralTrendChart";
import { TopTestsCard } from "../../components/dashboard/TopTestsCard";
import { StatCards } from "../../components/dashboard/StatCards";
import { StatCardsShimmer, ChartsShimmer } from "../../components/ui/Shimmer";
import { useAuth } from "../../lib/auth-context";
import { fetchDoctorAnalytics } from "../../lib/api-client";
import { DoctorAnalytics } from "../../lib/types";
import {
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  Sparkles,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

export default function AnalyticsPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<DoctorAnalytics | null>(null);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetchDoctorAnalytics(token);
      if (res.success) {
        setAnalytics(res);
      }
    } catch (err) {
      console.warn("Could not load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const metrics = analytics?.metrics || {
    total_patients: 0,
    total_reports: 0,
    verified_reports: 0,
    pending_reports: 0,
    completion_rate: 100,
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
              <span>Referral Analytics & Performance</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Clinical volume trends, test distribution, and laboratory turnaround performance.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Analytics</span>
          </button>
        </div>

        {loading ? (
          <>
            <StatCardsShimmer />
            <ChartsShimmer />
          </>
        ) : (
          <>
            {/* 1. KPI Stats Summary */}
            <StatCards metrics={metrics} />

            {/* 2. Charts Section */}
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

        {/* 3. Diagnostic Turnaround & Quality Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                98.2% Same-Day Turnaround
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Routine hematology, biochemistry and urine results verified within 4 hours.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                NABL Standard Compliant
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Calibrated multi-level automated QC validation performed before result release.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Instant WhatsApp Dispatch
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Patients receive verified digital PDF links instantly upon pathologist sign-off.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

