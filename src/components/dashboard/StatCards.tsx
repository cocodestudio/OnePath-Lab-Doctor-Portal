"use client";

import React from "react";
import { Users, FileText, CheckCircle2, Clock, TrendingUp } from "lucide-react";

interface StatCardsProps {
  metrics: {
    total_patients: number;
    total_reports: number;
    verified_reports: number;
    pending_reports: number;
    completion_rate?: number;
  };
}

export function StatCards({ metrics }: StatCardsProps) {
  const cards = [
    {
      title: "Referred Patients",
      value: metrics.total_patients,
      trend: "+12.5%",
      subtext: "Total unique patients",
      icon: Users,
      color: "emerald",
      bgLight: "bg-emerald-50 text-emerald-600 border-emerald-200",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      title: "Diagnostic Reports",
      value: metrics.total_reports,
      trend: "+8.2%",
      subtext: "Cumulative report volume",
      icon: FileText,
      color: "blue",
      bgLight: "bg-blue-50 text-blue-600 border-blue-200",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      title: "Verified & Ready",
      value: metrics.verified_reports,
      trend: `${metrics.completion_rate || 100}%`,
      subtext: "Ready for clinical review",
      icon: CheckCircle2,
      color: "teal",
      bgLight: "bg-teal-50 text-teal-600 border-teal-200",
      badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    },
    {
      title: "Samples In Process",
      value: metrics.pending_reports,
      trend: "Avg TAT ~2.4h",
      subtext: "Processing in laboratory",
      icon: Clock,
      color: "amber",
      bgLight: "bg-amber-50 text-amber-600 border-amber-200",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-xl border ${card.bgLight} shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {card.value}
              </div>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${card.badgeColor} whitespace-nowrap`}
              >
                <TrendingUp className="w-3 h-3 shrink-0" />
                <span>{card.trend}</span>
              </span>
            </div>

            <div className="mt-2 text-[11px] text-slate-400 truncate">
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}

