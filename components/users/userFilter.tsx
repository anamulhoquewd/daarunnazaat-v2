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
interface UserFiltersProps {
  filters: Record<string, string | boolean | undefined>;
  onChange: (key: string, value: string) => void;
  isExpanded?: boolean;
  activeFilterCount: number;
}

export default function UserFilters({
  filters,
  onChange,
  isExpanded: initialExpanded = false,
  activeFilterCount,
}: UserFiltersProps) {
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <Select
                value={(filters.role as string) || "all"}
                onValueChange={(v) => onChange("role", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select batch type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="guardian">Guardian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Activity</label>
              <Select
                value={
                  filters.isActive === "all"
                    ? "all"
                    : filters.isActive === true
                    ? "true"
                    : filters.isActive === false
                    ? "false"
                    : "all"
                }
                onValueChange={(v) => onChange("isActive", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Block status
              </label>
              <Select
                value={
                  filters.isBlocked === "all"
                    ? "all"
                    : filters.isBlocked === true
                    ? "true"
                    : filters.isBlocked === false
                    ? "false"
                    : "all"
                }
                onValueChange={(v) => onChange("isBlocked", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Blocked</SelectItem>
                  <SelectItem value="false">Unblocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
