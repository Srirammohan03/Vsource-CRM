"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Switch } from "@/components/ui/switch";

import { Button } from "@/components/ui/button";

import { Loader2 } from "lucide-react";

import { AppModule, Role } from "../types";

import { useUpdatePermissions } from "../hooks/useUpdatePermissions";
import { permissionsChanged } from "../utils/permission-utils";

interface Props {
  role: Role | null;

  modules: AppModule[];
}

type PermissionRow = {
  moduleId: string;

  canCreate: boolean;

  canRead: boolean;

  canUpdate: boolean;

  canDelete: boolean;
};

export default function PermissionMatrix({ role, modules }: Props) {
  const [rows, setRows] = useState<PermissionRow[]>([]);

  const mutation = useUpdatePermissions();

  useEffect(() => {
    if (!role) {
      setRows([]);
      return;
    }

    const mapped = modules.map((module) => {
      const existing = (role.modulePermissions || []).find(
        (p) => p.moduleId === module.id,
      );

      return {
        moduleId: module.id,

        canCreate: existing?.canCreate ?? false,

        canRead: existing?.canRead ?? false,

        canUpdate: existing?.canUpdate ?? false,

        canDelete: existing?.canDelete ?? false,
      };
    });

    setRows(mapped);
  }, [role, modules]);

  const updatePermission = (
    moduleId: string,
    field: "canCreate" | "canRead" | "canUpdate" | "canDelete",
    value: boolean,
  ) => {
    setRows((prev) =>
      prev.map((row) =>
        row.moduleId === moduleId
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    );
  };

  const hasChanges = useMemo(() => {
    if (!role) return false;

    const original = modules.map((module) => {
      const existing = (role.modulePermissions || []).find(
        (permission) => permission.moduleId === module.id,
      );

      return {
        moduleId: module.id,

        canCreate: existing?.canCreate ?? false,

        canRead: existing?.canRead ?? false,

        canUpdate: existing?.canUpdate ?? false,

        canDelete: existing?.canDelete ?? false,
      };
    });

    return permissionsChanged(original, rows);
  }, [role, rows, modules]);

  if (!role) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border">
        Select a role
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{role.name}</h2>

          <p className="text-sm text-muted-foreground">{role.description}</p>
        </div>

        <Button
          disabled={mutation.isPending || !hasChanges || rows.length === 0}
          onClick={() =>
            mutation.mutate({
              roleId: role.id,
              permissions: rows,
            })
          }
        >
          {mutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Module</TableHead>

              <TableHead className="text-center">Create</TableHead>

              <TableHead className="text-center">Read</TableHead>

              <TableHead className="text-center">Update</TableHead>

              <TableHead className="text-center">Delete</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {modules.map((module) => {
              const permission = rows.find((x) => x.moduleId === module.id);

              if (!permission) return null;

              return (
                <TableRow key={module.id}>
                  <TableCell className="font-medium">{module.name}</TableCell>

                  <TableCell className="text-center">
                    <Switch
                      checked={permission.canCreate}
                      onCheckedChange={(value) =>
                        updatePermission(module.id, "canCreate", value)
                      }
                    />
                  </TableCell>

                  <TableCell className="text-center">
                    <Switch
                      checked={permission.canRead}
                      onCheckedChange={(value) =>
                        updatePermission(module.id, "canRead", value)
                      }
                    />
                  </TableCell>

                  <TableCell className="text-center">
                    <Switch
                      checked={permission.canUpdate}
                      onCheckedChange={(value) =>
                        updatePermission(module.id, "canUpdate", value)
                      }
                    />
                  </TableCell>

                  <TableCell className="text-center">
                    <Switch
                      checked={permission.canDelete}
                      onCheckedChange={(value) =>
                        updatePermission(module.id, "canDelete", value)
                      }
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
