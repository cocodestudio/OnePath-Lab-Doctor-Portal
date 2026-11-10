"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Activity,
  Award,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

interface MonthlyTrendItem {
  month: string;
  short_month: string;
  reports: number;
}

interface ReferralTrendChartProps {
  trends?: MonthlyTrendItem[];
}

export function ReferralTrendChart({ trends = [] }: ReferralTrendChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Fallback data if empty
  const data: MonthlyTrendItem[] =
    trends.length > 0
      ? trends
      : [
          { month: "May 2026", short_month: "May", reports: 24 },
          { month: "Jun 2026", short_month: "Jun", reports: 38 },
          { month: "Jul 2026", short_month: "Jul", reports: 45 },
          { month: "Aug 2026", short_month: "Aug", reports: 52 },
          { month: "Sep 2026", short_month: "Sep", reports: 61 },
          { month: "Oct 2026", short_month: "Oct", reports: 74 },
        ];

  const maxVal = Math.max(...data.map((d) => d.reports), 10);
  const minVal = Math.min(...data.map((d) => d.reports), 0);
  const totalReportsInPeriod = data.reduce((acc, d) => acc + d.reports, 0);
  const avgMonthly = Math.round(totalReportsInPeriod / (data.length || 1));

  // Find peak month
  const peakItem = data.reduce(
    (prev, current) => (current.reports > prev.reports ? current : prev),
    data[0]
  );

  // Growth calculation between last two months
  const lastMonth = data[data.length - 1]?.reports || 0;
  const prevMonth = data[data.length - 2]?.reports || 0;
  const growthRate =
    prevMonth > 0 ? Math.round(((lastMonth - prevMonth) / prevMonth) * 100) : 0;

  // Grid steps (0%, 25%, 50%, 75%, 100%)
  const ySteps = [
    { label: maxVal, pct: 100 },
    { label: Math.round(maxVal * 0.75), pct: 75 },
    { label: Math.round(maxVal * 0.5), pct: 50 },
    { label: Math.round(maxVal * 0.25), pct: 25 },
    { label: 0, pct: 0 },
  ];

  return (
    <Card className="w-full bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Header Bar */}
      <CardHeader className="p-5 sm:p-6 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
                <BarChart3 className="w-4 h-4" />
              </div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Monthly Referral Volume
              </CardTitle>
              <Badge variant="success" className="text-[11px] font-semibold gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                <span>Last 6 Months</span>
              </Badge>
              <Badge variant="outline" className="text-[11px] font-medium hidden sm:inline-flex bg-slate-50">
                Pathology & Radiology
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Month-on-month breakdown of diagnostic investigations referred across your clinical practice.
            </CardDescription>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200/90 text-emerald-800 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                Total Referred:
              </span>
              <span className="text-sm font-extrabold font-mono">
                {totalReportsInPeriod.toLocaleString()}
              </span>
            </div>

            {growthRate !== 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold shadow-2xs">
                <ArrowUpRight className="w-3.5 h-3.5 text-teal-600" />
                <span>{growthRate > 0 ? `+${growthRate}%` : `${growthRate}%`} vs prev mo</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Main Chart Area */}
      <CardContent className="p-5 sm:p-6 lg:p-8">
        <div className="relative w-full h-64 sm:h-72 lg:h-80 pt-6 pb-2">
          {/* Background Grid Lines & Y-Axis Labels */}
          <div className="absolute inset-x-0 inset-y-6 flex flex-col justify-between pointer-events-none">
            {ySteps.map((step, i) => (
              <div key={i} className="flex items-center gap-3 w-full">
                <span className="w-8 text-[10px] font-mono font-medium text-slate-400 text-right shrink-0">
                  {step.label}
                </span>
                <div className="w-full border-b border-dashed border-slate-100" />
              </div>
            ))}
          </div>

          {/* Interactive Bars Container */}
          <div className="relative h-full flex items-end justify-between gap-3 sm:gap-6 lg:gap-10 pl-11 pr-2 z-10">
            {data.map((item, idx) => {
              const heightPercent = Math.max(8, Math.round((item.reports / maxVal) * 100));
              const isHovered = hoveredIdx === idx;
              const isPeak = item.reports === maxVal && maxVal > 0;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                >
                  {/* Floating Rich Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute -top-14 z-30 bg-slate-900/95 backdrop-blur-md text-white py-1.5 px-3 rounded-xl shadow-xl shadow-slate-900/20 whitespace-nowrap border border-slate-700/80 pointer-events-none transition-all scale-100 animate-in fade-in-50 zoom-in-95">
                      <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>{item.month}</span>
                      </div>
                      <div className="text-[10px] text-slate-300 font-mono mt-0.5">
                        {item.reports} Investigations ({Math.round((item.reports / maxVal) * 100)}% of peak)
                      </div>
                    </div>
                  )}

                  {/* Peak Marker Badge */}
                  {isPeak && !isHovered && (
                    <div className="hidden sm:inline-flex items-center gap-1 text-[9.5px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-1.5 py-0.5 rounded-md mb-1.5 shadow-2xs">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-700" />
                      <span>Peak</span>
                    </div>
                  )}

                  {/* Value Above Bar */}
                  <span
                    className={`text-xs font-mono font-bold mb-1.5 transition-all ${
                      isHovered
                        ? "text-emerald-700 scale-110 font-extrabold"
                        : isPeak
                        ? "text-emerald-800 font-bold"
                        : "text-slate-500"
                    }`}
                  >
                    {item.reports}
                  </span>

                  {/* Bar Outer Track & Gradient Fill */}
                  <div className="w-full max-w-[56px] sm:max-w-[68px] lg:max-w-[80px] bg-slate-100/80 hover:bg-slate-100 rounded-t-2xl sm:rounded-t-3xl overflow-hidden h-full flex flex-col justify-end transition-colors shadow-2xs">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-2xl sm:rounded-t-3xl transition-all duration-300 ease-out ${
                        isHovered
                          ? "bg-gradient-to-t from-emerald-600 via-emerald-500 to-teal-400 shadow-lg shadow-emerald-600/30 brightness-105"
                          : isPeak
                          ? "bg-gradient-to-t from-emerald-600 via-emerald-500 to-teal-400 opacity-95"
                          : "bg-gradient-to-t from-emerald-500 to-teal-400 opacity-80 group-hover:opacity-100"
                      }`}
                    />
                  </div>

                  {/* Month Label */}
                  <div className="mt-3 text-center">
                    <span
                      className={`text-xs font-semibold block transition-colors ${
                        isHovered
                          ? "text-emerald-800 font-bold"
                          : "text-slate-600"
                      }`}
                    >
                      {item.short_month}
                    </span>
                    <span className="text-[10px] text-slate-400 hidden sm:block font-mono">
                      {item.month.split(" ")[1] || ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Metrics Summary Strip */}
        <div className="mt-8 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
              Total Tests
            </div>
            <div className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5 font-mono">
              {totalReportsInPeriod.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">In current 6mo cycle</div>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
              Monthly Average
            </div>
            <div className="text-base sm:text-lg font-extrabold text-emerald-800 mt-0.5 font-mono">
              ~{avgMonthly}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Tests per month</div>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
              Peak Month
            </div>
            <div className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5 truncate">
              {peakItem?.month || "—"}
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
              {maxVal} investigations
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
              LIS Synchronization
            </div>
            <div className="text-base sm:text-lg font-extrabold text-teal-800 mt-0.5 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Auto-updates on verify</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ReferralTrendChart;
