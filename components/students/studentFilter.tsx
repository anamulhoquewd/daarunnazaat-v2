"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Branch, Gender } from "@/validations";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { ClassFilterCombobox } from "../clasess/classFilterCombobox";
import { GuardianFilterCombobox } from "../guardians/guardianFilterCombobox";

interface StudentFiltersProps {
  filters: Record<string, string | boolean | undefined>;
  onChange: (key: string, value: string) => void;
  isExpanded?: boolean;
  activeFilterCount: number;
}

export default function StudentFilters({
  filters,
  onChange,
  activeFilterCount,
}: StudentFiltersProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={activeFilterCount > 0 ? "default" : "outline"}
          size="sm"
          className="gap-2 shrink-0"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-0.5 rounded-full bg-primary-foreground/20 px-1.5 py-0.5 text-xs font-semibold leading-none">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <p className="text-sm font-semibold mb-4">Filter Students</p>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">
              Branch
            </label>
            <Select
              value={(filters.branch as string) || "all"}
              onValueChange={(v) => onChange("branch", v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {Object.entries(Branch)
                  .filter(([, v]) => !v.includes("Branch") || v === "Balika Branch" || v === "Balok Branch")
                  .filter(([k]) => !k.includes("_BRANCH"))
                  .map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {value}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">
              Gender
            </label>
            <Select
              value={(filters.gender as string) || "all"}
              onValueChange={(v) => onChange("gender", v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All genders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                {Object.entries(Gender).map(([key, value]) => (
                  <SelectItem key={key} value={value} className="capitalize">
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">
              Residential
            </label>
            <Select
              value={
                filters.residential === true
                  ? "true"
                  : filters.residential === false
                    ? "false"
                    : "all"
              }
              onValueChange={(v) => onChange("residential", v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Residential only</SelectItem>
                <SelectItem value="false">Non-residential only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">
              Class
            </label>
            <ClassFilterCombobox value={filters.classId as string} onChange={onChange} />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">
              Guardian
            </label>
            <GuardianFilterCombobox value={filters.guardianId as string} onChange={onChange} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
