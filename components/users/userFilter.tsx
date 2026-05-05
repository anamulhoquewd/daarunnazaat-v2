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
import { UserRole } from "@/validations";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";

const ROLE_OPTIONS = [
  { label: "All Roles", value: "all" },
  { label: "Super Admin", value: UserRole.SUPER_ADMIN },
  { label: "Admin", value: UserRole.ADMIN },
  { label: "Staff", value: UserRole.STAFF },
  { label: "Guardian", value: UserRole.GUARDIAN },
];

const ACTIVITY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

const BLOCK_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Blocked", value: "true" },
  { label: "Not Blocked", value: "false" },
];

const DELETE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Deleted", value: "true" },
  { label: "Not Deleted", value: "false" },
];

interface UserFiltersProps {
  filters: Record<string, string | boolean | undefined>;
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
  const activeOption = options.find((o) => o.value === value);
  const isActive = value !== "all" && value !== undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isActive ? "default" : "outline"}
          size="sm"
          className="gap-1.5"
        >
          {isActive ? activeOption?.label ?? label : label}
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

export default function UserFilters({ filters, onChange, activeFilterCount }: UserFiltersProps) {
  const rolesValue =
    filters.roles !== undefined ? String(filters.roles) : "all";
  const isActiveValue =
    filters.isActive === true ? "true" : filters.isActive === false ? "false" : "all";
  const isBlockedValue =
    filters.isBlocked === true ? "true" : filters.isBlocked === false ? "false" : "all";
  const isDeleteValue =
    filters.isDelete === true ? "true" : filters.isDelete === false ? "false" : "all";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />

      <FilterDropdown
        label="Role"
        filterKey="roles"
        value={rolesValue}
        options={ROLE_OPTIONS}
        onChange={onChange}
      />
      <FilterDropdown
        label="Activity"
        filterKey="isActive"
        value={isActiveValue}
        options={ACTIVITY_OPTIONS}
        onChange={onChange}
      />
      <FilterDropdown
        label="Block"
        filterKey="isBlocked"
        value={isBlockedValue}
        options={BLOCK_OPTIONS}
        onChange={onChange}
      />
      <FilterDropdown
        label="Deleted"
        filterKey="isDelete"
        value={isDeleteValue}
        options={DELETE_OPTIONS}
        onChange={onChange}
      />

      {activeFilterCount > 0 && (
        <>
          <Badge variant="secondary" className="gap-1 ml-1">
            <SlidersHorizontal className="h-3 w-3" />
            {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}
          </Badge>
        </>
      )}
    </div>
  );
}
