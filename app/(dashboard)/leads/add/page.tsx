// crm-frontend-next\app\(dashboard)\leads\add\page.tsx
"use client";

import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  CalendarIcon,
  GraduationCap,
  MapPin,
  Globe,
  BookOpen,
  Briefcase,
} from "lucide-react";
import { Branch, getBranches } from "@/lib/branches";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Country,
  Intake,
  LeadSource,
  getCountries,
  getIntakes,
  getLeadSources,
} from "@/lib/master-settings";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/store";
import { RoutePermission } from "@/components/guards/RoutePermission";
import { MODULES } from "@/lib/module-codes";

const leadFormSchema = z.object({
  counsellingDate: z.string().optional(),
  studentName: z.string().min(1, "Student name is required"),
  fatherName: z.string().optional(),
  mobileNumber: z
    .string()
    .min(10, "Must be at least 10 digits")
    .max(10, "Cannot exceed 10 digits")
    .regex(/^[0-9]+$/, "Must be numbers only"),
  emailId: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  place: z.string().optional(),
  passport: z.string().optional(),
  passportExpireDate: z.string().optional(),
  tenthPercentage: z.number().optional(),
  tenthYearOfPassing: z.number().optional(),
  twelfthPercentage: z.number().optional(),
  twelfthYearOfPassing: z.number().optional(),
  bachelorsCourse: z.string().optional(),
  bachelorsUniversityName: z.string().optional(),
  bachelorsPercentage: z.number().optional(),
  bachelorsYearOfPassing: z.number().optional(),
  backlogs: z.number().optional(),
  workExperience: z.string().optional(),
  preferredCountry: z.string().optional(),
  preferredIntake: z.string().optional(),
  preferredCourse: z.string().optional(),
  greGmatScore: z.number().optional(),
  quantitativeScore: z.number().optional(),
  verbalScore: z.number().optional(),
  analyticalWritingScore: z.number().optional(),
  englishTestType: z.string().optional(),
  listeningScore: z.number().optional(),
  writingScore: z.number().optional(),
  readingScore: z.number().optional(),
  speakingScore: z.number().optional(),
  gapsIfAny: z.string().optional(),
  status: z.string().optional(),
  source: z.string().optional(),
  branchId: z.string().min(1, "Branch is required"),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

const englishTestOptions = ["IELTS", "TOEFL", "DUOLINGO", "PTE"];

export default function AddLeadPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [universityOpen, setUniversityOpen] = useState(false);
  const [universitySearch, setUniversitySearch] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);
  const { user } = useAuth();

  const branches = user?.branches ?? [];

  const { data: universities = [], isLoading: universitiesLoad } = useQuery({
    queryKey: ["universities"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/lead-universities?status=true`,
        {
          withCredentials: true,
        },
      );
      return data?.data || [];
    },
  });
  const createUniversity = async (name: string) => {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/lead-universities?status=true`,
      {
        name,
      },
      {
        withCredentials: true,
      },
    );

    await queryClient.invalidateQueries({
      queryKey: ["universities"],
    });

    return data;
  };
  const { data: courses = [], isLoading: coursesLoad } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/lead-degrees?status=true`,
        {
          withCredentials: true,
        },
      );
      return data?.data || [];
    },
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      counsellingDate: new Date().toISOString().split("T")[0],
      studentName: "",
      mobileNumber: "",
      emailId: "",
      place: "",
      passport: "",
      source: "",
      branchId: "",
      status: "draft",
    },
  });

  useEffect(() => {
    const loadMasters = async () => {
      try {
        const [countryData, intakeData, sourceData] = await Promise.all([
          getCountries(),
          getIntakes(),
          getLeadSources(),
        ]);

        setCountries(countryData);
        setIntakes(intakeData);
        setLeadSources(sourceData);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load master data");
      }
    };

    loadMasters();
  }, []);

  const onSubmit = async (values: LeadFormValues, continueFlow = false) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed");
      }

      toast.success("Lead created successfully");

      if (continueFlow) {
        router.push("/leads/all");
        return;
      }

      reset();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create lead");
    }
  };

  return (
    <PageTransition>
      <RoutePermission action="create" moduleCode={MODULES.MASTER_LEADS}>
        <div className="mx-auto max-w-6xl space-y-6 pb-12">
          <PageHeader
            title="Add New Lead"
            description="Register a new student for counselling and process tracking."
          />

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <form className="space-y-8">
              <Accordion
                type="multiple"
                defaultValue={["basic", "education"]}
                className="space-y-4"
              >
                <AccordionItem
                  value="basic"
                  className="rounded-2xl border bg-card"
                >
                  <AccordionTrigger className="overflow-hidden border-t-4 border-t-primary rounded-2xl shadow-sm">
                    <div className=" px-6 py-4">
                      <h3 className="flex items-center text-lg font-semibold text-foreground">
                        <MapPin className="mr-2 h-5 w-5 text-primary" />
                        Basic Information
                      </h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-2">
                        <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                          Branch
                        </Label>

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
                                {branches.map((branch: Branch) => (
                                  <SelectItem key={branch.id} value={branch.id}>
                                    {branch.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />

                        {errors.branchId && (
                          <p className="text-sm font-medium text-destructive">
                            {errors.branchId.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="counsellingDate">
                          Counselling Date
                        </Label>
                        <Input
                          id="counsellingDate"
                          type="date"
                          {...register("counsellingDate")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="studentName"
                          className="after:content-['*'] after:ml-0.5 after:text-red-500"
                        >
                          Student Name
                        </Label>
                        <Input
                          id="studentName"
                          placeholder="ex: Rahul"
                          {...register("studentName")}
                        />
                        {errors.studentName && (
                          <p className="text-sm font-medium text-destructive">
                            {errors.studentName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fatherName">Father Name</Label>
                        <Input
                          id="fatherName"
                          placeholder="ex: Venkatesh"
                          {...register("fatherName")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="mobileNumber"
                          className="after:content-['*'] after:ml-0.5 after:text-red-500"
                        >
                          Mobile Number
                        </Label>
                        <Input
                          type="tel"
                          id="mobileNumber"
                          placeholder="9876543210"
                          maxLength={10}
                          // This event handler ensures only numbers are accepted
                          onInput={(e: React.FormEvent<HTMLInputElement>) => {
                            e.currentTarget.value =
                              e.currentTarget.value.replace(/[^0-9]/g, "");
                          }}
                          {...register("mobileNumber")}
                        />
                        {errors.mobileNumber && (
                          <p className="text-sm font-medium text-destructive">
                            {errors.mobileNumber.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="emailId"
                          className="after:content-['*'] after:ml-0.5 after:text-red-500"
                        >
                          Email Address
                        </Label>
                        <Input
                          id="emailId"
                          type="email"
                          placeholder="rahul@example.com"
                          {...register("emailId")}
                        />
                        {errors.emailId && (
                          <p className="text-sm font-medium text-destructive">
                            {errors.emailId.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="place">City / Place</Label>
                        <Input
                          id="place"
                          placeholder="Hyderabad"
                          {...register("place")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="passport">Passport Number</Label>
                        <Input
                          id="passport"
                          placeholder="U12345678"
                          {...register("passport")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="passportExpireDate">
                          Passport Expiry Date
                        </Label>

                        <Input
                          id="passportExpireDate"
                          type="date"
                          {...register("passportExpireDate")}
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
                                {leadSources.map((item) => (
                                  <SelectItem key={item.id} value={item.name}>
                                    {item.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Section 2: Educational Information */}
                {/* Education */}
                <AccordionItem
                  value="education"
                  className="rounded-2xl border bg-card"
                >
                  <AccordionTrigger className="overflow-hidden border-t-4 rounded-2xl border-t-primary shadow-sm">
                    <div className="px-6 py-4 ">
                      <h3 className="flex items-center text-lg font-semibold text-foreground">
                        <GraduationCap className="mr-2 h-5 w-5 text-blue-500" />
                        Educational Information
                      </h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-8 p-6">
                    {/* Schooling */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-2">
                        <Label>10th Percentage (%)</Label>
                        <Input
                          placeholder="e.g. 85"
                          type="number"
                          {...register("tenthPercentage", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>10th Year of Passing</Label>
                        <Input
                          placeholder="YYYY"
                          type="number"
                          {...register("tenthYearOfPassing", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>12th Percentage (%)</Label>
                        <Input
                          placeholder="e.g. 88"
                          type="number"
                          {...register("twelfthPercentage", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>12th Year of Passing</Label>
                        <Input
                          placeholder="YYYY"
                          type="number"
                          {...register("twelfthYearOfPassing", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                    </div>

                    <div className="border-t pt-6" />

                    {/* Bachelors */}
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                      Bachelor's Degree
                    </h4>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-2 lg:col-span-2">
                        <Label>University / College Name</Label>
                        <Controller
                          control={control}
                          name="bachelorsUniversityName"
                          render={({ field }) => (
                            <Popover
                              open={universityOpen}
                              onOpenChange={setUniversityOpen}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  role="combobox"
                                  className="w-full justify-between"
                                >
                                  {field.value || "Select or Type University"}

                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>

                              <PopoverContent className="w-[450px] p-0">
                                <Command>
                                  <CommandInput
                                    placeholder="Search university..."
                                    value={universitySearch}
                                    onValueChange={setUniversitySearch}
                                  />

                                  <CommandList>
                                    <CommandEmpty>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full justify-start"
                                        onClick={async () => {
                                          const value = universitySearch.trim();

                                          if (!value) return;

                                          try {
                                            await createUniversity(value);

                                            field.onChange(value);

                                            setUniversityOpen(false);

                                            setUniversitySearch("");

                                            toast.success(
                                              "University added successfully",
                                            );
                                          } catch {
                                            toast.error(
                                              "Failed to create university",
                                            );
                                          }
                                        }}
                                      >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add "{universitySearch}"
                                      </Button>
                                    </CommandEmpty>

                                    <CommandGroup>
                                      {universities.map(
                                        (uni: { id: string; name: string }) => (
                                          <CommandItem
                                            key={uni.id}
                                            value={uni.name}
                                            onSelect={(currentValue) => {
                                              field.onChange(currentValue);

                                              setUniversityOpen(false);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                field.value === uni.name
                                                  ? "opacity-100"
                                                  : "opacity-0",
                                              )}
                                            />

                                            {uni.name}
                                          </CommandItem>
                                        ),
                                      )}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Course / Major</Label>
                        <Controller
                          control={control}
                          name="bachelorsCourse"
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Course" />
                              </SelectTrigger>

                              <SelectContent>
                                {coursesLoad ? (
                                  <SelectItem value="loading" disabled>
                                    loading courses...
                                  </SelectItem>
                                ) : (
                                  courses.map(
                                    (
                                      course: { id: string; name: string },
                                      idx: number,
                                    ) => (
                                      <SelectItem
                                        key={course.id || idx}
                                        value={course.name}
                                      >
                                        {course.name}
                                      </SelectItem>
                                    ),
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CGPA / Percentage</Label>
                        <Input
                          placeholder="e.g. 75 or 8.5"
                          type="number"
                          step="0.01"
                          {...register("bachelorsPercentage", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Year of Passing</Label>
                        <Input
                          placeholder="YYYY"
                          type="number"
                          {...register("bachelorsYearOfPassing", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Active Backlogs</Label>
                        <Input
                          placeholder="0"
                          type="number"
                          {...register("backlogs", { valueAsNumber: true })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <Label>Education Gaps (If Any)</Label>
                      <Textarea
                        placeholder="Explain any gaps in education..."
                        rows={2}
                        {...register("gapsIfAny")}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
                {/* Section 3: EPT Details */}
                <AccordionItem
                  value="scores"
                  className="rounded-2xl border bg-card"
                >
                  <AccordionTrigger className="overflow-hidden border-t-4 border-t-primary rounded-2xl shadow-sm">
                    <div className=" px-6 py-4 ">
                      <h3 className="flex items-center text-lg font-semibold text-foreground">
                        <BookOpen className="mr-2 h-5 w-5 text-purple-500" />
                        EPT Details
                      </h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-8 p-6">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                      {/* English Proficiency */}
                      <div className="space-y-4 rounded-xl border p-4 bg-muted/20">
                        <h4 className="font-medium text-foreground">
                          English Proficiency Test
                        </h4>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                          <div className="space-y-2 col-span-2 sm:col-span-3">
                            <Label>Test Type</Label>
                            <Controller
                              control={control}
                              name="englishTestType"
                              render={({ field }) => (
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Test" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {englishTestOptions.map((i) => (
                                      <SelectItem key={i} value={i}>
                                        {i}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Listening</Label>
                            <Input
                              placeholder="L Score"
                              type="number"
                              step="0.5"
                              {...register("listeningScore", {
                                valueAsNumber: true,
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Reading</Label>
                            <Input
                              placeholder="R Score"
                              type="number"
                              step="0.5"
                              {...register("readingScore", {
                                valueAsNumber: true,
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Writing</Label>
                            <Input
                              placeholder="W Score"
                              type="number"
                              step="0.5"
                              {...register("writingScore", {
                                valueAsNumber: true,
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Speaking</Label>
                            <Input
                              placeholder="S Score"
                              type="number"
                              step="0.5"
                              {...register("speakingScore", {
                                valueAsNumber: true,
                              })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* GRE/GMAT */}
                      <div className="space-y-4 rounded-xl border p-4 bg-muted/20">
                        <h4 className="font-medium text-foreground">
                          GRE / GMAT
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2 col-span-2">
                            <Label>Total Score</Label>
                            <Input
                              placeholder="Overall Score"
                              type="number"
                              {...register("greGmatScore", {
                                valueAsNumber: true,
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Quantitative (Q)</Label>
                            <Input
                              placeholder="Q Score"
                              type="number"
                              {...register("quantitativeScore", {
                                valueAsNumber: true,
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Verbal (V)</Label>
                            <Input
                              placeholder="V Score"
                              type="number"
                              {...register("verbalScore", {
                                valueAsNumber: true,
                              })}
                            />
                          </div>
                          <div className="space-y-2 col-span-2">
                            <Label className="text-xs">
                              Analytical Writing (AWA)
                            </Label>
                            <Input
                              placeholder="AWA Score"
                              type="number"
                              step="0.5"
                              {...register("analyticalWritingScore", {
                                valueAsNumber: true,
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Section 4: Preferences & Experience */}
                <AccordionItem
                  value="preferences"
                  className="rounded-2xl border bg-card"
                >
                  <AccordionTrigger className="overflow-hidden border-t-4 border-t-primary rounded-2xl shadow-sm">
                    <div className=" px-6 py-4 ">
                      <h3 className="flex items-center text-lg font-semibold text-foreground">
                        <Globe className="mr-2 h-5 w-5 text-emerald-500" />
                        Study Preferences & Experience
                      </h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-6 p-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Preferred Country</Label>
                        <Controller
                          control={control}
                          name="preferredCountry"
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Country" />
                              </SelectTrigger>
                              <SelectContent>
                                {countries.map((country) => (
                                  <SelectItem
                                    key={country.id}
                                    value={country.name}
                                  >
                                    {country.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Preferred Intake</Label>
                        <Controller
                          control={control}
                          name="preferredIntake"
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Intake" />
                              </SelectTrigger>
                              <SelectContent>
                                {intakes.map((intake) => (
                                  <SelectItem
                                    key={intake.id}
                                    value={intake.name}
                                  >
                                    {intake.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Preferred Course</Label>
                        <Input
                          placeholder="e.g. MS in Data Science"
                          {...register("preferredCourse")}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <Label className="flex items-center">
                        <Briefcase className="mr-2 h-4 w-4" /> Work Experience
                      </Label>
                      <Textarea
                        placeholder="Details of current or past employment..."
                        rows={3}
                        {...register("workExperience")}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Sticky/Fixed Bottom Action Bar */}
                <div className="sticky bottom-4 z-10 flex flex-col-reverse gap-3 rounded-2xl bg-background/80 p-4 shadow-lg backdrop-blur-md border sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => reset()}
                  >
                    Reset Form
                  </Button>

                  <Button
                    type="button"
                    className="w-full sm:w-auto"
                    disabled={isSubmitting}
                    onClick={handleSubmit((values) =>
                      onSubmit(
                        {
                          ...values,
                          status: "new",
                        },
                        true,
                      ),
                    )}
                  >
                    Save Lead & Continue
                  </Button>
                </div>
              </Accordion>
            </form>
          </div>
        </div>
      </RoutePermission>
    </PageTransition>
  );
}
