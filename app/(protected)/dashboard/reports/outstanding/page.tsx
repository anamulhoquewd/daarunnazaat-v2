"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Download, AlertTriangle } from "lucide-react";
import { useOutstandingReport } from "@/modules/reports/hooks";
import { toMoney } from "@/lib/money";
import { Branch, InvoiceStatus } from "@/validations";

const MONTHS = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatPeriod(year?: number | null, month?: number | null): string {
  if (!year || !month) return "—";
  return `${MONTHS[month]} ${year}`;
}

function exportCSV(data: any) {
  const rows = [
    ["Report: Outstanding Dues"],
    [],
    ["Invoice No", "Student", "Branch", "Class", "Type", "Period", "Net Payable", "Paid", "Due", "Days Overdue", "Status"],
    ...data.data.map((r: any) => [
      r.invoiceNumber,
      r.studentName,
      r.branch,
      r.className,
      r.invoiceType,
      formatPeriod(r.periodYear, r.periodMonth),
      toMoney(r.netPayable, "en"),
      toMoney(r.paidAmount, "en"),
      toMoney(r.dueAmount, "en"),
      r.daysOverdue,
      r.status,
    ]),
    [],
    ["Total Due ()", toMoney(data.totalDue, "en")],
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `outstanding-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const today = new Date().toISOString().slice(0, 10);

export default function OutstandingPage() {
  const [branch, setBranch] = useState("");
  const [asOfDate, setAsOfDate] = useState(today);
  const [searched, setSearched] = useState({ branch: "", asOfDate: today });

  const { data, isLoading, isFetching, refetch } = useOutstandingReport({
    branch: searched.branch || undefined,
    asOfDate: searched.asOfDate,
  });

  const report = data as any;

  // Group by branch for chart
  const branchChart = Object.entries(
    (report?.data ?? []).reduce((acc: any, r: any) => {
      acc[r.branch] = (acc[r.branch] ?? 0) + r.dueAmount;
      return acc;
    }, {}),
  ).map(([name, amount]) => ({ name, amount: Math.round((amount as number) / 100) }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Outstanding Dues</h1>
          <p className="text-muted-foreground text-sm">All unpaid and partial invoices</p>
        </div>
        {report && (
          <Button variant="outline" size="sm" onClick={() => exportCSV(report)}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex gap-3 flex-wrap items-end">
            <div className="space-y-1">
              <label className="text-sm font-medium">As of Date</label>
              <Input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Branch</label>
              <Select value={branch} onValueChange={setBranch}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Branches</SelectItem>
                  {Object.values(Branch).map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => setSearched({ branch, asOfDate })}
              disabled={isFetching}
            >
              {isFetching ? "Loading…" : "Refresh"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {report && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Outstanding</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-2xl font-bold text-red-600"> {toMoney(report.totalDue, "en")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Invoice Count</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-2xl font-bold">{report.data.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-2xl font-bold text-amber-600">
                  {report.data.filter((r: any) => r.daysOverdue > 0).length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          {branchChart.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Outstanding by Branch ( taka)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={branchChart}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={((v: number) => ` ${v.toLocaleString()}`) as any} />
                    <Bar dataKey="amount" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invoice Detail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Branch / Class</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Net Payable</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Due</TableHead>
                      <TableHead className="text-right">Overdue</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.data.map((row: any) => (
                      <TableRow key={row.invoiceId} className={row.daysOverdue > 30 ? "bg-red-50" : ""}>
                        <TableCell className="font-mono text-xs">{row.invoiceNumber}</TableCell>
                        <TableCell className="font-medium">{row.studentName}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {row.branch}<br />{row.className}
                        </TableCell>
                        <TableCell className="text-xs">
                          {formatPeriod(row.periodYear, row.periodMonth)}
                        </TableCell>
                        <TableCell className="text-right">{toMoney(row.netPayable, "en")}</TableCell>
                        <TableCell className="text-right text-green-600">
                          {toMoney(row.paidAmount, "en")}
                        </TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          {toMoney(row.dueAmount, "en")}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.daysOverdue > 0 ? (
                            <span className="flex items-center justify-end gap-1 text-amber-600">
                              <AlertTriangle className="h-3 w-3" />
                              {row.daysOverdue}d
                            </span>
                          ) : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={row.status === InvoiceStatus.PARTIAL ? "outline" : "destructive"}>
                            {row.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {report.data.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                          No outstanding invoices
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
