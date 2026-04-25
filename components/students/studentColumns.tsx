import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Separator } from "../ui/separator";

// Define Props Interface
interface ColumnsProps {
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsDelOpen: React.Dispatch<React.SetStateAction<boolean>>;

  activeUser: (userId: string) => Promise<void>;
  deactiveUser: (userId: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  restoreUser: (userId: string) => Promise<void>;
}
export const StudentColumns = ({
  setIsDelOpen,
  setSelectedId,

  activeUser,
  deactiveUser,
  blockUser,
  unblockUser,
  deleteUser,
  restoreUser,
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
    accessorKey: "guardian_email",
    header: "Email",
    cell: ({ row }) => row.original?.guardian?.user?.email || "-",
  },
  {
    header: "G. Phone",
    cell: ({ row }) => row.original.guardian?.user?.phone || "-",
  },
  {
    accessorKey: "dob",
    header: "Date of Birth",
    cell: ({ row }) => {
      const { dateOfBirth } = row.original;
      return dateOfBirth ? format(new Date(dateOfBirth), "dd LLL yyyy") : "-";
    },
  },
  {
    accessorKey: "blood_group",
    header: "Blood Group",
    cell: ({ row }) => row.original.bloodGroup || "-",
  },
  {
    accessorKey: "admissionDate",
    header: "Admission Date",
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return value ? format(new Date(value), "dd LLL yyyy") : "-";
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (row.original?.isActive ? "Active" : "Deactive"),
  },
  {
    accessorKey: "isBlocked",
    header: "Blocked",
    cell: ({ row }) => (row.original?.isBlocked ? "Yes" : "No"),
  },
  {
    accessorKey: "isDeleted",
    header: "Deleted",
    cell: ({ row }) => (row.original?.isDeleted ? "Yes" : "No"),
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
            onClick={() => {
              if (row.original.isActive) {
                deactiveUser!(row.original._id);
              } else {
                activeUser!(row.original._id);
              }
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            {row.original.isActive ? "Deactivate" : "Activate"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              if (row.original.isBlocked) {
                unblockUser!(row.original._id);
              } else {
                blockUser!(row.original._id);
              }
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            {row.original.isBlocked ? "Unblock" : "Block"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              if (row.original.isDeleted) {
                restoreUser!(row.original._id);
              } else {
                deleteUser!(row.original._id);
              }
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            {row.original.isDeleted ? "Restore" : "Delete"}
          </DropdownMenuItem>

          <Separator className="my-1" />

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
