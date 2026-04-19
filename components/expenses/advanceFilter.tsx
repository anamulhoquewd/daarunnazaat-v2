"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Branch, ExpenseCategory } from "@/validations";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { useState } from "react";

interface AdvanceFilterForExpenseProps {
  filters: Record<string, string | boolean | undefined>;
  onChange: (key: string, value: string) => void;
  isExpanded?: boolean;
  activeFilterCount: number;
}

export default function AdvanceFilterForExpense({
  filters,
  onChange,
  isExpanded: initialExpanded = false,
  activeFilterCount,
}: AdvanceFilterForExpenseProps) {
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
                Expense type
              </label>
              <Select
                value={(filters.category as string) || "all"}
                onValueChange={(v) => onChange("category", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Type of category</SelectItem>
                  {Object.entries(ExpenseCategory).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {value}
                    </SelectItem>
                  ))}
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
                  {Object.entries(Branch).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
