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
import Link from "next/link";
import { Separator } from "../ui/separator";
import PaymentReceiver from "./paymentReceiver";
import ShowItems from "./showItems";

// Define Props Interface
interface ColumnsProps {
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsDelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  deleteFlag: (feeId: string) => Promise<void>;
  restoreExpense: (feeId: string) => Promise<void>;
}
export const ExpensesColumns = ({
  setIsDelOpen,
  setSelectedId,

  deleteFlag,
  restoreExpense,
}: ColumnsProps): ColumnDef<any>[] => [
  {
    header: "voucher number",
    cell: ({ row }) => {
      const { _id, voucherNumber } = row.original;

      return (
        <Link
          href={`/dashboard/expenses/${_id}`}
          className="text-blue-600 hover:underline font-medium"
          target="_blank"
        >
          {voucherNumber ?? "-"}
        </Link>
      );
    },
  },
  {
    header: "Category",
    cell: ({ row }) => row.original?.category || "-",
  },
  {
    header: "items",
    cell: ({ row }) => {
      return row.original?.items ? <ShowItems expense={row.original} />: "_";
    },
  },
  {
    accessorKey: "branch",
    header: "Branch",
    cell: ({ row }) => row.original?.branch || "-",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => row.original?.description || "-",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => row.original?.amount || "-",
  },
  {
    accessorKey: "expenseDate",
    header: "Expense Date",
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return value ? format(new Date(value), "dd LLL yyyy") : "-";
    },
  },
  {
    accessorKey: "paidTo",
    header: "Paid To",
    cell: ({ row }) => {
      return <PaymentReceiver expense={row.original} />;
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
    cell: ({ row }) => row.original?.paymentMethod,
  },
  {
    accessorKey: "createdBy",
    header: "Created by phone",
    cell: ({ row }) => row.original?.createdBy?.phone,
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
          <Link href={`/dashboard/expenses/edit/${row.original._id}`}>
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          </Link>

          <DropdownMenuItem
            onClick={() => {
              if (row.original.isDeleted) {
                restoreExpense!(row.original._id);
              } else {
                deleteFlag!(row.original._id);
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
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
