import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Separator } from "../ui/separator";

// Define Props Interface
interface ColumnsProps {
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAddOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsDelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setValues: (values: any) => void;

  activeUser: (userId: string) => Promise<void>;
  deactiveUser: (userId: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  restoreUser: (userId: string) => Promise<void>;
}
export const UserColumns = ({
  setIsEditing,
  setIsAddOpen,
  setIsDelOpen,
  setValues,
  setSelectedId,

  activeUser,
  deactiveUser,
  blockUser,
  unblockUser,
  deleteUser,
  restoreUser,
}: ColumnsProps): ColumnDef<any>[] => [
  {
    header: "User ID",
    cell: ({ row }) => row.original._id || "-",
  },
  {
    header: "Roles",
    cell: ({ row }) => row.original.roles?.join(", ") || "-",
  },
  {
    header: "Phone",
    cell: ({ row }) => row.original.phone || "-",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original?.email || "-",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (row.original?.isActive ? "Active" : "Inactive"),
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
              setValues(row.original);
              setSelectedId(row.original._id);
              setIsAddOpen!(true);
              setIsEditing!(true);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>

          <Separator className="my-1" />
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
            Permanently Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
