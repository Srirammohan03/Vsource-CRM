import { ModulePermission } from "@/rbac/types";

export const hasPermission = (
  permissions: ModulePermission[],
  moduleCode: string,
  action: "canCreate" | "canRead" | "canUpdate" | "canDelete",
) => {
  const permission = permissions.find((p) => p.module.code === moduleCode);

  return permission?.[action] ?? false;
};
