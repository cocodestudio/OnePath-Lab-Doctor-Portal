"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  BadgePercent,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Patient Reports",
    href: "/reports",
    icon: FileText,
    badge: null,
  },
  {
    name: "Referred Patients",
    href: "/patients",
    icon: Users,
    badge: null,
  },
  {
    name: "Referral Commission",
    href: "/analytics",
    icon: BadgePercent,
    badge: null,
  },
];

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        onToggleCollapse();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onToggleCollapse]);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container (Clean White / LIS Theme - Fixed on Desktop) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white text-slate-800 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-200/80 shadow-xs lg:sticky lg:top-0 lg:h-screen lg:z-30 shrink-0 select-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "w-20" : "w-64"}`}
      >
        {/* Brand Header */}
        <div
          className={`h-16 px-4 flex items-center ${
            collapsed ? "justify-center" : "justify-between"
          } border-b border-slate-100 shrink-0`}
        >
          <Link
            href="/dashboard"
            onClick={onCloseMobile}
            className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} overflow-hidden group`}
          >
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shrink-0 shadow-2xs group-hover:border-emerald-300 transition-all">
              <Image
                src="/onepath-logo.png"
                alt="OnePath Lab"
                width={28}
                height={28}
                className="object-contain w-7 h-7"
              />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0 leading-tight">
                <div className="flex items-center">
                  <span className="font-extrabold text-[16px] text-slate-900 tracking-tight">
                    OnePath
                  </span>
                  <span className="font-bold text-[16px] text-emerald-700 ml-1 tracking-tight">
                    Lab
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Doctor Referral Portal
                </span>
              </div>
            )}
          </Link>

          {/* Mobile Close Button */}
          {!collapsed && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 lg:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {!collapsed && (
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Navigation Menu
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={collapsed ? item.name : undefined}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer relative ${
                  isActive
                    ? "bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                } ${collapsed ? "justify-center px-0" : ""}`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-emerald-700" />
                )}
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? "text-emerald-700"
                      : "text-slate-400 group-hover:text-slate-700"
                  }`}
                />
                {!collapsed && (
                  <span className="truncate flex-1">{item.name}</span>
                )}
                {!collapsed && item.badge && (
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 tracking-wider">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Desktop Collapse / Expand Toggle at Bottom */}
        <div className="hidden lg:flex p-3 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`flex items-center transition cursor-pointer select-none ${
              collapsed
                ? "w-10 h-10 mx-auto justify-center rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200/90 shadow-2xs"
                : "w-full justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent hover:border-slate-200/60"
            }`}
            title={collapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar (Ctrl+B)"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {!collapsed && (
              <span className="flex items-center gap-2">
                <span>Collapse Sidebar</span>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1 py-0.5 rounded">
                  ⌘B
                </span>
              </span>
            )}
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-emerald-700 shrink-0" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-slate-500 shrink-0" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
