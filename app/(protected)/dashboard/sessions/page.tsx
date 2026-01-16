"use client";

import Paginations from "@/components/common/paginations";
import TableComponent from "@/components/common/table";
import { SessionBottomFilter } from "@/components/sessions/sessionBottomFilter";
import { SessionColumns } from "@/components/sessions/sessionColumns";
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
import useSessionQuery from "@/hooks/sessions/useCLassQuery";
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

function SessionsPage() {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDelOpen, setIsDelOpen] = useState<boolean>(false);
  const [selectId, setSelectId] = useState<string | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    batchType: false,
    status: false,
    startDate: false,
    endDate: false,
  });

  const {
    pagination,
    sessions,
    setValues,
    setPagination,
    search,
    setSearch,
    filterBy,
    setFilterBy,
    activeFilterCount,
    handleClearFilters,
    updateFilter,
    combinedFilters,
  } = useSessionQuery();

  const columns = SessionColumns({
    setIsEditing,
    setIsDelOpen,
    setValues,
    setSelectId,
  });

  const table = useReactTable({
    columns,
    data: sessions,
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
            <CardTitle className="text-2xl">Sessions Management</CardTitle>
            <CardDescription className="mt-1">
              Manage and view all sessions
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
              Search by Class name
            </label>
            <Input
              placeholder="Search class..."
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
            <label className="text-sm font-medium mb-2 block">Activity</label>
            <Select
              value={
                combinedFilters.isActive === "all"
                  ? "all"
                  : combinedFilters.isActive === true
                  ? "true"
                  : combinedFilters.isActive === false
                  ? "false"
                  : "all"
              }
              onValueChange={(v) => updateFilter("isActive", v)}
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
            <label className="text-sm font-medium mb-2 block">Batch Type</label>
            <Select
              value={(filterBy.batchType as string) || "all"}
              onValueChange={(v) => updateFilter("batchType", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select batch type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                <SelectItem value="january_december">
                  January - December
                </SelectItem>
                <SelectItem value="ramadan-ramadan">
                  Ramadan - Ramadan
                </SelectItem>
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
            <SessionBottomFilter
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

export default SessionsPage;
