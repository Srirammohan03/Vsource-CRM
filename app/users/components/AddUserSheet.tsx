"use client";

import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";

import UserForm from "./UserForm";

import { Plus } from "lucide-react";
import { useRoles } from "../hooks/useRoles";
import { useBranches } from "../hooks/useBranches";
import { useCreateUser } from "../hooks/useCreateUser";
import { UserFormValues } from "../schemas/user.schema";
import { userKeys } from "../service/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/store";
import { MODULES } from "@/lib/module-codes";

export default function AddUserSheet() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { canCreate } = useAuth();

  const { data: roles = [] } = useRoles();

  const { data: branches = [] } = useBranches();

  const createMutation = useCreateUser();

  const handleSubmit = (values: UserFormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: userKeys.all,
        });
        setOpen(false);
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {canCreate(MODULES.USERS) && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        )}
      </SheetTrigger>

      <SheetContent
        className="
        w-full
        sm:max-w-150
        overflow-y-auto
      "
      >
        <SheetHeader>
          <SheetTitle>Create User</SheetTitle>
          <SheetDescription>
            Create a new user and assign branches and role.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <UserForm
            mode="create"
            roles={roles}
            branches={branches}
            isLoading={createMutation.isPending}
            onSubmit={handleSubmit}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
