"use client";

import { DateRangePicker } from "@/components/common/dateRange";
import DeleteAlert from "@/components/common/deleteAlert";
import Paginations from "@/components/common/paginations";
import TableComponent from "@/components/common/table";
import { ExpensesColumns } from "@/components/expenses/expenseColumns";
import { FeesBottomFilter } from "@/components/fees/feesBottomFilter";
import FeesFilters from "@/components/fees/feesFilter";
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
import useExpensesQuery from "@/hooks/expenses/useExpenseQuery";
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
import AdvanceFilterForExpense from "../../../../components/expenses/advanceFilter";

function ExpensePage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    createdBy: false,
    branch: false,
    paymentMethod: false,
  });

  const {
    pagination,
    expenses,
    setPagination,
    search,
    setSearch,
    filterBy,
    setFilterBy,
    activeFilterCount,
    handleClearFilters,
    updateFilter,
    combinedFilters,
    isDelOpen,
    setIsDelOpen,
    selectedId,
    setSelectedId,
    handleDelete,
    isLoading,
    restoreExpense,
    deleteFlagOn,
  } = useExpensesQuery();

  const columns = ExpensesColumns({
    setIsDelOpen,
    setSelectedId,
    restoreExpense,
    deleteFlag: deleteFlagOn,
  });

  const table = useReactTable({
    columns,
    data: expenses,
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
    <Card className="w-full flex flex-col overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Expenses Management</CardTitle>
            <CardDescription className="mt-1">
              Manage and view all expenses
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
              <Button className="cursor-pointer">Expenses Center</Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Filter Controls Row */}
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <AdvanceFilterForExpense
            filters={combinedFilters}
            onChange={updateFilter}
            isExpanded={false}
            activeFilterCount={activeFilterCount()}
          />
        </div>

        <div className="flex flex-col md:flex-row justify-between md:items-end py-4 gap-2">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">
              Voucher number
            </label>
            <Input
              placeholder="Search expenses..."
              value={search.global}
              onChange={(e) =>
                setSearch((prev) => ({
                  ...prev,
                  global: e.target.value,
                }))
              }
            />
          </div>

          {/* Payment Date Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Payment Date Range
            </label>

            <DateRangePicker
              initialDateFrom={filterBy.dateRange?.from}
              initialDateTo={filterBy.dateRange?.to}
              onUpdate={(values) =>
                setFilterBy((prev) => ({
                  ...prev,
                  dateRange: values.range,
                }))
              }
            />
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
                  }) => column.getCanHide(),
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
                  },
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <TableComponent table={table} columns={columns} />

        {pagination.total > 0 && (
          <div className="pt-4 flex items-center justify-between">
            <FeesBottomFilter
              filters={combinedFilters}
              onChange={updateFilter}
            />
            <Paginations
              pagination={pagination}
              setPagination={setPagination}
            />
          </div>
        )}

        {selectedId && (
          <DeleteAlert
            isOpen={isDelOpen}
            setIsOpen={setIsDelOpen}
            cb={handleDelete.bind(null, selectedId)}
            setSelectedId={setSelectedId}
            isLoading={isLoading}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default ExpensePage;
