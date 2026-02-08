import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MONTHS } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

// Define Props Interface
interface ColumnsProps {
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsDelOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export const FeesColumns = ({
  setIsDelOpen,
  setSelectedId,
}: ColumnsProps): ColumnDef<any>[] => [
  {
    header: "Receipt number",
    cell: ({ row }) => {
      const { _id, receiptNumber } = row.original;

      return (
        <Link
          href={`/dashboard/fees/${_id}`}
          target="_blank"
          className="text-blue-600 hover:underline font-medium"
        >
          {receiptNumber ?? "-"}
        </Link>
      );
    },
  },
  {
    header: "Student Id",
    cell: ({ row }) => row.original?.studentId?.studentId || "-",
  },
  {
    header: "Student name",
    cell: ({ row }) =>
      `${row.original?.studentId?.firstName || ""} ${
        row.original?.studentId?.lastName || ""
      }`,
  },
  {
    accessorKey: "branch",
    header: "Branch",
    cell: ({ row }) => row.original?.branch || "-",
  },
  {
    accessorKey: "session",
    header: "Session",
    cell: ({ row }) => row.original?.sessionId?.sessionName || "-",
  },
  {
    accessorKey: "feeType",
    header: "Fee type",
    cell: ({ row }) => row.original?.feeType || "-",
  },
  {
    accessorKey: "baseAmount",
    header: "Base",
    cell: ({ row }) => row.original?.baseAmount || "-",
  },
  {
    accessorKey: "payableAmount",
    header: "Payable",
    cell: ({ row }) => row.original?.payableAmount || "-",
  },
  {
    accessorKey: "received",
    header: "Received",
    cell: ({ row }) => row.original?.receivedAmount || "-",
  },
  {
    accessorKey: "dueAmount",
    header: "Due",
    cell: ({ row }) => row.original?.dueAmount || "-",
  },
  {
    accessorKey: "paymentDate",
    header: "Payment Date",
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return value ? format(new Date(value), "yyyy-MM-dd") : "-";
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
    cell: ({ row }) => row.original?.paymentMethod,
  },
  {
    header: "Month",
    cell: ({ row }) => {
      const { month } = row.original;

      return <div>{MONTHS[month] ?? "-"}</div>;
    },
  },
  {
    accessorKey: "year",
    header: "Year",
    cell: ({ row }) => row.original?.year || "-",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => row.original?.paymentStatus,
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => row.original?.paymentSource,
  },
  {
    accessorKey: "collectedByPhone",
    header: "collected by phone",
    cell: ({ row }) => row.original?.collectedBy?.phone,
  },
  {
    accessorKey: "collectedByRole",
    header: "Collect role",
    cell: ({ row }) => row.original?.collectedBy?.role,
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
          <Link
            target="_blank"
            href={`/dashboard/fees/edit/${row.original._id}`}
          >
            <DropdownMenuItem
            // onClick={() => {
            //   setValues(row.original);
            //   setSelectedId(row.original._id);
            //   setIsEditing(true);
            // }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          </Link>

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
