"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getUserColumns } from "./UserColumns";
import { User } from "../types/user";
import { useAuth } from "@/store";

interface Props {
  users: User[];

  onView: (user: User) => void;

  onEdit: (user: User) => void;

  onDelete: (user: User) => void;
}

export default function UserTable({
  users,

  onView,

  onEdit,

  onDelete,
}: Props) {
  const { canUpdate, canDelete } = useAuth();

  const columns = getUserColumns({
    onView,
    onEdit,
    canUpdate,
  });

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-xl border bg-background">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32 text-center">
                No users found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
