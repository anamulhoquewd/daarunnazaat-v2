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
export const SessionColumns = ({
  setIsEditing,
  setIsDelOpen,
  setValues,
  setSelectId,
}: ColumnsProps): ColumnDef<any>[] => [
  {
    header: "Session ID",
    cell: ({ row }) => row.original._id || "-",
  },
  {
    header: "Session Name",
    cell: ({ row }) => row.original.sessionName || "-",
  },
  {
    accessorKey: "batchType",
    header: "Batch Type",
    cell: ({ row }) => row.original.batchType || "-",
  },
  {
    accessorKey: "startDate",
    header: "Star tDate",
    cell: ({ row }) => row.original.startDate || "-",
  },
  {
    accessorKey: "endDate",
    header: "End tDate",
    cell: ({ row }) => row.original.endDate || "-",
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
