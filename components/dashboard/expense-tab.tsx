import {
  fmtCurrency,
  formatDate,
  prettify,
} from "@/components/dashboard/salary-tab";
import {
  EXPENSE_CATEGORY_LABEL,
  PAYMENT_METHOD_LABEL,
} from "@/components/dashboard/filter-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { DashboardResponseData } from "@/hooks/dashboard/useDashboard";

function ExpenseTab({
  dashboard,
}: {
  dashboard: DashboardResponseData | null;
}) {
  const chartData = dashboard?.charts;
  const records = dashboard?.records;

  const expenseRecords = records?.expenses || [];

  return (
    <TabsContent value="expenses" className="mt-4 space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Expense Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Voucher</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseRecords.length ? (
                  expenseRecords.map((expense) => (
                    <TableRow key={expense._id}>
                      <TableCell className="font-mono text-xs">
                        {expense.voucherNumber}
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>
                        {EXPENSE_CATEGORY_LABEL[expense.category] ||
                          prettify(expense.category)}
                      </TableCell>
                      <TableCell>
                        {/* {expense?.branch?.length
                        ? expense.branch.map((branch) => BRANCH_LABEL[branch] || branch).join(", ")
                        : "N/A"} */}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-red-500">
                        {fmtCurrency(expense.amount)}
                      </TableCell>
                      <TableCell>
                        {PAYMENT_METHOD_LABEL[expense.paymentMethod] ||
                          prettify(expense.paymentMethod)}
                      </TableCell>
                      <TableCell>{formatDate(expense.expenseDate)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No expense records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4}>Total</TableCell>
                  <TableCell className="text-right text-red-500">
                    {fmtCurrency(
                      expenseRecords.reduce(
                        (sum, expense) => sum + expense.amount,
                        0,
                      ),
                    )}
                  </TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

export default ExpenseTab;
