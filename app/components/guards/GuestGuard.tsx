// components/guards/GuestGuard.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store";
import { moduleLandingRoutes } from "@/rbac/routePermissions";

export default function GuestGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) return;

    const firstModule = user?.role?.modulePermissions
      ?.filter((p) => p.canRead)
      ?.sort(
        (a, b) => (a.module.sortOrder ?? 999) - (b.module.sortOrder ?? 999),
      )[0];

    if (!firstModule) {
      return;
    }

    router.replace(moduleLandingRoutes[firstModule.module.code]);
  }, [user, isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
