"use client";

import { DateRangePicker } from "@/components/common/dateRange";
import DeleteAlert from "@/components/common/deleteAlert";
import Paginations from "@/components/common/paginations";
import TableComponent from "@/components/common/table";
import { StaffBottomFilter } from "@/components/staffs/staffBottomFilter";
import { StaffColumns } from "@/components/staffs/staffColumns";
import StaffFilters from "@/components/staffs/staffFilter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import useStaffQuery from "@/hooks/staff/useStaffQuery";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function StaffsPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    nid: false,
    branch: true,
    gender: false,
    joinDate: false,
    status: false,
  });

  const {
    pagination,
    staffs,
    setValues,
    setPagination,
    search,
    setSearch,
    filterWith,
    setfilterWith,
    activeFilterCount,
    handleClearFilters,
    updateFilter,
    combinedFilters,
    deleteStaff,
    isLoading,
    selectedId,
    setSelectedId,
    isDelOpen,
    setIsDelOpen,
  } = useStaffQuery();

  const columns = StaffColumns({ setIsDelOpen, setValues, setSelectedId });

  const table = useReactTable({
    columns,
    data: staffs,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: { sorting, columnFilters, columnVisibility },
    manualPagination: true,
    initialState: { pagination: { pageSize: pagination.page } },
  });

  const filterCount = activeFilterCount();

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pagination.total > 0 ? (
              <>
                Showing {staffs.length} of{" "}
                <span className="font-medium text-foreground">
                  {pagination.total}
                </span>{" "}
                staff members
              </>
            ) : (
              "Manage and view all staff members"
            )}
          </p>
        </div>
        <Link href="/dashboard/staffs/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Register Staff
          </Button>
        </Link>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-3 border-b">
          {/* Search + Date + Salary + Columns */}
          <div className="flex flex-col md:flex-row gap-2 items-start md:items-end">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by name, ID, NID, designation or phone…"
                value={search.global}
                onChange={(e) =>
                  setSearch((prev) => ({ ...prev, global: e.target.value }))
                }
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <DateRangePicker
                initialDateFrom={filterWith.dateRange?.from}
                initialDateTo={filterWith.dateRange?.to}
                onUpdate={(values) =>
                  setfilterWith((prev) => ({
                    ...prev,
                    dateRange: values.range,
                  }))
                }
              />
              {/* Salary range */}
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  placeholder="Min "
                  value={filterWith.salaryRange?.min ?? ""}
                  min={0}
                  onChange={(e) =>
                    setfilterWith((prev) => ({
                      ...prev,
                      salaryRange: {
                        ...prev.salaryRange,
                        min: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      },
                    }))
                  }
                  className="w-24 h-9 text-sm"
                />
                <span className="text-muted-foreground text-sm">–</span>
                <Input
                  type="number"
                  placeholder="Max "
                  value={filterWith.salaryRange?.max ?? ""}
                  min={0}
                  onChange={(e) =>
                    setfilterWith((prev) => ({
                      ...prev,
                      salaryRange: {
                        ...prev.salaryRange,
                        max: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      },
                    }))
                  }
                  className="w-24 h-9 text-sm"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <ChevronDown className="h-4 w-4" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((col) => col.getCanHide())
                    .map((col) => (
                      <DropdownMenuCheckboxItem
                        key={col.id}
                        className="capitalize"
                        checked={col.getIsVisible()}
                        onCheckedChange={(v) => col.toggleVisibility(!!v)}
                      >
                        {col.id.replace(/_/g, " ")}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-2 pt-2">
            <StaffFilters
              filters={combinedFilters}
              onChange={updateFilter}
              activeFilterCount={filterCount}
            />
            {filterCount > 0 && (
              <div className="flex items-center gap-2 ml-auto shrink-0">
                <Badge variant="secondary" className="gap-1">
                  <SlidersHorizontal className="h-3 w-3" />
                  {filterCount} filter{filterCount !== 1 ? "s" : ""}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-7 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <div className="flex-1 overflow-auto">
            <TableComponent table={table} columns={columns} />
          </div>

          {pagination.total > 0 && (
            <div className="border-t px-4 py-3 flex items-center justify-between bg-muted/30">
              <StaffBottomFilter
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

      {selectedId && (
        <DeleteAlert
          isOpen={isDelOpen}
          setIsOpen={setIsDelOpen}
          cb={deleteStaff.bind(null, selectedId)}
          setSelectedId={setSelectedId}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
