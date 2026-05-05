"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useInvoice, useVoidInvoice } from "@/modules/invoice/hooks";
import { useCreatePayment } from "@/modules/payment/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toMoney } from "@/lib/money";
import { ArrowLeft, Download, Receipt, XCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { PaymentMethod } from "@/validations";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STATUS_COLORS: Record<string, string> = {
  unpaid: "destructive",
  partial: "secondary",
  paid: "default",
  void: "outline",
};

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: inv, isLoading } = useInvoice(id);
  const voidMutation = useVoidInvoice();
  const paymentMutation = useCreatePayment();

  // Void dialog
  const [voidOpen, setVoidOpen] = useState(false);
  const [voidReason, setVoidReason] = useState("");

  // Payment dialog
  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<string>(PaymentMethod.CASH);
  const [payNotes, setPayNotes] = useState("");

  if (isLoading) {
    return <div className="p-8 text-muted-foreground">Loading invoice...</div>;
  }
  if (!inv) {
    return <div className="p-8 text-destructive">Invoice not found.</div>;
  }

  const canVoid = inv.paidAmount === 0 && inv.status !== "void";
  const canPay = inv.status !== "void" && inv.status !== "paid";

  const handleVoid = async () => {
    if (voidReason.trim().length < 5) {
      toast.error("Reason must be at least 5 characters");
      return;
    }
    try {
      await voidMutation.mutateAsync({ id, reason: voidReason });
      toast.success("Invoice voided");
      setVoidOpen(false);
    } catch {
      toast.error("Failed to void invoice");
    }
  };

  const handlePay = async () => {
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid payment amount");
      return;
    }
    try {
      const result = await paymentMutation.mutateAsync({
        studentId: typeof inv.studentId === "string" ? inv.studentId : (inv.studentId as any)?._id,
        sessionId: typeof inv.sessionId === "string" ? inv.sessionId : (inv.sessionId as any)?._id,
        branch: inv.branch,
        paymentMethod: payMethod as PaymentMethod,
        totalPaid: payAmount,
        allocations: [
          {
            invoiceId: id,
            allocatedAmount: payAmount,
          },
        ],
        notes: payNotes || undefined,
      } as any);
      toast.success(`Payment recorded — Receipt: ${(result as any)?.data?.receiptNumber}`);
      setPayOpen(false);
    } catch {
      toast.error("Failed to record payment");
    }
  };

  const period = inv.periodMonth && inv.periodYear
    ? `${MONTHS[inv.periodMonth - 1]} ${inv.periodYear}`
    : null;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/invoices">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold font-mono">{inv.invoiceNumber}</h1>
          <p className="text-muted-foreground text-sm capitalize">
            {inv.invoiceType.replace("_", " ")} invoice{period ? ` — ${period}` : ""}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant={STATUS_COLORS[inv.status] as any ?? "outline"}>
            {inv.status}
          </Badge>
          <a href={`/api/v1/invoices/${id}/pdf`} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" /> PDF
            </Button>
          </a>
        </div>
      </div>

      {/* Line items */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Item</th>
              <th className="text-right p-3 font-medium">Amount</th>
              <th className="text-right p-3 font-medium">Discount</th>
              <th className="text-right p-3 font-medium">Net</th>
            </tr>
          </thead>
          <tbody>
            {(inv.lineItems ?? []).map((li: any, i: number) => (
              <tr key={i} className="border-t">
                <td className="p-3">{li.label}</td>
                <td className="p-3 text-right font-mono">{toMoney(li.amount)}</td>
                <td className="p-3 text-right font-mono text-muted-foreground">
                  {li.discount > 0 ? `- ${toMoney(li.discount)}` : "—"}
                </td>
                <td className="p-3 text-right font-mono">{toMoney(li.net)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-muted/30">
            <tr className="border-t">
              <td colSpan={3} className="p-3 font-medium">Net Payable</td>
              <td className="p-3 text-right font-mono font-semibold">{toMoney(inv.netPayable)}</td>
            </tr>
            <tr className="border-t">
              <td colSpan={3} className="p-3 text-green-700">Paid</td>
              <td className="p-3 text-right font-mono text-green-700">{toMoney(inv.paidAmount)}</td>
            </tr>
            <tr className="border-t">
              <td colSpan={3} className="p-3 text-red-700 font-medium">Due</td>
              <td className="p-3 text-right font-mono font-bold text-red-700">{toMoney(inv.dueAmount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Actions */}
      {(canPay || canVoid) && (
        <div className="flex gap-3">
          {canPay && (
            <Button onClick={() => setPayOpen(true)}>
              <Receipt className="h-4 w-4 mr-1" /> Record Payment
            </Button>
          )}
          {canVoid && (
            <Button variant="outline" className="text-destructive border-destructive" onClick={() => setVoidOpen(true)}>
              <XCircle className="h-4 w-4 mr-1" /> Void Invoice
            </Button>
          )}
        </div>
      )}

      {/* Void AlertDialog */}
      <AlertDialog open={voidOpen} onOpenChange={setVoidOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Void Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. Please enter a reason.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={voidReason}
            onChange={(e) => setVoidReason(e.target.value)}
            placeholder="Reason for voiding..."
            className="mt-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVoid}
              disabled={voidMutation.isPending || voidReason.trim().length < 5}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Void
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Due: {toMoney(inv.dueAmount)} — enter the amount the student is paying now.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Amount (Taka)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="e.g. 500"
              />
            </div>

            <div className="space-y-1">
              <Label>Payment Method</Label>
              <Select value={payMethod} onValueChange={setPayMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                  <SelectItem value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</SelectItem>
                  <SelectItem value={PaymentMethod.BKASH}>bKash</SelectItem>
                  <SelectItem value={PaymentMethod.NAGAD}>Nagad</SelectItem>
                  <SelectItem value={PaymentMethod.CHEQUE}>Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Notes (optional)</Label>
              <Textarea
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                placeholder="Any notes..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
            <Button onClick={handlePay} disabled={paymentMutation.isPending}>
              {paymentMutation.isPending ? "Saving..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
