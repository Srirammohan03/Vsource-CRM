// app\(dashboard)\performances\page.tsx
"use client";
import { PageHeader, PageTransition } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export const monthlyRevenue = [
  { month: "Jan", revenue: 1820000, applications: 42 },
  { month: "Feb", revenue: 2150000, applications: 48 },
  { month: "Mar", revenue: 1980000, applications: 55 },
  { month: "Apr", revenue: 2680000, applications: 62 },
  { month: "May", revenue: 2420000, applications: 58 },
  { month: "Jun", revenue: 3110000, applications: 71 },
  { month: "Jul", revenue: 3580000, applications: 79 },
  { month: "Aug", revenue: 3250000, applications: 74 },
  { month: "Sep", revenue: 3890000, applications: 88 },
  { month: "Oct", revenue: 4120000, applications: 95 },
  { month: "Nov", revenue: 3760000, applications: 84 },
];
const branches = [
  "Hyderabad",
  "Bangalore",
  "Chennai",
  "Delhi",
  "Mumbai",
  "Pune",
  "Kolkata",
  "Vijayawada",
];
const counselors = [
  "Aditi Rao",
  "Vinod Bansal",
  "Sneha Kapoor",
  "Manoj Verma",
  "Pooja Iyer",
  "Rahul Singh",
];
const countries = [
  "USA",
  "UK",
  "Canada",
  "Australia",
  "Germany",
  "Ireland",
  "New Zealand",
  "France",
];
export const countryAdmissions = countries.map((c, i) => ({
  country: c,
  count: 35 + i * 12,
}));
const sources = [
  "Website",
  "Facebook",
  "Instagram",
  "Walk-in",
  "Referral",
  "Google Ads",
  "Education Fair",
  "QR Lead",
];

export const leadSourceSplit = sources
  .slice(0, 5)
  .map((s, i) => ({ source: s, value: 12 + i * 8 }));

type BranchPerformance = {
  id: string;
  name: string;
  city: string;
  manager: string;
  staff: number;
  students: number;
  revenue: number;
};

const branchesData: BranchPerformance[] = branches.map((b, i) => ({
  id: `BR${i + 1}`,
  name: `VSource ${b}`,
  city: b,
  manager: counselors[i % counselors.length],
  staff: 8 + i * 2,
  students: 120 + i * 35,
  revenue: 1800000 + i * 450000,
}));

const COLORS = [
  "oklch(0.58 0.22 27)",
  "oklch(0.62 0.15 240)",
  "oklch(0.65 0.17 155)",
  "oklch(0.78 0.16 75)",
  "oklch(0.55 0.2 305)",
];

export default function Reports() {
  return (
    <PageTransition>
      <PageHeader
        title="Reports & Analytics"
        description="Deep dive into revenue, conversions and branch performance."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Filter className="size-4 mr-1.5" /> Filters
            </Button>
            <Button size="sm">
              <Download className="size-4 mr-1.5" /> Export PDF
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={monthlyRevenue} margin={{ left: -10 }}>
                  <defs>
                    <linearGradient id="r1" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="oklch(0.58 0.22 27)"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="100%"
                        stopColor="oklch(0.58 0.22 27)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="oklch(0.58 0.22 27)"
                    strokeWidth={2}
                    fill="url(#r1)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Applications Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={monthlyRevenue} margin={{ left: -10 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke="oklch(0.62 0.15 240)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Country-wise Admissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={countryAdmissions} margin={{ left: -10 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="country"
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="oklch(0.65 0.17 155)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lead Source Mix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={leadSourceSplit}
                    dataKey="value"
                    nameKey="source"
                    outerRadius={90}
                    label
                  >
                    {leadSourceSplit.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Branch-wise Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border bg-secondary/30">
                  <th className="text-left px-4 py-2.5 font-medium">Branch</th>
                  <th className="text-left px-4 py-2.5 font-medium">Manager</th>
                  <th className="text-right px-4 py-2.5 font-medium">Staff</th>
                  <th className="text-right px-4 py-2.5 font-medium">
                    Students
                  </th>
                  <th className="text-right px-4 py-2.5 font-medium">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {branchesData.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/30"
                  >
                    <td className="px-4 py-3 font-medium">{b.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {b.manager}
                    </td>
                    <td className="px-4 py-3 text-right">{b.staff}</td>
                    <td className="px-4 py-3 text-right">{b.students}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      ₹{(b.revenue / 100000).toFixed(1)}L
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
