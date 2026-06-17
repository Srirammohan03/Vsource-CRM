"use client";

import { cn } from "@/lib/utils";

import { Role } from "../types";

interface Props {
  roles: Role[];

  selectedRole: Role | null;

  onSelect: (role: Role) => void;
}

export default function RoleSidebar({ roles = [], selectedRole, onSelect }: Props) {
  return (
    <div className="rounded-lg border">
      {roles?.map((role) => (
        <button
          key={role.id}
          onClick={() => onSelect(role)}
          className={cn(
            "w-full border-b p-4 text-left transition",
            selectedRole?.id === role.id && "bg-muted",
          )}
        >
          <p className="font-medium">{role.name}</p>

          <p className="text-xs text-muted-foreground">{role.description}</p>
        </button>
      ))}
    </div>
  );
}
