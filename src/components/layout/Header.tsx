"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../lib/auth-context";

interface HeaderProps {
  onOpenMobile: () => void;
}

export function Header({ onOpenMobile }: HeaderProps) {
  const { doctor, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/reports?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs h-16">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu, Top-Left Brand Logo & Search */}
        <div className="flex items-center gap-2.5 flex-1 max-w-lg">
          <button
            onClick={onOpenMobile}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer shrink-0"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Top-Left Logo Icon on Mobile / Tablet */}
          <Link
            href="/dashboard"
            className="lg:hidden flex items-center shrink-0 mr-1"
            title="OnePath Lab Doctor Portal"
          >
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shrink-0 shadow-2xs">
              <Image
                src="/onepath-logo.png"
                alt="OnePath Lab"
                width={24}
                height={24}
                className="object-contain w-6 h-6"
              />
            </div>
          </Link>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by patient, phone or test..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs sm:text-sm placeholder:text-slate-400 bg-slate-50/50 transition"
            />
          </form>
        </div>

        {/* Right: Only Doctor Profile Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
              {doctor?.name?.replace(/^(dr\.?|doctor)\s+/i, "").charAt(0) || "D"}
            </div>
            <div className="text-left text-xs leading-tight">
              <div className="font-bold text-slate-900 truncate max-w-[130px] sm:max-w-[170px]">
                {doctor?.name || "Doctor"}
              </div>
              <div className="text-[10px] text-slate-500 truncate max-w-[130px] sm:max-w-[170px]">
                {doctor?.specialty || "Referring Clinician"}
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 transition cursor-pointer ml-1"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
