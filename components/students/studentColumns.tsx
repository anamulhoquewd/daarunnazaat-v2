import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";

// Define Props Interface
interface ColumnsProps {
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsDelOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export const StudentColumns = ({
  setIsDelOpen,
  setSelectedId,
}: ColumnsProps): ColumnDef<any>[] => [
  {
    header: "Student ID",
    cell: ({ row }) => row.original.studentId || "-",
  },
  {
    header: "Name",
    cell: ({ row }) => {
      const { _id, fullName } = row.original;

      return (
        <Link
          href={`/dashboard/students/${_id}`}
          target="_blank"
          className="text-blue-600 hover:underline font-medium"
        >
          {fullName ?? "_"}
        </Link>
      );
    },
  },
  {
    header: "Class",
    cell: ({ row }) => row.original.class?.className || "-",
  },
  {
    accessorKey: "branch",
    header: "Branch",
    cell: ({ row }) => row.original.branch || "-",
  },
  {
    accessorKey: "batch",
    header: "Batch",
    cell: ({ row }) => row.original.batchType || "-",
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => row.original.gender || "-",
  },
  {
    header: "Guardian",
    cell: ({ row }) =>
      `${row.original.guardian?.fullName || "-"} (${row.original?.guardianRelation || "-"})`,
  },
  {
    accessorKey: "nid",
    header: "NID",
    cell: ({ row }) => row.original?.nid || "-",
  },
  {
    header: "Phone",
    cell: ({ row }) => row.original?.phone || "-",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original?.email || "-",
  },
  {
    header: "G. Phone",
    cell: ({ row }) => row.original.guardianId?.phone || "-",
  },
  {
    accessorKey: "residential",
    header: "Residential",
    cell: ({ row }) => (row.original.isResidential ? "Yes" : "No"),
  },
  {
    accessorKey: "admissionDate",
    header: "Admission Date",
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return value ? format(new Date(value), "cc LLL yyyy") : "-";
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (row.original?.isActive ? "Active" : "Inactive"),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => {
              setSelectedId(row.original._id);
              setIsDelOpen(true);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
