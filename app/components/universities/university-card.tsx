// crm-frontend-next\app\components\universities\university-card.tsx
"use client";

import { memo, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Separator } from "@/components/ui/separator";

import {
  MoreVertical,
  Pencil,
  Trash2,
  Heart,
  Building2,
  Globe,
  Trophy,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { University } from "@/types/university";

import { UniversityDetailsAccordion } from "./university-details-accordion";

interface UniversityCardProps {
  university: University;

  shortlisted?: boolean;

  onShortlist?: (university: University) => void;

  onEdit?: (university: University) => void;

  onDelete?: (university: University) => void;
}

function UniversityCardComponent({
  university,
  shortlisted = false,
  onShortlist,
  onEdit,
  onDelete,
}: UniversityCardProps) {
  const [expanded, setExpanded] = useState(false);

  const initials = university.name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const statusVariant: Record<University["status"], string> = {
    active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    inactive: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    archived: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  return (
    <Card className="overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-lg">
      {/* Header */}

      <div className="relative h-28 bg-gradient-to-r from-primary/90 via-primary to-primary/80">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] [background-size:18px_18px]" />

        <div className="absolute top-4 left-4 flex items-center gap-3">
          {university.logo ? (
            <img
              src={university.logo}
              alt={university.name}
              className="h-12 w-12 rounded-xl bg-white object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-primary font-bold shadow-sm">
              {initials}
            </div>
          )}

          <div className="text-white">
            <div className="font-semibold line-clamp-1">{university.name}</div>

            <div className="text-xs opacity-90">
              {university.city}, {university.country?.name}
            </div>
          </div>
        </div>

        <div className="absolute right-4 top-4 flex items-center gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-white/20 text-white hover:bg-white/30"
            onClick={() => onShortlist?.(university)}
          >
            <Heart className={`h-4 w-4 ${shortlisted ? "fill-current" : ""}`} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 bg-white/20 text-white hover:bg-white/30"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onEdit?.(university)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit University
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete?.(university)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete University
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="absolute bottom-3 left-4">
          <Badge className="bg-white/20 text-white border-white/20">
            #{university.ranking ?? "-"}
          </Badge>
        </div>
      </div>

      {/* Content */}

      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className={statusVariant[university.status]}>
            {university.status}
          </Badge>

          <Badge variant="secondary">{university._count?.courses ?? university.courses?.length ?? 0} Courses</Badge>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatCard
            icon={<Globe className="h-4 w-4" />}
            label="Country"
            value={university.country?.name || "-"}
          />

          <StatCard
            icon={<Trophy className="h-4 w-4" />}
            label="Ranking"
            value={university.ranking ? `#${university.ranking}` : "-"}
          />

          <StatCard
            icon={<DollarSign className="h-4 w-4" />}
            label="Application Fee"
            value={
              university.applicationFee
                ? `${university.currency} ${Number(
                    university.applicationFee,
                  ).toLocaleString()}`
                : "-"
            }
          />

          <StatCard
            icon={<Building2 className="h-4 w-4" />}
            label="Scholarships"
            value={String(university._count?.scholarships ?? university.scholarships?.length ?? 0)}
          />
        </div>

        {university.description && (
          <>
            <Separator className="my-4" />

            <p className="line-clamp-3 text-sm text-muted-foreground">
              {university.description}
            </p>
          </>
        )}

        <div className="mt-5 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                Hide Details
                <ChevronUp className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                View Details
                <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <Button className="flex-1" onClick={() => onEdit?.(university)}>
            Edit
          </Button>
        </div>

        {expanded && (
          <div className="mt-5 border-t pt-5">
            <UniversityDetailsAccordion university={university} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-muted/30 p-3">
      <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>

      <div className="font-medium text-sm">{value}</div>
    </div>
  );
}

export const UniversityCard = memo(UniversityCardComponent);
