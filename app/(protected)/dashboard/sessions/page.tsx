"use client";

import Paginations from "@/components/common/paginations";
import TableComponent from "@/components/common/table";
import { SessionBottomFilter } from "@/components/sessions/sessionBottomFilter";
import { SessionColumns } from "@/components/sessions/sessionColumns";
import SessionRegistrationForm from "@/components/sessions/sessionRegistrationForm";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClassForm } from "@/hooks/classes/useClassForm";
import { useSessionForm } from "@/hooks/sessions/useSessionForm";
import useSessionQuery from "@/hooks/sessions/useSessionQuery";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Filter, Plus, X } from "lucide-react";
import { useState } from "react";

function SessionsPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    batchType: false,
    status: false,
    startDate: false,
    endDate: false,
  });

  const { form, handleSubmit, isLoading, setIsDelOpen } = useSessionForm();

  const {
    pagination,
    sessions,
    setValues,
    setPagination,
    search,
    setSearch,
    filterBy,
    activeFilterCount,
    handleClearFilters,
    updateFilter,
    combinedFilters,
    isAddOpen,
    setIsAddOpen,
    setIsEditing,
    setSelectedId,
    values,
    isEditing,
    handleUpdate,
  } = useSessionQuery();

  const columns = SessionColumns({
    setIsEditing,
    setIsDelOpen,
    setValues,
    setSelectedId,
    setIsAddOpen,
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
    <Card className="w-full  flex flex-col overflow-hidden">
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
            <Dialog
              open={isAddOpen}
              onOpenChange={(open) => {
                if (!open) {
                  setValues(null);
                  setSelectedId("");
                  setIsEditing(false);
                  form.reset({
                    sessionName: "",
                    isActive: true,
                    startDate: undefined,
                    endDate: undefined,
                    batchType: undefined,
                  });
                }
                setIsAddOpen(open);
              }}
            >
              <DialogTrigger asChild>
                <Button
                  onChange={() => setIsAddOpen(true)}
                  className="w-full sm:w-auto cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add One
                </Button>
              </DialogTrigger>
              <DialogContent>
                <AlertDialogHeader>
                  <DialogTitle>Customer Registration Form</DialogTitle>
                  <DialogDescription>
                    Fill out the form below to complete new customer
                    registration.
                  </DialogDescription>
                </AlertDialogHeader>
                <ScrollArea className="sm:max-w-[525px] h-[65dvh] overflow-hidden pr-2 md:px-4">
                  <SessionRegistrationForm
                    values={values}
                    handleSubmit={isEditing ? handleUpdate : handleSubmit}
                    isLoading={isLoading}
                    form={form}
                  />
                  <ScrollBar orientation="vertical" className="w-2.5" />
                  <ScrollBar orientation="horizontal" className="w-2.5" />
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex flex-col md:flex-row justify-between md:items-end py-4 gap-2">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">
              Search by Session name
            </label>
            <Input
              placeholder="Search session..."
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
