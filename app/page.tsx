// app/page.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./store";
import { moduleLandingRoutes } from "./rbac/routePermissions";

export default function HomePage() {
  const router = useRouter();

  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    const firstModule = user?.role?.modulePermissions
      ?.filter((p) => p.canRead)
      ?.sort(
        (a, b) => (a.module.sortOrder ?? 999) - (b.module.sortOrder ?? 999),
      )[0];

    if (!firstModule) {
      router.replace("/unauthorized");
      return;
    }

    router.replace(moduleLandingRoutes[firstModule.module.code]);
  }, [user, isAuthenticated, isLoading, router]);

  return null;
}
