"use client";

import { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { format } from "date-fns";

async function fetchMyStudents() {
  const { data } = await axios.get("/api/v1/my-students");
  return data?.students ?? data?.data ?? [];
}

async function fetchPayments(params: Record<string, string | number>) {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "")) as Record<string, string>,
  ).toString();
  const { data } = await axios.get(`/api/v1/guardian-portal/payments?${query}`);
  return data;
}

export default function GuardianPaymentsPage() {
  const [filterStudentId, setFilterStudentId] = useState("");
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data: myStudents = [] } = useQuery({
    queryKey: ["my-students-list"],
    queryFn: fetchMyStudents,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["guardian-payments", filterStudentId, page],
    queryFn: () =>
      fetchPayments({
        ...(filterStudentId && { studentId: filterStudentId }),
        page,
        limit: 20,
      }),
  });

  const payments: any[] = data?.data ?? [];
  const total: number = data?.total ?? 0;
  const totalPages: number = data?.totalPages ?? 1;

  async function downloadReceipt(paymentId: string, receiptNumber: string) {
    setDownloading(paymentId);
    try {
      const resp = await axios.get(`/api/v1/guardian-portal/payments/${paymentId}/pdf`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([resp.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${receiptNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download receipt");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Payment Receipts</h1>
        <p className="text-muted-foreground text-sm">
          View and download payment receipts for your student(s)
        </p>
      </div>

      {myStudents.length > 1 && (
        <Card>
          <CardContent className="pt-4 pb-4">
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
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-base">Payments ({total})</CardTitle>
          <CardDescription>Download PDF receipts for any payment</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : payments.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground">No payments found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount ()</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="font-mono text-sm">{p.receiptNumber}</TableCell>
                    <TableCell>{(p.studentId as any)?.fullName ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(p.paymentDate), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="capitalize text-sm">
                      {p.paymentMethod?.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {toMoney(p.totalPaid)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadReceipt(p._id, p.receiptNumber)}
                        disabled={downloading === p._id}
                      >
                        {downloading === p._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <FileDown className="h-4 w-4" />
                        )}
                        <span className="ml-1">PDF</span>
                      </Button>
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
