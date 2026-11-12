"use client";

import React from "react";
import { Users, FileText, CheckCircle2, Clock, TrendingUp, Sparkles } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

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
      subtext: "Total unique patients registered",
      icon: Users,
      badgeVariant: "success" as const,
      iconBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    },
    {
      title: "Diagnostic Reports",
      value: metrics.total_reports,
      trend: "+8.2%",
      subtext: "Cumulative investigation volume",
      icon: FileText,
      badgeVariant: "info" as const,
      iconBg: "bg-blue-50 text-blue-700 border-blue-200/80",
    },
    {
      title: "Verified & Ready",
      value: metrics.verified_reports,
      trend: `${metrics.completion_rate || 100}% Ready`,
      subtext: "Ready for direct PDF download",
      icon: CheckCircle2,
      badgeVariant: "success" as const,
      iconBg: "bg-teal-50 text-teal-700 border-teal-200/80",
    },
    {
      title: "Samples In Process",
      value: metrics.pending_reports,
      trend: "Avg TAT ~2.4h",
      subtext: "Active analyzer turnaround",
      icon: Clock,
      badgeVariant: "warning" as const,
      iconBg: "bg-amber-50 text-amber-700 border-amber-200/80",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card
            key={idx}
            className="group hover-card-lift bg-white border border-slate-200/90 hover:border-emerald-300/90 relative overflow-hidden cursor-default select-none shadow-2xs"
          >
            {/* Subtle top indicator bar */}
            <div className={`h-1 w-full ${card.iconBg.includes('emerald') ? 'bg-emerald-500' : card.iconBg.includes('blue') ? 'bg-blue-500' : card.iconBg.includes('teal') ? 'bg-teal-500' : 'bg-amber-500'} opacity-80`} />
            
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                  {card.title}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl border ${card.iconBg} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 group-hover:rotate-3 transition-transform duration-200 ease-out`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between gap-2">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                  {card.value}
                </div>
                <Badge variant={card.badgeVariant} className="text-[10.5px] font-semibold group-hover:shadow-xs transition-shadow">
                  <TrendingUp className="w-3 h-3 shrink-0" />
                  <span>{card.trend}</span>
                </Badge>
              </div>

              <div className="mt-2.5 text-[11px] text-slate-400 font-medium truncate">
                {card.subtext}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default StatCards;
