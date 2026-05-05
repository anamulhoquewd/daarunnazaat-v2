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
import {
  ExternalLink,
  Lock,
  MoreHorizontal,
  RotateCcw,
  ShieldOff,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { formatMony } from "@/lib/utils";

interface ColumnsProps {
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsDelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeUser: (id: string) => Promise<void>;
  deactiveUser: (id: string) => Promise<void>;
  blockUser: (id: string) => Promise<void>;
  unblockUser: (id: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  restoreUser: (id: string) => Promise<void>;
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
    id: "student",
    header: "Student",
    cell: ({ row }) => {
      const { _id, fullName, studentId } = row.original;
      return (
        <div className="space-y-0.5 min-w-[140px]">
          <Link
            href={`/dashboard/students/${_id}`}
            className="font-semibold text-sm hover:text-primary hover:underline transition-colors"
          >
            {fullName ?? "—"}
          </Link>
          <p className="text-xs text-muted-foreground font-mono">
            {studentId || "—"}
          </p>
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const { isActive, isBlocked, isDeleted } = row.original;
      if (isDeleted)
        return (
          <Badge variant="destructive" className="text-xs">
            Deleted
          </Badge>
        );
      if (isBlocked)
        return (
          <Badge
            variant="outline"
            className="text-xs border-orange-400 text-orange-600"
          >
            Blocked
          </Badge>
        );
      return isActive ? (
        <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
          Active
        </Badge>
      ) : (
        <Badge variant="secondary" className="text-xs">
          Inactive
        </Badge>
      );
    },
  },
  {
    id: "class",
    header: "Class",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.class?.className || "—"}</span>
    ),
  },
  {
    accessorKey: "branch",
    header: "Branch",
    cell: ({ row }) => {
      const branch = row.original.branch as string | undefined;
      if (!branch) return <span className="text-muted-foreground">—</span>;
      return (
        <Badge
          variant="outline"
          className="text-xs font-normal whitespace-nowrap"
        >
          {branch.replace(" Branch", "")}
        </Badge>
      );
    },
  },
  {
    id: "monthlyFee",
    header: "Monthly Fee",
    cell: ({ row }) => {
      const fee = row.original.monthlyFee;
      return fee ? (
        <span className="font-mono text-sm tabular-nums">
          {formatMony(fee)}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    id: "guardian",
    header: "Guardian",
    cell: ({ row }) => {
      const name = row.original.guardian?.fullName;
      const rel = row.original.guardianRelation;
      if (!name) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{name}</p>
          {rel && (
            <p className="text-xs text-muted-foreground capitalize">{rel}</p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "nid",
    header: "NID",
    cell: ({ row }) => row.original?.nid || "—",
  },
  {
    id: "phone",
    header: "Phone",
    cell: ({ row }) => row.original?.phone || "—",
  },
  {
    accessorKey: "guardian_email",
    header: "Email",
    cell: ({ row }) => row.original?.guardian?.user?.email || "—",
  },
  {
    id: "guardianPhone",
    header: "G. Phone",
    cell: ({ row }) => row.original.guardian?.user?.phone || "—",
  },
  {
    accessorKey: "dob",
    header: "Date of Birth",
    cell: ({ row }) => {
      const { dateOfBirth } = row.original;
      return dateOfBirth ? format(new Date(dateOfBirth), "dd LLL yyyy") : "—";
    },
  },
  {
    accessorKey: "blood_group",
    header: "Blood",
    cell: ({ row }) => row.original.bloodGroup || "—",
  },
  {
    accessorKey: "admissionDate",
    header: "Admission",
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return value ? format(new Date(value), "dd LLL yyyy") : "—";
    },
  },
  {
    accessorKey: "status",
    header: "Active",
    cell: ({ row }) => (row.original?.isActive ? "Yes" : "No"),
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
    header: "",
    cell: ({ row }) => {
      const s = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 data-[state=open]:bg-muted"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/students/${s._id}`}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                s.isActive ? deactiveUser(s._id) : activeUser(s._id)
              }
              className="gap-2"
            >
              {s.isActive ? (
                <UserX className="h-4 w-4 text-amber-500" />
              ) : (
                <UserCheck className="h-4 w-4 text-emerald-500" />
              )}
              {s.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                s.isBlocked ? unblockUser(s._id) : blockUser(s._id)
              }
              className="gap-2"
            >
              {s.isBlocked ? (
                <ShieldOff className="h-4 w-4 text-emerald-500" />
              ) : (
                <Lock className="h-4 w-4 text-orange-500" />
              )}
              {s.isBlocked ? "Unblock" : "Block"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                s.isDeleted ? restoreUser(s._id) : deleteUser(s._id)
              }
              className="gap-2"
            >
              {s.isDeleted ? (
                <RotateCcw className="h-4 w-4 text-emerald-500" />
              ) : (
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              )}
              {s.isDeleted ? "Restore" : "Soft Delete"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive gap-2 focus:text-destructive"
              onClick={() => {
                setSelectedId(s._id);
                setIsDelOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Permanent Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
