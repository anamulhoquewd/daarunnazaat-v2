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

// Define Props Interface
interface ColumnsProps {
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsDelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setValues: (values: any) => void;
}
export const FeesColumns = ({
  setIsEditing,
  setIsDelOpen,
  setValues,
  setSelectId,
}: ColumnsProps): ColumnDef<any>[] => [
  {
    header: "Receipt number",
    cell: ({ row }) => row.original.receiptNumber || "-",
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
    accessorKey: "monthlyFee",
    header: "Monthly Fee",
    cell: ({ row }) => row.original?.studentId?.monthlyFee || "-",
  },
  {
    accessorKey: "mealFee",
    header: "Meal Fee",
    cell: ({ row }) => row.original?.studentId?.mealFee || "-",
  },
  {
    accessorKey: "residentialFee",
    header: "Residential Fee",
    cell: ({ row }) => row.original?.studentId?.residentialFee || "-",
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
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => row.original?.amount || "-",
  },
  {
    accessorKey: "discount",
    header: "Discount",
    cell: ({ row }) => row.original?.discount || "-",
  },
  {
    accessorKey: "paidAmount",
    header: "Paid amount",
    cell: ({ row }) => row.original?.paidAmount || "-",
  },
  {
    accessorKey: "dueAmount",
    header: "Due amount",
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
    cell: ({ row }) => row.original?.month || "-",
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
          <DropdownMenuItem
            onClick={() => {
              setValues(row.original);
              setSelectId(row.original._id);
              setIsEditing(true);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-destructive"
            onClick={() => {
              setSelectId(row.original._id);
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
