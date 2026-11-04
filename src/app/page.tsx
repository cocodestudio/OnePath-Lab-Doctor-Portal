"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { PageShellShimmer } from "../components/ui/Shimmer";

function RootPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, isLoading, loginWithToken } = useAuth();

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      loginWithToken(urlToken);
      router.replace("/dashboard");
      return;
    }

    if (!isLoading) {
      if (token) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [token, isLoading, searchParams, router, loginWithToken]);

  return <PageShellShimmer />;
}

export default function RootPage() {
  return (
    <Suspense fallback={<PageShellShimmer />}>
      <RootPageContent />
    </Suspense>
  );
}
