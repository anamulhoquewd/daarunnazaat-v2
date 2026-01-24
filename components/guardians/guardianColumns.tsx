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
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsDelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setValues: (values: any) => void;
}
export const GuardianColumns = ({
  setIsEditing,
  setIsDelOpen,
  setValues,
  setSelectedId,
}: ColumnsProps): ColumnDef<any>[] => [
  {
    header: "Guardian ID",
    cell: ({ row }) => row.original?.guardianId || "-",
  },
  {
    header: "Name",
    cell: ({ row }) =>
      `${row.original.firstName || ""} ${row.original.lastName || ""}`,
  },
  {
    header: "Phone",
    cell: ({ row }) => row.original?.userId?.phone || "-",
  },
  {
    header: "Whats App",
    cell: ({ row }) => row.original?.whatsApp || "-",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original?.userId?.email || "-",
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => row.original?.gender || "-",
  },
  {
    accessorKey: "occupation",
    header: "Occupation",
    cell: ({ row }) => row.original?.occupation || "-",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (row.original?.userId?.isActive ? "Active" : "Inactive"),
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
              setSelectedId(row.original._id);
              setIsEditing(true);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>

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
