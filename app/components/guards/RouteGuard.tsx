"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/store";
import { routePermissions } from "@/rbac/routePermissions";

export default function RouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const { isAuthenticated, canRead, isHydrating } = useAuth();

  useEffect(() => {
    if (isHydrating) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    const matchedRoute = Object.keys(routePermissions)
      .sort((a, b) => b.length - a.length)
      .find((route) => pathname.startsWith(route));

    if (!matchedRoute) return;
    console.log(matchedRoute);

    const moduleCode = routePermissions[matchedRoute];

    if (!canRead(moduleCode)) {
      router.replace("/unauthorized");
    }
  }, [pathname, isAuthenticated, isHydrating, canRead, router]);

  if (isHydrating) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
