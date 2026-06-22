// app\components\universities\university-scholarship-form.tsx
"use client";

import { memo } from "react";
import { Control, UseFieldArrayRemove, useController } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";

import { Trash2, Award } from "lucide-react";

import { UniversityFormValues } from "@/lib/university-schema";

interface Props {
  index: number;
  control: Control<UniversityFormValues>;
  remove: UseFieldArrayRemove;
}

function UniversityScholarshipFormComponent({ index, control, remove }: Props) {
  const { field: name } = useController({
    control,
    name: `scholarships.${index}.name`,
  });

  const { field: amount } = useController({
    control,
    name: `scholarships.${index}.amount`,
  });

  const { field: percentage } = useController({
    control,
    name: `scholarships.${index}.percentage`,
  });

  const { field: description } = useController({
    control,
    name: `scholarships.${index}.description`,
  });

  return (
    <Card className="rounded-2xl border">
      <CardContent className="space-y-5 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <Award className="size-5" />
            </div>

            <div>
              <h4 className="font-semibold">Scholarship #{index + 1}</h4>

              <p className="text-sm text-muted-foreground">
                Scholarship details
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => remove(index)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        {/* Scholarship Name */}

        <div className="space-y-2">
          <Label>Scholarship Name</Label>

          <Input
            value={name.value ?? ""}
            onChange={name.onChange}
            placeholder="Vice Chancellor Scholarship"
          />
        </div>

        {/* Amount & Percentage */}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Amount</Label>

            <Input
              type="number"
              value={amount.value ?? ""}
              onChange={(e) => amount.onChange(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="5000"
            />
          </div>

          <div className="space-y-2">
            <Label>Percentage</Label>

            <Input
              type="number"
              value={percentage.value ?? ""}
              onChange={(e) => percentage.onChange(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="25"
            />
          </div>
        </div>

        {/* Description */}

        <div className="space-y-2">
          <Label>Description</Label>

          <Textarea
            rows={4}
            value={description.value ?? ""}
            onChange={description.onChange}
            placeholder="Scholarship eligibility, requirements, benefits..."
          />
        </div>
      </CardContent>
    </Card>
  );
}

export const UniversityScholarshipForm = memo(
  UniversityScholarshipFormComponent,
);
