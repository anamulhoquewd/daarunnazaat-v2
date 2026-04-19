import { DashboardFilterState } from "@/hooks/dashboard/useDashboard";
import {
  BatchType,
  Branch,
  ExpenseCategory,
  FeeType,
  PaymentMethod,
  PaymentStatus,
} from "@/validations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const BATCH_LABEL: Record<string, string> = {
  [BatchType.JANUARY_DECEMBER]: "January - December",
  [BatchType.RAMADAN_RAMADAN]: "Ramadan - Ramadan",
};

export const BRANCH_LABEL: Record<string, string> = {
  [Branch.BALIKA_BRANCH]: "Balika Branch",
  [Branch.BALOK_BRANCH]: "Balok Branch",
};

export const FEE_TYPE_LABEL: Record<string, string> = {
  [FeeType.ADMISSION]: "Admission Fee",
  [FeeType.MONTHLY]: "Monthly Fee",
  [FeeType.COACHING]: "Coaching Fee",
  [FeeType.DAYCARE]: "Daycare Fee",
  [FeeType.RESIDENTIAL]: "Residential Fee",
  [FeeType.MEAL]: "Meal Fee",
  [FeeType.UTILITY]: "Utility Fee",
  [FeeType.OTHER]: "Other Fee",
};

export const EXPENSE_CATEGORY_LABEL: Record<string, string> = {
  [ExpenseCategory.RENT]: "Rent",
  [ExpenseCategory.ELECTRICITY]: "Electricity",
  [ExpenseCategory.GAS]: "Gas",
  [ExpenseCategory.WATER]: "Water",
  [ExpenseCategory.SUPPLIES]: "Supplies",
  [ExpenseCategory.TRAVEL]: "Travel",
  [ExpenseCategory.MARKETING]: "Marketing",
  [ExpenseCategory.EXOSORIZE]: "Exosorize",
  [ExpenseCategory.OTHER]: "Other",
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  [PaymentMethod.CASH]: "Cash",
  [PaymentMethod.BANK_TRANSFER]: "Bank Transfer",
  [PaymentMethod.MOBILE_BANKING]: "Mobile Banking",
  [PaymentMethod.CHEQUE]: "Cheque",
};

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  [PaymentStatus.PAID]: "Paid",
  [PaymentStatus.PARTIAL]: "Partial",
  [PaymentStatus.DUE]: "Due",
  [PaymentStatus.OVERDUE]: "Overdue",
};

function FilterPanel({
  filters,
  setFilter,
  resetFilters,
  activeFilterCount,
  sessionOptions,
}: {
  filters: DashboardFilterState;
  setFilter: (key: keyof DashboardFilterState, value: string) => void;
  resetFilters: () => void;
  activeFilterCount: number;
  sessionOptions: Array<{
    _id: string;
    sessionName: string;
    batchType: string;
  }>;
}) {
  return (
    <Card className="border-dashed">
      <CardHeader className="px-5 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">
              Dashboard Filters
            </CardTitle>
            {activeFilterCount > 0 ? (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount} active
              </Badge>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-8 text-xs"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Search</Label>
            <Input
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)}
              placeholder="Receipt, student, voucher..."
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Session</Label>
            <Select
              value={filters.sessionId}
              onValueChange={(value) => setFilter("sessionId", value)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                {sessionOptions.map((session) => (
                  <SelectItem key={session._id} value={session._id}>
                    {session.sessionName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Batch</Label>
            <Select
              value={filters.batchType}
              onValueChange={(value) => setFilter("batchType", value)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                {Object.values(BatchType).map((batch) => (
                  <SelectItem key={batch} value={batch}>
                    {BATCH_LABEL[batch]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Branch</Label>
            <Select
              value={filters.branch}
              onValueChange={(value) => setFilter("branch", value)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {Object.values(Branch).map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    {BRANCH_LABEL[branch]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Fee Type</Label>
            <Select
              value={filters.feeType}
              onValueChange={(value) => setFilter("feeType", value)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fee Types</SelectItem>
                {Object.values(FeeType).map((feeType) => (
                  <SelectItem key={feeType} value={feeType}>
                    {FEE_TYPE_LABEL[feeType]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Expense Category
            </Label>
            <Select
              value={filters.expenseCategory}
              onValueChange={(value) => setFilter("expenseCategory", value)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.values(ExpenseCategory).map((category) => (
                  <SelectItem key={category} value={category}>
                    {EXPENSE_CATEGORY_LABEL[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Payment Method
            </Label>
            <Select
              value={filters.paymentMethod}
              onValueChange={(value) => setFilter("paymentMethod", value)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {Object.values(PaymentMethod).map((method) => (
                  <SelectItem key={method} value={method}>
                    {PAYMENT_METHOD_LABEL[method]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Payment Status
            </Label>
            <Select
              value={filters.paymentStatus}
              onValueChange={(value) => setFilter("paymentStatus", value)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.values(PaymentStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {PAYMENT_STATUS_LABEL[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Salary Status
            </Label>
            <Select
              value={filters.salaryStatus}
              onValueChange={(value) => setFilter("salaryStatus", value)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Salary Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Transaction Type
            </Label>
            <Select
              value={filters.transactionType}
              onValueChange={(value) => setFilter("transactionType", value)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="salary">Salary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Period</Label>
            <Input
              value={filters.period}
              onChange={(e) => setFilter("period", e.target.value)}
              placeholder="YYYY-MM"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Date From</Label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilter("dateFrom", e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Date To</Label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilter("dateTo", e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Min Amount</Label>
            <Input
              type="number"
              value={filters.amountMin}
              onChange={(e) => setFilter("amountMin", e.target.value)}
              placeholder="0"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Max Amount</Label>
            <Input
              type="number"
              value={filters.amountMax}
              onChange={(e) => setFilter("amountMax", e.target.value)}
              placeholder="50000"
              className="h-9 text-xs"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default FilterPanel;
