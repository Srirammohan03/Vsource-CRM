type PermissionCompare = {
  moduleId: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

export function normalizePermissions(permissions: PermissionCompare[]) {
  return [...permissions]
    .sort((a, b) => a.moduleId.localeCompare(b.moduleId))
    .map((permission) => ({
      moduleId: permission.moduleId,
      canCreate: permission.canCreate,
      canRead: permission.canRead,
      canUpdate: permission.canUpdate,
      canDelete: permission.canDelete,
    }));
}

export function permissionsChanged(
  original: PermissionCompare[],
  current: PermissionCompare[],
) {
  return (
    JSON.stringify(normalizePermissions(original)) !==
    JSON.stringify(normalizePermissions(current))
  );
}
