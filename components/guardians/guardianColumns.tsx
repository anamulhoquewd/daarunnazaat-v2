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
  ExternalLink,
  MoreHorizontal,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import Link from "next/link";

interface ColumnsProps {
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsDelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeGuardian: (guardianId: string) => Promise<void>;
  deactiveGuardian: (guardianId: string) => Promise<void>;
  handleSoftDelete: (guardianId: string, reason: string) => Promise<void>;
  handleRestore: (guardianId: string) => Promise<void>;
}

export const GuardianColumns = ({
  setIsDelOpen,
  setSelectedId,
  activeGuardian,
  deactiveGuardian,

  handleSoftDelete,
  handleRestore,
}: ColumnsProps): ColumnDef<any>[] => [
  {
    header: "Guardian ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.guardianId || "—"}
      </span>
    ),
  },
  {
    header: "Name",
    cell: ({ row }) => {
      const { _id, fullName, isActive } = row.original;
      return (
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/guardians/${_id}`}
            className="font-medium hover:underline text-foreground"
          >
            {fullName ?? "—"}
          </Link>
          {isActive === false && (
            <Badge variant="secondary" className="text-xs px-1.5">
              Inactive
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    header: "Phone",
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {row.original.user?.phone || row.original.userId?.phone || "—"}
      </span>
    ),
  },
  {
    header: "WhatsApp",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.whatsApp || "—"}</span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.user?.email || row.original.userId?.email || "—"}
      </span>
    ),
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => (
      <span className="capitalize text-sm">{row.original.gender || "—"}</span>
    ),
  },
  {
    accessorKey: "occupation",
    header: "Occupation",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.occupation || "—"}</span>
    ),
  },
  {
    accessorKey: "isDeleted",
    header: "Deleted",
    cell: ({ row }) => {
      const isDeleted = row.original.isDeleted;
      return isDeleted === false ? (
        <Badge
          variant="outline"
          className="text-green-600 border-green-300 bg-green-50 dark:bg-green-900/20 text-xs"
        >
          Not Deleted
        </Badge>
      ) : (
        <Badge
          variant="destructive"
          className="text-destructive-foreground border-destructive bg-destructive/10 dark:bg-destructive/20 text-xs"
        >
          Deleted
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const active = row.original.isActive;
      return active === false ? (
        <Badge variant="secondary" className="text-muted-foreground text-xs">
          Inactive
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="text-green-600 border-green-300 bg-green-50 dark:bg-green-900/20 text-xs"
        >
          Active
        </Badge>
      );
    },
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
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/guardians/${row.original._id}`}
              className="flex items-center"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              if (row.original.isActive) {
                deactiveGuardian(row.original._id);
              } else {
                activeGuardian(row.original._id);
              }
            }}
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
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              if (row.original.isDeleted) {
                handleRestore(row.original._id);
              } else {
                handleSoftDelete(row.original._id, "Reason for soft delete");
              }
            }}
          >
            {row.original.isDeleted ? (
              <>
                <UserX className="mr-2 h-4 w-4" />
                Restore
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
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
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
