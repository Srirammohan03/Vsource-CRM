// crm-frontend-next\app\(dashboard)\leads\all\pageactions.tsx
"use client";

import type { LeadStatus } from "@/types";

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

interface LeadRecord {
  id: string;
  leadNumber: string;

  counsellingDate?: string | null;

  studentName?: string;
  fatherName?: string;
  mobileNumber?: string;
  emailId?: string;

  place?: string;
  passport?: string;

  passportExpireDate?: string | null;

  source?: string;
  branchId: string;
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

  preferredCountry?: string;
  preferredIntake?: string;
  preferredCourse?: string;
  preferredTiers?: string[];
  tenthPercentage?: number;
  tenthYearOfPassing?: number;

  twelfthPercentage?: number;
  twelfthYearOfPassing?: number;

  bachelorsCourse?: string;
  bachelorsUniversityName?: string;
  bachelorsPercentage?: number;
  bachelorsYearOfPassing?: number;

  backlogs?: number;

  workExperience?: string;

  greGmatScore?: number;
  quantitativeScore?: number;
  verbalScore?: number;
  analyticalWritingScore?: number;

  englishTestType?: string;
  listeningScore?: number;
  readingScore?: number;
  writingScore?: number;
  speakingScore?: number;

  gapsIfAny?: string;

  isConverted?: boolean;

  remarks?: string;
  nextFollowup?: string | null;

  status: LeadStatus;
  createdAt: string;
}

interface PageActionsProps {
  selected: LeadRecord | null;
  setSelected: React.Dispatch<React.SetStateAction<LeadRecord | null>>;

  editingLead: LeadRecord | null;
  setEditingLead: React.Dispatch<React.SetStateAction<LeadRecord | null>>;

  leadIdToDelete: string | null;
  setLeadIdToDelete: React.Dispatch<React.SetStateAction<string | null>>;

  handleUpdateLead: (e: React.FormEvent) => Promise<void>;
  executeDeleteLead: () => Promise<void>;

  branchOptions: string[];
  statusStyle: Record<LeadStatus, string>;

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
    const loadBranches = async () => {
      try {
        const data = await getBranches();
        setBranches(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load branches");
      }
    };

    loadBranches();
  }, []);

  useEffect(() => {
    if (editingLead?.counselors) {
      setSelectedCounselors(
        editingLead.counselors.map((c: any) => c.counselor.id),
      );
    }
  }, [editingLead]);

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
                    <DetailItem label="Place" value={selected.place} />
                    <DetailItem
                      label="Passport Number"
                      value={selected.passport}
                    />
                    <DetailItem label="Lead Source" value={selected.source} />
                    <DetailItem label="Branch" value={selected.branch?.name} />
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Assigned Counselors
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {selected.counselors?.length ? (
                          selected.counselors.map((coun, idx) => (
                            <Badge key={coun.counselor?.id || idx}>
                              {coun?.counselor?.name}
                              {coun.isPrimary && " (Primary)"}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No counselors assigned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* EDUCATIONAL INFORMATION */}
                <div className="rounded-xl border bg-card">
                  <div className="border-b px-5 py-3">
                    <h3 className="font-semibold text-lg">
                      Educational Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 lg:grid-cols-3">
                    <DetailItem
                      label="10th Percentage"
                      value={selected.tenthPercentage}
                    />
                    <DetailItem
                      label="10th Passing Year"
                      value={selected.tenthYearOfPassing}
                    />
                    <DetailItem
                      label="12th Percentage"
                      value={selected.twelfthPercentage}
                    />
                    <DetailItem
                      label="12th Passing Year"
                      value={selected.twelfthYearOfPassing}
                    />
                    <DetailItem
                      label="University"
                      value={selected.bachelorsUniversityName}
                    />
                    <DetailItem
                      label="Course"
                      value={selected.bachelorsCourse}
                    />
                    <DetailItem
                      label="Bachelor Percentage"
                      value={selected.bachelorsPercentage}
                    />
                    <DetailItem
                      label="Bachelor Passing Year"
                      value={selected.bachelorsYearOfPassing}
                    />
                    <DetailItem label="Backlogs" value={selected.backlogs} />
                  </div>
                  <div className="border-t p-5">
                    <DetailBlock
                      label="Education Gaps"
                      value={selected.gapsIfAny}
                    />
                  </div>
                </div>

                {/* EPT Details */}
                <div className="rounded-xl border bg-card">
                  <div className="border-b px-5 py-3">
                    <h3 className="font-semibold text-lg">EPT Details</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 lg:grid-cols-3">
                    <DetailItem
                      label="English Test"
                      value={selected.englishTestType}
                    />
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
                    <DetailItem
                      label="GRE / GMAT"
                      value={selected.greGmatScore}
                    />
                    <DetailItem
                      label="Quantitative"
                      value={selected.quantitativeScore}
                    />
                    <DetailItem label="Verbal" value={selected.verbalScore} />
                    <DetailItem
                      label="AWA"
                      value={selected.analyticalWritingScore}
                    />
                  </div>
                </div>

                {/* STUDY PREFERENCES */}
                <div className="rounded-xl border bg-card">
                  <div className="border-b px-5 py-3">
                    <h3 className="font-semibold text-lg">
                      Study Preferences & Experience
                    </h3>
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
                          <span className="text-sm text-muted-foreground">
                            Not Selected
                          </span>
                        )}
                      </div>
                    </div>
                    <DetailItem
                      label="Preferred Course"
                      value={selected.preferredCourse}
                    />
                  </div>
                  <div className="border-t p-5">
                    <DetailBlock
                      label="Work Experience"
                      value={selected.workExperience}
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
                  <div className="grid gap-1.5 sm:col-span-2">
                    <Label htmlFor="edit-name" className="text-sm font-medium">
                      Father Name
                    </Label>
                    <Input
                      id="edit-name"
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

                  {/* Place */}
                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-place" className="text-sm font-medium">
                      Place
                    </Label>
                    <Input
                      id="edit-place"
                      className="bg-background"
                      value={editingLead.place || ""}
                      onChange={(e) =>
                        setEditingLead({
                          ...editingLead,
                          place: e.target.value,
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

                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-passport-expiry">
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
                          status: val as LeadStatus,
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

                  {/* Assigned Branch - Synced dynamically with loaded branches */}
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
                          branchId: targetBranch?.id ?? "",
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

                  {/* Assigned Counselor */}
                  <div className="grid gap-2 sm:col-span-2">
                    <Label className="text-sm font-medium">
                      Assigned Counselors
                    </Label>

                    <div className="border rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto">
                      {counselors.map(
                        (counselor: { id: string; name: string }) => (
                          <label
                            key={counselor.id}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCounselors.includes(
                                counselor.id,
                              )}
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
                            loading intakes...
                          </SelectItem>
                        ) : (
                          (intakes || []).map(
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
                        const selectedTier =
                          editingLead.preferredTiers?.includes(tier);

                        return (
                          <Button
                            key={tier}
                            type="button"
                            size="sm"
                            variant={selectedTier ? "default" : "outline"}
                            onClick={() =>
                              setEditingLead({
                                ...editingLead,
                                preferredTiers: selectedTier
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
                            loading lead source...
                          </SelectItem>
                        ) : (
                          (lead_sources || []).map(
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
