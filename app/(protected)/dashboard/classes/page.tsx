"use client";

import { ClassBottomFilter } from "@/components/clasess/classBottomFilter";
import { ClassColumns } from "@/components/clasess/classColumns";
import ClassRegistrationForm from "@/components/clasess/classRegistrationForm";
import Paginations from "@/components/common/paginations";
import TableComponent from "@/components/common/table";
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
import useClassQuery from "@/hooks/classes/useCLassQuery";
import { useClassForm } from "@/hooks/classes/useClassForm";
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

function ClassesPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    description: false,
    status: false,
  });

  const {
    pagination,
    classes,
    setPagination,
    search,
    setSearch,
    filterBy,
    setFilterBy,
    activeFilterCount,
    handleClearFilters,
    updateFilter,
    combinedFilters,
    setSelectedId,
    handleUpdate,
    values,
    setValues,
    isEditing,
    setIsEditing,
    isAddOpen,
    setIsAddOpen,
  } = useClassQuery();

  const { form, handleSubmit, isLoading, setIsDelOpen } = useClassForm();

  const columns = ClassColumns({
    setIsEditing,
    setIsDelOpen,
    setValues,
    setSelectedId,
    setIsAddOpen,
  });

  const table = useReactTable({
    columns,
    data: classes,
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
            <CardTitle className="text-2xl">Classes Management</CardTitle>
            <CardDescription className="mt-1">
              Manage and view all classes
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
                    className: "",
                    description: "",
                    monthlyFee: 0,
                    capacity: 0,
                    isActive: true,
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
                  <ClassRegistrationForm
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
            <ClassBottomFilter
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

export default ClassesPage;
