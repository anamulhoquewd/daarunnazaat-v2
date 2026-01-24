"use client";

import { DateRangePicker } from "@/components/common/dateRange";
import DeleteAlert from "@/components/common/deleteAlert";
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
import { UserBottomFilter } from "@/components/users/userBottomFilter";
import { UserColumns } from "@/components/users/userColumns";
import UserFilters from "@/components/users/userFilter";
import UserRegistrationForm from "@/components/users/userRegistrationForm";
import useUserQuery from "@/hooks/users/useUserQuery";
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

function UsersPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    isBlocked: false,
    status: false,
  });

  const {
    isLoading,
    pagination,
    users,
    setValues,
    values,
    setPagination,
    search,
    setSearch,
    filterBy,
    setFilterBy,
    activeFilterCount,
    handleClearFilters,
    updateFilter,
    combinedFilters,
    selectedId,
    handleDelete,
    handleUpdate,
    handleSubmit,
    setSelectedId,
    clearForm,
    form,
    isEditing,
    isAddOpen,
    isDelOpen,
    setIsEditing,
    setIsAddOpen,
    setIsDelOpen,
  } = useUserQuery();

  const columns = UserColumns({
    setIsEditing,
    setIsDelOpen,
    setValues,
    setSelectedId,
    setIsAddOpen,
  });

  const table = useReactTable({
    columns,
    data: users,
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

  console.log("Editing State:", isEditing);

  return (
    <Card className="w-full  flex flex-col overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Users Management</CardTitle>
            <CardDescription className="mt-1">
              Manage and view all users
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
                  clearForm();
                  setValues(null);
                  setSelectedId("");
                  setIsEditing(false);
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
                  Add one
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
                  <UserRegistrationForm
                    values={values}
                    handleSubmit={isEditing ? handleUpdate : handleSubmit}
                    isLoading={isLoading}
                    form={form}
                    clearForm={clearForm}
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
        {/* Filter Controls Row */}
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <UserFilters
            filters={combinedFilters}
            onChange={updateFilter}
            isExpanded={false}
            activeFilterCount={activeFilterCount()}
          />
        </div>

        <div className="flex flex-col md:flex-row justify-between md:items-end py-4 gap-2">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">
              Search by phone or email
            </label>
            <Input
              placeholder="Search users..."
              value={search.global}
              onChange={(e) =>
                setSearch((prev) => ({
                  ...prev,
                  global: e.target.value,
                }))
              }
            />
          </div>

          {/* Joining Date Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Joining Date Range
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
            <UserBottomFilter
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

export default UsersPage;
