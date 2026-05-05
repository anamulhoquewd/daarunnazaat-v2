"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { Download, Search } from "lucide-react";
import { useFeeStatusReport } from "@/modules/reports/hooks";
import { toMoney } from "@/lib/money";
import { Branch, InvoiceStatus } from "@/validations";

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" },
  { value: 3, label: "March" }, { value: 4, label: "April" },
  { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" },
  { value: 9, label: "September" }, { value: 10, label: "October" },
  { value: 11, label: "November" }, { value: 12, label: "December" },
];

const STATUS_COLORS: Record<string, string> = {
  [InvoiceStatus.PAID]: "#16a34a",
  [InvoiceStatus.PARTIAL]: "#d97706",
  [InvoiceStatus.UNPAID]: "#dc2626",
  [InvoiceStatus.VOID]: "#6b7280",
};

const STATUS_LABELS: Record<string, string> = {
  paid: "Paid",
  partial: "Partial",
  unpaid: "Unpaid",
  void: "Void",
};

function exportCSV(params: any, data: any) {
  const rows = [
    ["Report: Monthly Fee Status"],
    ["Period", `${MONTHS.find((m) => m.value === params.periodMonth)?.label} ${params.periodYear}`],
    [],
    ["Summary"],
    ["Total Invoices", data.summary.total],
    ["Paid", data.summary.paid],
    ["Partial", data.summary.partial],
    ["Unpaid", data.summary.unpaid],
    ["Total Due ()", toMoney(data.summary.totalDue, "en")],
    [],
    ["Student Name", "Class", "Branch", "Net Payable", "Paid Amount", "Due Amount", "Status"],
    ...data.data.map((r: any) => [
      r.studentName,
      r.className,
      r.branch,
      toMoney(r.netPayable, "en"),
      toMoney(r.paidAmount, "en"),
      toMoney(r.dueAmount, "en"),
      r.status,
    ]),
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fee-status-${params.periodYear}-${String(params.periodMonth).padStart(2, "0")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const nowYear = new Date().getFullYear();
const nowMonth = new Date().getMonth() + 1;

export default function FeeStatusPage() {
  const [periodYear, setPeriodYear] = useState(nowYear);
  const [periodMonth, setPeriodMonth] = useState(nowMonth);
  const [branch, setBranch] = useState("");
  const [onlyDue, setOnlyDue] = useState(false);
  const [searched, setSearched] = useState({ periodYear: nowYear, periodMonth: nowMonth, branch: "", onlyDue: false });

  const { data, isLoading, isFetching } = useFeeStatusReport({
    periodYear: searched.periodYear,
    periodMonth: searched.periodMonth,
    branch: searched.branch || undefined,
    onlyDue: searched.onlyDue,
  });

  const report = data as any;

  const pieData = report
    ? [
        { name: "Paid", value: report.summary.paid, color: "#16a34a" },
        { name: "Partial", value: report.summary.partial, color: "#d97706" },
        { name: "Unpaid", value: report.summary.unpaid, color: "#dc2626" },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monthly Fee Status</h1>
          <p className="text-muted-foreground text-sm">Payment status for all monthly invoices</p>
        </div>
        {report && (
          <Button variant="outline" size="sm" onClick={() => exportCSV(searched, report)}>
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
              <label className="text-sm font-medium">Year</label>
              <Select value={String(periodYear)} onValueChange={(v) => setPeriodYear(Number(v))}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[nowYear - 1, nowYear, nowYear + 1].map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Month</label>
              <Select value={String(periodMonth)} onValueChange={(v) => setPeriodMonth(Number(v))}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <div className="flex items-center gap-2 mt-5">
              <Switch id="only-due" checked={onlyDue} onCheckedChange={setOnlyDue} />
              <Label htmlFor="only-due" className="text-sm">Due only</Label>
            </div>
            <Button
              onClick={() => setSearched({ periodYear, periodMonth, branch, onlyDue })}
              disabled={isFetching}
              className="mt-5"
            >
              <Search className="h-4 w-4 mr-2" />
              {isFetching ? "Loading…" : "Generate"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {report && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Invoices", value: report.summary.total, color: "" },
              { label: "Paid", value: report.summary.paid, color: "text-green-600" },
              { label: "Partial", value: report.summary.partial, color: "text-amber-600" },
              { label: "Unpaid", value: report.summary.unpaid, color: "text-red-600" },
            ].map((s) => (
              <Card key={s.label}>
                <CardHeader className="pb-1 pt-4 px-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Money summary + chart */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { label: "Total Net Payable", value: report.summary.totalNetPayable, color: "" },
                    { label: "Total Paid", value: report.summary.totalPaid, color: "text-green-600" },
                    { label: "Total Outstanding", value: report.summary.totalDue, color: "text-red-600" },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between py-2 border-b last:border-0">
                      <span className="text-sm text-muted-foreground">{r.label}</span>
                      <span className={`font-semibold ${r.color}`}> {toMoney(r.value, "en")}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={65}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Data table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Student Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead className="text-right">Net Payable</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Due</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.data.map((row: any) => (
                      <TableRow key={row.invoiceId}>
                        <TableCell className="font-medium">{row.studentName}</TableCell>
                        <TableCell>{row.className}</TableCell>
                        <TableCell>{row.branch}</TableCell>
                        <TableCell className="text-right">{toMoney(row.netPayable, "en")}</TableCell>
                        <TableCell className="text-right text-green-600">
                          {toMoney(row.paidAmount, "en")}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${row.dueAmount > 0 ? "text-red-600" : "text-green-600"}`}>
                          {row.dueAmount < 0 ? "CR " : ""}
                          {toMoney(Math.abs(row.dueAmount), "en")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            style={{ backgroundColor: STATUS_COLORS[row.status] + "22", color: STATUS_COLORS[row.status] }}
                          >
                            {STATUS_LABELS[row.status] ?? row.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {report.data.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No invoices found for this period
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
