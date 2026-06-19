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

      toast.success(isEdit ? "University updated" : "University created");

      onOpenChange(false);
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>
            {isEdit ? "Edit University" : "Create University"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(submitHandler)}
          className="flex h-full flex-col"
        >
          <Tabs defaultValue="info" className="flex flex-col">
            <div className="border-b px-6 py-3">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">University</TabsTrigger>

                <TabsTrigger value="courses">Courses</TabsTrigger>

                <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
              </TabsList>
            </div>

            <div className="overflow-y-auto px-6 py-5 max-h-[70vh]">
              <TabsContent value="info" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>University Name</Label>

                    <Input {...form.register("name")} />
                  </div>

                  <div>
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

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>City</Label>

                    <Input {...form.register("city")} />
                  </div>

                  <div>
                    <Label>State</Label>

                    <Input {...form.register("state")} />
                  </div>

                  <div>
                    <Label>Postal Code</Label>

                    <Input {...form.register("postalCode")} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Website</Label>

                    <Input {...form.register("website")} />
                  </div>

                  <div>
                    <Label>Logo URL</Label>

                    <Input {...form.register("logo")} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <Label>Ranking</Label>

                    <Input
                      type="number"
                      {...form.register("ranking", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>

                  <div>
                    <Label>Established</Label>

                    <Input
                      type="number"
                      {...form.register("establishedYear", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>

                  <div>
                    <Label>Application Fee</Label>

                    <Input
                      type="number"
                      {...form.register("applicationFee", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>

                  <div>
                    <Label>Currency</Label>

                    <Input {...form.register("currency")} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>Contact Person</Label>

                    <Input {...form.register("contactPerson")} />
                  </div>

                  <div>
                    <Label>Contact Email</Label>

                    <Input {...form.register("contactEmail")} />
                  </div>

                  <div>
                    <Label>Contact Phone</Label>

                    <Input {...form.register("contactPhone")} />
                  </div>
                </div>

                <div>
                  <Label>Status</Label>

                  <Select
                    value={form.watch("status")}
                    onValueChange={(value) =>
                      form.setValue(
                        "status",
                        value as "active" | "inactive" | "archived",
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>

                      <SelectItem value="inactive">Inactive</SelectItem>

                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Intake Notes</Label>

                  <Textarea rows={4} {...form.register("intakeNotes")} />
                </div>

                <div>
                  <Label>Description</Label>

                  <Textarea rows={5} {...form.register("description")} />
                </div>
              </TabsContent>

              <TabsContent value="courses" className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
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

                <div className="space-y-4">
                  {courseArray.fields.map((field, index) => (
                    <UniversityCourseForm
                      key={field.id}
                      index={index}
                      control={form.control}
                      remove={courseArray.remove}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="scholarships" className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
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

                <div className="space-y-4">
                  {scholarshipArray.fields.map((field, index) => (
                    <UniversityScholarshipForm
                      key={field.id}
                      index={index}
                      control={form.control}
                      remove={scholarshipArray.remove}
                    />
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="border-t px-6 ">
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
