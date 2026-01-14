import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

// Define Props Interface
interface ColumnsProps {
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsDelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setValues: (values: any) => void;
}
export const studentColumns = ({
  setIsEditing,
  setIsDelOpen,
  setValues,
  setSelectId,
}: ColumnsProps): ColumnDef<any>[] => [
  {
    header: "Student ID",
    cell: ({ row }) => row.original.studentId || "-",
  },
  {
    header: "Name",
    cell: ({ row }) =>
      `${row.original.firstName || ""} ${row.original.lastName || ""}`,
  },
  {
    header: "Class",
    cell: ({ row }) => row.original.classId?.className || "-",
  },
  {
    header: "Branch",
    cell: ({ row }) => row.original.branch || "-",
  },
  {
    header: "Batch",
    cell: ({ row }) => row.original.batchType || "-",
  },
  {
    header: "Gender",
    cell: ({ row }) => row.original.gender || "-",
  },
  {
    header: "Guardian",
    cell: ({ row }) =>
      `${row.original.guardianId?.firstName || ""} ${
        row.original.guardianId?.lastName || ""
      }`,
  },
  {
    header: "Phone",
    cell: ({ row }) => row.original.userId?.phone || "-",
  },
  {
    header: "Guardian Phone",
    cell: ({ row }) => row.original.guardianId?.userId?.phone || "-",
  },
  {
    header: "Residential",
    cell: ({ row }) => (row.original.isResidential ? "Yes" : "No"),
  },
  {
    header: "Status",
    cell: ({ row }) => (row.original.userId?.isActive ? "Active" : "Inactive"),
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
              setValues(row.original);
              setSelectId(row.original._id);
              setIsEditing(true);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-destructive"
            onClick={() => {
              setSelectId(row.original._id);
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
