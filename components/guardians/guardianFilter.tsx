"use client";

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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Gender } from "@/validations";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

const GENDER_OPTIONS = [
  { label: "All Genders", value: "all" },
  { label: "Male", value: Gender.MALE },
  { label: "Female", value: Gender.FEMALE },
];

interface GuardianFiltersProps {
  filters: Record<string, string | boolean | undefined>;
  onChange: (key: string, value: string | boolean) => void;
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
  onChange: (key: string, value: string | boolean) => void;
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

export default function GuardianFilters({ filters, onChange }: GuardianFiltersProps) {
  const genderValue = (filters.gender as string) || "all";
  const isDeleted = filters.isDeleted === true || filters.isDeleted === "true";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
      <FilterDropdown
        label="Gender"
        filterKey="gender"
        value={genderValue}
        options={GENDER_OPTIONS}
        onChange={onChange}
      />
      <div className="flex items-center gap-1.5">
        <Switch
          id="isDeleted"
          checked={isDeleted}
          onCheckedChange={(checked) => onChange("isDeleted", checked)}
        />
        <Label htmlFor="isDeleted" className="text-sm cursor-pointer">
          Deleted
        </Label>
      </div>
    </div>
  );
}
