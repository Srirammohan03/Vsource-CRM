import { ModuleCode } from "@/store";

export interface ModulePermission {
  moduleId: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;

  module: {
    code: ModuleCode;
    name: string;
    sortOrder: number;
  };
}

export interface Role {
  id: string;

  name: string;

  description: string;

  isSystem: boolean;

  createdAt: string;

  updatedAt: string;

  modulePermissions: ModulePermission[];
}

export interface AppModule {
  id: string;

  name: string;

  code: string;

  icon: string | null;

  sortOrder: number;

  isActive: boolean;
}
