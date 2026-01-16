"use client";

import Paginations from "@/components/common/paginations";
import TableComponent from "@/components/common/table";
import { GuardianBottomFilter } from "@/components/guardians/guardianBottomFilter";
import { guardianColumns } from "@/components/guardians/guardianColumns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useGuardianQuery from "@/hooks/guardians/guardianStudentQuery";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Filter, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function GuardianPage() {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDelOpen, setIsDelOpen] = useState<boolean>(false);
  const [selectId, setSelectId] = useState<string | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    isBlocked: false,
    status: false,
  });

  const {
    pagination,
    guardians,
    setValues,
    setPagination,
    search,
    setSearch,
    activeFilterCount,
    handleClearFilters,
    updateFilter,
    combinedFilters,
  } = useGuardianQuery();

  const columns = guardianColumns({
    setIsEditing,
    setIsDelOpen,
    setValues,
    setSelectId,
  });

  const table = useReactTable({
    columns,
    data: guardians,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },

    manualPagination: true,

    initialState: {
      pagination: {
        pageSize: pagination.page,
      },
    },
  });

  return (
    // Full-height card so header stays fixed and table area scrolls
    <Card className="w-full -[calc(100vh-140px)] flex flex-col overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Guardian Management</CardTitle>
            <CardDescription className="mt-1">
              Manage and view all guardian
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {activeFilterCount() > 0 && (
              <Button
                variant="ghost"
                onClick={handleClearFilters}
                className="cursor-pointer"
              >
                <X className="mr-2" />
                Clear Filters
              </Button>
            )}
            {activeFilterCount() > 0 && (
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full">
                <Filter size={14} />
                {activeFilterCount()} filter
                {activeFilterCount() !== 1 ? "s" : ""} active
              </span>
            )}
            <Link href={"#"}>
              <Button className="cursor-pointer">Add One</Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex flex-col md:flex-row justify-between md:items-end py-4 gap-2">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">
              Search by name, ID, phone, or email
            </label>
            <Input
              placeholder="Search students..."
              value={search.global}
              onChange={(e) =>
                setSearch((prev) => ({
                  ...prev,
                  global: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Gender</label>
            <Select
              value={(combinedFilters.gender as string) || "all"}
              onValueChange={(v) => updateFilter("gender", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="w-fit ml-auto">
              <Button
                variant="outline"
                className="cursor-pointer bg-transparent"
              >
                Columns <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter(
                  (column: {
                    id: string;
                    getCanHide: () => boolean;
                    getIsVisible: () => boolean;
                    toggleVisibility: (value: boolean) => void;
                  }) => column.getCanHide()
                )
                .map(
                  (column: {
                    id: string;
                    getCanHide: () => boolean;
                    getIsVisible: () => boolean;
                    toggleVisibility: (value: boolean) => void;
                  }) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="cursor-pointer capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  }
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <TableComponent table={table} columns={columns} />

        {pagination.total > 0 && (
          <div className="pt-4 flex items-center justify-between">
            <GuardianBottomFilter
              filters={combinedFilters}
              onChange={updateFilter}
            />
            <Paginations
              pagination={pagination}
              setPagination={setPagination}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default GuardianPage;
