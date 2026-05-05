"use client";

import { DateRangePicker } from "@/components/common/dateRange";
import DeleteAlert from "@/components/common/deleteAlert";
import Paginations from "@/components/common/paginations";
import TableComponent from "@/components/common/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { UserBottomFilter } from "@/components/users/userBottomFilter";
import { UserColumns } from "@/components/users/userColumns";
import UserFilters from "@/components/users/userFilter";
import UserRegistrationForm from "@/components/users/userRegistrationForm";
import useUser from "@/hooks/users/useUser";
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

export default function UsersPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    isBlocked: false,
    isDeleted: false,
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
    filterWith,
    setfilterWith,
    activeFilterCount,
    handleClearFilters,
    updateFilter,
    combinedFilters,
    selectedId,
    handleDelete,
    handleUpdate,
    handleSubmit,
    setSelectedId,
    form,
    isEditing,
    isAddOpen,
    isDelOpen,
    setIsEditing,
    setIsAddOpen,
    setIsDelOpen,
    activeUser,
    deactiveUser,
    blockUser,
    unblockUser,
    deleteUser,
    restoreUser,
  } = useUser();

  const columns = UserColumns({
    setIsEditing,
    setIsDelOpen,
    setValues,
    setSelectedId,
    setIsAddOpen,
    activeUser,
    deactiveUser,
    blockUser,
    unblockUser,
    deleteUser,
    restoreUser,
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
    state: { sorting, columnFilters, columnVisibility },
    manualPagination: true,
    initialState: { pagination: { pageSize: pagination.page } },
  });

  const filterCount = activeFilterCount();

  const closeModal = () => {
    form.reset({ email: "", phone: "", roles: [] });
    setValues(null);
    setSelectedId(null);
    setIsEditing(false);
    setIsAddOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pagination.total > 0 ? (
              <>
                Showing {users.length} of{" "}
                <span className="font-medium text-foreground">
                  {pagination.total}
                </span>{" "}
                users
              </>
            ) : (
              "Manage and view all system users"
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add User
          </Button>
          <Link href="/dashboard/users/new">
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1.5" />
              Full Form
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
                placeholder="Search by phone or email…"
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
            <UserFilters
              filters={combinedFilters}
              onChange={updateFilter}
              activeFilterCount={filterCount}
            />
            {filterCount > 0 && (
              <div className="flex items-center gap-2 ml-auto shrink-0">
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
        </CardContent>
      </Card>

      {/* Add / Edit Modal */}
      <Dialog
        open={isAddOpen}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit User" : "Add User"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the user's information and roles."
                : "Create a new system user account and assign roles."}
            </DialogDescription>
          </DialogHeader>
          <UserRegistrationForm
            values={values}
            setIsAddOpen={setIsAddOpen}
            handleSubmit={isEditing ? handleUpdate : handleSubmit}
            isLoading={isLoading}
            form={form}
            isEditing={isEditing}
          />
        </DialogContent>
      </Dialog>

      {/* Permanent Delete Alert */}
      {selectedId && (
        <DeleteAlert
          isOpen={isDelOpen}
          setIsOpen={setIsDelOpen}
          cb={handleDelete.bind(null, selectedId)}
          setSelectedId={setSelectedId}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
