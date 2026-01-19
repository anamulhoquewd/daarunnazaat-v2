"use client";

import { DateRangePicker } from "@/components/common/dateRange";
import Paginations from "@/components/common/paginations";
import TableComponent from "@/components/common/table";
import { TransactionsBottomFilter } from "@/components/transactions/transactionsBottomFilter";
import { TransactionsColumns } from "@/components/transactions/transactionsColumns";
import TransactionsFilters from "@/components/transactions/transactionsFilter";
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
import useTransactionsQuery from "@/hooks/transactions/useTransactionsQuery";
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
import { useState } from "react";

function TransactionsPage() {
  const [isDelOpen, setIsDelOpen] = useState<boolean>(false);
  const [selectId, setSelectId] = useState<string | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    description: false,
    branch: false,
    performedByPhone: false,
    performedByRole: false,
  });

  const {
    pagination,
    transactions,
    setPagination,
    search,
    setSearch,
    filterBy,
    setFilterBy,
    activeFilterCount,
    handleClearFilters,
    updateFilter,
    combinedFilters,
  } = useTransactionsQuery();

  const columns = TransactionsColumns({
    setIsDelOpen,
    setSelectId,
  });

  const table = useReactTable({
    columns,
    data: transactions,
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
    <Card className="w-full  flex flex-col overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Transactions Management</CardTitle>
            <CardDescription className="mt-1">
              Manage and view all transactions
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
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Filter Controls Row */}
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <TransactionsFilters
            filters={combinedFilters}
            onChange={updateFilter}
            isExpanded={false}
            activeFilterCount={activeFilterCount()}
          />
        </div>

        <div className="flex flex-col md:flex-row justify-between md:items-end py-4 gap-2">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">
              Search by ID or description
            </label>
            <Input
              placeholder="Search transaction..."
              value={search.global}
              onChange={(e) =>
                setSearch((prev) => ({
                  ...prev,
                  global: e.target.value,
                }))
              }
            />
          </div>

          {/* Transaction Date Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Transaction Date Range
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

          {/* Amount Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Amount Range
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filterBy.amountRange?.min}
                min={0}
                onChange={(e) =>
                  setFilterBy((values) => ({
                    ...values,
                    amountRange: {
                      ...values.amountRange,
                      min: e.target.value ? Number(e.target.value) : undefined,
                    },
                  }))
                }
                className="w-full"
              />

              <Input
                min={0}
                type="number"
                placeholder="Max"
                value={filterBy.amountRange.max}
                onChange={(e) =>
                  setFilterBy((values) => ({
                    ...values,
                    amountRange: {
                      ...values.amountRange,
                      max: e.target.value ? Number(e.target.value) : undefined,
                    },
                  }))
                }
                className="w-full"
              />
            </div>
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
            <TransactionsBottomFilter
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

export default TransactionsPage;
