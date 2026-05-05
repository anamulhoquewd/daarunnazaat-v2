"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Branch, Gender } from "@/validations";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

const BRANCH_OPTIONS = [
  { label: "All Branches", value: "all" },
  { label: "Balika Branch", value: Branch.BALIKA },
  { label: "Balok Branch", value: Branch.BALOK },
];

const GENDER_OPTIONS = [
  { label: "All Genders", value: "all" },
  { label: "Male", value: Gender.MALE },
  { label: "Female", value: Gender.FEMALE },
];

interface StaffFiltersProps {
  filters: Record<string, string | number | undefined>;
  onChange: (key: string, value: string) => void;
  activeFilterCount: number;
}

function FilterDropdown({
  label,
  filterKey,
  value,
  options,
  onChange,
}: {
  label: string;
  filterKey: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (key: string, value: string) => void;
}) {
  const active = value !== "all" && !!value;
  const activeOption = options.find((o) => o.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={active ? "default" : "outline"} size="sm" className="gap-1.5">
          {active ? activeOption?.label ?? label : label}
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(filterKey, v)}>
          {options.map((opt) => (
            <DropdownMenuRadioItem key={opt.value} value={opt.value}>
              {opt.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function StaffFilters({ filters, onChange, activeFilterCount }: StaffFiltersProps) {
  const branchValue = (filters.branch as string) || "all";
  const genderValue = (filters.gender as string) || "all";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />

      <FilterDropdown
        label="Branch"
        filterKey="branch"
        value={branchValue}
        options={BRANCH_OPTIONS}
        onChange={onChange}
      />
      <FilterDropdown
        label="Gender"
        filterKey="gender"
        value={genderValue}
        options={GENDER_OPTIONS}
        onChange={onChange}
      />

      {activeFilterCount > 0 && (
        <Badge variant="secondary" className="gap-1 ml-1">
          <SlidersHorizontal className="h-3 w-3" />
          {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}
        </Badge>
      )}
    </div>
  );
}
