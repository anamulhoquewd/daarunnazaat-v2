"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Send, Trash2 } from "lucide-react";
import Link from "next/link";

const statusStyle: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  ongoing: "bg-yellow-100 text-yellow-700 border-yellow-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  results_published: "bg-purple-100 text-purple-700 border-purple-200",
};

const typeStyle: Record<string, string> = {
  monthly: "bg-sky-100 text-sky-700 border-sky-200",
  terminal: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

interface ColumnsProps {
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsDelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  publishResults: (id: string) => void;
}

export const ExamColumns = ({
  setIsDelOpen,
  setSelectedId,
  publishResults,
}: ColumnsProps): ColumnDef<any>[] => [
  {
    header: "Exam Name",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/exams/${row.original._id}`}
        className="text-blue-600 hover:underline font-medium"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline" className={typeStyle[row.original.type] ?? ""}>
        {row.original.type}
      </Badge>
    ),
  },
  {
    header: "Year",
    cell: ({ row }) => row.original.academicYear,
  },
  {
    header: "Classes",
    cell: ({ row }) => {
      const classes = row.original.applicableClasses ?? [];
      return (
        <span className="text-sm text-muted-foreground">
          {classes.length > 0
            ? classes.map((c: any) => c.className ?? c).join(", ")
            : "-"}
        </span>
      );
    },
  },
  {
    header: "Dates",
    cell: ({ row }) => {
      const { startDate, endDate } = row.original;
      if (!startDate) return "-";
      return (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {format(new Date(startDate), "dd MMM")} –{" "}
          {endDate ? format(new Date(endDate), "dd MMM yyyy") : ""}
        </span>
      );
    },
  },
  {
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={`capitalize ${statusStyle[row.original.status] ?? ""}`}
      >
        {(row.original.status as string).replace(/_/g, " ")}
      </Badge>
    ),
  },
  {
    header: "Actions",
    cell: ({ row }) => {
      const { _id, status } = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/exams/${_id}`}>
                <Pencil className="w-4 h-4 mr-2" /> View Details
              </Link>
            </DropdownMenuItem>
            {status !== "results_published" && (
              <DropdownMenuItem onClick={() => publishResults(_id)}>
                <Send className="w-4 h-4 mr-2" /> Publish Results
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                setSelectedId(_id);
                setIsDelOpen(true);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
