// crm-frontend-next\app\(dashboard)\leads\all\page.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { PageHeader, PageTransition } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Download, Plus, Pencil, Trash2, Eye } from "lucide-react";
import type { LeadStatus } from "@/types";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import PageActions from "./pageactions";
import { useAuth } from "@/store";
import { MODULES } from "@/lib/module-codes";

// Production API URL fallback configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "NEXT_PUBLIC_API_URL";

const statusStyle: Record<LeadStatus, string> = {
  draft:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  new: "bg-info/15 text-info border-info/20",
  contacted: "bg-warning/15 text-warning border-warning/20",
  qualified: "bg-primary/10 text-primary border-primary/20",
  converted: "bg-success/15 text-success border-success/20",
  lost: "bg-muted text-muted-foreground border-border",
};

const statusTabs: Array<LeadStatus | "all"> = [
  "all",
  "draft",
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
];

interface LeadRecord {
  id: string;
  leadNumber: string;

  counsellingDate?: string | null;

  studentName?: string;
  mobileNumber?: string;
  emailId?: string;

  place?: string;
  passport?: string;

  passportExpireDate?: string | null;

  source?: string;

  branch?: {
    id: string;
    name: string;
  };

  counselors?: {
    isPrimary: boolean;
    counselor: {
      id: string;
      name: string;
    };
  }[];

  preferredCountry?: string;
  preferredIntake?: string;
  preferredCourse?: string;

  tenthPercentage?: number;
  tenthYearOfPassing?: number;

  twelfthPercentage?: number;
  twelfthYearOfPassing?: number;

  bachelorsCourse?: string;
  bachelorsUniversityName?: string;
  bachelorsPercentage?: number;
  bachelorsYearOfPassing?: number;

  backlogs?: number;

  workExperience?: string;

  greGmatScore?: number;
  quantitativeScore?: number;
  verbalScore?: number;
  analyticalWritingScore?: number;

  englishTestType?: string;

  listeningScore?: number;
  readingScore?: number;
  writingScore?: number;
  speakingScore?: number;

  gapsIfAny?: string;

  remarks?: string;

  nextFollowup?: string | null;

  status: LeadStatus;

  isConverted?: boolean;
  createdAt: string;
}

const branchOptions = [
  "Dilsukhnagar Branch",
  "Ameerpet Branch",
  "KPHB - JNTU Branch",
  "Vijayawada Branch",
  "Visakhapatnam Branch",
  "Tirupathi Branch",
  "Bengaluru Branch",
];

export default function AllLeadsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [branch, setBranch] = useState("all");
  const [source, setSource] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedCounselors, setSelectedCounselors] = useState<string[]>([]);
  const { canCreate, canUpdate, canDelete } = useAuth();

  // Modals & Action States
  const [selected, setSelected] = useState<LeadRecord | null>(null);
  const [editingLead, setEditingLead] = useState<LeadRecord | null>(null);
  const [leadIdToDelete, setLeadIdToDelete] = useState<string | null>(null);

  const [leads, setLeads] = useState<LeadRecord[]>([]);

  const uniqueSources = useMemo(() => {
    return [
      ...new Set(
        leads
          .map((lead) => lead.source)
          .filter(
            (source): source is string =>
              typeof source === "string" && source.trim().length > 0,
          ),
      ),
    ];
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads
      .filter((item) => {
        const q = query.toLowerCase();

        const matchQuery =
          !q ||
          item.studentName?.toLowerCase().includes(q) ||
          item.emailId?.toLowerCase().includes(q) ||
          item.mobileNumber?.includes(q) ||
          item.id?.toLowerCase().includes(q) ||
          item.leadNumber?.toLowerCase().includes(q);

        const matchStatus = status === "all" || item.status === status;
        const matchBranch = branch === "all" || item.branch?.name === branch;
        const matchSource = source === "all" || item.source === source;

        return matchQuery && matchStatus && matchBranch && matchSource;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [leads, query, status, branch, source]);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/leads`, {
        cache: "no-store",
        credentials: "include",
      });
      const res = await response.json();
      const data = res?.data ?? [];
      console.log("first", data);
      setLeads(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load leads from the server");
    } finally {
      setIsLoading(false);
    }
  };

  const pageSize = 10;
  const start = (page - 1) * pageSize;
  const pageLeads = filteredLeads.slice(start, start + pageSize);
  const pageCount = Math.max(1, Math.ceil(filteredLeads.length / pageSize));

  const executeDeleteLead = async () => {
    if (!leadIdToDelete) return;
    try {
      await fetch(`${API_BASE_URL}/leads/${leadIdToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });

      setLeads((current) =>
        current.filter((item) => item.id !== leadIdToDelete),
      );
      toast.success("Lead deleted successfully");
    } catch (error) {
      setLeads((current) =>
        current.filter((item) => item.id !== leadIdToDelete),
      );
      toast.success("Lead cleared from current session views");
    } finally {
      setLeadIdToDelete(null);
    }
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    try {
      await fetch(`${API_BASE_URL}/leads/${editingLead.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editingLead,
          counselorIds: selectedCounselors,
        }),
      });

      setLeads((current) =>
        current.map((item) =>
          item.id === editingLead.id ? editingLead : item,
        ),
      );
      toast.success("Lead records synchronized successfully");
      setEditingLead(null);
    } catch (error) {
      setLeads((current) =>
        current.map((item) =>
          item.id === editingLead.id ? editingLead : item,
        ),
      );
      toast.success("Lead changes saved locally");
      setEditingLead(null);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [query, status, branch, source]);

  return (
    <PageTransition>
      <PageHeader
        title="All Leads"
        description="Manage every enquiry in the CRM with search, filters, export and status-driven navigation."
        actions={
          <div className="flex flex-row items-center gap-2">
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Export started")}
              className="whitespace-nowrap"
            >
              <Download className="size-4 mr-2" /> Export
            </Button> */}
            {canCreate(MODULES.MASTER_LEADS) && (
              <Button
                size="sm"
                onClick={() => router.push("/leads/add")}
                className="whitespace-nowrap"
              >
                <Plus className="size-4 mr-2" /> Add Lead
              </Button>
            )}
          </div>
        }
      />

      {/* Filter Control Board */}
      <Card className="mb-6 shadow-sm border-border">
        <CardContent className="grid gap-4 lg:grid-cols-[1.9fr_2.1fr] xl:grid-cols-[1.8fr_2.2fr] p-4 sm:p-5 min-w-0">
          <div className="relative flex items-end w-full">
            <div className="relative w-full">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10 w-full bg-background"
                placeholder="Search leads by name, email or ID"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold tracking-wide text-muted-foreground">
                Status
              </Label>
              <Select
                value={status}
                onValueChange={(value) =>
                  setStatus(value as LeadStatus | "all")
                }
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold tracking-wide text-muted-foreground">
                Branch
              </Label>
              <Select
                value={branch}
                onValueChange={(value) => setBranch(value)}
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Any branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Branch</SelectLabel>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branchOptions.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-semibold tracking-wide text-muted-foreground">
                Source
              </Label>
              <Select
                value={source}
                onValueChange={(value) => setSource(value)}
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Any source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Source</SelectLabel>
                    <SelectItem value="all">Any</SelectItem>
                    {uniqueSources.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Row Container - Uses hidden tracks to eliminate unwanted scrollbars while remaining accessible */}
      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {statusTabs.map((tab) => (
          <Button
            key={tab}
            variant={tab === status ? "secondary" : "outline"}
            size="sm"
            onClick={() => setStatus(tab)}
            className="whitespace-nowrap transition-all duration-200 shrink-0"
          >
            {tab === "all"
              ? "All Leads"
              : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {/* Responsive Lead Records Component Grid/Table Interface */}
      <Card className="overflow-hidden border-border shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              {/* Responsive Card Stack View (Visible on Mobile Viewports, Hides Table Scrollbars Completely) */}
              <div className="md:hidden divide-y divide-border">
                {pageLeads.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground bg-background">
                    No leads match your filters.
                  </div>
                ) : (
                  pageLeads.map((lead) => (
                    <div
                      key={lead.id || lead.leadNumber}
                      className="p-4 space-y-3 bg-card hover:bg-secondary/10 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
                          {lead.leadNumber}
                        </span>
                        <Badge
                          variant="outline"
                          className={`capitalize tracking-wide font-semibold ${statusStyle[lead.status || "draft"]}`}
                        >
                          {lead.status}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground text-base">
                          {lead.studentName || "—"}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5 space-x-1">
                          <span>{lead.mobileNumber || "—"}</span>
                          {lead.emailId && (
                            <span className="text-border">|</span>
                          )}
                          <span className="truncate max-w-[200px] inline-block align-bottom">
                            {lead.emailId || ""}
                          </span>
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/60 text-xs">
                        <div>
                          <p className="text-muted-foreground uppercase text-[10px]">
                            Source
                          </p>
                          <p>{lead.source || "—"}</p>
                        </div>

                        <div>
                          <p className="text-muted-foreground uppercase text-[10px]">
                            Country
                          </p>
                          <p>{lead.preferredCountry || "—"}</p>
                        </div>

                        <div>
                          <p className="text-muted-foreground uppercase text-[10px]">
                            Branch
                          </p>
                          <p>{lead.branch?.name || "—"}</p>
                        </div>

                        <div>
                          <p className="text-muted-foreground uppercase text-[10px]">
                            Counselor
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {lead?.counselors?.length ? (
                              lead?.counselors?.map((coun, idx) => (
                                <Badge key={coun.counselor?.id || idx}>
                                  {coun?.counselor?.name}
                                  {coun.isPrimary && " (Primary)"}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                No counselors assigned
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="col-span-2">
                          <p className="text-muted-foreground uppercase text-[10px]">
                            Email
                          </p>
                          <p className="break-all">{lead.emailId || "—"}</p>
                        </div>

                        <div>
                          <p className="text-muted-foreground uppercase text-[10px]">
                            Created Date
                          </p>
                          <p>
                            {lead.createdAt
                              ? new Date(lead.createdAt).toLocaleDateString()
                              : "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-muted-foreground uppercase text-[10px]">
                            Next Followup
                          </p>
                          <p>
                            {lead.nextFollowup
                              ? new Date(lead.nextFollowup).toLocaleDateString()
                              : "—"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1 pt-2 border-t border-border/60">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          onClick={() => setSelected(lead)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        {canUpdate(MODULES.MASTER_LEADS) && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8"
                            onClick={() => setEditingLead({ ...lead })}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        )}
                        {canDelete(MODULES.MASTER_LEADS) && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setLeadIdToDelete(lead.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* High-Fidelity Desktop Grid Interface (Visible on Medium screens and up) */}
              <div className="hidden md:block overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-secondary/30 text-left text-xs uppercase tracking-[0.16em] text-muted-foreground border-b border-border">
                      <th className="px-4 py-3.5 align-middle font-semibold">
                        Lead ID
                      </th>
                      <th className="px-4 py-3.5 align-middle font-semibold">
                        Student Name
                      </th>
                      <th className="px-4 py-3.5 align-middle font-semibold">
                        Mobile
                      </th>
                      <th className="px-4 py-3.5 align-middle font-semibold">
                        Email
                      </th>
                      <th className="px-4 py-3.5 align-middle font-semibold">
                        Source
                      </th>
                      <th className="px-4 py-3.5 align-middle font-semibold">
                        Branch
                      </th>
                      <th className="px-4 py-3.5 align-middle font-semibold">
                        Counselor
                      </th>
                      <th className="px-4 py-3.5 align-middle font-semibold">
                        Country
                      </th>
                      <th className="px-4 py-3.5 align-middle font-semibold">
                        Status
                      </th>
                      <th className="px-4 py-3.5 align-middle font-semibold">
                        Created Date
                      </th>
                      <th className="px-4 py-3.5 align-middle font-semibold">
                        Next Followup
                      </th>
                      <th className="px-4 py-3.5 align-middle text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageLeads.length === 0 ? (
                      <tr>
                        <td
                          colSpan={12}
                          className="py-12 text-center text-sm text-muted-foreground bg-background/50"
                        >
                          No leads match your filters.
                        </td>
                      </tr>
                    ) : (
                      pageLeads.map((lead) => (
                        <tr
                          key={lead.id || lead.leadNumber}
                          className="border-b border-border hover:bg-secondary/40 transition-colors"
                        >
                          <td className="px-4 py-3.5 font-medium align-middle whitespace-nowrap">
                            {lead.leadNumber}
                          </td>
                          <td className="px-4 py-3.5 align-middle font-medium text-foreground whitespace-nowrap">
                            {lead.studentName || "—"}
                          </td>
                          <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                            {lead.mobileNumber || "—"}
                          </td>
                          <td className="px-4 py-3.5 align-middle  text-muted-foreground max-w-[180px] truncate">
                            {lead.emailId || "—"}
                          </td>
                          <td className="px-4 py-3.5 align-middle max-w-[120px] truncate">
                            {lead.source || "—"}
                          </td>
                          <td className="px-4 py-3.5 align-middle max-w-[150px] truncate">
                            {lead.branch?.name || "—"}
                          </td>
                          <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                            <div className="flex flex-wrap gap-2">
                              {lead?.counselors?.length ? (
                                lead?.counselors.map((coun, idx) => (
                                  <Badge key={coun.counselor?.id || idx}>
                                    {coun?.counselor?.name}
                                    {coun.isPrimary && " (Primary)"}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  No counselors assigned
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                            {lead.preferredCountry || "—"}
                          </td>
                          <td className="px-4 py-3.5 align-middle">
                            <Badge
                              variant="outline"
                              className={`capitalize tracking-wide font-semibold whitespace-nowrap ${
                                statusStyle[lead.status || "draft"]
                              }`}
                            >
                              {lead.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5 align-middle  text-muted-foreground whitespace-nowrap">
                            {lead.createdAt
                              ? new Date(lead.createdAt).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                            {lead.nextFollowup
                              ? new Date(lead.nextFollowup).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="px-4 py-3.5 align-middle text-right space-x-1 whitespace-nowrap">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8"
                              onClick={() => setSelected(lead)}
                            >
                              <Eye className="size-4" />
                            </Button>
                            {canUpdate(MODULES.MASTER_LEADS) && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-8"
                                onClick={() => setEditingLead({ ...lead })}
                              >
                                <Pencil className="size-4" />
                              </Button>
                            )}
                            {canDelete(MODULES.MASTER_LEADS) && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setLeadIdToDelete(lead.id)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination Footer */}
      <div className="flex flex-col gap-3 mt-4 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground px-1">
        <div className="text-center sm:text-left">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {filteredLeads.length === 0 ? 0 : start + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-foreground">
            {Math.min(start + pageSize, filteredLeads.length)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-foreground">
            {filteredLeads.length}
          </span>{" "}
          result
          {filteredLeads.length === 1 ? "" : "s"}
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="select-none"
          >
            Previous
          </Button>
          <span className="font-medium text-foreground text-xs sm:text-sm px-2 bg-secondary/40 py-1 rounded">
            Page {page} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === pageCount}
            onClick={() =>
              setPage((current) => Math.min(pageCount, current + 1))
            }
            className="select-none"
          >
            Next
          </Button>
        </div>
      </div>

      <PageActions
        selected={selected as any}
        setSelected={setSelected as any}
        editingLead={editingLead as any}
        setEditingLead={setEditingLead as any}
        leadIdToDelete={leadIdToDelete}
        setLeadIdToDelete={setLeadIdToDelete}
        handleUpdateLead={handleUpdateLead}
        executeDeleteLead={executeDeleteLead}
        branchOptions={branchOptions}
        statusStyle={statusStyle}
        selectedCounselors={selectedCounselors}
        setSelectedCounselors={setSelectedCounselors}
      />
    </PageTransition>
  );
}
