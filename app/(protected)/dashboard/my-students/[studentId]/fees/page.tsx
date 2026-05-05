"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card, CardContent,
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, CreditCard, CheckCircle } from "lucide-react";
import { toMoney } from "@/lib/money";
import { OnlinePaymentProvider, InvoiceStatus } from "@/validations";
import Link from "next/link";

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",
];

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  paid: "default", partial: "secondary", unpaid: "destructive", void: "outline",
};

async function fetchStudentInvoices(studentId: string) {
  const { data } = await axios.get(
    `/api/v1/guardian-portal/invoices?studentId=${studentId}&limit=50`,
  );
  return data?.data ?? [];
}

export default function StudentFeesPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const qc = useQueryClient();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [provider, setProvider] = useState<OnlinePaymentProvider>(OnlinePaymentProvider.BKASH);
  const [step, setStep] = useState<"select" | "confirm" | "success">("select");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactionRef, setTransactionRef] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["guardian-student-invoices", studentId],
    queryFn: () => fetchStudentInvoices(studentId),
    enabled: Boolean(studentId),
  });

  const unpaidInvoices = (invoices as any[]).filter(
    (inv) => inv.status === InvoiceStatus.UNPAID || inv.status === InvoiceStatus.PARTIAL,
  );

  const initiateMutation = useMutation({
    mutationFn: (body: { studentId: string; invoiceIds: string[]; provider: OnlinePaymentProvider }) =>
      axios.post("/api/v1/online-payments/initiate", body),
  });

  const confirmMutation = useMutation({
    mutationFn: (body: { transactionRef: string }) =>
      axios.post("/api/v1/online-payments/confirm", body),
    onSuccess: (res) => {
      setReceiptNumber((res as any).data?.receiptNumber ?? "");
      setStep("success");
      qc.invalidateQueries({ queryKey: ["guardian-student-invoices", studentId] });
    },
    onError: () => toast.error("Payment confirmation failed"),
  });

  const selectedInvoices = (invoices as any[]).filter((inv) => selected.has(inv._id));
  const totalSelected = selectedInvoices.reduce((sum, inv) => sum + inv.dueAmount, 0);

  function toggleInvoice(id: string, inv: any) {
    if (inv.status === InvoiceStatus.PAID || inv.status === InvoiceStatus.VOID) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleInitiate() {
    if (selected.size === 0) { toast.error("Select at least one invoice"); return; }
    try {
      const res = await initiateMutation.mutateAsync({
        studentId,
        invoiceIds: Array.from(selected),
        provider,
      });
      setTransactionRef((res as any).data?.transactionRef ?? "");
      setStep("confirm");
    } catch {
      toast.error("Failed to initiate payment");
    }
  }

  function openDialog() {
    setStep("select");
    setSelected(new Set());
    setTransactionRef("");
    setReceiptNumber("");
    setDialogOpen(true);
  }

  return (
    <div className="p-6 space-y-4 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/my-students">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Fee Invoices</h1>
          <p className="text-muted-foreground text-sm">Select unpaid invoices to pay online</p>
        </div>
        {unpaidInvoices.length > 0 && (
          <Button className="ml-auto" onClick={openDialog}>
            <CreditCard className="h-4 w-4 mr-1" /> Pay Online
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-4 pb-2">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (invoices as any[]).length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No invoices found.</p>
          ) : (
            <div className="divide-y">
              {(invoices as any[]).map((inv) => (
                <div key={inv._id} className="flex items-center gap-3 py-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">{inv.invoiceNumber}</span>
                      <Badge variant={STATUS_COLORS[inv.status] ?? "outline"} className="text-xs">
                        {inv.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                      {inv.invoiceType.replace("_", " ")}
                      {inv.periodMonth && inv.periodYear
                        ? ` — ${MONTHS[inv.periodMonth - 1]} ${inv.periodYear}`
                        : ""}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">{toMoney(inv.netPayable)}</p>
                    {inv.dueAmount > 0 && (
                      <p className="text-xs text-red-600">Due: {toMoney(inv.dueAmount)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog — 3-step: select → confirm → success */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!confirmMutation.isPending) setDialogOpen(o); }}>
        <DialogContent className="sm:max-w-md">
          {step === "select" && (
            <>
              <DialogHeader>
                <DialogTitle>Pay Online</DialogTitle>
                <DialogDescription>Select invoices. Full due amount is charged per invoice.</DialogDescription>
              </DialogHeader>

              <div className="space-y-2 py-2 max-h-64 overflow-y-auto">
                {unpaidInvoices.map((inv: any) => (
                  <label key={inv._id} className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-muted/50">
                    <Checkbox
                      checked={selected.has(inv._id)}
                      onCheckedChange={() => toggleInvoice(inv._id, inv)}
                    />
                    <div className="flex-1 text-sm">
                      <span className="font-mono">{inv.invoiceNumber}</span>
                      <span className="text-muted-foreground ml-2 capitalize text-xs">
                        {inv.invoiceType.replace("_", " ")}
                        {inv.periodMonth ? ` — ${MONTHS[inv.periodMonth - 1]} ${inv.periodYear}` : ""}
                      </span>
                    </div>
                    <span className="font-medium text-sm">{toMoney(inv.dueAmount)}</span>
                  </label>
                ))}
              </div>

              {selected.size > 0 && (
                <div className="border-t pt-2 flex justify-between font-semibold text-sm px-2">
                  <span>Total</span>
                  <span>{toMoney(totalSelected)}</span>
                </div>
              )}

              <div className="space-y-1">
                <Label>Payment Method</Label>
                <Select value={provider} onValueChange={(v) => setProvider(v as OnlinePaymentProvider)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={OnlinePaymentProvider.BKASH}>bKash</SelectItem>
                    <SelectItem value={OnlinePaymentProvider.NAGAD}>Nagad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleInitiate} disabled={selected.size === 0 || initiateMutation.isPending}>
                  {initiateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                  Continue →
                </Button>
              </DialogFooter>
            </>
          )}

          {step === "confirm" && (
            <>
              <DialogHeader>
                <DialogTitle>Confirm Payment</DialogTitle>
                <DialogDescription>
                  Demo mode — in production you would be redirected to{" "}
                  {provider === OnlinePaymentProvider.BKASH ? "bKash" : "Nagad"}.
                </DialogDescription>
              </DialogHeader>

              <div className="bg-muted rounded-md p-4 space-y-2 text-sm my-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction Ref</span>
                  <span className="font-mono font-medium">{transactionRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-base">{toMoney(totalSelected)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Via</span>
                  <span className="capitalize font-medium">{provider}</span>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setStep("select")}>← Back</Button>
                <Button onClick={() => confirmMutation.mutate({ transactionRef })} disabled={confirmMutation.isPending}>
                  {confirmMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                  <CreditCard className="h-4 w-4 mr-1" />
                  Confirm Payment
                </Button>
              </DialogFooter>
            </>
          )}

          {step === "success" && (
            <>
              <DialogHeader>
                <DialogTitle>Payment Successful</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-3 py-6">
                <CheckCircle className="h-14 w-14 text-green-500" />
                <p className="text-sm text-center">
                  Invoices marked as paid. Receipt:{" "}
                  <span className="font-mono font-semibold">{receiptNumber}</span>
                </p>
              </div>
              <DialogFooter>
                <Button className="w-full" onClick={() => setDialogOpen(false)}>Done</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
