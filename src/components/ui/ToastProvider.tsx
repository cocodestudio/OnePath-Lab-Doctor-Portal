"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { subscribeToasts, dismissToast, ToastItem } from "./toast";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return subscribeToasts((updatedToasts) => {
      setToasts(updatedToasts);
    });
  }, []);

  return (
    <>
      {/* Toast Viewport (Fixed Top Center, z-[9999], Clear High-Contrast Dynamic UI) */}
      <div
        aria-live="polite"
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2.5 w-[calc(100vw-2rem)] max-w-md pointer-events-none transition-all duration-300"
      >
        {toasts.map((t) => {
          const isSuccess = t.type === "success";
          const isError = t.type === "error";
          const isWarning = t.type === "warning";

          return (
            <div
              key={t.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border shadow-xl shadow-slate-900/10 transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
                isSuccess
                  ? "border-slate-200/90 border-l-4 border-l-emerald-600"
                  : isError
                  ? "border-slate-200/90 border-l-4 border-l-rose-600"
                  : isWarning
                  ? "border-slate-200/90 border-l-4 border-l-amber-500"
                  : "border-slate-200/90 border-l-4 border-l-sky-500"
              }`}
            >
              {/* Soft Clinical Icon Badge */}
              <div
                className={`p-1.5 rounded-xl shrink-0 mt-0.5 ${
                  isSuccess
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                    : isError
                    ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                    : isWarning
                    ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                    : "bg-sky-50 text-sky-700 border border-sky-200/60"
                }`}
              >
                {isSuccess && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                {isError && <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
                {isWarning && <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />}
                {!isSuccess && !isError && !isWarning && (
                  <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </div>

              {/* Message Content with High Contrast Text */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="text-xs sm:text-sm font-bold text-slate-900 leading-snug break-words">
                  {t.title}
                </div>
                {t.description && (
                  <div className="text-[11px] sm:text-xs text-slate-600 font-medium mt-0.5 leading-relaxed break-words">
                    {t.description}
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0 cursor-pointer"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {children}
    </>
  );
}

export default ToastProvider;
