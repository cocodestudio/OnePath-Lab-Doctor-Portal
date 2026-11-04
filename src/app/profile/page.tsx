"use client";

import React, { useState } from "react";
import { PortalLayout } from "../../components/layout/PortalLayout";
import { useAuth } from "../../lib/auth-context";
import {
  Stethoscope,
  Building2,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  KeyRound,
  Copy,
  Check,
  LogOut,
  Sparkles,
} from "lucide-react";
import { toast } from "../../components/ui/toast";

export default function ProfilePage() {
  const { doctor, lab, token, logout } = useAuth();
  const [copied, setCopied] = useState(false);

  const portalLink = typeof window !== "undefined" && token
    ? `${window.location.origin}/?token=${token}`
    : "";

  const handleCopy = () => {
    if (portalLink) {
      navigator.clipboard.writeText(portalLink);
      setCopied(true);
      toast.success("Copied to Clipboard", "Direct 1-click Doctor Portal link copied.");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <PortalLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-emerald-600" />
            <span>Doctor Profile & Practice Details</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your referring credentials and connected diagnostic laboratory information.
          </p>
        </div>

        {/* Doctor Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold text-2xl flex items-center justify-center shrink-0 border border-emerald-300 shadow-xs">
              {doctor?.name?.replace(/^(dr\.?|doctor)\s+/i, "").charAt(0) || "D"}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {doctor?.name || "Doctor"}
                </h2>
                {doctor?.degree && (
                  <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md border border-slate-200">
                    {doctor.degree}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                {doctor?.specialty || "Referring Clinician"}
                {doctor?.clinic_hospital ? ` • ${doctor.clinic_hospital}` : ""}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified Clinical Partner</span>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Phone: <strong>{doctor?.phone ? `+91 ${doctor.phone}` : "Not configured"}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-700">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Email: <strong>{doctor?.email || "Not configured"}</strong>
              </span>
            </div>

            {doctor?.clinic_hospital && (
              <div className="flex items-center gap-2.5 text-slate-700">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Clinic/Hospital: <strong>{doctor.clinic_hospital}</strong>
                </span>
              </div>
            )}

            {doctor?.address && (
              <div className="flex items-center gap-2.5 text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Address: <strong>{doctor.address}</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 1-Click Access Link Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Your 1-Click Direct Portal Access Link
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Bookmark this unique link on your phone or PC to access your patient reports instantly without entering a password.
          </p>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={portalLink}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-700 truncate select-all"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Diagnostic Laboratory Context Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Associated Diagnostic Laboratory
            </h3>
          </div>

          <div className="space-y-2 text-xs text-slate-700">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Laboratory Name</span>
              <strong className="text-sm text-slate-900">{lab?.name || "OnePath Lab"}</strong>
            </div>
            {lab?.tagline && (
              <p className="text-slate-500 italic">{lab.tagline}</p>
            )}
            {lab?.address && (
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold mt-2">Address</span>
                <span>{lab.address}</span>
              </div>
            )}
            {lab?.phone && (
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold mt-2">Lab Helpline</span>
                <span>Phone: {lab.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-2">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold text-xs transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out from Doctor Portal</span>
          </button>
        </div>
      </div>
    </PortalLayout>
  );
}

