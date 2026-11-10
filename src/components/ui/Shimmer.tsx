"use client";

import React from "react";

interface ShimmerProps {
  className?: string;
}

/**
 * Basic Shimmer Box primitive with smooth wave gradient
 */
export function Shimmer({ className = "h-4 w-full rounded-md" }: ShimmerProps) {
  return <div className={`shimmer-box ${className}`} />;
}

/**
 * Shimmer skeleton for table rows (Reports & Patients)
 */
export function TableShimmer({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="px-5 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Shimmer className="h-4 w-36 sm:w-48 rounded-lg" />
            <Shimmer className="h-3 w-24 sm:w-32 rounded-md" />
          </div>
          <div className="hidden sm:block flex-1">
            <Shimmer className="h-3.5 w-40 rounded-md" />
          </div>
          <div className="hidden md:block w-28">
            <Shimmer className="h-3.5 w-20 rounded-md" />
          </div>
          <div className="w-24">
            <Shimmer className="h-5 w-20 rounded-full" />
          </div>
          <div className="w-28 text-right flex justify-end">
            <Shimmer className="h-8 w-24 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Shimmer skeleton for Dashboard 4 KPI Stat Cards
 */
export function StatCardsShimmer() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <Shimmer className="h-3.5 w-24 rounded-md" />
            <Shimmer className="h-8 w-8 rounded-xl" />
          </div>
          <Shimmer className="h-7 w-16 rounded-lg" />
          <Shimmer className="h-3 w-28 rounded-md" />
        </div>
      ))}
    </div>
  );
}

/**
 * Shimmer skeleton for Charts section
 */
export function ChartsShimmer({ fullWidth = false }: { fullWidth?: boolean } = {}) {
  if (fullWidth) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Shimmer className="h-6 w-56 rounded-lg" />
            <Shimmer className="h-4 w-80 rounded-md" />
          </div>
          <Shimmer className="h-8 w-28 rounded-xl" />
        </div>
        <Shimmer className="h-64 sm:h-72 lg:h-80 w-full rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Shimmer key={idx} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <Shimmer className="h-5 w-44 rounded-lg" />
          <Shimmer className="h-4 w-20 rounded-md" />
        </div>
        <Shimmer className="h-64 w-full rounded-xl" />
      </div>
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <Shimmer className="h-5 w-36 rounded-lg" />
        <div className="space-y-3 pt-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between">
                <Shimmer className="h-3.5 w-28 rounded-md" />
                <Shimmer className="h-3.5 w-10 rounded-md" />
              </div>
              <Shimmer className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Full Page Shell Shimmer (for route transitions and initial session loading)
 */
export function PageShellShimmer() {
  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col">
      <div className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between">
        <Shimmer className="h-7 w-32 rounded-lg" />
        <Shimmer className="h-8 w-48 rounded-xl" />
      </div>
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        <Shimmer className="h-32 w-full rounded-3xl" />
        <StatCardsShimmer />
        <ChartsShimmer />
      </div>
    </div>
  );
}

