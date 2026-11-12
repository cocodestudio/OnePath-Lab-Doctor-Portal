"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PortalLayout } from "../../components/layout/PortalLayout";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import {
  Smartphone,
  Tablet,
  Download,
  Sparkles,
  CheckCircle2,
  FileText,
  BadgePercent,
  Activity,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function ShowcasePage() {
  const [activeTab, setActiveTab] = useState<"reports" | "commission" | "timeline">("reports");
  const [deviceMode, setDeviceMode] = useState<"iphone" | "ipad">("iphone");

  return (
    <PortalLayout>
      <div className="space-y-8 max-w-6xl mx-auto py-2">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-white border border-emerald-200/90 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>App Store & Mobile Launch Showcase</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              OnePath Doctor Portal — Mobile Experience
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
              Designed with the <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-emerald-800 font-bold">app-store-screenshots</code> & <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-emerald-800 font-bold">emil-kowalski</code> craft suites.
              High-converting Apple App Store & Google Play marketing device frames.
            </p>
          </div>

          {/* Device Toggle Controls */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setDeviceMode("iphone")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active-press cursor-pointer ${
                deviceMode === "iphone"
                  ? "bg-white text-emerald-800 shadow-xs border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>iPhone 16 Pro</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode("ipad")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active-press cursor-pointer ${
                deviceMode === "ipad"
                  ? "bg-white text-emerald-800 shadow-xs border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Tablet className="w-4 h-4 text-teal-600" />
              <span>iPad Air</span>
            </button>
          </div>
        </div>

        {/* Feature Screen Switcher Pills */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all active-press flex items-center gap-2 cursor-pointer ${
              activeTab === "reports"
                ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                : "bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 shadow-2xs"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1-Click PDF Reports</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("commission")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all active-press flex items-center gap-2 cursor-pointer ${
              activeTab === "commission"
                ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                : "bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 shadow-2xs"
            }`}
          >
            <BadgePercent className="w-3.5 h-3.5" />
            <span>Live Referral Earnings</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("timeline")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all active-press flex items-center gap-2 cursor-pointer ${
              activeTab === "timeline"
                ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                : "bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 shadow-2xs"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Panic Values & TAT</span>
          </button>
        </div>

        {/* Main Showcase Presentation Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-center pt-2">
          {/* Left Column: Marketing Punchlines & Highlights */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <Badge variant="success" className="gap-1 font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Next-Gen Clinician Experience</span>
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {activeTab === "reports" && "Instant Diagnostic Reports in 1 Tap"}
                {activeTab === "commission" && "Transparent Referral Commission Ledger"}
                {activeTab === "timeline" && "Real-Time Panic Values & Turnaround"}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {activeTab === "reports" &&
                  "No more waiting for physical printouts or email attachments. Direct client-side PDF downloads rendered with complete laboratory letterheads and digital pathologist signatures."}
                {activeTab === "commission" &&
                  "Itemized financial ledger calculated automatically according to test rates set in LIS. Track gross referral billings, discounts, and net doctor commission in real-time."}
                {activeTab === "timeline" &&
                  "Instant visual alerts when patient parameters reach critical panic thresholds. Track specimen status from collection to analyzer completion with 2.4-hour turnaround metrics."}
              </p>
            </div>

            {/* Feature Checkpoints */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>ABDM & ABHA Compliant Health Records</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Zero Cold-Start & Offline Client-Side PDF Generation</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>60fps Emil Kowalski Spring Physics & Micro-interactions</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Link href="/reports">
                <Button variant="emerald" size="sm" className="gap-2 shadow-xs active-press font-bold">
                  <span>Open Live Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="gap-2 active-press font-semibold">
                  <span>Back to Dashboard</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Realistic iPhone / iPad Device Mockup */}
          <div className="lg:col-span-7 flex justify-center items-center py-4">
            {deviceMode === "iphone" ? (
              /* iPhone 16 Pro Mockup (6.7" Display Frame) */
              <div className="relative w-[310px] sm:w-[340px] h-[640px] sm:h-[680px] bg-slate-900 rounded-[52px] p-3 shadow-2xl shadow-slate-900/40 border-[4px] border-slate-700/80 ring-1 ring-slate-800 transition-all duration-300">
                {/* Side Buttons Simulation */}
                <div className="absolute -left-[7px] top-28 w-[3px] h-10 bg-slate-700 rounded-l" />
                <div className="absolute -left-[7px] top-42 w-[3px] h-12 bg-slate-700 rounded-l" />
                <div className="absolute -right-[7px] top-32 w-[3px] h-16 bg-slate-700 rounded-r" />

                {/* Inner Screen Display */}
                <div className="relative w-full h-full bg-[#fbfbfa] rounded-[42px] overflow-hidden flex flex-col border border-slate-300/40 select-none">
                  {/* Dynamic Island */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-40 flex items-center justify-between px-3 shadow-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 animate-pulse" />
                  </div>

                  {/* Mobile Status Bar */}
                  <div className="h-10 px-6 pt-2 flex items-center justify-between text-[11px] font-bold text-slate-800 z-30 shrink-0">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span>5G</span>
                      <div className="w-4 h-2 rounded-xs border border-slate-800 p-0.5">
                        <div className="w-full h-full bg-slate-800" />
                      </div>
                    </div>
                  </div>

                  {/* Mobile Portal Navigation Bar */}
                  <div className="px-4 py-2 border-b border-slate-200/80 bg-white/90 backdrop-blur-sm flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-extrabold text-xs shadow-2xs">
                        OP
                      </div>
                      <div className="text-xs font-extrabold text-slate-900 leading-tight">
                        OnePath <span className="text-emerald-700">Lab</span>
                      </div>
                    </div>
                    <Badge variant="success" className="text-[9px] py-0 px-1.5">
                      Doctor
                    </Badge>
                  </div>

                  {/* Mobile Screen Mockup Body */}
                  <div className="flex-1 p-3.5 space-y-3 overflow-y-auto">
                    {activeTab === "reports" && (
                      <div className="space-y-2.5">
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-2xl border border-emerald-200/90 shadow-2xs">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                            Pathology Report
                          </div>
                          <div className="text-xs font-extrabold text-slate-900 mt-0.5">
                            Mr. Ramesh Kumar, 45Y
                          </div>
                          <div className="text-[10.5px] text-slate-500 font-medium mt-0.5">
                            CBC + Lipid Profile + HbA1c
                          </div>
                          <div className="mt-2.5 flex items-center justify-between">
                            <Badge variant="success" className="text-[9.5px]">
                              VERIFIED & READY
                            </Badge>
                            <div className="px-2.5 py-1 bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                              <Download className="w-2.5 h-2.5" />
                              <span>PDF Ready</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Biochemistry Report
                          </div>
                          <div className="text-xs font-bold text-slate-800 mt-0.5">
                            Mrs. Sunita Verma, 38Y
                          </div>
                          <div className="text-[10.5px] text-slate-500 font-medium mt-0.5">
                            Thyroid Profile (T3, T4, TSH)
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <Badge variant="success" className="text-[9.5px]">
                              VERIFIED
                            </Badge>
                            <span className="text-[10px] text-slate-400 font-mono">Today, 10:15 AM</span>
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Microbiology Culture
                          </div>
                          <div className="text-xs font-bold text-slate-800 mt-0.5">
                            Master Aarav, 12Y
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <Badge variant="warning" className="text-[9.5px]">
                              IN INCUBATION
                            </Badge>
                            <span className="text-[10px] text-slate-400 font-mono">TAT ~18h</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "commission" && (
                      <div className="space-y-2.5">
                        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 p-3.5 rounded-2xl text-white shadow-sm">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                            Total Doctor Commission
                          </div>
                          <div className="text-xl font-extrabold font-mono mt-0.5">
                            ₹18,450.00
                          </div>
                          <div className="text-[10px] text-emerald-100 mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>+14.2% from last cycle</span>
                          </div>
                        </div>

                        <div className="bg-white p-2.5 rounded-2xl border border-slate-200 text-xs space-y-2">
                          <div className="text-[10px] font-bold uppercase text-slate-400">
                            Recent Patient Cuts
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-slate-100">
                            <div>
                              <div className="font-bold text-slate-800">Ramesh Kumar</div>
                              <div className="text-[10px] text-slate-400">Bill #BL-1029</div>
                            </div>
                            <div className="text-right font-mono font-bold text-emerald-700">
                              +₹350.00
                            </div>
                          </div>
                          <div className="flex items-center justify-between py-1">
                            <div>
                              <div className="font-bold text-slate-800">Sunita Verma</div>
                              <div className="text-[10px] text-slate-400">Bill #BL-1030</div>
                            </div>
                            <div className="text-right font-mono font-bold text-emerald-700">
                              +₹220.00
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "timeline" && (
                      <div className="space-y-2.5">
                        <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl shadow-2xs">
                          <div className="flex items-center gap-1.5 text-rose-800 font-bold text-[10px] uppercase">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                            <span>Critical Panic Alert</span>
                          </div>
                          <div className="text-xs font-extrabold text-rose-900 mt-1">
                            Potassium (Serum): 6.9 mmol/L
                          </div>
                          <div className="text-[10px] text-rose-700 mt-0.5">
                            Patient: Anil Sharma (Ward 3B) • Notified Pathologist
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded-2xl border border-slate-200 text-xs space-y-2">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">
                            Turnaround Timeline (TAT)
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-700">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Sample Collected: 08:30 AM</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-700">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>LIS Barcode Scanned: 09:10 AM</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-700">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Verified & Signed: 10:45 AM</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Home Indicator Bar */}
                  <div className="h-5 flex items-center justify-center shrink-0">
                    <div className="w-24 h-1 bg-slate-400 rounded-full" />
                  </div>
                </div>
              </div>
            ) : (
              /* iPad Air Mockup (Tablet Display Frame) */
              <div className="relative w-[440px] sm:w-[500px] h-[360px] sm:h-[400px] bg-slate-900 rounded-[36px] p-4 shadow-2xl shadow-slate-900/40 border-[4px] border-slate-700/80 ring-1 ring-slate-800 transition-all duration-300">
                <div className="relative w-full h-full bg-[#fbfbfa] rounded-[24px] overflow-hidden flex flex-col border border-slate-300/40 p-4 select-none">
                  {/* Tablet Header Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-extrabold text-sm shadow-2xs">
                        OP
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 text-sm">
                          OnePath Lab — Doctor Portal (Tablet HD)
                        </div>
                        <div className="text-[10px] text-slate-400">12.9" iPad Retina View</div>
                      </div>
                    </div>
                    <Badge variant="success" className="text-xs">
                      Live Pathology
                    </Badge>
                  </div>

                  {/* Tablet Body Content */}
                  <div className="grid grid-cols-2 gap-3 mt-3 overflow-hidden flex-1">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-xs font-bold text-slate-800">Cumulative Investigations</div>
                      <div className="text-2xl font-extrabold text-emerald-800 font-mono mt-1">1,248</div>
                      <div className="text-[10px] text-slate-500 mt-1">Turnaround rate: 98.4% within 3 hours</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-xs font-bold text-slate-800">Direct PDF Downloads</div>
                      <div className="text-2xl font-extrabold text-teal-800 font-mono mt-1">100% Ready</div>
                      <div className="text-[10px] text-slate-500 mt-1">Encrypted, letterhead-backed</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

