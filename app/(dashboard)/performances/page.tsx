"use client";

import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRightLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Download,
  FileText,
  Filter,
  GraduationCap,
  Landmark,
  Loader2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { PageHeader, PageTransition } from "@/components/common/PageHeader";
import { ReportFilterSheet } from "@/components/reports/ReportFilterSheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePerformanceReport } from "@/hooks/reports/usePerformanceReport";
import { usePerformanceReportFilters } from "@/hooks/reports/usePerformanceReportFilters";
import {
  countPerformanceReportFilters,
  formatIndianCurrency,
  formatReportDate,
  humanizeReportStatus,
} from "@/lib/performance-report-utils";
import { exportPerformanceReport } from "@/services/reports/performance-report.service";
import {
  DEFAULT_PERFORMANCE_REPORT_FILTERS,
  type PerformanceReportFilters,
  type PerformanceReportRow,
} from "@/types/performance-report";

const PAGE_SIZE = 20;

const CHART_COLORS = [
  "oklch(0.58 0.22 27)",
  "oklch(0.62 0.15 240)",
  "oklch(0.65 0.17 155)",
  "oklch(0.78 0.16 75)",
  "oklch(0.55 0.2 305)",
  "oklch(0.68 0.16 35)",
  "oklch(0.58 0.14 195)",
];

type SummaryCardProps = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
};

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight">
            {value}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function SummarySkeleton() {
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-3 w-36" />
      </CardContent>
    </Card>
  );
}

function ChartEmptyState() {
  return (
    <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
      No matching report data
    </div>
  );
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

function getRecordBadge(row: PerformanceReportRow) {
  return row.recordType === "lead" ? (
    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
      Lead
    </Badge>
  ) : (
    <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
      Student
    </Badge>
  );
}

function getLifecycleBadgeClass(status: string) {
  const normalized = status.toLowerCase();

  if (["converted", "admitted", "enrolled", "completed"].includes(normalized)) {
    return "border-success/20 bg-success/15 text-success";
  }

  if (["qualified", "visa_process", "loan_process", "active"].includes(normalized)) {
    return "border-primary/20 bg-primary/10 text-primary";
  }

  if (["lost", "dropped", "rejected"].includes(normalized)) {
    return "border-destructive/20 bg-destructive/10 text-destructive";
  }

  if (["contacted", "draft"].includes(normalized)) {
    return "border-warning/20 bg-warning/15 text-warning";
  }

  return "border-border bg-muted text-muted-foreground";
}

export default function PerformanceReportsPage() {
  const [filters, setFilters] = useState<PerformanceReportFilters>({
    ...DEFAULT_PERFORMANCE_REPORT_FILTERS,
  });
  const [page, setPage] = useState(1);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const reportQuery = usePerformanceReport(filters, page, PAGE_SIZE);
  const filterOptionsQuery = usePerformanceReportFilters();

  const report = reportQuery.data;
  const activeFiltersCount = countPerformanceReportFilters(filters);

  const topCountryData = useMemo(
    () => report?.countryDemand.slice(0, 8) ?? [],
    [report?.countryDemand],
  );

  const topBranchData = useMemo(
    () => report?.branchPerformance.slice(0, 12) ?? [],
    [report?.branchPerformance],
  );

  const leadSourceData = useMemo(
    () => report?.leadSourceBreakdown.slice(0, 7) ?? [],
    [report?.leadSourceBreakdown],
  );

  const leadStatusData = useMemo(
    () => report?.leadStatusBreakdown.slice(0, 7) ?? [],
    [report?.leadStatusBreakdown],
  );

  const applicationStatusData = useMemo(
    () => report?.applicationStatusBreakdown.slice(0, 7) ?? [],
    [report?.applicationStatusBreakdown],
  );

  const visaStatusData = useMemo(
    () => report?.visaStatusBreakdown.slice(0, 7) ?? [],
    [report?.visaStatusBreakdown],
  );

  const handleApplyFilters = (nextFilters: PerformanceReportFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const blob = await exportPerformanceReport(filters);
      const date = new Date().toISOString().slice(0, 10);

      downloadBlob(blob, `vsource-lead-student-performance-${date}.xlsx`);
      toast.success("Excel report downloaded successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to download Excel report",
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PageTransition>
      <PageHeader
        title="Performance Reports"
        description="Live lead pipeline, student conversion, applications, visa and loan analytics."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterSheetOpen(true)}
            >
              <Filter className="mr-1.5 size-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 min-w-5 justify-center px-1.5"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            <Button
              size="sm"
              onClick={handleExport}
              disabled={
                isExporting ||
                reportQuery.isLoading ||
                !report ||
                report.pagination.total === 0
              }
            >
              {isExporting ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : (
                <Download className="mr-1.5 size-4" />
              )}
              Export Excel
            </Button>
          </>
        }
      />

      {reportQuery.isError && (
        <Card className="mb-4 border-destructive/40">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-destructive">
                Unable to load performance report
              </p>
              <p className="text-sm text-muted-foreground">
                {reportQuery.error instanceof Error
                  ? reportQuery.error.message
                  : "Please retry the request."}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => reportQuery.refetch()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {reportQuery.isLoading || !report ? (
          Array.from({ length: 6 }).map((_, index) => (
            <SummarySkeleton key={index} />
          ))
        ) : (
          <>
            <SummaryCard
              title="Active Leads"
              value={report.summary.totalLeads.toLocaleString("en-IN")}
              description={`${report.summary.qualifiedLeads.toLocaleString(
                "en-IN",
              )} qualified leads`}
              icon={BriefcaseBusiness}
            />
            <SummaryCard
              title="Converted Students"
              value={report.summary.totalStudents.toLocaleString("en-IN")}
              description={`${report.summary.conversionRate}% pipeline conversion`}
              icon={GraduationCap}
            />
            <SummaryCard
              title="Applications"
              value={report.summary.totalApplications.toLocaleString("en-IN")}
              description={`${report.summary.offerApplications.toLocaleString(
                "en-IN",
              )} applications with offers`}
              icon={FileText}
            />
            <SummaryCard
              title="Pipeline Records"
              value={report.summary.totalPipelineRecords.toLocaleString(
                "en-IN",
              )}
              description={`${report.summary.lostLeads.toLocaleString(
                "en-IN",
              )} leads marked lost`}
              icon={ArrowRightLeft}
            />
            <SummaryCard
              title="Visa Approved"
              value={report.summary.visaApprovedStudents.toLocaleString(
                "en-IN",
              )}
              description={`${report.summary.casReceivedStudents.toLocaleString(
                "en-IN",
              )} students with CAS received`}
              icon={CheckCircle2}
            />
            <SummaryCard
              title="Loan Sanctioned"
              value={formatIndianCurrency(
                report.summary.totalSanctionedAmount,
              )}
              description={`${report.summary.loanSanctionedStudents.toLocaleString(
                "en-IN",
              )} sanctioned students`}
              icon={Landmark}
            />
          </>
        )}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly Pipeline Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            {reportQuery.isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : report?.monthlyVolume.length ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={report.monthlyVolume}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--color-border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      stroke="var(--color-muted-foreground)"
                    />
                    <YAxis
                      allowDecimals={false}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      stroke="var(--color-muted-foreground)"
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 10,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="leads"
                      name="New Leads"
                      stroke={CHART_COLORS[0]}
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="students"
                      name="Converted Students"
                      stroke={CHART_COLORS[2]}
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="applications"
                      name="Applications"
                      stroke={CHART_COLORS[1]}
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <ChartEmptyState />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Country Demand</CardTitle>
          </CardHeader>
          <CardContent>
            {reportQuery.isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : topCountryData.length ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topCountryData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--color-border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="country"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      stroke="var(--color-muted-foreground)"
                      angle={-20}
                      textAnchor="end"
                      height={55}
                    />
                    <YAxis
                      allowDecimals={false}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      stroke="var(--color-muted-foreground)"
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 10,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar
                      dataKey="leads"
                      name="Leads"
                      fill={CHART_COLORS[0]}
                      radius={[5, 5, 0, 0]}
                    />
                    <Bar
                      dataKey="students"
                      name="Students"
                      fill={CHART_COLORS[2]}
                      radius={[5, 5, 0, 0]}
                    />
                    <Bar
                      dataKey="applications"
                      name="Applications"
                      fill={CHART_COLORS[1]}
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <ChartEmptyState />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Lead Source Mix</CardTitle>
          </CardHeader>
          <CardContent>
            {reportQuery.isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : leadSourceData.length ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leadSourceData}
                      dataKey="total"
                      nameKey="source"
                      innerRadius={52}
                      outerRadius={88}
                      paddingAngle={2}
                    >
                      {leadSourceData.map((item, index) => (
                        <Cell
                          key={`${item.source}-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 10,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <ChartEmptyState />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Lead Lifecycle Status</CardTitle>
          </CardHeader>
          <CardContent>
            {reportQuery.isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : leadStatusData.length ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={leadStatusData}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--color-border)"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="status"
                      width={95}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 10,
                        fontSize: 12,
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Records"
                      fill={CHART_COLORS[0]}
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <ChartEmptyState />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Application Status</CardTitle>
          </CardHeader>
          <CardContent>
            {reportQuery.isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : applicationStatusData.length ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={applicationStatusData}
                      dataKey="count"
                      nameKey="status"
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {applicationStatusData.map((item, index) => (
                        <Cell
                          key={`${item.status}-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 10,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <ChartEmptyState />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Visa Status</CardTitle>
          </CardHeader>
          <CardContent>
            {reportQuery.isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : visaStatusData.length ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={visaStatusData}
                      dataKey="count"
                      nameKey="status"
                      innerRadius={50}
                      outerRadius={88}
                      paddingAngle={2}
                    >
                      {visaStatusData.map((item, index) => (
                        <Cell
                          key={`${item.status}-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 10,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <ChartEmptyState />
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Branch-wise Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-sm">
              <thead>
                <tr className="border-b bg-secondary/30 text-xs text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">Branch</th>
                  <th className="px-4 py-3 text-right font-medium">Leads</th>
                  <th className="px-4 py-3 text-right font-medium">Students</th>
                  <th className="px-4 py-3 text-right font-medium">
                    Applications
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    Conversion
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    Visa Approved
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    Sanctioned
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    Disbursed
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportQuery.isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-b">
                      <td colSpan={8} className="px-4 py-3">
                        <Skeleton className="h-8 w-full" />
                      </td>
                    </tr>
                  ))
                ) : topBranchData.length ? (
                  topBranchData.map((branch) => (
                    <tr
                      key={branch.branchId}
                      className="border-b last:border-0 hover:bg-secondary/20"
                    >
                      <td className="px-4 py-3 font-medium">{branch.branch}</td>
                      <td className="px-4 py-3 text-right">{branch.leads}</td>
                      <td className="px-4 py-3 text-right">
                        {branch.students}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {branch.applications}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {branch.conversionRate}%
                      </td>
                      <td className="px-4 py-3 text-right">
                        {branch.visaApproved}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatIndianCurrency(branch.sanctionedAmount)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatIndianCurrency(branch.disbursedAmount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
                      No branch performance data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">Lead and Student Records</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Converted leads appear only as students, preventing duplicate
              pipeline records.
            </p>
          </div>
          <Badge variant="secondary">
            {report?.pagination.total.toLocaleString("en-IN") ?? 0} records
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1450px] text-sm">
              <thead>
                <tr className="border-b bg-secondary/30 text-xs text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Lead No.</th>
                  <th className="px-4 py-3 text-left font-medium">Person</th>
                  <th className="px-4 py-3 text-left font-medium">Contact</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Branch / Counselor
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    Source / Country
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Latest Application
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    Visa / Loan
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {reportQuery.isLoading ? (
                  Array.from({ length: 8 }).map((_, index) => (
                    <tr key={index} className="border-b">
                      <td colSpan={10} className="px-4 py-3">
                        <Skeleton className="h-10 w-full" />
                      </td>
                    </tr>
                  ))
                ) : report?.rows.length ? (
                  report.rows.map((row) => (
                    <tr
                      key={`${row.recordType}-${row.recordId}`}
                      className="border-b align-top last:border-0 hover:bg-secondary/20"
                    >
                      <td className="px-4 py-3">{getRecordBadge(row)}</td>
                      <td className="px-4 py-3 font-mono text-xs font-semibold">
                        {row.leadNumber || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{row.studentName}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {row.courseName}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p>{row.mobileNumber || "—"}</p>
                        <p className="mt-1 max-w-[220px] truncate text-xs text-muted-foreground">
                          {row.emailId || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p>{row.branchName}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {row.counselorName}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p>{row.source}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {row.countryName}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={getLifecycleBadgeClass(
                            row.lifecycleStatus,
                          )}
                        >
                          {humanizeReportStatus(row.lifecycleStatus)}
                        </Badge>
                        {row.currentStage && row.currentStage !== "lead" && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {humanizeReportStatus(row.currentStage)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {row.recordType === "student" ? (
                          <>
                            <p className="max-w-[230px] truncate font-medium">
                              {row.latestUniversityName}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {row.applicationsCount} application
                              {row.applicationsCount === 1 ? "" : "s"}
                              {row.latestApplicationStatus
                                ? ` · ${humanizeReportStatus(
                                    row.latestApplicationStatus,
                                  )}`
                                : ""}
                            </p>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Not converted</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {row.recordType === "student" ? (
                          <>
                            <p>
                              Visa: {humanizeReportStatus(row.visaStatus)}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Loan: {humanizeReportStatus(row.loanStatus)}
                            </p>
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p>{formatReportDate(row.createdAt)}</p>
                        {row.nextFollowup && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Follow-up: {formatReportDate(row.nextFollowup)}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      No leads or students match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Showing {report?.rows.length ?? 0} of {report?.pagination.total ?? 0}{" "}
          records
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!report || report.pagination.page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <span className="rounded-md bg-secondary/40 px-3 py-1.5 text-xs font-medium text-foreground">
            Page {report?.pagination.page ?? 1} of{" "}
            {report?.pagination.totalPages ?? 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={
              !report || report.pagination.page >= report.pagination.totalPages
            }
            onClick={() =>
              setPage((current) =>
                Math.min(report?.pagination.totalPages ?? current, current + 1),
              )
            }
          >
            Next
          </Button>
        </div>
      </div>

      <ReportFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        value={filters}
        options={filterOptionsQuery.data}
        isLoading={filterOptionsQuery.isLoading}
        onApply={handleApplyFilters}
      />
    </PageTransition>
  );
}
