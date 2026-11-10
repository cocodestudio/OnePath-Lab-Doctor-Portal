"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PortalLayout } from "../../../components/layout/PortalLayout";

function RedirectHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  useEffect(() => {
    if (id) {
      router.replace(`/patients/${encodeURIComponent(id)}`);
    } else {
      router.replace("/patients");
    }
  }, [id, router]);

  return (
    <div className="py-24 text-center text-slate-400 animate-pulse text-sm">
      Loading patient clinical history...
    </div>
  );
}

export default function PatientHistoryRedirectPage() {
  return (
    <PortalLayout>
      <Suspense
        fallback={
          <div className="py-24 text-center text-slate-400 animate-pulse text-sm">
            Loading patient clinical history...
          </div>
        }
      >
        <RedirectHandler />
      </Suspense>
    </PortalLayout>
  );
}
