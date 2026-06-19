// crm-frontend-next\app\components\universities\university-details-accordion.tsx

"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Badge } from "@/components/ui/badge";

import { Card, CardContent } from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";

import {
  Building2,
  Globe,
  GraduationCap,
  Award,
  Phone,
  Mail,
  User,
  Calendar,
  MapPin,
  DollarSign,
  Trophy,
} from "lucide-react";

import { University } from "@/types/university";

interface Props {
  university: University;
}

export function UniversityDetailsAccordion({ university }: Props) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {/* OVERVIEW */}

      <AccordionItem value="overview">
        <AccordionTrigger>
          <div className="flex items-center gap-2">
            <Building2 className="size-4" />
            <span>University Overview</span>
          </div>
        </AccordionTrigger>

        <AccordionContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <InfoCard
              icon={<Globe className="size-4" />}
              label="Country"
              value={typeof university.country === 'object' ? university.country?.name ?? '-' : String(university.country ?? '-')}
            />

            <InfoCard
              icon={<MapPin className="size-4" />}
              label="City"
              value={university?.city}
            />

            <InfoCard
              icon={<Trophy className="size-4" />}
              label="Ranking"
              value={university.ranking ? `#${university.ranking}` : "-"}
            />

            <InfoCard
              icon={<Calendar className="size-4" />}
              label="Established"
              value={university.establishedYear?.toString() ?? "-"}
            />

            <InfoCard
              icon={<DollarSign className="size-4" />}
              label="Application Fee"
              value={
                university.applicationFee
                  ? `${university.currency} ${Number(university.applicationFee).toLocaleString()}`
                  : "-"
              }
            />
          </div>

          {university.description && (
            <>
              <Separator className="my-4" />

              <div>
                <h4 className="font-medium mb-2">Description</h4>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {university.description}
                </p>
              </div>
            </>
          )}

          {university.intakeNotes && (
            <>
              <Separator className="my-4" />

              <div>
                <h4 className="font-medium mb-2">Intake Notes</h4>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {university.intakeNotes}
                </p>
              </div>
            </>
          )}
        </AccordionContent>
      </AccordionItem>

      {/* COURSES */}

      <AccordionItem value="courses">
        <AccordionTrigger>
          <div className="flex items-center gap-2">
            <GraduationCap className="size-4" />

            <span>Courses ({university.courses?.length ?? 0})</span>
          </div>
        </AccordionTrigger>

        <AccordionContent>
          {!university.courses || university.courses.length === 0 ? (
            <EmptyState title="No courses available" />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {university.courses.map((course) => (
                <Card key={course.id} className="rounded-2xl">
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold">{course.name}</h4>

                        <Badge variant="outline">{course.degree}</Badge>
                      </div>

                      {course.courseCode && (
                        <p className="text-xs text-muted-foreground">
                          {course.courseCode}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <CourseInfo
                        label="Duration"
                        value={`${course.durationMonths ?? "-"} Months`}
                      />

                      <CourseInfo label="Intake" value={course.intake ?? "-"} />

                      <CourseInfo
                        label="Annual Fee"
                        value={
                          course.annualTuitionFee
                            ? `${course.currency} ${Number(course.annualTuitionFee).toLocaleString()}`
                            : "-"
                        }
                      />

                      <CourseInfo
                        label="IELTS"
                        value={course.ieltsOverall?.toString() ?? "-"}
                      />

                      <CourseInfo
                        label="Minimum %"
                        value={course.minimumPercentage?.toString() ?? "-"}
                      />

                      <CourseInfo
                        label="Backlogs"
                        value={course.backlogLimit?.toString() ?? "-"}
                      />
                    </div>

                    {course.description && (
                      <>
                        <Separator />

                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {course.description}
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>

      {/* SCHOLARSHIPS */}

      <AccordionItem value="scholarships">
        <AccordionTrigger>
          <div className="flex items-center gap-2">
            <Award className="size-4" />

            <span>Scholarships ({university.scholarships?.length ?? 0})</span>
          </div>
        </AccordionTrigger>

        <AccordionContent>
          {!university.scholarships || university.scholarships.length === 0 ? (
            <EmptyState title="No scholarships available" />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {university.scholarships.map((scholarship) => (
                <Card key={scholarship.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="size-4 text-primary" />

                      <h4 className="font-semibold">{scholarship.name}</h4>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {scholarship.amount && (
                        <Badge>Amount: {scholarship.amount}</Badge>
                      )}

                      {scholarship.percentage && (
                        <Badge variant="secondary">
                          {scholarship.percentage}%
                        </Badge>
                      )}
                    </div>

                    {scholarship.description && (
                      <p className="text-sm text-muted-foreground">
                        {scholarship.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>

      {/* CONTACT */}

      <AccordionItem value="contact">
        <AccordionTrigger>
          <div className="flex items-center gap-2">
            <Phone className="size-4" />
            <span>Contact Details</span>
          </div>
        </AccordionTrigger>

        <AccordionContent>
          <div className="grid gap-3 md:grid-cols-3">
            <InfoCard
              icon={<User className="size-4" />}
              label="Contact Person"
              value={university.contactPerson ?? "-"}
            />

            <InfoCard
              icon={<Mail className="size-4" />}
              label="Email"
              value={university.contactEmail ?? "-"}
            />

            <InfoCard
              icon={<Phone className="size-4" />}
              label="Phone"
              value={university.contactPhone ?? "-"}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
          {icon}
          {label}
        </div>

        <div className="font-medium">{value}</div>
      </CardContent>
    </Card>
  );
}

function CourseInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>

      <div className="font-medium">{value}</div>
    </div>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
      {title}
    </div>
  );
}
