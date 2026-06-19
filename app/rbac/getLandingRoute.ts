import { routeConfig } from "@/config/navigation";

export function getLandingRoute(permissions: any[]): string {
  for (const moduleRoute of routeConfig) {
    const permission = permissions.find(
      (p) => p.module.code === moduleRoute.moduleCode,
    );

    if (!permission) continue;

    for (const route of moduleRoute.routes) {
      if (permission[route.permission]) {
        return route.path;
      }
    }
  }

  return "/unauthorized";
}
