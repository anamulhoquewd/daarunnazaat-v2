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

// Define Props Interface
interface ColumnsProps {
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsDelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setValues: (values: any) => void;
}
export const SalariesColumns = ({
  setIsDelOpen,
  setSelectedId,
}: ColumnsProps): ColumnDef<any>[] => [
  {
    header: "Receipt number",
    cell: ({ row }) => {
      const { _id, receiptNumber } = row.original;

      return (
        <Link
          href={`/dashboard/salaries/${_id}`}
          className="text-blue-600 hover:underline font-medium"
          target="_blank"
        >
          {receiptNumber ?? "-"}
        </Link>
      );
    },
  },
  {
    accessorKey: "staffId",
    header: "Staff Id",
    cell: ({ row }) => row.original?.staffId?.staffId || "-",
  },
  {
    header: "Staff name",
    cell: ({ row }) => `${row.original?.staffId?.fullName || ""}` || "-",
  },
  {
    accessorKey: "branch",
    header: "Branch",
    cell: ({ row }) => row.original?.staffId.branch || "-",
  },
  {
    accessorKey: "staff_salary",
    header: "Staff Salary",
    cell: ({ row }) => row.original?.staffId?.baseSalary || "-",
  },
  {
    accessorKey: "designation",
    header: "Designation",
    cell: ({ row }) => row.original?.staffId?.designation || "-",
  },
  {
    accessorKey: "wahtsApp",
    header: "WhatsApp",
    cell: ({ row }) => row.original?.staffId?.phone || "-",
  },
  {
    accessorKey: "period",
    header: "Period",
    cell: ({ row }) => row.original?.period || "-",
  },
  {
    accessorKey: "salary",
    header: "Salary",
    cell: ({ row }) => row.original?.baseSalary || "-",
  },
  {
    accessorKey: "bonus",
    header: "Bonus",
    cell: ({ row }) => row.original?.bonus || "-",
  },
  {
    header: "Net Salary",
    cell: ({ row }) => row.original?.netSalary || "-",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => row.original?.status,
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
    cell: ({ row }) => row.original?.paymentMethod,
  },
  {
    accessorKey: "paymentDate",
    header: "Payment Date",
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return value ? format(new Date(value), "dd LLL yyyy") : "-";
    },
  },
  {
    accessorKey: "paidByPhone",
    header: "Paid by phone",
    cell: ({ row }) => row.original?.paidBy?.phone,
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
          <Link href={`/dashboard/salaries/edit/${row.original._id}`}>
            <DropdownMenuItem>
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
            Delete Flag
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
