import {
  fmtCurrency,
  formatDate,
  prettify,
} from "@/components/dashboard/salary-tab";
import {
  BRANCH_LABEL,
  FEE_TYPE_LABEL,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
} from "@/components/dashboard/filter-panel";
import StatCard from "@/components/dashboard/stateCard";
import { Badge } from "@/components/ui/badge";
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
import { AlertCircle, ArrowDownCircle, TrendingDown } from "lucide-react";
import { statusBadgeVariant } from "./salary-tab";

function FeesTabe({ dashboard }: { dashboard: DashboardResponseData | null }) {
  const chartData = dashboard?.charts;
  const records = dashboard?.records;

  const feeStatusCards = chartData?.feeStatusBreakdown || [];
  const feeRecords = records?.fees || [];

  return (
    <TabsContent value="fees" className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {feeStatusCards.map((item) => (
          <StatCard
            key={item.key}
            label={PAYMENT_STATUS_LABEL[item.key] || prettify(item.label)}
            value={fmtCurrency(
              item.key === "due" || item.key === "overdue"
                ? item.due || 0
                : item.amount || 0,
            )}
            sub={`${item.count || 0} records`}
            icon={
              item.key === "paid" ? (
                <ArrowDownCircle className="h-4 w-4 text-emerald-600" />
              ) : item.key === "partial" ? (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )
            }
            variant={
              item.key === "paid"
                ? "success"
                : item.key === "partial"
                  ? "warning"
                  : "danger"
            }
          />
        ))}
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Fee Collection Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  <TableHead className="text-right">Due</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeRecords.length ? (
                  feeRecords.map((fee) => (
                    <TableRow key={fee._id}>
                      <TableCell className="font-mono text-xs">
                        {fee.receiptNumber}
                      </TableCell>
                      <TableCell>{fee.studentId?.fullName || "--"}</TableCell>
                      <TableCell>
                        {FEE_TYPE_LABEL[fee.feeType] || prettify(fee.feeType)}
                      </TableCell>
                      <TableCell>
                        {fee.sessionId?.sessionName || fee.period || "--"}
                      </TableCell>
                      <TableCell>
                        {BRANCH_LABEL[fee.branch] || fee.branch}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-emerald-700">
                        {fmtCurrency(fee.receivedAmount)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-red-500">
                        {fmtCurrency(fee.dueAmount)}
                      </TableCell>
                      <TableCell>
                        {PAYMENT_METHOD_LABEL[fee.paymentMethod] ||
                          prettify(fee.paymentMethod)}
                      </TableCell>
                      <TableCell>{formatDate(fee.paymentDate)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            statusBadgeVariant[fee.paymentStatus] || "outline"
                          }
                          className="capitalize"
                        >
                          {PAYMENT_STATUS_LABEL[fee.paymentStatus] ||
                            fee.paymentStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No fee records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={5}>Total</TableCell>
                  <TableCell className="text-right text-emerald-700">
                    {fmtCurrency(
                      feeRecords.reduce(
                        (sum, fee) => sum + fee.receivedAmount,
                        0,
                      ),
                    )}
                  </TableCell>
                  <TableCell className="text-right text-red-500">
                    {fmtCurrency(
                      feeRecords.reduce((sum, fee) => sum + fee.dueAmount, 0),
                    )}
                  </TableCell>
                  <TableCell colSpan={3} />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

export default FeesTabe;
