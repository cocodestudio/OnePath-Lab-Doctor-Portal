"use client";

import React from "react";
import { Activity, Award, Sparkles } from "lucide-react";

interface TopTestItem {
  name: string;
  count: number;
  rank: number;
}

interface TopTestsCardProps {
  topTests?: TopTestItem[];
}

export function TopTestsCard({ topTests = [] }: TopTestsCardProps) {
  const tests = topTests.length > 0 ? topTests : [
    { name: "Complete Blood Count (CBC)", count: 48, rank: 1 },
    { name: "Liver Function Test (LFT)", count: 32, rank: 2 },
    { name: "Kidney Function Test (KFT)", count: 27, rank: 3 },
    { name: "Lipid Profile Panel", count: 21, rank: 4 },
    { name: "HbA1c & Fasting Glucose", count: 18, rank: 5 },
  ];

  const highestCount = Math.max(...tests.map((t) => t.count), 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Top Referred Profiles
            </h3>
            <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
              Clinical Mix
            </span>
          </div>
          <Award className="w-4 h-4 text-emerald-600" />
        </div>
        <p className="text-xs text-slate-500 mb-5">
          Most requested diagnostic investigations across your patients
        </p>

        <div className="space-y-3.5">
          {tests.map((item) => {
            const widthPct = Math.round((item.count / highestCount) * 100);
            return (
              <div key={item.rank} className="group">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2 font-medium text-slate-800 truncate pr-2">
                    <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                      #{item.rank}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 font-mono text-[11px] shrink-0">
                    {item.count} tests
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${widthPct}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 group-hover:from-emerald-600 group-hover:to-teal-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>Accredited Pathology Analysis</span>
        </span>
      </div>
    </div>
  );
}

