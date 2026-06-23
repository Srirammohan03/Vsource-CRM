// app/(dashboard)/applications-tracker/mbbs-tracker/page.tsx

"use client";

import { useMbbsTracker } from "@/hooks/application-tracker/useMbbsTracker";

export default function MbbsTrackerPage() {
  const { data, isLoading } = useMbbsTracker();

  const mbbsLeads = data?.mbbsLeads ?? [];

  if (isLoading) {
    return (
      <div className="flex h-[500px] items-center justify-center">
        Loading...
      </div>
    );
  }

  const inquiry = mbbsLeads.filter(
    (lead: any) => lead.status === "new" || lead.status === "contacted",
  );

  const qualified = mbbsLeads.filter(
    (lead: any) => lead.status === "qualified",
  );

  const admitted = mbbsLeads.filter((lead: any) => lead.status === "admitted");

  const enrolled = mbbsLeads.filter((lead: any) => lead.status === "enrolled");

  const columns = [
    {
      title: "Inquiry",
      data: inquiry,
      color: "border-yellow-400 bg-yellow-50",
    },
    {
      title: "Qualified",
      data: qualified,
      color: "border-blue-400 bg-blue-50",
    },
    {
      title: "Admitted",
      data: admitted,
      color: "border-purple-400 bg-purple-50",
    },
    {
      title: "Enrolled",
      data: enrolled,
      color: "border-green-500 bg-green-50",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">MBBS Tracker</h1>

      <div className="grid gap-4 xl:grid-cols-4">
        {columns.map((column) => (
          <div key={column.title} className="rounded-3xl border bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold ${column.color}`}
              >
                {column.title}
              </span>

              <span className="font-bold">{column.data.length}</span>
            </div>

            <div className="space-y-3">
              {column.data.map((lead: any) => (
                <div
                  key={lead.id}
                  className={`rounded-2xl border p-4 ${
                    lead.status === "enrolled"
                      ? "border-green-500 bg-green-50"
                      : "border-yellow-400 bg-yellow-50"
                  }`}
                >
                  <h3 className="font-semibold">{lead.studentName}</h3>

                  <p className="text-sm text-muted-foreground">
                    {lead.leadNumber}
                  </p>

                  <p className="text-sm">{lead.preferredCountry}</p>

                  <p className="mt-2 text-xs font-medium">{lead.status}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
