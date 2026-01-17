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
export const SalariesColumns = ({
  setIsEditing,
  setIsDelOpen,
  setValues,
  setSelectId,
}: ColumnsProps): ColumnDef<any>[] => [
  {
    header: "Receipt number",
    cell: ({ row }) => row.original?.receiptNumber || "-",
  },
  {
    accessorKey: "staffId",
    header: "Staff Id",
    cell: ({ row }) => row.original?.staffId?.staffId || "-",
  },
  {
    header: "Staff name",
    cell: ({ row }) =>
      `${row.original?.staffId?.firstName || ""} ${
        row.original?.staffId?.lastName || ""
      }`,
  },
  {
    accessorKey: "branch",
    header: "Branch",
    cell: ({ row }) => row.original?.staffId.branch || "-",
  },
  {
    accessorKey: "staff_salary",
    header: "Staff Salary",
    cell: ({ row }) => row.original?.staffId?.basicSalary || "-",
  },
  {
    accessorKey: "designation",
    header: "Designation",
    cell: ({ row }) => row.original?.staffId?.designation || "-",
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => row.original?.staffId.gender || "-",
  },
  {
    accessorKey: "wahtsApp",
    header: "WhatsApp",
    cell: ({ row }) => row.original?.staffId?.phone || "-",
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
    accessorKey: "salary",
    header: "Salary",
    cell: ({ row }) => row.original?.basicSalary || "-",
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
      return value ? format(new Date(value), "yyyy-MM-dd") : "-";
    },
  },
  {
    accessorKey: "paidByPhone",
    header: "Paid by phone",
    cell: ({ row }) => row.original?.paidBy?.phone,
  },
  {
    accessorKey: "paidByRole",
    header: "Paid by role",
    cell: ({ row }) => row.original?.paidBy?.role,
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
