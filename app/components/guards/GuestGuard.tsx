// components/guards/GuestGuard.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store";
import { moduleLandingRoutes } from "@/rbac/routePermissions";
import { getLandingRoute } from "@/rbac/getLandingRoute";

export default function GuestGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { user, isAuthenticated, isHydrating } = useAuth();

  useEffect(() => {
    if (isHydrating) return;

    if (!isAuthenticated) return;

    const firstModule = user?.role?.modulePermissions
      ?.filter((p) => p.canRead)
      ?.sort(
        (a, b) => (a.module.sortOrder ?? 999) - (b.module.sortOrder ?? 999),
      )[0];

    if (!firstModule) {
      return;
    }

    const redirectPath = getLandingRoute(user?.role?.modulePermissions ?? []);

    router.replace(redirectPath);
  }, [user, isAuthenticated, isHydrating, router]);

  if (isHydrating) {
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
