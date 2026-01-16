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

interface SalariesFiltersProps {
  filters: Record<string, string | boolean | undefined>;
  onChange: (key: string, value: string) => void;
  isExpanded?: boolean;
  activeFilterCount: number;
}

export default function SalariesFilters({
  filters,
  onChange,
  isExpanded: initialExpanded = false,
  activeFilterCount,
}: SalariesFiltersProps) {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Payment Method
              </label>
              <Select
                value={(filters.paymentMethod as string) || "all"}
                onValueChange={(v) => onChange("paymentMethod", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank transfer</SelectItem>
                  <SelectItem value="mobile_banking">Mobile banking</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
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
              <label className="text-sm font-medium mb-2 block">Staff ID</label>
              <Input
                placeholder="Search class by id..."
                value={(filters.staffId as string) || ""}
                onChange={(e) => onChange("staffId", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                PaidBy ID
              </label>
              <Input
                placeholder="Search guardian by id..."
                value={(filters.PaidBy as string) || ""}
                onChange={(e) => onChange("PaidBy", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
