import {
  fmtCurrency,
  formatDate,
  prettify,
} from "@/components/dashboard/salary-tab";
import {
  BRANCH_LABEL,
  PAYMENT_METHOD_LABEL,
} from "@/components/dashboard/filter-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { DashboardResponseData } from "@/hooks/dashboard/useDashboard";

function TransactionTab({
  dashboard,
}: {
  dashboard: DashboardResponseData | null;
}) {
  const chartData = dashboard?.charts;
  const records = dashboard?.records;

  const recentTransactions = records?.transactions || [];

  return (
    <TabsContent value="transactions" className="mt-4 space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.length ? (
                  recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className="capitalize">
                        {transaction.type}
                      </TableCell>
                      <TableCell>{transaction.reference}</TableCell>
                      <TableCell>
                        {BRANCH_LABEL[transaction.branch || ""] ||
                          transaction.branch ||
                          "--"}
                      </TableCell>
                      <TableCell>
                        {PAYMENT_METHOD_LABEL[transaction.method || ""] ||
                          prettify(transaction.method)}
                      </TableCell>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {fmtCurrency(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

export default TransactionTab;
