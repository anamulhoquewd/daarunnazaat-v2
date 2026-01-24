import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal, Trash2 } from "lucide-react";

// Define Props Interface
interface ColumnsProps {
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsDelOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export const TransactionsColumns = ({
  setIsDelOpen,
  setSelectedId,
}: ColumnsProps): ColumnDef<any>[] => [
  {
    header: "transactionType",
    cell: ({ row }) => row.original?.transactionType || "-",
  },
  {
    header: "Reff Receipt",
    cell: ({ row }) => row.original?.referenceId?.receiptNumber || "-",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => row.original?.description || "-",
  },
  {
    header: "amount",
    cell: ({ row }) => row.original?.amount || "-",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return value ? format(new Date(value), "yyyy-MM-dd") : "-";
    },
  },
  {
    accessorKey: "branch",
    header: "Branch",
    cell: ({ row }) => row.original?.branch || "-",
  },
  {
    accessorKey: "performedByPhone",
    header: "Performed by phone",
    cell: ({ row }) => row.original?.performedBy?.phone,
  },
  {
    accessorKey: "performedByRole",
    header: "Performed role",
    cell: ({ row }) => row.original?.performedBy?.role,
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
