"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useAuth } from "../../lib/auth-context";

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
  },
  {
    name: "Patient Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    name: "Referred Patients",
    href: "/patients",
    icon: Users,
  },
  {
    name: "Referral Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Doctor Profile",
    href: "/profile",
    icon: Stethoscope,
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
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white text-slate-800 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-200 shadow-sm lg:sticky lg:top-0 lg:h-screen lg:z-30 shrink-0 select-none ${
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
            className={`flex items-center ${collapsed ? "justify-center" : "gap-2.5"} overflow-hidden`}
          >
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shrink-0 shadow-2xs">
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
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Doctor Referral Portal
                </span>
              </div>
            )}
          </Link>

          {/* Mobile Close Button */}
          {!collapsed && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 lg:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {!collapsed && (
            <div className="px-3 mb-2 text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "gradient-primary text-white shadow-md shadow-emerald-700/20"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                } ${collapsed ? "justify-center px-0" : ""}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Desktop Collapse / Expand Toggle at Bottom (Clean, Accessible & Centered when collapsed) */}
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
            {!collapsed && <span>Collapse Sidebar</span>}
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
