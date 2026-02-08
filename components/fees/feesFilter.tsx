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
import { StaffFilterCombobox } from "../staffs/staffFilterCombobox";
import { SttudentFilterCombobox } from "../students/studentFilterCombobox";

interface FeesFiltersProps {
  filters: Record<string, string | boolean | undefined>;
  onChange: (key: string, value: string) => void;
  isExpanded?: boolean;
  activeFilterCount: number;
}

export default function FeesFilters({
  filters,
  onChange,
  isExpanded: initialExpanded = false,
  activeFilterCount,
}: FeesFiltersProps) {
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
              <label className="text-sm font-medium mb-2 block">
                Fees type
              </label>
              <Select
                value={(filters.branch as string) || "all"}
                onValueChange={(v) => onChange("feeType", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select feeType" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Type of fees</SelectItem>
                  <SelectItem value="admission">Admission</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="coaching">Coaching</SelectItem>
                  <SelectItem value="daycare">Daycare</SelectItem>
                  <SelectItem value="utility">Utility</SelectItem>
                  <SelectItem value="meal">Meal</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

            <StaffFilterCombobox
              value={filters.collectedBy as string}
              onChange={onChange}
            />

            <SttudentFilterCombobox
              value={filters.studentId as string}
              onChange={onChange}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
