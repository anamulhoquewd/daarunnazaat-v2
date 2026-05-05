import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import {
  Ban,
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  ShieldOff,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { Separator } from "../ui/separator";

const roleColors: Record<string, string> = {
  super_admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  admin: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  staff: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  guardian: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
};

const roleLabel: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  staff: "Staff",
  guardian: "Guardian",
};

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
    header: "Phone",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.phone || "—"}</span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.email || "—"}</span>
    ),
  },
  {
    header: "Roles",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.roles?.map((role: string) => (
          <span
            key={role}
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${roleColors[role] ?? "bg-muted text-muted-foreground"}`}
          >
            {roleLabel[role] ?? role}
          </span>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      row.original.isActive ? (
        <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 dark:bg-green-900/20">
          Active
        </Badge>
      ) : (
        <Badge variant="outline" className="text-muted-foreground">
          Inactive
        </Badge>
      ),
  },
  {
    accessorKey: "isBlocked",
    header: "Blocked",
    cell: ({ row }) =>
      row.original.isBlocked ? (
        <Badge variant="destructive" className="text-xs">Blocked</Badge>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "isDeleted",
    header: "Deleted",
    cell: ({ row }) =>
      row.original.isDeleted ? (
        <Badge variant="secondary" className="text-xs text-destructive">Deleted</Badge>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
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
          <DropdownMenuLabel className="text-xs text-muted-foreground">Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              setValues(row.original);
              setSelectedId(row.original._id);
              setIsAddOpen(true);
              setIsEditing(true);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>

          <Separator className="my-1" />

          <DropdownMenuItem
            onClick={() =>
              row.original.isActive
                ? deactiveUser(row.original._id)
                : activeUser(row.original._id)
            }
          >
            {row.original.isActive ? (
              <>
                <UserX className="mr-2 h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Activate
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() =>
              row.original.isBlocked
                ? unblockUser(row.original._id)
                : blockUser(row.original._id)
            }
          >
            {row.original.isBlocked ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Unblock
              </>
            ) : (
              <>
                <Ban className="mr-2 h-4 w-4" />
                Block
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() =>
              row.original.isDeleted
                ? restoreUser(row.original._id)
                : deleteUser(row.original._id)
            }
          >
            {row.original.isDeleted ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Restore
              </>
            ) : (
              <>
                <ShieldOff className="mr-2 h-4 w-4" />
                Soft Delete
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
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
