// crm-frontend-next\app\components\universities\university-form-dialog.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  universitySchema,
  UniversityFormValues,
} from "@/lib/university-schema";

import { University } from "@/types/university";
import { UniversityCourseForm } from "./university-course-form";
import { UniversityScholarshipForm } from "./university-scholarship-form";

interface UniversityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  university?: University | null;
  onSubmit: (data: UniversityFormValues) => void;
}

const DEFAULT_VALUES: UniversityFormValues = {
  id: "",
  name: "",
  countryId: "",
  city: "",
  state: "",
  postalCode: "",
  website: "",
  logo: "",
  ranking: undefined,
  establishedYear: undefined,
  applicationFee: undefined,
  currency: "AUD",
  description: "",
  contactPerson: "",
  contactEmail: "",
  contactPhone: "",
  intakeNotes: "",
  status: "active",
  courses: [],
  scholarships: [],
};

export function UniversityFormDialog({
  open,
  onOpenChange,
  university,
  onSubmit,
}: UniversityFormDialogProps) {
  const isEdit = !!university;

  const { data: countriesData } = useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const response = await axios.get("/api/countries");
      return response.data.data;
    },
  });
  const countries = (countriesData || []) as { id: string; name: string; code: string }[];

  const values = useMemo(() => {
    if (!university) {
      return DEFAULT_VALUES;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { country, _count, createdAt, updatedAt, ...rest } = university as any;
    return {
      ...DEFAULT_VALUES,
      ...rest,
      countryId: university.countryId || (typeof country === 'object' ? country?.id : country) || "",
      courses: university.courses ?? [],
      scholarships: university.scholarships ?? [],
    };
  }, [university]);

  const form = useForm<UniversityFormValues>({
    resolver: zodResolver(universitySchema),
    defaultValues: values,
  });

  useEffect(() => {
    form.reset(values);
  }, [values, form]);

  const courseArray = useFieldArray({
    control: form.control,
    name: "courses",
  });

  const scholarshipArray = useFieldArray({
    control: form.control,
    name: "scholarships",
  });

  const submitHandler = (data: UniversityFormValues) => {
    try {
      // Strip client-side IDs from nested records — server generates them
      const cleanedData = {
        ...data,
        courses: (data.courses ?? []).map(({ id, ...rest }) => rest),
        scholarships: (data.scholarships ?? []).map(({ id, ...rest }) => rest),
      };
      onSubmit(cleanedData as any);

      toast.success(isEdit ? "University updated successfully" : "University created successfully");
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Adjusted sizing: added max-w-5xl so it doesn't stretch too far, flex col to handle internal scrolling */}
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-5 bg-muted/10">
          <DialogTitle className="text-xl">
            {isEdit ? "Edit University Details" : "Create New University"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(submitHandler)}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <Tabs defaultValue="info" className="flex flex-1 flex-col overflow-hidden">
            <div className="border-b px-6 py-2 bg-muted/5">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="info">General Info</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
              </TabsList>
            </div>

            {/* Changed from max-h to flex-1 to perfectly fill the available space */}
            <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
              <TabsContent value="info" className="space-y-8 mt-0">
                {/* Basic Info Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Basic Information</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>University Name</Label>
                      <Input placeholder="e.g. Harvard University" {...form.register("name")} />
                    </div>

                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Select
                        value={form.watch("countryId")}
                        onValueChange={(value) => form.setValue("countryId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Location Section */}
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input placeholder="e.g. Cambridge" {...form.register("city")} />
                  </div>
                  <div className="space-y-2">
                    <Label>State / Province</Label>
                    <Input placeholder="e.g. Massachusetts" {...form.register("state")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Postal Code</Label>
                    <Input placeholder="e.g. 02138" {...form.register("postalCode")} />
                  </div>
                </div>

                {/* Digital Presence */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input placeholder="https://..." {...form.register("website")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Logo URL</Label>
                    <Input placeholder="https://..." {...form.register("logo")} />
                  </div>
                </div>

                {/* Institutional Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Institutional Details</h3>
                  <div className="grid gap-6 md:grid-cols-4">
                    <div className="space-y-2">
                      <Label>Global Ranking</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 1"
                        {...form.register("ranking", { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Established Year</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 1636"
                        {...form.register("establishedYear", { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Application Fee</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...form.register("applicationFee", { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Input placeholder="e.g. USD, AUD" {...form.register("currency")} />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Contact Information</h3>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Contact Person</Label>
                      <Input placeholder="Name" {...form.register("contactPerson")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Email</Label>
                      <Input type="email" placeholder="Email" {...form.register("contactEmail")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Phone</Label>
                      <Input placeholder="Phone number" {...form.register("contactPhone")} />
                    </div>
                  </div>
                </div>

                {/* Notes & Status */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={form.watch("status")}
                      onValueChange={(value) =>
                        form.setValue("status", value as "active" | "inactive" | "archived")
                      }
                    >
                      <SelectTrigger className="w-full md:w-1/3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Intake Notes</Label>
                    <Textarea
                      rows={3}
                      placeholder="Special instructions for the intake process..."
                      className="resize-none"
                      {...form.register("intakeNotes")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      rows={4}
                      placeholder="General description of the university..."
                      className="resize-none"
                      {...form.register("description")}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="courses" className="space-y-6 mt-0">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium">Courses</h3>
                    <p className="text-sm text-muted-foreground">Manage courses offered by this university.</p>
                  </div>
                  <Button
                    type="button"
                    onClick={() =>
                      courseArray.append({
                        id: crypto.randomUUID(),
                        name: "",
                        degree: "masters",
                      })
                    }
                  >
                    <Plus className="mr-2 size-4" />
                    Add Course
                  </Button>
                </div>

                <div className="space-y-4">
                  {courseArray.fields.length === 0 ? (
                    <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                      <p className="text-sm text-muted-foreground">No courses added yet.</p>
                    </div>
                  ) : (
                    courseArray.fields.map((field, index) => (
                      <UniversityCourseForm
                        key={field.id}
                        index={index}
                        control={form.control}
                        remove={courseArray.remove}
                      />
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="scholarships" className="space-y-6 mt-0">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium">Scholarships</h3>
                    <p className="text-sm text-muted-foreground">Manage available scholarships.</p>
                  </div>
                  <Button
                    type="button"
                    onClick={() =>
                      scholarshipArray.append({
                        id: crypto.randomUUID(),
                        name: "",
                      })
                    }
                  >
                    <Plus className="mr-2 size-4" />
                    Add Scholarship
                  </Button>
                </div>

                <div className="space-y-4">
                  {scholarshipArray.fields.length === 0 ? (
                    <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                      <p className="text-sm text-muted-foreground">No scholarships added yet.</p>
                    </div>
                  ) : (
                    scholarshipArray.fields.map((field, index) => (
                      <UniversityScholarshipForm
                        key={field.id}
                        index={index}
                        control={form.control}
                        remove={scholarshipArray.remove}
                      />
                    ))
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Added py-4 and gap-2 to properly space the buttons */}
          <DialogFooter className="border-t px-6 py-4 bg-muted/10 sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit">
              <Save className="mr-2 size-4" />
              {isEdit ? "Update University" : "Create University"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}