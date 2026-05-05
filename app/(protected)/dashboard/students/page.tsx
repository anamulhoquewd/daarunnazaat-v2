"use client";

import { DateRangePicker } from "@/components/common/dateRange";
import DeleteAlert from "@/components/common/deleteAlert";
import Paginations from "@/components/common/paginations";
import TableComponent from "@/components/common/table";
import { StudentBottomFilter } from "@/components/students/studentBottomFilter";
import { StudentColumns } from "@/components/students/studentColumns";
import StudentFilters from "@/components/students/studentFilter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import useStudentQuery from "@/hooks/students/useStudentQuery";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  Download,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function StudentPage() {
  const [isDelOpen, setIsDelOpen] = useState(false);
  const [selectId, setSelectedId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    nid: false,
    phone: false,
    branch: true,
    email: false,
    guardian_email: false,
    status: false,
    isBlocked: false,
    isDeleted: false,
    blood_group: false,
    dob: false,
  });

  const {
    students,
    isLoading,
    deleteLoading,
    pagination,
    setPagination,
    search,
    setSearch,
    filterWith,
    setfilterWith,
    combinedFilters,
    activeFilterCount,
    handleClearFilters,
    updateFilter,
    handleExportAsPDF,
    handleExportAsSheet,
    handleDelete,
    activeUser,
    deactiveUser,
    blockUser,
    unblockUser,
    deleteUser,
    restoreUser,
  } = useStudentQuery();

  const columns = StudentColumns({
    setIsDelOpen,
    setSelectedId,
    activeUser,
    deactiveUser,
    blockUser,
    unblockUser,
    deleteUser,
    restoreUser,
  });

  const table = useReactTable({
    columns,
    data: students,
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
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pagination.total > 0 ? (
              <>
                Showing {students.length} of{" "}
                <span className="font-medium text-foreground">
                  {pagination.total}
                </span>{" "}
                students
              </>
            ) : (
              "Manage and view all students"
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isLoading}>
                <Download className="h-4 w-4 mr-1.5" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2 pb-1">
                Exports current filter &amp; search
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel
                className="cursor-pointer font-normal hover:bg-accent rounded px-2 py-1.5"
                onClick={handleExportAsPDF}
              >
                Export as PDF
              </DropdownMenuLabel>
              <DropdownMenuLabel
                className="cursor-pointer font-normal hover:bg-accent rounded px-2 py-1.5"
                onClick={handleExportAsSheet}
              >
                Export as Sheet
              </DropdownMenuLabel>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/dashboard/students/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Register Student
            </Button>
          </Link>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-3 border-b">
          {/* Search + Date + Columns */}
          <div className="flex flex-col md:flex-row gap-2 items-start md:items-end">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by name, ID, NID, phone or email…"
                value={search.global}
                onChange={(e) =>
                  setSearch((prev) => ({ ...prev, global: e.target.value }))
                }
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
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
            <StudentFilters
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
              <StudentBottomFilter
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

      {selectId && (
        <DeleteAlert
          isOpen={isDelOpen}
          setIsOpen={setIsDelOpen}
          cb={handleDelete.bind(null, selectId)}
          setSelectedId={setSelectedId}
          isLoading={deleteLoading}
        />
      )}
    </div>
  );
}
