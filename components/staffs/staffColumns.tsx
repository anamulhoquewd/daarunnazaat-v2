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
import { format } from "date-fns";
import { ExternalLink, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";

interface ColumnsProps {
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsDelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setValues: (values: any) => void;
}

export const StaffColumns = ({
  setIsDelOpen,
  setSelectedId,
}: ColumnsProps): ColumnDef<any>[] => [
  {
    header: "Staff ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.staffId || "—"}
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
            href={`/dashboard/staffs/${_id}`}
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
    header: "Designation",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.designation || "—"}</span>
    ),
  },
  {
    accessorKey: "branch",
    header: "Branch",
    cell: ({ row }) => {
      const branches: string[] = row.original.branch ?? [];
      if (!branches.length)
        return <span className="text-muted-foreground">—</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {branches.map((b) => (
            <Badge key={b} variant="outline" className="text-xs">
              {b}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => (
      <span className="capitalize text-sm">{row.original.gender || "—"}</span>
    ),
  },
  {
    accessorKey: "nid",
    header: "NID",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.nid || "—"}</span>
    ),
  },
  {
    accessorKey: "joinDate",
    header: "Join Date",
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return value ? (
        <span className="text-sm">
          {format(new Date(value), "dd MMM yyyy")}
        </span>
      ) : (
        "—"
      );
    },
  },
  {
    header: "Salary",
    cell: ({ row }) =>
      row.original.baseSalary != null ? (
        <span className="font-medium tabular-nums">
          {Number(row.original.baseSalary).toLocaleString()}
        </span>
      ) : (
        "—"
      ),
  },
  {
    header: "Phone",
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {row.original.userId?.phone || row.original.user?.phone || "—"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const active =
        row.original.userId?.isActive ?? row.original.user?.isActive;
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
              href={`/dashboard/staffs/${row.original._id}`}
              className="flex items-center"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Details
            </Link>
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
