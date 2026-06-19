// app\components\guards\RoutePermission.tsx

import UnauthorizedPage from "@/(dashboard)/unauthorized/page";
import { useAuth } from "@/store";

interface Props {
  moduleCode: string;
  action: "read" | "create" | "update" | "delete";
  children: React.ReactNode;
}

export function RoutePermission({ moduleCode, action, children }: Props) {
  const { canRead, canCreate, canUpdate, canDelete } = useAuth();

  const allowed =
    action === "read"
      ? canRead(moduleCode)
      : action === "create"
        ? canCreate(moduleCode)
        : action === "update"
          ? canUpdate(moduleCode)
          : canDelete(moduleCode);

  if (!allowed) {
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
}
