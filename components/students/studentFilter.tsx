"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { useState } from "react";
import { ClassFilterCombobox } from "../clasess/classFilterCombobox";

interface StudentFiltersProps {
  filters: Record<string, string | boolean | undefined>;
  onChange: (key: string, value: string) => void;
  isExpanded?: boolean;
  activeFilterCount: number;
}

export default function StudentFilters({
  filters,
  onChange,
  isExpanded: initialExpanded = false,
  activeFilterCount,
}: StudentFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  return (
    <Card className="w-full">
      <div
        className="flex items-center justify-between cursor-pointer px-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <Filter size={18} />
          <div>
            <CardTitle className="text-base">Advanced Filters</CardTitle>
            <CardDescription className="text-xs">
              {activeFilterCount > 0
                ? `${activeFilterCount} filter${
                    activeFilterCount !== 1 ? "s" : ""
                  } applied`
                : "Refine your search"}
            </CardDescription>
          </div>
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>

      {isExpanded && (
        <CardContent className="space-y-6 border-t pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Branch</label>
              <Select
                value={(filters.branch as string) || "all"}
                onValueChange={(v) => onChange("branch", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="branch_1">Branch 1</SelectItem>
                  <SelectItem value="branch_2">Branch 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Gender</label>
              <Select
                value={(filters.gender as string) || "all"}
                onValueChange={(v) => onChange("gender", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Batch Type
              </label>
              <Select
                value={(filters.batchType as string) || "all"}
                onValueChange={(v) => onChange("batchType", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select batch type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  <SelectItem value="january_december">
                    January - December
                  </SelectItem>
                  <SelectItem value="ramadan-ramadan">
                    Ramadan - Ramadan
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Residential
              </label>
              <Select
                value={
                  filters.residential === "all"
                    ? "all"
                    : filters.residential === true
                      ? "true"
                      : filters.residential === false
                        ? "false"
                        : "all"
                }
                onValueChange={(v) => onChange("residential", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ClassFilterCombobox
              value={filters.classId as string}
              onChange={onChange}
            />

            <div>
              <label className="text-sm font-medium mb-2 block">
                Guardian ID
              </label>
              <Input
                placeholder="Search guardian by id..."
                value={(filters.guardianId as string) || ""}
                onChange={(e) => onChange("guardianId", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
