"use client";

import DeleteAlert from "@/components/common/deleteAlert";
import Paginations from "@/components/common/paginations";
import TableComponent from "@/components/common/table";
import { ExamColumns } from "@/components/exam/examColumns";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExamCategory, ExamStatus } from "@/validations";
import useExamQuery from "@/hooks/exam/useExamQuery";
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

export default function ExamsPage() {
  const [isDelOpen, setIsDelOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const {
    exams,
    pagination,
    setPagination,
    isLoading,
    filterWith,
    setFilterWith,
    deleteExam,
    publishResults,
  } = useExamQuery();

  const columns = ExamColumns({
    setIsDelOpen,
    setSelectedId,
    publishResults,
  });

  const table = useReactTable({
    columns,
    data: exams,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: { sorting, columnFilters, columnVisibility },
    manualPagination: true,
  });

  const hasFilters =
    filterWith.academicYear || filterWith.type || filterWith.status;

  const clearFilters = () =>
    setFilterWith({ academicYear: "", type: "", status: "", limit: "10" });

  return (
    <Card className="w-full flex flex-col overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Exam Management</CardTitle>
            <CardDescription className="mt-1">
              Create and manage all exams, enrollments, and results
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                <X className="mr-2 w-4 h-4" /> Clear Filters
              </Button>
            )}
            {hasFilters && (
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                <Filter size={14} /> Filtered
              </span>
            )}
            <Link href="/dashboard/exams/new">
              <Button>Create Exam</Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 pt-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <Select
            value={filterWith.type || "all"}
            onValueChange={(v) =>
              setFilterWith((f) => ({ ...f, type: v === "all" ? "" : v }))
            }
          >
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={ExamCategory.MONTHLY}>Monthly</SelectItem>
              <SelectItem value={ExamCategory.TERMINAL}>Terminal</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterWith.status || "all"}
            onValueChange={(v) =>
              setFilterWith((f) => ({ ...f, status: v === "all" ? "" : v }))
            }
          >
            <SelectTrigger className="w-44 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value={ExamStatus.DRAFT}>Draft</SelectItem>
              <SelectItem value={ExamStatus.SCHEDULED}>Scheduled</SelectItem>
              <SelectItem value={ExamStatus.ONGOING}>Ongoing</SelectItem>
              <SelectItem value={ExamStatus.COMPLETED}>Completed</SelectItem>
              <SelectItem value={ExamStatus.RESULTS_PUBLISHED}>
                Results Published
              </SelectItem>
            </SelectContent>
          </Select>

          <input
            type="text"
            placeholder="Academic year (e.g. 2026)"
            className="h-9 rounded-md border border-input px-3 text-sm w-48 bg-background"
            value={filterWith.academicYear}
            onChange={(e) =>
              setFilterWith((f) => ({ ...f, academicYear: e.target.value }))
            }
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto h-9">
                Columns <ChevronDown className="w-4 h-4 ml-1" />
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
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <TableComponent table={table} columns={columns} />

        {pagination.total > 0 && (
          <div className="flex justify-end pt-2">
            <Paginations
              pagination={pagination}
              setPagination={setPagination as any}
            />
          </div>
        )}

        {selectedId && (
          <DeleteAlert
            isOpen={isDelOpen}
            setIsOpen={setIsDelOpen}
            cb={async () => {
              setDeleting(true);
              await deleteExam(selectedId);
              setDeleting(false);
            }}
            setSelectedId={setSelectedId}
            isLoading={deleting}
          />
        )}
      </CardContent>
    </Card>
  );
}
