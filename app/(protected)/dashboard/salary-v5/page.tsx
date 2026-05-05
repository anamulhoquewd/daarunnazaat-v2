"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Loader2, RefreshCw, BanknoteArrowUp } from "lucide-react";
import { useSalariesV5, useBulkGenerateSalaries, usePayoutSalary } from "@/modules/salary/hooks";
import { toMoney } from "@/lib/money";
import { Branch, PaymentMethod } from "@/validations";
import { format } from "date-fns";

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" },
  { value: 3, label: "March" }, { value: 4, label: "April" },
  { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" },
  { value: 9, label: "September" }, { value: 10, label: "October" },
  { value: 11, label: "November" }, { value: 12, label: "December" },
];

const payoutSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod),
  bonus: z.coerce.number().min(0),
  deduction: z.coerce.number().min(0),
  notes: z.string().optional(),
});
type PayoutForm = z.infer<typeof payoutSchema>;

const nowYear = new Date().getFullYear();
const nowMonth = new Date().getMonth() + 1;

export default function SalaryV5Page() {
  const [filterYear, setFilterYear] = useState(nowYear);
  const [filterMonth, setFilterMonth] = useState(nowMonth);
  const [filterBranch, setFilterBranch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [payoutTarget, setPayoutTarget] = useState<any>(null);

  const { data, isLoading, refetch } = useSalariesV5({
    periodYear: filterYear,
    periodMonth: filterMonth,
    ...(filterBranch && { branch: filterBranch }),
    ...(filterStatus && { status: filterStatus }),
    limit: 100,
  });

  const bulkGenerate = useBulkGenerateSalaries();
  const payout = usePayoutSalary();

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<PayoutForm>({
    resolver: zodResolver(payoutSchema) as any,
    defaultValues: { bonus: 0, deduction: 0 },
  });

  const salaries: any[] = data?.data ?? [];

  function handleBulkGenerate() {
    bulkGenerate.mutate(
      {
        periodYear: filterYear,
        periodMonth: filterMonth,
        ...(filterBranch && { branch: filterBranch }),
      },
      {
        onSuccess: (res) => {
          toast.success(res.data.message ?? "Salary records generated");
          refetch();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message ?? "Failed to generate salaries");
        },
      },
    );
  }

  function openPayout(salary: any) {
    setPayoutTarget(salary);
    reset({
      bonus: Math.round((salary.bonus ?? 0) / 100),
      deduction: Math.round((salary.deduction ?? 0) / 100),
      notes: salary.notes ?? "",
    });
  }

  function onPayoutSubmit(values: PayoutForm) {
    if (!payoutTarget) return;
    payout.mutate(
      {
        id: payoutTarget._id,
        body: {
          paymentMethod: values.paymentMethod,
          bonus: values.bonus * 100,
          deduction: values.deduction * 100,
          notes: values.notes,
        },
      },
      {
        onSuccess: () => {
          toast.success("Salary paid out successfully");
          setPayoutTarget(null);
          refetch();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message ?? "Payout failed");
        },
      },
    );
  }

  const pendingCount = salaries.filter((s) => s.status === "pending").length;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Salary Management (v5)</h1>
          <p className="text-muted-foreground text-sm">
            Generate and disburse monthly salaries
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleBulkGenerate}
            disabled={bulkGenerate.isPending}
          >
            {bulkGenerate.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Generate Monthly
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex gap-3 flex-wrap items-end">
            <div className="space-y-1">
              <Label>Year</Label>
              <Select value={String(filterYear)} onValueChange={(v) => setFilterYear(Number(v))}>
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
              <Label>Month</Label>
              <Select value={String(filterMonth)} onValueChange={(v) => setFilterMonth(Number(v))}>
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
              <Label>Branch</Label>
              <Select value={filterBranch} onValueChange={setFilterBranch}>
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
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {pendingCount > 0 && (
        <div className="text-sm text-muted-foreground">
          <span className="text-amber-600 font-medium">{pendingCount}</span> pending payout{pendingCount !== 1 ? "s" : ""}
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-base">Salary Records</CardTitle>
          <CardDescription>
            {MONTHS.find((m) => m.value === filterMonth)?.label} {filterYear}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : salaries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No salary records for this period.{" "}
              <button
                className="text-primary underline"
                onClick={handleBulkGenerate}
              >
                Generate now
              </button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead className="text-right">Base ()</TableHead>
                  <TableHead className="text-right">Bonus ()</TableHead>
                  <TableHead className="text-right">Deduction ()</TableHead>
                  <TableHead className="text-right">Net ()</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid On</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaries.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell>
                      <div className="font-medium">{s.staffId?.fullName ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{s.staffId?.staffId}</div>
                    </TableCell>
                    <TableCell className="text-sm">{s.branch}</TableCell>
                    <TableCell className="text-right">{toMoney(s.baseSalary, "en")}</TableCell>
                    <TableCell className="text-right text-green-600">
                      {s.bonus > 0 ? `+${toMoney(s.bonus, "en")}` : "—"}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {s.deduction > 0 ? `-${toMoney(s.deduction, "en")}` : "—"}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {toMoney(s.netSalary, "en")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.status === "paid" ? "default" : "secondary"}>
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.paymentDate
                        ? format(new Date(s.paymentDate), "dd MMM yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {s.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openPayout(s)}
                        >
                          <BanknoteArrowUp className="h-3 w-3 mr-1" />
                          Pay Out
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payout Dialog */}
      <Dialog open={Boolean(payoutTarget)} onOpenChange={(open) => !open && setPayoutTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pay Out Salary</DialogTitle>
          </DialogHeader>
          {payoutTarget && (
            <form onSubmit={handleSubmit(onPayoutSubmit)} className="space-y-4">
              <div className="bg-muted rounded p-3 text-sm space-y-1">
                <div><span className="font-medium">Staff:</span> {payoutTarget.staffId?.fullName}</div>
                <div><span className="font-medium">Period:</span> {MONTHS.find((m) => m.value === payoutTarget.periodMonth)?.label} {payoutTarget.periodYear}</div>
                <div><span className="font-medium">Base Salary:</span>  {toMoney(payoutTarget.baseSalary, "en")}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Bonus ()</Label>
                  <Input type="number" min={0} step={0.01} {...register("bonus")} />
                  {errors.bonus && <p className="text-xs text-destructive">{errors.bonus.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Deduction ()</Label>
                  <Input type="number" min={0} step={0.01} {...register("deduction")} />
                  {errors.deduction && <p className="text-xs text-destructive">{errors.deduction.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <Label>Payment Method</Label>
                <Select
                  onValueChange={(v) => setValue("paymentMethod", v as PaymentMethod)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PaymentMethod).map((m) => (
                      <SelectItem key={m} value={m} className="capitalize">
                        {m.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.paymentMethod && (
                  <p className="text-xs text-destructive">{errors.paymentMethod.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Notes (optional)</Label>
                <Input {...register("notes")} placeholder="Any remarks..." />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPayoutTarget(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={payout.isPending}>
                  {payout.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Confirm Payout
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
