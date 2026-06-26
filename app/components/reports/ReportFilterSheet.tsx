"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Filter,
  GitBranch,
  GraduationCap,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { countPerformanceReportFilters } from "@/lib/performance-report-utils";
import {
  DEFAULT_PERFORMANCE_REPORT_FILTERS,
  type PerformanceReportFilters,
  type PerformanceReportFilterOptions,
  type ReportDatePreset,
  type ReportOption,
  type ReportRecordScope,
} from "@/types/performance-report";

type ReportFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: PerformanceReportFilters;
  options?: PerformanceReportFilterOptions;
  isLoading?: boolean;
  onApply: (filters: PerformanceReportFilters) => void;
};

type FilterSelectProps = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  options: ReportOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
};

function FilterSelect({
  id,
  label,
  value,
  placeholder,
  options,
  disabled,
  onChange,
}: FilterSelectProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium">
        {label}
      </Label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function toStatusOptions(values: string[]): ReportOption[] {
  return values.map((value) => ({
    value,
    label: value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase()),
  }));
}

function getDateOptions(): Array<{
  value: ReportDatePreset;
  label: string;
}> {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const month = now.toLocaleDateString("en-IN", {
    month: "long",
  });

  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = lastMonthDate.toLocaleDateString("en-IN", {
    month: "long",
  });

  const quarter = Math.floor(now.getMonth() / 3) + 1;
  const lastQuarter = quarter === 1 ? 4 : quarter - 1;

  return [
    { value: "all", label: "All Time" },
    {
      value: "today",
      label: `Today (${now.toLocaleDateString("en-IN")})`,
    },
    {
      value: "yesterday",
      label: `Yesterday (${yesterday.toLocaleDateString("en-IN")})`,
    },
    { value: "last_7_days", label: "Last 7 Days" },
    { value: "last_30_days", label: "Last 30 Days" },
    { value: "this_month", label: `This Month (${month})` },
    { value: "last_month", label: `Last Month (${lastMonth})` },
    { value: "this_quarter", label: `This Quarter (Q${quarter})` },
    { value: "last_quarter", label: `Last Quarter (Q${lastQuarter})` },
    { value: "this_year", label: `This Year (${now.getFullYear()})` },
    { value: "custom", label: "Custom Date Range" },
  ];
}

const recordScopeOptions: ReportOption[] = [
  { value: "all", label: "Leads and Students" },
  { value: "leads", label: "Leads Only" },
  { value: "students", label: "Students Only" },
];

export function ReportFilterSheet({
  open,
  onOpenChange,
  value,
  options,
  isLoading,
  onApply,
}: ReportFilterSheetProps) {
  const [draft, setDraft] = useState<PerformanceReportFilters>(value);

  useEffect(() => {
    if (open) {
      setDraft(value);
    }
  }, [open, value]);

  const dateOptions = useMemo(() => getDateOptions(), []);

  const counselorOptions = useMemo(() => {
    if (!options) {
      return [];
    }

    if (!draft.branchId) {
      return options.counselors;
    }

    return options.counselors.filter((counselor) =>
      counselor.branchIds.includes(draft.branchId),
    );
  }, [draft.branchId, options]);

  const universityOptions = useMemo(() => {
    if (!options) {
      return [];
    }

    if (!draft.countryId) {
      return options.universities;
    }

    return options.universities.filter(
      (university) => university.countryId === draft.countryId,
    );
  }, [draft.countryId, options]);

  const activeCount = countPerformanceReportFilters(draft);

  const updateFilter = <K extends keyof PerformanceReportFilters>(
    key: K,
    nextValue: PerformanceReportFilters[K],
  ) => {
    setDraft((current) => ({
      ...current,
      [key]: nextValue,
    }));
  };

  const handleRecordScopeChange = (nextValue: string) => {
    const recordScope = nextValue as ReportRecordScope;

    setDraft((current) => {
      if (recordScope === "leads") {
        return {
          ...current,
          recordScope,
          leadStatus:
            current.leadStatus === "converted" ? "" : current.leadStatus,
          universityId: "",
          applicationStatus: "",
          casStatus: "",
          visaStatus: "",
          loanStatus: "",
          nbfc: "",
          fintechAssigneeId: "",
        };
      }

      if (recordScope === "students") {
        return {
          ...current,
          recordScope,
          leadStatus:
            current.leadStatus && current.leadStatus !== "converted"
              ? ""
              : current.leadStatus,
        };
      }

      return {
        ...current,
        recordScope,
      };
    });
  };

  const handleLeadStatusChange = (leadStatus: string) => {
    setDraft((current) => ({
      ...current,
      leadStatus,
      recordScope:
        leadStatus === "converted"
          ? "students"
          : leadStatus
            ? "leads"
            : current.recordScope,
    }));
  };

  const handleBranchChange = (branchId: string) => {
    setDraft((current) => {
      const selectedCounselor = options?.counselors.find(
        (counselor) => counselor.value === current.counselorId,
      );

      const counselorIsValid =
        !branchId ||
        !selectedCounselor ||
        selectedCounselor.branchIds.includes(branchId);

      return {
        ...current,
        branchId,
        counselorId: counselorIsValid ? current.counselorId : "",
      };
    });
  };

  const handleCountryChange = (countryId: string) => {
    setDraft((current) => {
      const selectedUniversity = options?.universities.find(
        (university) => university.value === current.universityId,
      );

      const universityIsValid =
        !countryId ||
        !selectedUniversity ||
        selectedUniversity.countryId === countryId;

      return {
        ...current,
        countryId,
        universityId: universityIsValid ? current.universityId : "",
      };
    });
  };

  const handleReset = () => {
    setDraft({ ...DEFAULT_PERFORMANCE_REPORT_FILTERS });
  };

  const handleApply = () => {
    onApply(draft);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b px-6 py-5 text-left">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Filter className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <SheetTitle>Advanced Report Filters</SheetTitle>
                <Badge variant="secondary">{activeCount} active</Badge>
              </div>
              <SheetDescription>
                The dashboard and Excel workbook always use the same filters.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6 px-6 py-5">
            <section className="space-y-4 rounded-xl border bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CalendarDays className="size-4 text-primary" />
                Report Scope and Lifecycle Date
              </div>

              <FilterSelect
                id="report-record-scope"
                label="Report Scope"
                value={draft.recordScope}
                placeholder="Select report scope"
                options={recordScopeOptions}
                onChange={handleRecordScopeChange}
              />

              <FilterSelect
                id="report-date-preset"
                label="Lifecycle Date Range"
                value={draft.datePreset}
                placeholder="Select date range"
                options={dateOptions}
                onChange={(nextValue) =>
                  updateFilter(
                    "datePreset",
                    nextValue as PerformanceReportFilters["datePreset"],
                  )
                }
              />

              <p className="text-[11px] leading-4 text-muted-foreground">
                The date filter uses lead created date for leads and student
                conversion/created date for students.
              </p>

              {draft.datePreset === "custom" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="report-start-date" className="text-xs">
                      Start Date
                    </Label>
                    <Input
                      id="report-start-date"
                      type="date"
                      value={draft.startDate}
                      max={draft.endDate || undefined}
                      onChange={(event) =>
                        updateFilter("startDate", event.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="report-end-date" className="text-xs">
                      End Date
                    </Label>
                    <Input
                      id="report-end-date"
                      type="date"
                      value={draft.endDate}
                      min={draft.startDate || undefined}
                      onChange={(event) =>
                        updateFilter("endDate", event.target.value)
                      }
                    />
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div className="flex items-start gap-2">
                <GitBranch className="mt-0.5 size-4 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold">Lead Pipeline</h3>
                  <p className="text-xs text-muted-foreground">
                    Converted leads are represented as students and are never
                    duplicated in the lead total.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="report-search" className="text-xs font-medium">
                  Search
                </Label>
                <Input
                  id="report-search"
                  value={draft.search}
                  placeholder="Lead no., student, email, mobile, university or course"
                  onChange={(event) =>
                    updateFilter("search", event.target.value)
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FilterSelect
                  id="report-branch"
                  label="Branch"
                  value={draft.branchId}
                  placeholder="All Branches"
                  options={options?.branches ?? []}
                  disabled={isLoading}
                  onChange={handleBranchChange}
                />

                <FilterSelect
                  id="report-counselor"
                  label="Assigned Counselor"
                  value={draft.counselorId}
                  placeholder="All Counselors"
                  options={counselorOptions}
                  disabled={isLoading}
                  onChange={(nextValue) =>
                    updateFilter("counselorId", nextValue)
                  }
                />

                <FilterSelect
                  id="report-lead-status"
                  label="Lead Status"
                  value={draft.leadStatus}
                  placeholder="All Lead Statuses"
                  options={toStatusOptions(options?.leadStatuses ?? [])}
                  disabled={isLoading}
                  onChange={handleLeadStatusChange}
                />

                <FilterSelect
                  id="report-lead-source"
                  label="Lead Source"
                  value={draft.leadSource}
                  placeholder="All Lead Sources"
                  options={(options?.leadSources ?? []).map((source) => ({
                    value: source,
                    label: source,
                  }))}
                  disabled={isLoading}
                  onChange={(nextValue) =>
                    updateFilter("leadSource", nextValue)
                  }
                />
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-start gap-2">
                <GraduationCap className="mt-0.5 size-4 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold">
                    Destination and Applications
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Country and intake also match unconverted lead preferences.
                    University and application status apply to students only.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FilterSelect
                  id="report-country"
                  label="Country"
                  value={draft.countryId}
                  placeholder="All Countries"
                  options={options?.countries ?? []}
                  disabled={isLoading}
                  onChange={handleCountryChange}
                />

                <FilterSelect
                  id="report-intake"
                  label="Intake"
                  value={draft.intakeId}
                  placeholder="All Intakes"
                  options={options?.intakes ?? []}
                  disabled={isLoading}
                  onChange={(nextValue) =>
                    updateFilter("intakeId", nextValue)
                  }
                />

                <FilterSelect
                  id="report-university"
                  label="University"
                  value={draft.universityId}
                  placeholder="All Universities"
                  options={universityOptions}
                  disabled={isLoading || draft.recordScope === "leads"}
                  onChange={(nextValue) =>
                    updateFilter("universityId", nextValue)
                  }
                />

                <FilterSelect
                  id="report-application-status"
                  label="Application Status"
                  value={draft.applicationStatus}
                  placeholder="All Application Statuses"
                  options={toStatusOptions(
                    options?.applicationStatuses ?? [],
                  )}
                  disabled={isLoading || draft.recordScope === "leads"}
                  onChange={(nextValue) =>
                    updateFilter("applicationStatus", nextValue)
                  }
                />
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold">
                  Visa and Loan Compliance
                </h3>
                <p className="text-xs text-muted-foreground">
                  These filters apply only to converted students.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FilterSelect
                  id="report-cas-status"
                  label="CAS Status"
                  value={draft.casStatus}
                  placeholder="All CAS Statuses"
                  options={toStatusOptions(options?.casStatuses ?? [])}
                  disabled={isLoading || draft.recordScope === "leads"}
                  onChange={(nextValue) =>
                    updateFilter("casStatus", nextValue)
                  }
                />

                <FilterSelect
                  id="report-visa-status"
                  label="Visa Status"
                  value={draft.visaStatus}
                  placeholder="All Visa Statuses"
                  options={toStatusOptions(options?.visaStatuses ?? [])}
                  disabled={isLoading || draft.recordScope === "leads"}
                  onChange={(nextValue) =>
                    updateFilter("visaStatus", nextValue)
                  }
                />

                <FilterSelect
                  id="report-loan-status"
                  label="Loan Status"
                  value={draft.loanStatus}
                  placeholder="All Loan Statuses"
                  options={toStatusOptions(options?.loanStatuses ?? [])}
                  disabled={isLoading || draft.recordScope === "leads"}
                  onChange={(nextValue) =>
                    updateFilter("loanStatus", nextValue)
                  }
                />

                <FilterSelect
                  id="report-nbfc"
                  label="NBFC"
                  value={draft.nbfc}
                  placeholder="All NBFCs"
                  options={(options?.nbfcs ?? []).map((nbfc) => ({
                    value: nbfc,
                    label: nbfc,
                  }))}
                  disabled={isLoading || draft.recordScope === "leads"}
                  onChange={(nextValue) => updateFilter("nbfc", nextValue)}
                />

                <div className="sm:col-span-2">
                  <FilterSelect
                    id="report-fintech-assignee"
                    label="Fintech Assignee"
                    value={draft.fintechAssigneeId}
                    placeholder="All Fintech Assignees"
                    options={options?.fintechAssignees ?? []}
                    disabled={isLoading || draft.recordScope === "leads"}
                    onChange={(nextValue) =>
                      updateFilter("fintechAssigneeId", nextValue)
                    }
                  />
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        <SheetFooter className="flex-row gap-3 border-t bg-background px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleReset}
          >
            <RotateCcw className="mr-2 size-4" />
            Reset All
          </Button>
          <Button type="button" className="flex-1" onClick={handleApply}>
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
