import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Separator } from "../ui/separator";

// Define Props Interface
interface ColumnsProps {
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsDelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeGuardian: (guardianId: string) => Promise<void>;
  deactiveGuardian: (guardianId: string) => Promise<void>;
}
export const GuardianColumns = ({
  setIsDelOpen,
  setSelectedId,
  activeGuardian,
  deactiveGuardian,
}: ColumnsProps): ColumnDef<any>[] => [
  {
    header: "Guardian ID",
    cell: ({ row }) => row.original?.guardianId || "-",
  },
  {
    header: "Name",
    cell: ({ row }) => {
      const { _id, fullName } = row.original;

      return (
        <Link
          href={`/dashboard/guardians/${_id}`}
          target="_blank"
          className="text-blue-600 hover:underline font-medium"
        >
          {fullName ?? ""}
        </Link>
      );
    },
  },
  {
    header: "Phone",
    cell: ({ row }) => row.original?.user?.phone || "-",
  },
  {
    header: "Whats App",
    cell: ({ row }) => row.original?.whatsApp || "-",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original?.user?.email || "-",
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
    cell: ({ row }) => (row.original?.isActive ? "Active" : "Deactivated"),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
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
                  deactiveGuardian!(row.original._id);
                } else {
                  activeGuardian!(row.original._id);
                }
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              {row.original.isActive ? "Deactivate" : "Activate"}
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
      );
    },
  },
];
