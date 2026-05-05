"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Download, Search } from "lucide-react";
import { useDailyCollectionReport } from "@/modules/reports/hooks";
import { toMoney } from "@/lib/money";
import { Branch } from "@/validations";

const METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  mobile_banking: "Mobile Banking",
  cheque: "Cheque",
};

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#6366f1"];

function exportCSV(date: string, data: any) {
  const rows = [
    ["Report: Daily Collection"],
    ["Date", date],
    ["Total Amount ()", toMoney(data.totalAmount, "en")],
    ["Payment Count", data.paymentCount],
    [],
    ["By Payment Method"],
    ["Method", "Amount ()"],
    ...Object.entries(data.byMethod ?? {}).map(([k, v]) => [
      METHOD_LABELS[k] ?? k,
      toMoney(v as number, "en"),
    ]),
    [],
    ["By Fee Type"],
    ["Fee Type", "Amount ()"],
    ...Object.entries(data.byFeeType ?? {}).map(([k, v]) => [
      k,
      toMoney(v as number, "en"),
    ]),
  ];

  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `daily-collection-${date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DailyCollectionPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [branch, setBranch] = useState<string>("");
  const [searched, setSearched] = useState({ date: today, branch: "" });

  const { data, isLoading, isFetching } = useDailyCollectionReport({
    date: searched.date,
    branch: searched.branch || undefined,
  });

  const report = data as any;

  const feeTypeChartData = Object.entries(report?.byFeeType ?? {}).map(([k, v]) => ({
    name: k,
    amount: Math.round((v as number) / 100),
  }));

  const methodChartData = Object.entries(report?.byMethod ?? {}).map(([k, v]) => ({
    name: METHOD_LABELS[k] ?? k,
    amount: Math.round((v as number) / 100),
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Daily Collection Report</h1>
          <p className="text-muted-foreground text-sm">Fee collections for a specific date</p>
        </div>
        {report && (
          <Button variant="outline" size="sm" onClick={() => exportCSV(searched.date, report)}>
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
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
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
              onClick={() => setSearched({ date, branch })}
              disabled={isLoading || isFetching}
            >
              <Search className="h-4 w-4 mr-2" />
              {isFetching ? "Loading…" : "Generate"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {report && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Collected
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-2xl font-bold"> {toMoney(report.totalAmount, "en")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Payments</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-2xl font-bold">{report.paymentCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Advances</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-2xl font-bold text-amber-600">
                   {toMoney(report.unallocatedTotal ?? 0, "en")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Date</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-lg font-semibold">{searched.date}</p>
                {searched.branch && <Badge variant="outline" className="mt-1">{searched.branch}</Badge>}
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">By Fee Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={feeTypeChartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={((v: number) => ` ${v.toLocaleString()}`) as any} />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {feeTypeChartData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">By Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={methodChartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={((v: number) => ` ${v.toLocaleString()}`) as any} />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">By Fee Type</CardTitle>
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
                    {Object.entries(report.byFeeType ?? {}).map(([k, v]) => (
                      <TableRow key={k}>
                        <TableCell className="font-medium">{k}</TableCell>
                        <TableCell className="text-right">{toMoney(v as number, "en")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">By Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount ()</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(report.byMethod ?? {}).map(([k, v]) => (
                      <TableRow key={k}>
                        <TableCell className="font-medium">{METHOD_LABELS[k] ?? k}</TableCell>
                        <TableCell className="text-right">{toMoney(v as number, "en")}</TableCell>
                      </TableRow>
                    ))}
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
