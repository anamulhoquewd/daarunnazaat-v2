"use client";

import { useState } from "react";
import axios from "axios";
import { useInvoices, useGenerateMonthlyInvoices, useVoidInvoice } from "@/modules/invoice/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toMoney } from "@/lib/money";
import Link from "next/link";
import { FileText, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

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

export default function InvoicesPage() {
  const currentYear = new Date().getFullYear();

  // Filters
  const [status, setStatus] = useState("");
  const [periodYear, setPeriodYear] = useState<string>("");
  const [periodMonth, setPeriodMonth] = useState<string>("");

  // Generate monthly dialog
  const [genOpen, setGenOpen] = useState(false);
  const [genYear, setGenYear] = useState(String(currentYear));
  const [genMonth, setGenMonth] = useState(String(new Date().getMonth() + 1));
  const [genSessionId, setGenSessionId] = useState("");
  const [genDryRun, setGenDryRun] = useState(false);

  const filterParams: Record<string, unknown> = {};
  if (status) filterParams.status = status;
  if (periodYear) filterParams.periodYear = Number(periodYear);
  if (periodMonth) filterParams.periodMonth = Number(periodMonth);

  const { data, isLoading, refetch } = useInvoices(filterParams);
  const generateMutation = useGenerateMonthlyInvoices();
  const invoices: any[] = data?.data ?? [];

  const handleGenerate = async () => {
    if (!genSessionId) { toast.error("Session ID is required"); return; }
    const res = await generateMutation.mutateAsync({
      sessionId: genSessionId,
      periodYear: Number(genYear),
      periodMonth: Number(genMonth),
      dryRun: genDryRun,
    });
    const result = (res as any)?.data;
    if (genDryRun) {
      toast.info(result?.message ?? "Dry run complete");
    } else {
      toast.success(result?.message ?? "Invoices generated");
      setGenOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-muted-foreground text-sm">View and manage student invoices</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
          <Button size="sm" onClick={() => setGenOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Generate Monthly
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="void">Void</SelectItem>
          </SelectContent>
        </Select>

        <Select value={periodYear} onValueChange={setPeriodYear}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={periodMonth} onValueChange={setPeriodMonth}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All months</SelectItem>
            {MONTHS.map((m, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Invoice #</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-left p-3 font-medium">Period</th>
              <th className="text-right p-3 font-medium">Net Payable</th>
              <th className="text-right p-3 font-medium">Paid</th>
              <th className="text-right p-3 font-medium">Due</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={8} className="text-center p-8 text-muted-foreground">Loading...</td>
              </tr>
            )}
            {!isLoading && invoices.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center p-8 text-muted-foreground">No invoices found</td>
              </tr>
            )}
            {invoices.map((inv: any) => (
              <tr key={inv._id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="p-3 font-mono font-medium">{inv.invoiceNumber}</td>
                <td className="p-3 capitalize">{inv.invoiceType.replace("_", " ")}</td>
                <td className="p-3 text-muted-foreground">
                  {inv.periodMonth && inv.periodYear
                    ? `${MONTHS[inv.periodMonth - 1]} ${inv.periodYear}`
                    : "—"}
                </td>
                <td className="p-3 text-right font-mono">{toMoney(inv.netPayable)}</td>
                <td className="p-3 text-right font-mono text-green-600">{toMoney(inv.paidAmount)}</td>
                <td className="p-3 text-right font-mono text-red-600">{toMoney(inv.dueAmount)}</td>
                <td className="p-3">
                  <Badge variant={STATUS_COLORS[inv.status] as any ?? "outline"}>
                    {inv.status}
                  </Badge>
                </td>
                <td className="p-3">
                  <Link href={`/dashboard/invoices/${inv._id}`}>
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <p className="text-sm text-muted-foreground text-center">
          Page {data.page} of {data.totalPages} — {data.total} invoices total
        </p>
      )}

      {/* Generate Monthly Dialog */}
      <Dialog open={genOpen} onOpenChange={setGenOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Monthly Invoices</DialogTitle>
            <DialogDescription>
              Creates one invoice per active student for the selected month. Skips students who already have an invoice for that period.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Year</Label>
                <Input
                  type="number"
                  value={genYear}
                  onChange={(e) => setGenYear(e.target.value)}
                  min={2020}
                  max={2100}
                />
              </div>
              <div className="space-y-1">
                <Label>Month</Label>
                <Select value={genMonth} onValueChange={setGenMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Session ID</Label>
              <Input
                value={genSessionId}
                onChange={(e) => setGenSessionId(e.target.value)}
                placeholder="MongoDB ObjectId of the session"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="dryrun"
                checked={genDryRun}
                onChange={(e) => setGenDryRun(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="dryrun" className="cursor-pointer">
                Dry run (preview only, no invoices created)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setGenOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerate} disabled={generateMutation.isPending}>
              {generateMutation.isPending ? "Generating..." : genDryRun ? "Preview" : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
