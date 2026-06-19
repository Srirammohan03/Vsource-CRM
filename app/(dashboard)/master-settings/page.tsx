// crm-frontend-next\app\(dashboard)\master-settings\page.tsx
"use client";

import { useEffect, useState } from "react";

import { PageHeader, PageTransition } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";

import { toast } from "sonner";

import {
  MasterItem,
  getMasters,
  createMaster,
  deleteMaster,
} from "@/lib/master-settings";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categories = [
  {
    key: "countries",
    label: "Countries",
    endpoint: "/countries",
  },
  {
    key: "intakes",
    label: "Intakes",
    endpoint: "/intakes",
  },
  {
    key: "lead-sources",
    label: "Lead Sources",
    endpoint: "/lead-sources",
  },
  {
    key: "lead-degrees",
    label: "Lead Degrees",
    endpoint: "/lead-degrees",
  },
  {
    key: "lead-universities",
    label: "Lead Universities",
    endpoint: "/lead-universities",
  },
];

export default function MasterSettings() {
  const [selected, setSelected] = useState<(typeof categories)[number]["key"]>(
    categories[0].key,
  );
  const [items, setItems] = useState<MasterItem[]>([]);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const current = categories.find((x) => x.key === selected)!;

  const loadData = async () => {
    try {
      setLoading(true);

      const data = await getMasters(current.endpoint);

      setItems(data);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selected]);

  const handleAdd = async () => {
    if (!value.trim()) {
      return;
    }

    try {
      await createMaster(current.endpoint, value.trim());

      toast.success(`${current.label} added`);

      setValue("");
      await loadData();
    } catch {
      toast.error("Failed to add");
    }
  };
  const handleStatusChange = async (
    id: string,
    status: boolean,
  ) => {
    try {
      const res = await fetch(`/api${current.endpoint}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      });

      if (!res.ok) {
        throw new Error();
      }

      toast.success(
        status ? "Activated successfully" : "Deactivated successfully",
      );

      await loadData();
    } catch {
      toast.error("Failed to update status");
    }
  };
  const handleDelete = async (id: string) => {
    try {
      await deleteMaster(current.endpoint, id);

      toast.success("Deleted");
      await loadData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Master Settings"
          description="Manage Countries, Intakes, Lead Sources, Lead Degrees and Lead Universities"
        />

        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="overflow-x-auto">
              <Tabs
                value={selected}
                onValueChange={(value) =>
                  setSelected(value as (typeof categories)[number]["key"])
                }
              >
                <TabsList className="inline-flex min-w-max">
                  {categories.map((item) => (
                    <TabsTrigger
                      key={item.key}
                      value={item.key}
                      className="px-6 whitespace-nowrap"
                    >
                      {item.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                className="flex-1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`Add new ${current.label.slice(0, -1)}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
              />

              <Button onClick={handleAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>

            <div className="space-y-2">
              {loading ? (
                <p>Loading...</p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 shadow-sm transition-all border ${item.status
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                      }`}
                  >
                    <div className="flex flex-col">
                      <span
                        className={`font-medium ${item.status ? "text-green-800" : "text-red-800"
                          }`}
                      >
                        {item.name}
                      </span>

                      <span
                        className={`text-xs ${item.status ? "text-green-600" : "text-red-600"
                          }`}
                      >
                        {item.status ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <Switch
                      checked={item.status}
                      onCheckedChange={(checked) =>
                        handleStatusChange(item.id, checked)
                      }
                    />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
