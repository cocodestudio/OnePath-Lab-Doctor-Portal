"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuth } from "../../lib/auth-context";
import { PageShellShimmer } from "../ui/Shimmer";

interface PortalLayoutProps {
  children: React.ReactNode;
}

export function PortalLayout({ children }: PortalLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      } else {
        router.push("/login");
      }
    }
  }, [isLoading, token, router]);

  if (isLoading || !token) {
    return <PageShellShimmer />;
  }

  return (
    <div className="h-screen flex bg-[#fbfbfa] text-slate-900 font-sans overflow-hidden">
      {/* LIS-Themed Collapsible Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area - Locked Top Header with Smooth Scrolling Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header - Fixed & Locked at Top */}
        <div className="shrink-0 z-30">
          <Header onOpenMobile={() => setMobileOpen(true)} />
        </div>

        {/* Scrollable Body Container (Header stays locked above) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col scroll-smooth">
          {/* Page Content: Edge to Edge with crisp responsive padding */}
          <main className="flex-1 w-full max-w-7xl mx-auto p-3.5 sm:p-6 lg:p-8">
            {children}
          </main>

          {/* Subdued Footer */}
          <footer className="py-4 px-6 border-t border-slate-200/80 bg-white text-center text-xs text-slate-500 shrink-0">
            <div className="flex items-center justify-between max-w-7xl mx-auto flex-wrap gap-2.5">
              <span className="font-medium text-slate-600">
                OnePath Lab Doctor Referral Portal
              </span>
              <span className="text-slate-500">
                Developed and design by{" "}
                <a
                  href="https://cocodestudio.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline transition inline-flex items-center gap-1"
                >
                  CoCode Studio Pvt Ltd
                </a>
              </span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default PortalLayout;
