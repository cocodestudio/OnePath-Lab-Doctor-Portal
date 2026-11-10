"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  LogOut,
  User,
  Phone,
  FileText,
  ArrowRight,
  Loader2,
  X,
} from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { fetchDoctorPatients } from "../../lib/api-client";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ReferredPatient } from "../../lib/types";

interface HeaderProps {
  onOpenMobile: () => void;
}

export function Header({ onOpenMobile }: HeaderProps) {
  const { token, doctor, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ReferredPatient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced Live Search for Patients
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!token || trimmed.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    const handler = setTimeout(async () => {
      try {
        const res = await fetchDoctorPatients(token, {
          search: trimmed,
          per_page: 6,
        });
        if (res.success && Array.isArray(res.patients)) {
          setSearchResults(res.patients);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.warn("Live search error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [searchQuery, token]);

  // Handle Outside Click to Close Dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectPatient = (patient: ReferredPatient) => {
    setShowDropdown(false);
    setSearchQuery("");
    router.push(`/patients/${patient.id}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setShowDropdown(false);
    if (searchResults.length > 0) {
      // Direct jump to first matching patient's clinical history
      router.push(`/patients/${searchResults[0].id}`);
    } else {
      router.push(`/patients?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const doctorInitial =
    doctor?.name?.replace(/^(dr\.?|doctor)\s+/i, "").charAt(0) || "D";

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs h-16 transition-all">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Trigger, Mobile Brand Logo & Quick Global Search */}
        <div className="flex items-center gap-2.5 flex-1 max-w-lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenMobile}
            className="lg:hidden text-slate-600 hover:text-slate-900"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </Button>

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

          {/* Quick Search Bar with Instant Live Patient Dropdown */}
          <div ref={searchContainerRef} className="relative w-full">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) setShowDropdown(true);
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setShowDropdown(false);
                }}
                placeholder="Search patient by name, mobile, or ID..."
                className="w-full pl-9 pr-12 py-2 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-xs sm:text-sm placeholder:text-slate-400 transition-all shadow-2xs"
              />
              <div className="hidden sm:flex items-center gap-0.5 absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md pointer-events-none">
                {isSearching ? (
                  <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                ) : (
                  <span>↵</span>
                )}
              </div>
            </form>

            {/* Instant Patient Search Results Dropdown */}
            {showDropdown && searchQuery.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in-50 slide-in-from-top-2 duration-150">
                <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Referred Patients</span>
                  </span>
                  {isSearching ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1 normal-case text-xs">
                      <Loader2 className="w-3 h-3 animate-spin" /> Searching...
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] font-normal lowercase text-slate-400">
                      {searchResults.length} found
                    </span>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {isSearching && searchResults.length === 0 ? (
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2" />
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-xs">
                      <p className="font-semibold text-slate-700">No referred patients found</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Try typing patient's first name, last name, mobile or ID.
                      </p>
                    </div>
                  ) : (
                    searchResults.map((pat) => {
                      const patInitial =
                        pat.name
                          ?.replace(/^(mr\.?|mrs\.?|ms\.?|dr\.?)\s+/i, "")
                          .charAt(0) || "P";

                      return (
                        <div
                          key={pat.id}
                          onClick={() => handleSelectPatient(pat)}
                          className="p-3 hover:bg-emerald-50/60 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="w-8 h-8 rounded-xl bg-emerald-50 border-emerald-200">
                              <AvatarFallback className="text-emerald-800 font-bold text-xs">
                                {patInitial}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-bold text-xs sm:text-sm text-slate-900 truncate group-hover:text-emerald-800 transition-colors">
                                {pat.name}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                                {pat.custom_id && <span>#{pat.custom_id}</span>}
                                {pat.phone && (
                                  <span className="flex items-center gap-1 text-slate-500">
                                    <Phone className="w-2.5 h-2.5 text-slate-400" />
                                    {pat.phone}
                                  </span>
                                )}
                                {pat.age && (
                                  <span className="text-slate-500 font-sans">
                                    • {pat.age} {pat.age_unit || "Y"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 text-emerald-700 text-xs font-semibold group-hover:translate-x-0.5 transition-transform">
                            <span className="hidden sm:inline">View History</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {searchResults.length > 0 && (
                  <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="text-[11px] text-slate-500 hover:text-emerald-700 font-medium transition"
                    >
                      Press Enter to see all results in directory →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Doctor Profile Badge & Session Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-100">
            {/* Doctor Avatar with Active Online Pulse */}
            <div className="relative">
              <Avatar className="w-9 h-9 border border-emerald-300 bg-emerald-50">
                <AvatarFallback className="text-emerald-800 font-extrabold text-xs">
                  {doctorInitial}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            {/* Doctor Info */}
            <div className="hidden sm:block text-left text-xs leading-tight">
              <div className="font-bold text-slate-900 truncate max-w-[160px]">
                {doctor?.name || "Doctor"}
              </div>
              <div className="text-[10.5px] text-slate-500 truncate max-w-[160px]">
                {doctor?.specialty || "Referring Clinician"}
              </div>
            </div>

            {/* Logout Action */}
            <Button
              variant="ghost"
              size="iconSm"
              onClick={logout}
              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition ml-0.5"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
