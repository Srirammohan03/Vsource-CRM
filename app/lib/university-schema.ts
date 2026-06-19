import { z } from "zod";

export const courseSchema = z.object({
  id: z.string(),

  name: z.string().min(1, "Course name is required"),

  courseCode: z.string().optional(),

  degree: z.enum([
    "diploma",
    "bachelors",
    "masters",
    "phd",
    "mba",
    "certificate",
  ]),

  durationMonths: z.number().optional(),

  annualTuitionFee: z.number().optional(),

  totalTuitionFee: z.number().optional(),

  currency: z.string().optional(),

  intake: z.string().optional(),

  minimumPercentage: z.number().optional(),

  backlogLimit: z.number().optional(),

  ieltsOverall: z.number().optional(),

  applicationDeadline: z.string().optional(),

  description: z.string().optional(),
});

export const scholarshipSchema = z.object({
  id: z.string(),

  name: z.string().min(1),

  amount: z.number().optional(),

  percentage: z.number().optional(),

  description: z.string().optional(),
});

export const universitySchema = z.object({
  id: z.string(),

  name: z.string().min(2),

  countryId: z.string().min(1, "Country is required"),

  city: z.string().optional(),

  state: z.string().optional(),

  postalCode: z.string().optional(),

  website: z.string().optional(),

  logo: z.string().optional(),

  ranking: z.number().optional(),

  establishedYear: z.number().optional(),

  applicationFee: z.number().optional(),

  currency: z.string().optional(),

  description: z.string().optional(),

  contactPerson: z.string().optional(),

  contactEmail: z.string().email().optional().or(z.literal("")),

  contactPhone: z.string().optional(),

  intakeNotes: z.string().optional(),

  status: z.enum([
    "active",
    "inactive",
    "archived",
  ]),

  courses: z.array(courseSchema),

  scholarships: z.array(scholarshipSchema),
});

export type UniversityFormValues =
  z.infer<typeof universitySchema>;