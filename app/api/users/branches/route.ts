import { handleError, ok } from "@/lib/api-helpers";
import { MODULES, PERMISSIONS } from "@/lib/module-codes";
import { getAuthorizedUser } from "@/lib/rbac";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getAuthorizedUser(
      req,
      MODULES.USERS,
      PERMISSIONS.READ,
    );

    const branches = currentUser.branches.map((branch) => ({
      id: branch.id,
      name: branch.name,
    }));

    return ok(branches);
  } catch (err) {
    return handleError(err);
  }
}
