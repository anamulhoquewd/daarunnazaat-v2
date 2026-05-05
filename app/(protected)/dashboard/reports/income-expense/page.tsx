"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { Download, Search, TrendingUp, TrendingDown } from "lucide-react";
import { usePLReport } from "@/modules/reports/hooks";
import { toMoney } from "@/lib/money";
import { Branch } from "@/validations";

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" },
  { value: 3, label: "March" }, { value: 4, label: "April" },
  { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" },
  { value: 9, label: "September" }, { value: 10, label: "October" },
  { value: 11, label: "November" }, { value: 12, label: "December" },
];

const INCOME_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#ec4899", "#8b5cf6"];
const EXPENSE_COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#06b6d4", "#a855f7"];

function exportCSV(params: any, report: any) {
  const monthLabel = MONTHS.find((m) => m.value === params.periodMonth)?.label;
  const rows = [
    ["Report: Income vs Expense (P&L)"],
    ["Period", `${monthLabel} ${params.periodYear}`],
    ["Branch", params.branch ?? "All"],
    [],
    ["Summary"],
    ["Total Income ()", toMoney(report.income, "en")],
    ["Total Expense ()", toMoney(report.expense, "en")],
    ["Net ()", toMoney(report.net, "en")],
    [],
    ["Income by Fee Type"],
    ["Fee Type", "Amount ()"],
    ...Object.entries(report.incomeByFeeType ?? {}).map(([k, v]) => [k, toMoney(v as number, "en")]),
    [],
    ["Expense by Category"],
    ["Category", "Amount ()"],
    ...Object.entries(report.expenseByCategory ?? {}).map(([k, v]) => [k, toMoney(v as number, "en")]),
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pl-${params.periodYear}-${String(params.periodMonth).padStart(2, "0")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const nowYear = new Date().getFullYear();
const nowMonth = new Date().getMonth() + 1;

export default function IncomeExpensePage() {
  const [periodYear, setPeriodYear] = useState(nowYear);
  const [periodMonth, setPeriodMonth] = useState(nowMonth);
  const [branch, setBranch] = useState("");
  const [searched, setSearched] = useState({ periodYear: nowYear, periodMonth: nowMonth, branch: "" });

  const { data, isLoading, isFetching } = usePLReport({
    periodYear: searched.periodYear,
    periodMonth: searched.periodMonth,
    branch: searched.branch || undefined,
  });

  const report = data as any;

  const summaryChartData = report
    ? [
        { name: "Income", value: Math.round(report.income / 100), fill: "#10b981" },
        { name: "Expense", value: Math.round(report.expense / 100), fill: "#ef4444" },
        { name: "Net", value: Math.round(Math.abs(report.net) / 100), fill: report.net >= 0 ? "#3b82f6" : "#f97316" },
      ]
    : [];

  const incomeBreakdown = Object.entries(report?.incomeByFeeType ?? {}).map(([k, v]) => ({
    name: k,
    amount: Math.round((v as number) / 100),
  }));

  const expenseBreakdown = Object.entries(report?.expenseByCategory ?? {}).map(([k, v]) => ({
    name: k,
    amount: Math.round((v as number) / 100),
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Income vs Expense</h1>
          <p className="text-muted-foreground text-sm">Monthly profit & loss statement</p>
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
            <Button
              onClick={() => setSearched({ periodYear, periodMonth, branch })}
              disabled={isFetching}
            >
              <Search className="h-4 w-4 mr-2" />
              {isFetching ? "Loading…" : "Generate"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {report && (
        <>
          {/* P&L summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-200">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Total Income
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-2xl font-bold text-green-600"> {toMoney(report.income, "en")}</p>
              </CardContent>
            </Card>
            <Card className="border-red-200">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  Total Expense
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-2xl font-bold text-red-600"> {toMoney(report.expense, "en")}</p>
              </CardContent>
            </Card>
            <Card className={report.net >= 0 ? "border-blue-200" : "border-orange-200"}>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Net {report.net >= 0 ? "Surplus" : "Deficit"}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className={`text-2xl font-bold ${report.net >= 0 ? "text-blue-600" : "text-orange-600"}`}>
                  {report.net < 0 ? "−" : "+"} {toMoney(Math.abs(report.net), "en")}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Summary chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Income / Expense / Net ( taka)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={summaryChartData}>
                  <XAxis dataKey="name" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={((v: number) => ` ${v.toLocaleString()}`) as any} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {summaryChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Breakdown tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-green-700">Income Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fee Type</TableHead>
                      <TableHead className="text-right">Amount ()</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomeBreakdown.map((r) => (
                      <TableRow key={r.name}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell className="text-right text-green-600">
                          {r.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {incomeBreakdown.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground py-4">
                          No income recorded
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base text-red-700">Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount ()</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenseBreakdown.map((r) => (
                      <TableRow key={r.name}>
                        <TableCell className="font-medium capitalize">{r.name}</TableCell>
                        <TableCell className="text-right text-red-600">
                          {r.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {expenseBreakdown.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground py-4">
                          No expenses recorded
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
