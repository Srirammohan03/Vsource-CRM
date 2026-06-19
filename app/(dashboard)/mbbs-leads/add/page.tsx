// crm-frontend-next\app\(dashboard)\mbbs-leads\add\page.tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BookOpen,
  FileText,
  Globe,
  GraduationCap,
  MapPin,
  NotebookPen,
} from "lucide-react";

import { PageHeader, PageTransition } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Branch, getBranches, useBranches } from "@/lib/branches";
import {
  Country,
  getCountries,
  getIntakes,
  getLeadSources,
  Intake,
  LeadSource,
  useCountries,
  useIntakes,
  useLeadSources,
} from "@/lib/master-settings";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/store";
import { MODULES } from "@/lib/module-codes";
import { RoutePermission } from "@/components/guards/RoutePermission";

type DynamicOption = {
  id: string;
  name: string;
};

const getTodayDate = () => {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;

  return new Date(today.getTime() - timezoneOffset).toISOString().split("T")[0];
};

const requiredText = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required`);

const optionalText = z.string().trim().optional();

const requiredNumberText = (
  fieldName: string,
  minValue = 0,
  maxValue?: number,
) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} is required`)
    .regex(/^\d+(\.\d+)?$/, `${fieldName} must be a valid number`)
    .refine((value) => Number(value) >= minValue, {
      message: `${fieldName} must be at least ${minValue}`,
    })
    .refine((value) => maxValue === undefined || Number(value) <= maxValue, {
      message:
        maxValue === undefined
          ? `${fieldName} is invalid`
          : `${fieldName} cannot be more than ${maxValue}`,
    });

const optionalNumberText = (
  fieldName: string,
  minValue = 0,
  maxValue?: number,
) =>
  z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^\d+(\.\d+)?$/.test(value), {
      message: `${fieldName} must be a valid number`,
    })
    .refine((value) => !value || Number(value) >= minValue, {
      message: `${fieldName} must be at least ${minValue}`,
    })
    .refine(
      (value) => !value || maxValue === undefined || Number(value) <= maxValue,
      {
        message:
          maxValue === undefined
            ? `${fieldName} is invalid`
            : `${fieldName} cannot be more than ${maxValue}`,
      },
    );

const mbbsFormSchema = z.object({
  branchId: requiredText("Branch"),
  counsellingDate: requiredText("Date"),

  studentName: requiredText("Student name"),
  fatherName: optionalText,
  mobileNumber: z
    .string()
    .trim()
    .min(1, "Mobile number is required")
    .regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  emailId: z
    .string()
    .trim()
    .min(1, "Email ID is required")
    .email("Invalid email address"),
  address: requiredText("Address"),

  passportNumber: optionalText,
  passportExpiryDate: optionalText,

  source: optionalText,

  twelfthCollegeName: requiredText("12th college name"),
  twelfthMarks: requiredNumberText("12th marks"),
  neetMarks: requiredNumberText("NEET marks", 0, 720),

  state: requiredText("State"),
  city: requiredText("City"),

  ept: requiredText("EPT"),
  listeningScore: optionalNumberText("Listening score"),
  readingScore: optionalNumberText("Reading score"),
  writingScore: optionalNumberText("Writing score"),
  speakingScore: optionalNumberText("Speaking score"),

  preferredCountry: requiredText("Preferred country"),
  preferredIntake: optionalText,
  // preferredUniversity: requiredText("Preferred university / college"),
  preferredCourse: requiredText("Preferred course"),

  remarks: optionalText,
  status: optionalText,
});

type MbbsFormValues = z.infer<typeof mbbsFormSchema>;

const courseOptions = ["MBBS", "MD", "BDS", "Nursing", "Pharmacy", "Other"];

const eptOptions = [
  "IELTS",
  "TOEFL",
  "PTE",
  "DUOLINGO",
  "MOI",
  "Not Applicable",
  "Yet to Write",
];

const getDefaultValues = (): MbbsFormValues => ({
  branchId: "",
  counsellingDate: getTodayDate(),

  studentName: "",
  fatherName: "",
  mobileNumber: "",
  emailId: "",
  address: "",

  passportNumber: "",
  passportExpiryDate: "",

  source: "",

  twelfthCollegeName: "",
  twelfthMarks: "",
  neetMarks: "",

  state: "",
  city: "",

  ept: "",
  listeningScore: "",
  readingScore: "",
  writingScore: "",
  speakingScore: "",

  preferredCountry: "",
  preferredIntake: "",
  // preferredUniversity: "",
  preferredCourse: "MBBS",

  remarks: "",
  status: "draft",
});

const numberOrUndefined = (value?: string) => {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return undefined;
  }

  return Number(trimmedValue);
};

function RequiredLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className="after:content-['*'] after:ml-0.5 after:text-red-500"
    >
      {children}
    </Label>
  );
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-sm font-medium text-destructive">{message}</p>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MbbsForm() {
  const router = useRouter();
  const { user } = useAuth();
  const branches = user?.branches ?? [];

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MbbsFormValues>({
    resolver: zodResolver(mbbsFormSchema),
    defaultValues: getDefaultValues(),
  });

  const { data: countries = [], isLoading: isCountriesLoading } =
    useCountries();
  const { data: intakes = [] } = useIntakes();
  const { data: leadSources = [], isLoading: isIntakesLoading } =
    useLeadSources();

  const onSubmit = async (values: MbbsFormValues, continueFlow = false) => {
    try {
      const payload = {
        ...values,

        leadType: "mbbs",

        passport: values.passportNumber,
        passportExpireDate: values.passportExpiryDate,

        twelfthMarks: Number(values.twelfthMarks),
        neetMarks: Number(values.neetMarks),

        listeningScore: numberOrUndefined(values.listeningScore),
        readingScore: numberOrUndefined(values.readingScore),
        writingScore: numberOrUndefined(values.writingScore),
        speakingScore: numberOrUndefined(values.speakingScore),

        status: "new",
      };
      const response = await fetch(`${API_BASE_URL}/mbbs-leads`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to create MBBS lead");
      }

      toast.success("MBBS lead created successfully");

      if (continueFlow) {
        router.push("/mbbs-leads/all");
        return;
      }

      reset(getDefaultValues());
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create MBBS lead",
      );
    }
  };

  return (
    <PageTransition>
      <RoutePermission action="create" moduleCode={MODULES.MBBS_LEADS}>
        <div className="mx-auto max-w-6xl space-y-6 pb-12">
          <PageHeader
            title="Add MBBS Lead"
            description="Register MBBS student details, academic information, passport details, and study preferences."
          />

          <form
            className="space-y-8"
            onSubmit={handleSubmit((values) => onSubmit(values, true))}
          >
            <Accordion
              type="multiple"
              defaultValue={["basic", "education", "ept", "preferences"]}
              className="space-y-4"
            >
              <AccordionItem
                value="basic"
                className="rounded-2xl border bg-card"
              >
                <AccordionTrigger className="overflow-hidden rounded-2xl border-t-4 border-t-primary shadow-sm">
                  <div className="px-4 py-4 sm:px-6">
                    <h3 className="flex items-center text-base font-semibold text-foreground sm:text-lg">
                      <MapPin className="mr-2 h-5 w-5 text-primary" />
                      Basic Information
                    </h3>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <RequiredLabel>Branch</RequiredLabel>

                      <Controller
                        control={control}
                        name="branchId"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Branch" />
                            </SelectTrigger>

                            <SelectContent>
                              {branches?.map((branch: Branch, idx: number) => (
                                <SelectItem
                                  key={branch.id || idx}
                                  value={branch.id}
                                >
                                  {branch.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />

                      <FormError message={errors.branchId?.message} />
                    </div>

                    <div className="space-y-2">
                      <RequiredLabel htmlFor="counsellingDate">
                        Date
                      </RequiredLabel>
                      <Input
                        id="counsellingDate"
                        type="date"
                        {...register("counsellingDate")}
                      />
                      <FormError message={errors.counsellingDate?.message} />
                    </div>

                    <div className="space-y-2">
                      <RequiredLabel htmlFor="studentName">
                        Student Name
                      </RequiredLabel>
                      <Input
                        id="studentName"
                        placeholder="ex: Rahul Sharma"
                        {...register("studentName")}
                      />
                      <FormError message={errors.studentName?.message} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fatherName">Father&apos;s Name</Label>
                      <Input
                        id="fatherName"
                        placeholder="ex: Rajesh Sharma"
                        {...register("fatherName")}
                      />
                    </div>

                    <div className="space-y-2">
                      <RequiredLabel htmlFor="mobileNumber">
                        Mobile Number
                      </RequiredLabel>
                      <Input
                        id="mobileNumber"
                        type="tel"
                        placeholder="9876543210"
                        maxLength={10}
                        inputMode="numeric"
                        {...register("mobileNumber")}
                        onInput={(event) => {
                          event.currentTarget.value =
                            event.currentTarget.value.replace(/[^0-9]/g, "");
                        }}
                      />
                      <FormError message={errors.mobileNumber?.message} />
                    </div>

                    <div className="space-y-2">
                      <RequiredLabel htmlFor="emailId">Email ID</RequiredLabel>
                      <Input
                        id="emailId"
                        type="email"
                        placeholder="student@example.com"
                        {...register("emailId")}
                      />
                      <FormError message={errors.emailId?.message} />
                    </div>

                    <div className="space-y-2 md:col-span-2 lg:col-span-3">
                      <RequiredLabel htmlFor="address">Address</RequiredLabel>
                      <Textarea
                        id="address"
                        placeholder="Enter full address"
                        rows={3}
                        {...register("address")}
                      />
                      <FormError message={errors.address?.message} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="passportNumber">Passport Number</Label>
                      <Input
                        id="passportNumber"
                        placeholder="ex: U12345678"
                        {...register("passportNumber")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="passportExpiryDate">
                        Passport Expiry Date
                      </Label>
                      <Input
                        id="passportExpiryDate"
                        type="date"
                        {...register("passportExpiryDate")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Lead Source</Label>
                      <Controller
                        control={control}
                        name="source"
                        render={({ field }) => (
                          <Select
                            value={field.value ?? ""}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Source" />
                            </SelectTrigger>

                            <SelectContent>
                              {leadSources?.map(
                                (item: LeadSource, idx: number) => (
                                  <SelectItem
                                    key={item.id || idx}
                                    value={item.name}
                                  >
                                    {item.name}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="education"
                className="rounded-2xl border bg-card"
              >
                <AccordionTrigger className="overflow-hidden rounded-2xl border-t-4 border-t-primary shadow-sm">
                  <div className="px-4 py-4 sm:px-6">
                    <h3 className="flex items-center text-base font-semibold text-foreground sm:text-lg">
                      <GraduationCap className="mr-2 h-5 w-5 text-blue-500" />
                      Educational Information
                    </h3>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2 md:col-span-2">
                      <RequiredLabel htmlFor="twelfthCollegeName">
                        12th College Name
                      </RequiredLabel>
                      <Input
                        id="twelfthCollegeName"
                        placeholder="Enter 12th college name"
                        {...register("twelfthCollegeName")}
                      />
                      <FormError message={errors.twelfthCollegeName?.message} />
                    </div>

                    <div className="space-y-2">
                      <RequiredLabel htmlFor="twelfthMarks">
                        12th Marks
                      </RequiredLabel>
                      <Input
                        id="twelfthMarks"
                        type="number"
                        min="0"
                        placeholder="ex: 875 or 92"
                        {...register("twelfthMarks")}
                      />
                      <FormError message={errors.twelfthMarks?.message} />
                    </div>

                    <div className="space-y-2">
                      <RequiredLabel htmlFor="neetMarks">
                        NEET Marks
                      </RequiredLabel>
                      <Input
                        id="neetMarks"
                        type="number"
                        min="0"
                        max="720"
                        placeholder="ex: 450"
                        {...register("neetMarks")}
                      />
                      <FormError message={errors.neetMarks?.message} />
                    </div>

                    <div className="space-y-2">
                      <RequiredLabel htmlFor="state">State</RequiredLabel>
                      <Input
                        id="state"
                        placeholder="ex: Telangana"
                        {...register("state")}
                      />
                      <FormError message={errors.state?.message} />
                    </div>

                    <div className="space-y-2">
                      <RequiredLabel htmlFor="city">City</RequiredLabel>
                      <Input
                        id="city"
                        placeholder="ex: Hyderabad"
                        {...register("city")}
                      />
                      <FormError message={errors.city?.message} />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ept" className="rounded-2xl border bg-card">
                <AccordionTrigger className="overflow-hidden rounded-2xl border-t-4 border-t-primary shadow-sm">
                  <div className="px-4 py-4 sm:px-6">
                    <h3 className="flex items-center text-base font-semibold text-foreground sm:text-lg">
                      <BookOpen className="mr-2 h-5 w-5 text-purple-500" />
                      EPT Details
                    </h3>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <RequiredLabel>EPT</RequiredLabel>

                      <Controller
                        control={control}
                        name="ept"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select EPT" />
                            </SelectTrigger>

                            <SelectContent>
                              {eptOptions.map((item) => (
                                <SelectItem key={item} value={item}>
                                  {item}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />

                      <FormError message={errors.ept?.message} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="listeningScore" className="text-xs">
                        Listening
                      </Label>
                      <Input
                        id="listeningScore"
                        placeholder="L Score"
                        type="number"
                        min="0"
                        step="0.5"
                        {...register("listeningScore")}
                      />
                      <FormError message={errors.listeningScore?.message} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="readingScore" className="text-xs">
                        Reading
                      </Label>
                      <Input
                        id="readingScore"
                        placeholder="R Score"
                        type="number"
                        min="0"
                        step="0.5"
                        {...register("readingScore")}
                      />
                      <FormError message={errors.readingScore?.message} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="writingScore" className="text-xs">
                        Writing
                      </Label>
                      <Input
                        id="writingScore"
                        placeholder="W Score"
                        type="number"
                        min="0"
                        step="0.5"
                        {...register("writingScore")}
                      />
                      <FormError message={errors.writingScore?.message} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="speakingScore" className="text-xs">
                        Speaking
                      </Label>
                      <Input
                        id="speakingScore"
                        placeholder="S Score"
                        type="number"
                        min="0"
                        step="0.5"
                        {...register("speakingScore")}
                      />
                      <FormError message={errors.speakingScore?.message} />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="preferences"
                className="rounded-2xl border bg-card"
              >
                <AccordionTrigger className="overflow-hidden rounded-2xl border-t-4 border-t-primary shadow-sm">
                  <div className="px-4 py-4 sm:px-6">
                    <h3 className="flex items-center text-base font-semibold text-foreground sm:text-lg">
                      <Globe className="mr-2 h-5 w-5 text-emerald-500" />
                      Study Preferences
                    </h3>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <RequiredLabel>Preferred Country</RequiredLabel>
                      <Controller
                        control={control}
                        name="preferredCountry"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Country" />
                            </SelectTrigger>

                            <SelectContent>
                              {isCountriesLoading ? (
                                <SelectItem value="loading-countries" disabled>
                                  Loading countries...
                                </SelectItem>
                              ) : countries?.length > 0 ? (
                                countries?.map(
                                  (country: Country, idx: number) => (
                                    <SelectItem
                                      key={country.id || idx}
                                      value={country.name}
                                    >
                                      {country.name}
                                    </SelectItem>
                                  ),
                                )
                              ) : (
                                <SelectItem value="no-countries" disabled>
                                  No countries found
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FormError message={errors.preferredCountry?.message} />
                    </div>

                    <div className="space-y-2">
                      <Label>Preferred Intake</Label>
                      <Controller
                        control={control}
                        name="preferredIntake"
                        render={({ field }) => (
                          <Select
                            value={field.value ?? ""}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Intake" />
                            </SelectTrigger>

                            <SelectContent>
                              {isIntakesLoading ? (
                                <SelectItem value="loading-intakes" disabled>
                                  Loading intakes...
                                </SelectItem>
                              ) : intakes?.length > 0 ? (
                                intakes?.map((intake: Intake, idx: number) => (
                                  <SelectItem
                                    key={intake.id || idx}
                                    value={intake.name}
                                  >
                                    {intake.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-intakes" disabled>
                                  No intakes found
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <RequiredLabel>Preferred Course</RequiredLabel>

                      <Controller
                        control={control}
                        name="preferredCourse"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Course" />
                            </SelectTrigger>

                            <SelectContent>
                              {courseOptions.map((item) => (
                                <SelectItem key={item} value={item}>
                                  {item}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />

                      <FormError message={errors.preferredCourse?.message} />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="remarks"
                className="rounded-2xl border bg-card"
              >
                <AccordionTrigger className="overflow-hidden rounded-2xl border-t-4 border-t-primary shadow-sm">
                  <div className="px-4 py-4 sm:px-6">
                    <h3 className="flex items-center text-base font-semibold text-foreground sm:text-lg">
                      <NotebookPen className="mr-2 h-5 w-5 text-slate-500" />
                      Remarks
                    </h3>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="p-4 sm:p-6">
                  <div className="space-y-2">
                    <Label htmlFor="remarks">Remarks</Label>
                    <Textarea
                      id="remarks"
                      placeholder="Enter counselling notes, student interest, follow-up points, or any additional details..."
                      rows={4}
                      {...register("remarks")}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <div className="sticky bottom-3 z-10 flex flex-col-reverse gap-3 rounded-2xl border bg-background/90 p-3 shadow-lg backdrop-blur-md sm:bottom-4 sm:flex-row sm:justify-end sm:p-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => reset(getDefaultValues())}
                >
                  Reset Form
                </Button>

                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  Save MBBS Lead & Continue
                </Button>
              </div>
            </Accordion>
          </form>
        </div>
      </RoutePermission>
    </PageTransition>
  );
}
