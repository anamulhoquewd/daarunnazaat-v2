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

// Define Props Interface
interface ColumnsProps {
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsDelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setValues: (values: any) => void;
}
export const StaffColumns = ({
  setIsEditing,
  setIsDelOpen,
  setValues,
  setSelectId,
}: ColumnsProps): ColumnDef<any>[] => [
  {
    header: "Staff ID",
    cell: ({ row }) => row.original.staffId || "-",
  },
  {
    header: "Name",
    cell: ({ row }) =>
      `${row.original.firstName || ""} ${row.original.lastName || ""}`,
  },
  {
    accessorKey: "branch",
    header: "Branch",
    cell: ({ row }) => row.original.branch || "-",
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => row.original.gender || "-",
  },
  {
    accessorKey: "nid",
    header: "NID",
    cell: ({ row }) => row.original?.nid || "-",
  },
  {
    header: "Designation",
    cell: ({ row }) => row.original?.designation || "-",
  },
  {
    accessorKey: "joinDate",
    header: "Join Date",
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return value ? format(new Date(value), "yyyy-MM-dd") : "-";
    },
  },
  {
    header: "Salary",
    cell: ({ row }) => row.original?.basicSalary || "-",
  },
  {
    header: "Phone",
    cell: ({ row }) => row.original.user?.phone || "-",
  },
  {
    header: "Whats App",
    cell: ({ row }) => row.original?.whatsApp || "-",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.user?.email || "-",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (row.original.user?.isActive ? "Active" : "Inactive"),
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
