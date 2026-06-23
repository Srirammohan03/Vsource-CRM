// crm-frontend-next\app\(dashboard)\mbbs-leads\all\pageactions.tsx
"use client";

import type { MbbsLeadStatus } from "@/types";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Branch, getBranches } from "@/lib/branches";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useCounselors } from "@/lib/lead";

interface MbbsLeadRecord {
  id: string;
  leadNumber: string;

  counsellingDate?: string | null;
  preferredTiers?: string[];
  studentName?: string;
  fatherName?: string;
  mobileNumber?: string;
  emailId?: string;

  address?: string;
  state?: string;
  city?: string;

  passport?: string;
  passportExpireDate?: string | null;

  source?: string;

  branch?: {
    id: string;
    name: string;
  };

  counselors?: {
    isPrimary: boolean;
    counselor: {
      id: string;
      name: string;
    };
  }[];

  status: MbbsLeadStatus;

  twelfthCollegeName?: string;
  twelfthMarks?: number;

  neetMarks?: number;

  ept?: string;

  listeningScore?: number;
  readingScore?: number;
  writingScore?: number;
  speakingScore?: number;

  preferredCountry?: string;
  preferredIntake?: string;
  preferredUniversity?: string;
  preferredCourse?: string;

  remarks?: string;
  nextFollowup?: string | null;

  createdAt: string;
}

interface PageActionsProps {
  selected: MbbsLeadRecord | null;
  setSelected: React.Dispatch<React.SetStateAction<MbbsLeadRecord | null>>;

  editingLead: MbbsLeadRecord | null;
  setEditingLead: React.Dispatch<React.SetStateAction<MbbsLeadRecord | null>>;

  leadIdToDelete: string | null;
  setLeadIdToDelete: React.Dispatch<React.SetStateAction<string | null>>;

  handleUpdateLead: (e: React.FormEvent) => Promise<void>;
  executeDeleteLead: () => Promise<void>;

  branchOptions: string[];
  statusStyle: Record<MbbsLeadStatus, string>;

  selectedCounselors: string[];
  setSelectedCounselors: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function PageActions(props: PageActionsProps) {
  const {
    selected,
    setSelected,
    editingLead,
    setEditingLead,
    leadIdToDelete,
    setLeadIdToDelete,
    handleUpdateLead,
    executeDeleteLead,
    selectedCounselors,
    setSelectedCounselors,
  } = props;

  const [branches, setBranches] = useState<Branch[]>([]);

  const { data: counselors } = useCounselors();

  const { data: intakes = [], isLoading: intakeLoad } = useQuery({
    queryKey: ["intake"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/intakes`,
        {
          withCredentials: true,
        },
      );
      return data?.data || [];
    },
  });
  const { data: countries = [], isLoading: countryLoad } = useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/countries`,
        {
          withCredentials: true,
        },
      );
      return data?.data || [];
    },
  });
  const { data: lead_sources = [], isLoading: lead_sourcesLoad } = useQuery({
    queryKey: ["lead-sources"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/lead-sources`,
        {
          withCredentials: true,
        },
      );
      return data?.data || [];
    },
  });

  useEffect(() => {
    if (editingLead?.counselors) {
      setSelectedCounselors(
        editingLead.counselors.map((c: any) => c.counselor.id),
      );
    }
  }, [editingLead]);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const data = await getBranches();
        setBranches(data);
      } catch (error) {
        console.error("Failed to load branches:", error);
        toast.error("Failed to load branches");
      }
    };

    loadBranches();
  }, []);

  function DetailItem({
    label,
    value,
  }: {
    label: string;
    value?: string | number | null;
  }) {
    return (
      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium break-words">{value || "—"}</p>
      </div>
    );
  }

  function DetailBlock({
    label,
    value,
  }: {
    label: string;
    value?: string | null;
  }) {
    return (
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="rounded-lg bg-muted/30 p-3 text-sm whitespace-pre-wrap">
          {value || "—"}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 1. DETAILED RECORD VIEW SHEET */}
      <Sheet
        open={!!selected}
        onOpenChange={(value) => !value && setSelected(null)}
      >
        <SheetContent className="w-full sm:max-w-4xl overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {selected && (
            <>
              <SheetHeader className="border-b pb-4">
                <SheetTitle className="text-2xl font-bold">
                  {selected.studentName}
                </SheetTitle>
                <SheetDescription>
                  Serial Number: {selected.leadNumber}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 py-6">
                {/* BASIC INFORMATION */}
                <div className="rounded-xl border bg-card">
                  <div className="border-b px-5 py-3">
                    <h3 className="font-semibold text-lg">Basic Information</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 lg:grid-cols-3">
                    <DetailItem
                      label="Student Name"
                      value={selected.studentName}
                    />
                    <DetailItem
                      label="Father Name"
                      value={selected.fatherName}
                    />
                    <DetailItem
                      label="Mobile Number"
                      value={selected.mobileNumber}
                    />
                    <DetailItem
                      label="Email Address"
                      value={selected.emailId}
                    />
                    <DetailItem label="Place" value={selected.address} />
                    <DetailItem
                      label="Passport Number"
                      value={selected.passport}
                    />
                    <DetailItem label="Lead Source" value={selected.source} />
                    <DetailItem label="Branch" value={selected.branch?.name} />
                  </div>
                </div>

                {/* EDUCATIONAL INFORMATION - MBBS SPECIFIC */}
                <div className="rounded-xl border bg-card">
                  <div className="border-b px-5 py-3">
                    <h3 className="font-semibold text-lg">
                      Educational Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 lg:grid-cols-3">
                    <DetailItem
                      label="12th College Name"
                      value={selected.twelfthCollegeName}
                    />
                    <DetailItem
                      label="12th Marks"
                      value={selected.twelfthMarks}
                    />
                    <DetailItem label="NEET Marks" value={selected.neetMarks} />
                    <DetailItem
                      label="Preferred University"
                      value={selected.preferredUniversity}
                    />
                    <DetailItem
                      label="Preferred Course"
                      value={selected.preferredCourse}
                    />
                  </div>
                </div>

                {/* ENGLISH PROFICIENCY TEST - MBBS SPECIFIC */}
                <div className="rounded-xl border bg-card">
                  <div className="border-b px-5 py-3">
                    <h3 className="font-semibold text-lg">
                      English Proficiency Test
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 lg:grid-cols-3">
                    <DetailItem label="Test Type" value={selected.ept} />
                    <DetailItem
                      label="Listening"
                      value={selected.listeningScore}
                    />
                    <DetailItem label="Reading" value={selected.readingScore} />
                    <DetailItem label="Writing" value={selected.writingScore} />
                    <DetailItem
                      label="Speaking"
                      value={selected.speakingScore}
                    />
                  </div>
                </div>

                {/* STUDY PREFERENCES */}
                <div className="rounded-xl border bg-card">
                  <div className="border-b px-5 py-3">
                    <h3 className="font-semibold text-lg">Study Preferences</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 lg:grid-cols-3">
                    <DetailItem
                      label="Preferred Country"
                      value={selected.preferredCountry}
                    />
                    <DetailItem
                      label="Preferred Intake"
                      value={selected.preferredIntake}
                    />

                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Preferred Tiers
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {selected.preferredTiers?.length ? (
                          selected.preferredTiers.map((tier) => (
                            <Badge key={tier} variant="secondary">
                              {tier}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm">-</span>
                        )}
                      </div>
                    </div>

                    <DetailItem
                      label="Counselling Date"
                      value={
                        selected.counsellingDate
                          ? new Date(
                              selected.counsellingDate,
                            ).toLocaleDateString()
                          : "-"
                      }
                    />
                  </div>
                </div>

                {/* CRM INFORMATION */}
                <div className="rounded-xl border bg-card">
                  <div className="border-b px-5 py-3">
                    <h3 className="font-semibold text-lg">CRM Information</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 lg:grid-cols-3">
                    <DetailItem label="Status" value={selected.status} />
                    <DetailItem
                      label="Created Date"
                      value={
                        selected.createdAt
                          ? new Date(selected.createdAt).toLocaleDateString()
                          : "-"
                      }
                    />
                    <DetailItem
                      label="Next Followup"
                      value={
                        selected.nextFollowup
                          ? new Date(selected.nextFollowup).toLocaleDateString()
                          : "-"
                      }
                    />
                  </div>
                  <div className="border-t p-5">
                    <DetailBlock label="Remarks" value={selected.remarks} />
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* 2. RECORD MODIFICATION ACTIONSHEET FORM */}
      <Sheet
        open={!!editingLead}
        onOpenChange={(value) => !value && setEditingLead(null)}
      >
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {editingLead && (
            <form
              onSubmit={handleUpdateLead}
              className="h-full flex flex-col justify-between"
            >
              <div className="space-y-5">
                <SheetHeader className="pb-4 border-b border-border">
                  <SheetTitle className="text-lg font-bold">
                    Modify Lead Parameters
                  </SheetTitle>
                  <SheetDescription>
                    Synchronize profile record variables for Serial Number:{" "}
                    <span className="font-mono text-foreground font-semibold">
                      {editingLead.leadNumber}
                    </span>
                  </SheetDescription>
                </SheetHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Student Name */}
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label htmlFor="edit-name" className="text-sm font-medium">
                      Student Name
                    </Label>
                    <Input
                      id="edit-name"
                      className="bg-background"
                      value={editingLead.studentName || ""}
                      onChange={(e) =>
                        setEditingLead({
                          ...editingLead,
                          studentName: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Father Name */}
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label
                      htmlFor="edit-father-name"
                      className="text-sm font-medium"
                    >
                      Father Name
                    </Label>
                    <Input
                      id="edit-father-name"
                      className="bg-background"
                      value={editingLead.fatherName || ""}
                      onChange={(e) =>
                        setEditingLead({
                          ...editingLead,
                          fatherName: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Mobile Number */}
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="edit-mobile"
                      className="text-sm font-medium"
                    >
                      Mobile Number
                    </Label>
                    <Input
                      id="edit-mobile"
                      className="bg-background"
                      value={editingLead.mobileNumber || ""}
                      onChange={(e) =>
                        setEditingLead({
                          ...editingLead,
                          mobileNumber: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Email Address */}
                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="edit-email"
                      type="email"
                      className="bg-background"
                      value={editingLead.emailId || ""}
                      onChange={(e) =>
                        setEditingLead({
                          ...editingLead,
                          emailId: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Address */}
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="edit-address"
                      className="text-sm font-medium"
                    >
                      Address
                    </Label>
                    <Input
                      id="edit-address"
                      className="bg-background"
                      value={editingLead.address || ""}
                      onChange={(e) =>
                        setEditingLead({
                          ...editingLead,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* State */}
                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-state" className="text-sm font-medium">
                      State
                    </Label>
                    <Input
                      id="edit-state"
                      className="bg-background"
                      value={editingLead.state || ""}
                      onChange={(e) =>
                        setEditingLead({
                          ...editingLead,
                          state: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* City */}
                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-city" className="text-sm font-medium">
                      City
                    </Label>
                    <Input
                      id="edit-city"
                      className="bg-background"
                      value={editingLead.city || ""}
                      onChange={(e) =>
                        setEditingLead({
                          ...editingLead,
                          city: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Passport Number */}
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="edit-passport"
                      className="text-sm font-medium"
                    >
                      Passport Number
                    </Label>
                    <Input
                      id="edit-passport"
                      className="bg-background"
                      value={editingLead.passport || ""}
                      onChange={(e) =>
                        setEditingLead({
                          ...editingLead,
                          passport: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Passport Expiry Date */}
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="edit-passport-expiry"
                      className="text-sm font-medium"
                    >
                      Passport Expiry Date
                    </Label>

                    <Input
                      id="edit-passport-expiry"
                      type="date"
                      value={
                        editingLead.passportExpireDate
                          ? new Date(editingLead.passportExpireDate)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setEditingLead({
                          ...editingLead,
                          passportExpireDate: e.target.value || null,
                        })
                      }
                    />
                  </div>

                  {/* 12th College Name */}
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="edit-12th-college"
                      className="text-sm font-medium"
                    >
                      12th College Name
                    </Label>
                    <Input
                      id="edit-12th-college"
                      className="bg-background"
                      value={editingLead.twelfthCollegeName || ""}
                      onChange={(e) =>
                        setEditingLead({
                          ...editingLead,
                          twelfthCollegeName: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* 12th Marks */}
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="edit-12th-marks"
                      className="text-sm font-medium"
                    >
                      12th Marks
                    </Label>
                    <Input
                      id="edit-12th-marks"
                      type="number"
                      className="bg-background"
                      value={editingLead.twelfthMarks || ""}
                      onChange={(e) =>
                        setEditingLead({
                          ...editingLead,
                          twelfthMarks: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>

                  {/* NEET Marks */}
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="edit-neet-marks"
                      className="text-sm font-medium"
                    >
                      NEET Marks
                    </Label>
                    <Input
                      id="edit-neet-marks"
                      type="number"
                      className="bg-background"
                      value={editingLead.neetMarks || ""}
                      onChange={(e) =>
                        setEditingLead({
                          ...editingLead,
                          neetMarks: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>

                  {/* English Test Type */}
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label htmlFor="edit-ept" className="text-sm font-medium">
                      English Proficiency Test Type
                    </Label>
                    <Input
                      id="edit-ept"
                      className="bg-background"
                      value={editingLead.ept || ""}
                      onChange={(e) =>
                        setEditingLead({
                          ...editingLead,
                          ept: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Listening Score */}
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="edit-listening"
                      className="text-sm font-medium"
                    >
                      Listening Score
                    </Label>
                    <Input
                      id="edit-listening"
                      type="number"
                      step="0.1"
                      className="bg-background"
                      value={editingLead.listeningScore || ""}
                      onChange={(e) =>
                        setEditingLead({
                          ...editingLead,
                          listeningScore: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>

                  {/* Reading Score */}
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="edit-reading"
                      className="text-sm font-medium"
                    >
                      Reading Score
                    </Label>
                    <Input
                      id="edit-reading"
                      type="number"
                      step="0.1"
                      className="bg-background"
                      value={editingLead.readingScore || ""}
                      onChange={(e) =>
                        setEditingLead({
                          ...editingLead,
                          readingScore: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>

                  {/* Writing Score */}
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="edit-writing"
                      className="text-sm font-medium"
                    >
                      Writing Score
                    </Label>
                    <Input
                      id="edit-writing"
                      type="number"
                      step="0.1"
                      className="bg-background"
                      value={editingLead.writingScore || ""}
                      onChange={(e) =>
                        setEditingLead({
                          ...editingLead,
                          writingScore: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>

                  {/* Speaking Score */}
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="edit-speaking"
                      className="text-sm font-medium"
                    >
                      Speaking Score
                    </Label>
                    <Input
                      id="edit-speaking"
                      type="number"
                      step="0.1"
                      className="bg-background"
                      value={editingLead.speakingScore || ""}
                      onChange={(e) =>
                        setEditingLead({
                          ...editingLead,
                          speakingScore: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </div>

                  {/* Pipeline Status */}
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label
                      htmlFor="edit-status"
                      className="text-sm font-medium"
                    >
                      Pipeline Status
                    </Label>
                    <Select
                      value={editingLead.status}
                      onValueChange={(val) =>
                        setEditingLead({
                          ...editingLead,
                          status: val as MbbsLeadStatus,
                        })
                      }
                    >
                      <SelectTrigger
                        id="edit-status"
                        className="w-full bg-background"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Assigned Branch */}
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label
                      htmlFor="edit-branch"
                      className="text-sm font-medium"
                    >
                      Assigned Branch
                    </Label>
                    <Select
                      value={editingLead.branch?.id || ""}
                      onValueChange={(val) => {
                        const targetBranch = branches.find((b) => b.id === val);
                        setEditingLead({
                          ...editingLead,
                          branch: targetBranch
                            ? { id: targetBranch.id, name: targetBranch.name }
                            : undefined,
                        });
                      }}
                    >
                      <SelectTrigger
                        id="edit-branch"
                        className="w-full bg-white h-11 border-slate-200 rounded-xl"
                      >
                        <SelectValue placeholder="Select Branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Preferred Country */}
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="edit-country"
                      className="text-sm font-medium"
                    >
                      Preferred Country
                    </Label>
                    <Select
                      value={editingLead.preferredCountry || ""}
                      onValueChange={(val) =>
                        setEditingLead({
                          ...editingLead,
                          preferredCountry: val,
                        })
                      }
                    >
                      <SelectTrigger
                        id="edit-country"
                        className="w-full bg-white h-11 border-slate-200 rounded-xl"
                      >
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryLoad ? (
                          <SelectItem value="loading" disabled>
                            Loading countries...
                          </SelectItem>
                        ) : (
                          (countries || [])?.map(
                            (
                              country: { id: string; name: string },
                              idx: number,
                            ) => (
                              <SelectItem
                                key={country.id || idx}
                                value={country.name}
                              >
                                {country.name}
                              </SelectItem>
                            ),
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Preferred Intake */}
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="edit-intake"
                      className="text-sm font-medium"
                    >
                      Preferred Intake
                    </Label>
                    <Select
                      value={editingLead.preferredIntake || ""}
                      onValueChange={(val) =>
                        setEditingLead({
                          ...editingLead,
                          preferredIntake: val,
                        })
                      }
                    >
                      <SelectTrigger
                        id="edit-intake"
                        className="w-full bg-white h-11 border-slate-200 rounded-xl"
                      >
                        <SelectValue placeholder="Select Intake" />
                      </SelectTrigger>
                      <SelectContent>
                        {intakeLoad ? (
                          <SelectItem value="loading" disabled>
                            Loading intakes...
                          </SelectItem>
                        ) : (
                          (intakes || [])?.map(
                            (intake: { id: string; name: string }) => (
                              <SelectItem key={intake.id} value={intake.name}>
                                {intake.name}
                              </SelectItem>
                            ),
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label className="text-sm font-medium">
                      Preferred University Tiers
                    </Label>

                    <div className="flex flex-wrap gap-2">
                      {["T1", "T2", "T3", "T4"].map((tier) => {
                        const selected =
                          editingLead.preferredTiers?.includes(tier);

                        return (
                          <Button
                            key={tier}
                            type="button"
                            variant={selected ? "default" : "outline"}
                            size="sm"
                            onClick={() =>
                              setEditingLead({
                                ...editingLead,
                                preferredTiers: selected
                                  ? editingLead.preferredTiers?.filter(
                                      (t) => t !== tier,
                                    )
                                  : [
                                      ...(editingLead.preferredTiers || []),
                                      tier,
                                    ],
                              })
                            }
                          >
                            {tier}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preferred Course */}
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="edit-course"
                      className="text-sm font-medium"
                    >
                      Preferred Course
                    </Label>
                    <Input
                      id="edit-course"
                      className="bg-background"
                      value={editingLead.preferredCourse || ""}
                      onChange={(e) =>
                        setEditingLead({
                          ...editingLead,
                          preferredCourse: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Lead Source */}
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label
                      htmlFor="edit-source"
                      className="text-sm font-medium"
                    >
                      Lead Source
                    </Label>
                    <Select
                      value={editingLead.source || ""}
                      onValueChange={(val) =>
                        setEditingLead({
                          ...editingLead,
                          source: val,
                        })
                      }
                    >
                      <SelectTrigger
                        id="edit-source"
                        className="w-full bg-white h-11 border-slate-200 rounded-xl"
                      >
                        <SelectValue placeholder="Select Lead Source" />
                      </SelectTrigger>
                      <SelectContent>
                        {lead_sourcesLoad ? (
                          <SelectItem value="loading" disabled>
                            Loading lead sources...
                          </SelectItem>
                        ) : (
                          (lead_sources || [])?.map(
                            (
                              lead_source: { id: string; name: string },
                              idx: number,
                            ) => (
                              <SelectItem
                                key={lead_source.id || idx}
                                value={lead_source.name}
                              >
                                {lead_source.name}
                              </SelectItem>
                            ),
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto">
                    {counselors?.map(
                      (counselor: { id: string; name: string }) => (
                        <label
                          key={counselor.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCounselors.includes(counselor.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCounselors((prev) => [
                                  ...prev,
                                  counselor.id,
                                ]);
                              } else {
                                setSelectedCounselors((prev) =>
                                  prev.filter((id) => id !== counselor.id),
                                );
                              }
                            }}
                          />

                          <span>{counselor.name}</span>
                        </label>
                      ),
                    )}
                  </div>

                  {/* Counselling Date */}
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label
                      htmlFor="edit-counselling"
                      className="text-sm font-medium"
                    >
                      Counselling Date
                    </Label>
                    <Input
                      id="edit-counselling"
                      type="date"
                      className="bg-background"
                      value={
                        editingLead.counsellingDate
                          ? editingLead.counsellingDate.split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setEditingLead({
                          ...editingLead,
                          counsellingDate: e.target.value || null,
                        })
                      }
                    />
                  </div>

                  {/* Next Followup Date */}
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label
                      htmlFor="edit-followup"
                      className="text-sm font-medium"
                    >
                      Next Followup Date
                    </Label>
                    <Input
                      id="edit-followup"
                      type="date"
                      className="bg-background"
                      value={
                        editingLead.nextFollowup
                          ? editingLead.nextFollowup.split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setEditingLead({
                          ...editingLead,
                          nextFollowup: e.target.value || null,
                        })
                      }
                    />
                  </div>

                  {/* Management Remarks */}
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label
                      htmlFor="edit-remarks"
                      className="text-sm font-medium"
                    >
                      Management Remarks
                    </Label>
                    <Input
                      id="edit-remarks"
                      className="bg-background"
                      value={editingLead.remarks || ""}
                      onChange={(e) =>
                        setEditingLead({
                          ...editingLead,
                          remarks: e.target.value,
                        })
                      }
                      placeholder="Add tracking updates..."
                    />
                  </div>
                </div>
              </div>

              <SheetFooter className="mt-6 pt-4 border-t border-border flex flex-row items-center justify-end gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingLead(null)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  Save Updates
                </Button>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>

      {/* 3. HARD CONFIRMATION DELETION ALERT_DIALOG */}
      <AlertDialog
        open={!!leadIdToDelete}
        onOpenChange={(value) => !value && setLeadIdToDelete(null)}
      >
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">
              Are you absolutely certain?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground leading-normal">
              This action cannot be undone. This will permanently detach the
              selected client file from your CRM live table data index matrices.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-2">
            <AlertDialogCancel className="mt-0 w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDeleteLead}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
