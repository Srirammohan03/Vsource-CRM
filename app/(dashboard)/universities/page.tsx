// crm-frontend-next\app\(dashboard)\universities\page.tsx
"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { PageHeader, PageTransition } from "@/components/common/PageHeader";

import { UniversityCard } from "@/components/universities/university-card";
import { UniversityFormDialog } from "@/components/universities/university-form-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";

import { useUniversities } from "@/hooks/use-universities";

import { University, UniversityStatus } from "@/types/university";

export default function UniversitiesPage() {
  const { universities, isLoading, addUniversity, updateUniversity, deleteUniversity } =
    useUniversities();

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<"all" | UniversityStatus>(
    "all",
  );

  const [dialogOpen, setDialogOpen] = useState(false);

  const [editingUniversity, setEditingUniversity] = useState<University | null>(
    null,
  );

  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);

  const filteredUniversities = useMemo(() => {
    return universities.filter((university) => {
      const matchesSearch =
        university.name.toLowerCase().includes(search.toLowerCase()) ||
        university.country?.name?.toLowerCase().includes(search.toLowerCase()) ||
        university.city?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ? true : university.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [universities, search, statusFilter]);

  const handleCreateUniversity = async (data: any) => {
    try {
      await addUniversity(data);
      toast.success("University created successfully");
    } catch {
      toast.error("Failed to create university");
    }
  };

  const handleUpdateUniversity = async (data: any) => {
    if (!editingUniversity) return;

    try {
      await updateUniversity(editingUniversity.id, data);
      toast.success("University updated successfully");
      setEditingUniversity(null);
    } catch {
      toast.error("Failed to update university");
    }
  };

  const handleDeleteUniversity = async (university: University) => {
    const confirmed = window.confirm(`Delete ${university.name}?`);

    if (!confirmed) return;

    try {
      await deleteUniversity(university.id);
      toast.success("University deleted");
    } catch {
      toast.error("Failed to delete university");
    }
  };

  const handleEditUniversity = (university: University) => {
    setEditingUniversity(university);
    setDialogOpen(true);
  };

  const handleShortlist = (university: University) => {
    setShortlistedIds((prev) => {
      const exists = prev.includes(university.id);

      if (exists) {
        toast.success("Removed from shortlist");

        return prev.filter((id) => id !== university.id);
      }

      toast.success("Added to shortlist");

      return [...prev, university.id];
    });
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);

    if (!open) {
      setEditingUniversity(null);
    }
  };

  return (
    <PageTransition>
      <PageHeader
        title="Universities"
        description="Manage universities, courses, scholarships and admissions."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {shortlistedIds.length} Shortlisted
            </Badge>

            <Button
              onClick={() => {
                setEditingUniversity(null);

                setDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add University
            </Button>
          </div>
        }
      />

      {/* Filters */}

      <div className="mb-6 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search university, country, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="w-full md:w-[220px]">
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as "all" | UniversityStatus)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>

              <SelectItem value="active">Active</SelectItem>

              <SelectItem value="inactive">Inactive</SelectItem>

              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Total Universities</p>

          <h3 className="mt-2 text-2xl font-bold">{universities.length}</h3>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Active</p>

          <h3 className="mt-2 text-2xl font-bold text-emerald-600">
            {universities.filter((u) => u.status === "active").length}
          </h3>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Scholarships</p>

          <h3 className="mt-2 text-2xl font-bold">
            {universities.reduce(
              (total, university) => total + (university._count?.scholarships ?? university.scholarships?.length ?? 0),
              0,
            )}
          </h3>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Shortlisted</p>

          <h3 className="mt-2 text-2xl font-bold">{shortlistedIds.length}</h3>
        </div>
      </div>

      {/* Grid */}

      {isLoading ? (
        <div className="flex h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed">
          <h3 className="text-lg font-semibold">Loading Universities...</h3>
        </div>
      ) : filteredUniversities.length === 0 ? (
        <div className="flex h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed">
          <h3 className="text-lg font-semibold">No Universities Found</h3>

          <p className="mt-2 text-sm text-muted-foreground">
            Try changing your filters or create a new university.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredUniversities.map((university) => (
            <UniversityCard
              key={university.id}
              university={university}
              shortlisted={shortlistedIds.includes(university.id)}
              onShortlist={handleShortlist}
              onEdit={handleEditUniversity}
              onDelete={handleDeleteUniversity}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}

      <UniversityFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        university={editingUniversity}
        onSubmit={
          editingUniversity ? handleUpdateUniversity : handleCreateUniversity
        }
      />
    </PageTransition>
  );
}
