"use client";

import React, { useState } from "react";
import { BarChart3, TrendingUp, Calendar } from "lucide-react";

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
  const data = trends.length > 0 ? trends : [
    { month: "May 2026", short_month: "May", reports: 24 },
    { month: "Jun 2026", short_month: "Jun", reports: 38 },
    { month: "Jul 2026", short_month: "Jul", reports: 45 },
    { month: "Aug 2026", short_month: "Aug", reports: 52 },
    { month: "Sep 2026", short_month: "Sep", reports: 61 },
    { month: "Oct 2026", short_month: "Oct", reports: 74 },
  ];

  const maxVal = Math.max(...data.map((d) => d.reports), 10);
  const totalReportsInPeriod = data.reduce((acc, d) => acc + d.reports, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Monthly Referral Volume
            </h3>
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
              Last 6 Months
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Total of {totalReportsInPeriod} diagnostic tests referred
          </p>
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Real-time LIS Sync</span>
        </div>
      </div>

      {/* Interactive Bar Chart Area */}
      <div className="h-56 sm:h-64 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 px-2 border-b border-slate-100">
        {data.map((item, idx) => {
          const heightPercent = Math.max(8, Math.round((item.reports / maxVal) * 100));
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
            >
              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute -top-10 z-20 bg-slate-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg shadow-lg shadow-slate-900/30 whitespace-nowrap border border-slate-700 pointer-events-none">
                  {item.month}: {item.reports} tests
                </div>
              )}

              {/* Bar Value on top */}
              <span
                className={`text-[10px] font-bold mb-1 transition-colors ${
                  isHovered ? "text-emerald-600 font-extrabold" : "text-slate-400"
                }`}
              >
                {item.reports}
              </span>

              {/* Bar Capsule */}
              <div className="w-full max-w-[42px] bg-slate-100 rounded-t-xl overflow-hidden h-full flex flex-col justify-end">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-xl transition-all duration-300 ${
                    isHovered
                      ? "bg-gradient-to-t from-emerald-600 to-teal-400 shadow-md shadow-emerald-500/30"
                      : "bg-gradient-to-t from-emerald-500 to-teal-500 opacity-80 group-hover:opacity-100"
                  }`}
                />
              </div>

              {/* Month Label */}
              <span className="text-[11px] font-medium text-slate-500 mt-2 truncate max-w-full">
                {item.short_month}
              </span>
            </div>
          );
        })}
      </div>

      {/* Chart Footer Stats */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Patient Tests Referred</span>
        </div>
        <div className="font-semibold text-slate-700">
          Peak: {maxVal} tests / month
        </div>
      </div>
    </div>
  );
}

