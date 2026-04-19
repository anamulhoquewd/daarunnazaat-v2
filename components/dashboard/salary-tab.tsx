import {
  BRANCH_LABEL,
  PAYMENT_METHOD_LABEL,
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
import { AlertCircle, ArrowDownCircle, Users, Wallet } from "lucide-react";

export const statusBadgeVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  paid: "default",
  partial: "secondary",
  due: "destructive",
  overdue: "destructive",
  pending: "outline",
};

export const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(n || 0);

export const formatDate = (value?: string) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const prettify = (value?: string) =>
  (value || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

function SalaryTab({ dashboard }: { dashboard: DashboardResponseData | null }) {
  const chartData = dashboard?.charts;
  const records = dashboard?.records;

  const salaryRecords = records?.salaries || [];

  return (
    <TabsContent value="salary" className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Paid Salary"
          value={fmtCurrency(
            salaryRecords
              .filter((salary) => salary.status === "paid")
              .reduce((sum, salary) => sum + salary.netSalary, 0),
          )}
          sub={`${salaryRecords.filter((salary) => salary.status === "paid").length} staff`}
          icon={<ArrowDownCircle className="h-4 w-4 text-emerald-600" />}
          variant="success"
        />
        <StatCard
          label="Pending Salary"
          value={fmtCurrency(
            salaryRecords
              .filter((salary) => salary.status === "pending")
              .reduce((sum, salary) => sum + salary.netSalary, 0),
          )}
          sub={`${salaryRecords.filter((salary) => salary.status === "pending").length} staff`}
          icon={<AlertCircle className="h-4 w-4 text-amber-500" />}
          variant="warning"
        />
        <StatCard
          label="Bonus"
          value={fmtCurrency(
            salaryRecords.reduce((sum, salary) => sum + salary.bonus, 0),
          )}
          sub="Filtered bonus total"
          icon={<Wallet className="h-4 w-4 text-violet-500" />}
        />
        <StatCard
          label="Salary Records"
          value={`${salaryRecords.length}`}
          sub="Current filtered result"
          icon={<Users className="h-4 w-4 text-teal-500" />}
        />
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Salary Payment Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead className="text-right">Base</TableHead>
                  <TableHead className="text-right">Bonus</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryRecords.length ? (
                  salaryRecords.map((salary) => (
                    <TableRow key={salary._id}>
                      <TableCell className="font-mono text-xs">
                        {salary.receiptNumber}
                      </TableCell>
                      <TableCell>{salary.staffId?.fullName || "--"}</TableCell>
                      <TableCell>
                        {salary.staffId?.designation || "--"}
                      </TableCell>
                      <TableCell>{salary.period}</TableCell>
                      <TableCell>
                        {BRANCH_LABEL[salary.branch] || salary.branch}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmtCurrency(salary.baseSalary)}
                      </TableCell>
                      <TableCell className="text-right text-violet-600">
                        {fmtCurrency(salary.bonus)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-blue-700">
                        {fmtCurrency(salary.netSalary)}
                      </TableCell>
                      <TableCell>
                        {PAYMENT_METHOD_LABEL[salary.paymentMethod] ||
                          prettify(salary.paymentMethod)}
                      </TableCell>
                      <TableCell>{formatDate(salary.paymentDate)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            statusBadgeVariant[salary.status] || "outline"
                          }
                          className="capitalize"
                        >
                          {salary.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No salary records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={5}>Total</TableCell>
                  <TableCell className="text-right">
                    {fmtCurrency(
                      salaryRecords.reduce(
                        (sum, salary) => sum + salary.baseSalary,
                        0,
                      ),
                    )}
                  </TableCell>
                  <TableCell className="text-right text-violet-600">
                    {fmtCurrency(
                      salaryRecords.reduce(
                        (sum, salary) => sum + salary.bonus,
                        0,
                      ),
                    )}
                  </TableCell>
                  <TableCell className="text-right text-blue-700">
                    {fmtCurrency(
                      salaryRecords.reduce(
                        (sum, salary) => sum + salary.netSalary,
                        0,
                      ),
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

export default SalaryTab;
