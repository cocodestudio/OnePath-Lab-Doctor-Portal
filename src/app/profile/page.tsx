"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PortalLayout } from "../../components/layout/PortalLayout";

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <PortalLayout>
      <div className="py-24 text-center text-slate-400 animate-pulse text-sm">
        Redirecting to dashboard...
      </div>
    </PortalLayout>
  );
}
