"use client";

import { Button } from "@/components/ui/button";
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
import { BatchType, Branch, Gender } from "@/validations";
import { ChevronDown, ChevronUp, Filter, RotateCcw } from "lucide-react";
import { useState } from "react";
import { DateRangePicker } from "../common/dateRange";

export interface StudentFiltersType {
  page?: number;
  limit?: number;
  sortBy?:
    | "createdAt"
    | "updatedAt"
    | "firstName"
    | "studentId"
    | "admissionDate";
  sortType?: "asc" | "desc";
  classId?: string;
  branch?: Branch | "all";
  gender?: Gender | "all";
  isResidential?: boolean;
  guardianId?: string;
  batchType?: BatchType | "all";
  currentSessionId?: string;
  admissionDateFrom?: string;
  admissionDateTo?: string;
}

interface StudentFiltersProps {
  onFiltersChange: (filters: Partial<StudentFiltersType>) => void;
  onReset: () => void;
  isExpanded?: boolean;
}

export default function StudentFilters({
  onFiltersChange,
  onReset,
  isExpanded: initialExpanded = false,
}: StudentFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [filters, setFilters] = useState({
    classId: "all",
    branch: "all",
    gender: "all",
    batchType: "all",
    isResidential: "all",
    guardianId: "",
    currentSessionId: "",
    admissionDateFrom: "",
    admissionDateTo: "",
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApply = () => {
    const filtersToSend: Record<string, any> = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== "all") {
        filtersToSend[key] = value;
      }
    });

    onFiltersChange?.(filtersToSend);
  };

  const handleReset = () => {
    setFilters({
      classId: "all",
      branch: "all",
      gender: "all",
      batchType: "all",
      isResidential: "all",
      guardianId: "",
      currentSessionId: "",
      admissionDateFrom: "",
      admissionDateTo: "",
    });
    onReset?.();
  };

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== "" && v !== "all"
  ).length;

  return (
    <Card className="w-full">
      <div
        className="flex items-center justify-between cursor-pointer p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
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
                value={filters.branch}
                onValueChange={(v) => handleFilterChange("branch", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="Branch 1">Branch 1</SelectItem>
                  <SelectItem value="Branch 2">Branch 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Gender</label>
              <Select
                value={filters.gender}
                onValueChange={(v) => handleFilterChange("gender", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Batch Type
              </label>
              <Select
                value={filters.batchType}
                onValueChange={(v) => handleFilterChange("batchType", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select batch type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  <SelectItem value="January - December">
                    January - December
                  </SelectItem>
                  <SelectItem value="Ramadan - Ramadan">
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
                value={filters.isResidential}
                onValueChange={(v) => handleFilterChange("isResidential", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Class</label>
              <Input
                placeholder="Search class by id..."
                value={filters.classId === "all" ? "" : filters.classId}
                onChange={(e) => handleFilterChange("classId", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Guardian ID
              </label>
              <Input
                placeholder="Search guardian by id..."
                value={filters.guardianId}
                onChange={(e) =>
                  handleFilterChange("guardianId", e.target.value)
                }
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleReset}
              className="gap-2 bg-transparent"
              size="sm"
            >
              <RotateCcw size={16} />
              Reset
            </Button>
            <Button onClick={handleApply} size="sm">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
