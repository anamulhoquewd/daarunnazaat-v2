"use client";

import { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Loader2, FileDown } from "lucide-react";
import { toMoney } from "@/lib/money";
import { InvoiceStatus } from "@/validations";

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",
];

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  paid: "default",
  partial: "secondary",
  unpaid: "destructive",
  void: "outline",
};

const nowYear = new Date().getFullYear();
const nowMonth = new Date().getMonth() + 1;

async function fetchMyStudents() {
  const { data } = await axios.get("/api/v1/my-students");
  return data?.students ?? data?.data ?? [];
}

async function fetchInvoices(params: Record<string, string | number>) {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "")) as Record<string, string>,
  ).toString();
  const { data } = await axios.get(`/api/v1/guardian-portal/invoices?${query}`);
  return data;
}

export default function GuardianInvoicesPage() {
  const [filterStudentId, setFilterStudentId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterYear, setFilterYear] = useState(String(nowYear));
  const [filterMonth, setFilterMonth] = useState("");
  const [page, setPage] = useState(1);

  const { data: myStudents = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["my-students-list"],
    queryFn: fetchMyStudents,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["guardian-invoices", filterStudentId, filterStatus, filterYear, filterMonth, page],
    queryFn: () =>
      fetchInvoices({
        ...(filterStudentId && { studentId: filterStudentId }),
        ...(filterStatus && { status: filterStatus }),
        ...(filterYear && { periodYear: filterYear }),
        ...(filterMonth && { periodMonth: filterMonth }),
        page,
        limit: 20,
      }),
  });

  const invoices: any[] = data?.data ?? [];
  const total: number = data?.total ?? 0;
  const totalPages: number = data?.totalPages ?? 1;

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Invoices</h1>
        <p className="text-muted-foreground text-sm">View fee invoices for your student(s)</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex gap-3 flex-wrap items-end">
            {myStudents.length > 1 && (
              <div className="space-y-1">
                <label className="text-sm font-medium">Student</label>
                <Select value={filterStudentId} onValueChange={setFilterStudentId}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All students" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    {myStudents.map((s: any) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-sm font-medium">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {Object.values(InvoiceStatus).map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Year</label>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {[nowYear - 1, nowYear, nowYear + 1].map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Month</label>
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All months</SelectItem>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-base">Invoices ({total})</CardTitle>
          <CardDescription>Click an invoice to view details</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : invoices.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground">No invoices found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount ()</TableHead>
                  <TableHead className="text-right">Paid ()</TableHead>
                  <TableHead className="text-right">Due ()</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv._id}>
                    <TableCell className="font-mono text-sm">{inv.invoiceNumber}</TableCell>
                    <TableCell>{(inv.studentId as any)?.fullName ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {inv.periodMonth && inv.periodYear
                        ? `${MONTHS[inv.periodMonth - 1]} ${inv.periodYear}`
                        : "—"}
                    </TableCell>
                    <TableCell className="capitalize">{inv.invoiceType}</TableCell>
                    <TableCell className="text-right">{toMoney(inv.netPayable)}</TableCell>
                    <TableCell className="text-right text-green-600">
                      {toMoney(inv.paidAmount)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {inv.dueAmount > 0 ? toMoney(inv.dueAmount) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_COLORS[inv.status] ?? "outline"}>
                        {inv.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Prev
              </Button>
              <span className="text-sm self-center text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
