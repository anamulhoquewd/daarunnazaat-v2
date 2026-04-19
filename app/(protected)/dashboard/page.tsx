"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  BookOpen,
  Building2,
  DollarSign,
  RotateCcw,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type FeeType =
  | "monthlyFee"
  | "residentialFee"
  | "admissionFee"
  | "mealFee"
  | "coachingFee"
  | "daycareFee";
type PaymentStatus = "paid" | "partial" | "unpaid";
type PaymentMethod = "cash" | "bkash" | "nagad" | "bank";
type Branch = "main" | "north" | "south";
type ExpenseCategory =
  | "utilities"
  | "maintenance"
  | "stationery"
  | "food"
  | "transport";
type TransactionType = "income" | "expense" | "salary";
type BatchType = "morning" | "evening";

interface Session {
  id: string;
  name: string;
  batchType: BatchType;
}

interface FeeRecord {
  id: string;
  receiptNumber: string;
  studentName: string;
  sessionId: string;
  branch: Branch;
  feeType: FeeType;
  period: string;
  baseAmount: number;
  receivedAmount: number;
  dueAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  batchType: BatchType;
}

interface ExpenseRecord {
  id: string;
  voucherNumber: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  branch: Branch[];
}

interface SalaryRecord {
  id: string;
  receiptNumber: string;
  staffName: string;
  period: string;
  baseSalary: number;
  bonus: number;
  netSalary: number;
  status: "paid" | "pending" | "partial";
  paymentDate: string;
  branch: Branch;
}

interface Transaction {
  id: string;
  type: TransactionType;
  subType: string;
  description: string;
  amount: number;
  date: string;
  branch: string;
  method: string;
  ref: string;
}

interface DashboardFilters {
  session: string;
  batch: string;
  branch: string;
  feeType: string;
  expenseCategory: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionType: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  period: string;
}

// ─── Mock Data (replace with API calls) ───────────────────────────────────────

const SESSIONS: Session[] = [
  { id: "s1", name: "2023-2024", batchType: "morning" },
  { id: "s2", name: "2024-2025", batchType: "evening" },
  { id: "s3", name: "2025-2026", batchType: "morning" },
];

const FEE_COLLECTIONS: FeeRecord[] = [
  {
    id: "f1",
    receiptNumber: "RC-001",
    studentName: "Mohammad Rafi",
    sessionId: "s3",
    branch: "main",
    feeType: "monthlyFee",
    period: "2025-01",
    baseAmount: 1500,
    receivedAmount: 1500,
    dueAmount: 0,
    paymentStatus: "paid",
    paymentMethod: "cash",
    paymentDate: "2025-01-05",
    batchType: "morning",
  },
  {
    id: "f2",
    receiptNumber: "RC-002",
    studentName: "Abdullah Al-Mamun",
    sessionId: "s3",
    branch: "main",
    feeType: "monthlyFee",
    period: "2025-01",
    baseAmount: 1500,
    receivedAmount: 1000,
    dueAmount: 500,
    paymentStatus: "partial",
    paymentMethod: "bkash",
    paymentDate: "2025-01-07",
    batchType: "morning",
  },
  {
    id: "f3",
    receiptNumber: "RC-003",
    studentName: "Noor Mohammad",
    sessionId: "s3",
    branch: "north",
    feeType: "residentialFee",
    period: "2025-01",
    baseAmount: 3000,
    receivedAmount: 3000,
    dueAmount: 0,
    paymentStatus: "paid",
    paymentMethod: "cash",
    paymentDate: "2025-01-10",
    batchType: "evening",
  },
  {
    id: "f4",
    receiptNumber: "RC-004",
    studentName: "Ibrahim Khalil",
    sessionId: "s3",
    branch: "main",
    feeType: "admissionFee",
    period: "2025-01",
    baseAmount: 5000,
    receivedAmount: 5000,
    dueAmount: 0,
    paymentStatus: "paid",
    paymentMethod: "bank",
    paymentDate: "2025-01-12",
    batchType: "morning",
  },
  {
    id: "f5",
    receiptNumber: "RC-005",
    studentName: "Yusuf Ali",
    sessionId: "s2",
    branch: "south",
    feeType: "monthlyFee",
    period: "2024-12",
    baseAmount: 1500,
    receivedAmount: 0,
    dueAmount: 1500,
    paymentStatus: "unpaid",
    paymentMethod: "cash",
    paymentDate: "2024-12-01",
    batchType: "evening",
  },
  {
    id: "f6",
    receiptNumber: "RC-006",
    studentName: "Hafiz Mahmud",
    sessionId: "s3",
    branch: "main",
    feeType: "coachingFee",
    period: "2025-02",
    baseAmount: 800,
    receivedAmount: 800,
    dueAmount: 0,
    paymentStatus: "paid",
    paymentMethod: "nagad",
    paymentDate: "2025-02-03",
    batchType: "morning",
  },
  {
    id: "f7",
    receiptNumber: "RC-007",
    studentName: "Ariful Islam",
    sessionId: "s3",
    branch: "north",
    feeType: "monthlyFee",
    period: "2025-02",
    baseAmount: 1500,
    receivedAmount: 1500,
    dueAmount: 0,
    paymentStatus: "paid",
    paymentMethod: "cash",
    paymentDate: "2025-02-06",
    batchType: "morning",
  },
  {
    id: "f8",
    receiptNumber: "RC-008",
    studentName: "Tahmid Hassan",
    sessionId: "s3",
    branch: "main",
    feeType: "mealFee",
    period: "2025-02",
    baseAmount: 2000,
    receivedAmount: 2000,
    dueAmount: 0,
    paymentStatus: "paid",
    paymentMethod: "bkash",
    paymentDate: "2025-02-10",
    batchType: "evening",
  },
  {
    id: "f9",
    receiptNumber: "RC-009",
    studentName: "Saiful Islam",
    sessionId: "s3",
    branch: "south",
    feeType: "monthlyFee",
    period: "2025-03",
    baseAmount: 1500,
    receivedAmount: 1500,
    dueAmount: 0,
    paymentStatus: "paid",
    paymentMethod: "cash",
    paymentDate: "2025-03-02",
    batchType: "morning",
  },
  {
    id: "f10",
    receiptNumber: "RC-010",
    studentName: "Mizanur Rahman",
    sessionId: "s3",
    branch: "main",
    feeType: "residentialFee",
    period: "2025-03",
    baseAmount: 3000,
    receivedAmount: 1500,
    dueAmount: 1500,
    paymentStatus: "partial",
    paymentMethod: "cash",
    paymentDate: "2025-03-05",
    batchType: "evening",
  },
];

const EXPENSES: ExpenseRecord[] = [
  {
    id: "e1",
    voucherNumber: "EXP-001",
    category: "utilities",
    description: "Electricity Bill",
    amount: 4500,
    expenseDate: "2025-01-08",
    paymentMethod: "cash",
    branch: ["main"],
  },
  {
    id: "e2",
    voucherNumber: "EXP-002",
    category: "maintenance",
    description: "Classroom Renovation",
    amount: 12000,
    expenseDate: "2025-01-15",
    paymentMethod: "bank",
    branch: ["main", "north"],
  },
  {
    id: "e3",
    voucherNumber: "EXP-003",
    category: "stationery",
    description: "Books & Notebooks",
    amount: 8500,
    expenseDate: "2025-02-05",
    paymentMethod: "cash",
    branch: ["main"],
  },
  {
    id: "e4",
    voucherNumber: "EXP-004",
    category: "food",
    description: "Dormitory Food Supply",
    amount: 25000,
    expenseDate: "2025-02-10",
    paymentMethod: "bkash",
    branch: ["north"],
  },
  {
    id: "e5",
    voucherNumber: "EXP-005",
    category: "utilities",
    description: "Water Bill",
    amount: 1500,
    expenseDate: "2025-02-15",
    paymentMethod: "cash",
    branch: ["south"],
  },
  {
    id: "e6",
    voucherNumber: "EXP-006",
    category: "transport",
    description: "Transportation Cost",
    amount: 6000,
    expenseDate: "2025-03-01",
    paymentMethod: "cash",
    branch: ["main"],
  },
  {
    id: "e7",
    voucherNumber: "EXP-007",
    category: "maintenance",
    description: "Furniture Repair",
    amount: 5500,
    expenseDate: "2025-03-08",
    paymentMethod: "bank",
    branch: ["main"],
  },
  {
    id: "e8",
    voucherNumber: "EXP-008",
    category: "stationery",
    description: "Exam Stationery",
    amount: 3200,
    expenseDate: "2025-03-12",
    paymentMethod: "cash",
    branch: ["north", "south"],
  },
];

const SALARIES: SalaryRecord[] = [
  {
    id: "sl1",
    receiptNumber: "SAL-001",
    staffName: "Mawlana Abu Bakr",
    period: "2025-01",
    baseSalary: 18000,
    bonus: 2000,
    netSalary: 20000,
    status: "paid",
    paymentDate: "2025-01-28",
    branch: "main",
  },
  {
    id: "sl2",
    receiptNumber: "SAL-002",
    staffName: "Hafez Zakariya",
    period: "2025-01",
    baseSalary: 15000,
    bonus: 0,
    netSalary: 15000,
    status: "paid",
    paymentDate: "2025-01-28",
    branch: "north",
  },
  {
    id: "sl3",
    receiptNumber: "SAL-003",
    staffName: "Ustaz Idris",
    period: "2025-02",
    baseSalary: 18000,
    bonus: 0,
    netSalary: 18000,
    status: "paid",
    paymentDate: "2025-02-27",
    branch: "main",
  },
  {
    id: "sl4",
    receiptNumber: "SAL-004",
    staffName: "Muazzin Saheb",
    period: "2025-02",
    baseSalary: 10000,
    bonus: 1000,
    netSalary: 11000,
    status: "paid",
    paymentDate: "2025-02-27",
    branch: "south",
  },
  {
    id: "sl5",
    receiptNumber: "SAL-005",
    staffName: "Mawlana Sulaiman",
    period: "2025-03",
    baseSalary: 20000,
    bonus: 0,
    netSalary: 20000,
    status: "pending",
    paymentDate: "2025-03-31",
    branch: "main",
  },
];

// ─── Derived data ─────────────────────────────────────────────────────────────

const TRANSACTIONS: Transaction[] = [
  ...FEE_COLLECTIONS.map((f) => ({
    id: f.id,
    type: "income" as TransactionType,
    subType: f.feeType,
    description: `${f.studentName} — ${f.receiptNumber}`,
    amount: f.receivedAmount,
    date: f.paymentDate,
    branch: f.branch,
    method: f.paymentMethod,
    ref: f.receiptNumber,
  })),
  ...EXPENSES.map((e) => ({
    id: e.id,
    type: "expense" as TransactionType,
    subType: e.category,
    description: `${e.description} — ${e.voucherNumber}`,
    amount: e.amount,
    date: e.expenseDate,
    branch: e.branch[0],
    method: e.paymentMethod,
    ref: e.voucherNumber,
  })),
  ...SALARIES.filter((s) => s.status === "paid").map((s) => ({
    id: s.id,
    type: "salary" as TransactionType,
    subType: "salary",
    description: `${s.staffName} Salary — ${s.receiptNumber}`,
    amount: s.netSalary,
    date: s.paymentDate,
    branch: s.branch,
    method: "bank",
    ref: s.receiptNumber,
  })),
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const monthlyData = [
  { month: "Jan", income: 10500, expense: 16500, salary: 35000 },
  { month: "Feb", income: 7800, expense: 34700, salary: 29000 },
  { month: "Mar", income: 3000, expense: 8700, salary: 20000 },
];

const feeTypeData = [
  { name: "Monthly Fee", value: 9000, color: "#10b981" },
  { name: "Residential", value: 4500, color: "#3b82f6" },
  { name: "Admission", value: 5000, color: "#f59e0b" },
  { name: "Coaching", value: 800, color: "#8b5cf6" },
  { name: "Meal Fee", value: 2000, color: "#ec4899" },
];

const expenseCatData = [
  { name: "Utilities", value: 6000, color: "#ef4444" },
  { name: "Maintenance", value: 17500, color: "#f97316" },
  { name: "Stationery", value: 11700, color: "#eab308" },
  { name: "Food", value: 25000, color: "#84cc16" },
  { name: "Transport", value: 6000, color: "#06b6d4" },
];

// ─── Label Maps ───────────────────────────────────────────────────────────────

const FEE_TYPE_LABEL: Record<string, string> = {
  monthlyFee: "Monthly Fee",
  residentialFee: "Residential Fee",
  admissionFee: "Admission Fee",
  mealFee: "Meal Fee",
  coachingFee: "Coaching Fee",
  daycareFee: "Daycare Fee",
};

const BRANCH_LABEL: Record<string, string> = {
  main: "Main Branch",
  north: "North Branch",
  south: "South Branch",
};

const METHOD_LABEL: Record<string, string> = {
  cash: "Cash",
  bkash: "bKash",
  nagad: "Nagad",
  bank: "Bank Transfer",
};

const CATEGORY_LABEL: Record<string, string> = {
  utilities: "Utilities",
  maintenance: "Maintenance",
  stationery: "Stationery",
  food: "Food",
  transport: "Transport",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(n);

const DEFAULT_FILTERS: DashboardFilters = {
  session: "all",
  batch: "all",
  branch: "all",
  feeType: "all",
  expenseCategory: "all",
  paymentMethod: "all",
  paymentStatus: "all",
  transactionType: "all",
  dateFrom: "",
  dateTo: "",
  amountMin: "",
  amountMax: "",
  period: "",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  trend?: number;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const variantStyles: Record<string, string> = {
  default: "border-l-slate-400",
  success: "border-l-emerald-500",
  warning: "border-l-amber-500",
  danger: "border-l-red-500",
  info: "border-l-blue-500",
};

function StatCard({
  icon,
  label,
  value,
  sub,
  trend,
  variant = "default",
}: StatCardProps) {
  return (
    <Card
      className={`border-l-4 ${variantStyles[variant]} shadow-sm hover:shadow-md transition-shadow`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              {label}
            </p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className="p-2.5 rounded-xl bg-muted/60">{icon}</div>
        </div>
        {trend !== undefined && (
          <div
            className={`mt-3 flex items-center gap-1 text-xs font-medium ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}
          >
            {trend >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(trend)}% vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const statusBadgeVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  paid: "default",
  partial: "secondary",
  unpaid: "destructive",
  pending: "outline",
};

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border rounded-xl shadow-xl p-3 text-xs">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold">{fmtCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Filter Panel ──────────────────────────────────────────────────────────────

interface FilterPanelProps {
  filters: DashboardFilters;
  onChange: (key: keyof DashboardFilters, val: string) => void;
  onReset: () => void;
  activeCount: number;
}

function FilterPanel({
  filters,
  onChange,
  onReset,
  activeCount,
}: FilterPanelProps) {
  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">
              Advanced Filters
            </CardTitle>
            {activeCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeCount} active
              </Badge>
            )}
          </div>
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <RotateCcw className="w-3 h-3 mr-1" /> Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4 pb-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Session */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Session</Label>
            <Select
              value={filters.session}
              onValueChange={(v) => onChange("session", v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                {SESSIONS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Batch */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Batch</Label>
            <Select
              value={filters.batch}
              onValueChange={(v) => onChange("batch", v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Branch */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Branch</Label>
            <Select
              value={filters.branch}
              onValueChange={(v) => onChange("branch", v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                <SelectItem value="main">Main Branch</SelectItem>
                <SelectItem value="north">North Branch</SelectItem>
                <SelectItem value="south">South Branch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fee Type */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Fee Type</Label>
            <Select
              value={filters.feeType}
              onValueChange={(v) => onChange("feeType", v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fee Types</SelectItem>
                <SelectItem value="monthlyFee">Monthly Fee</SelectItem>
                <SelectItem value="residentialFee">Residential Fee</SelectItem>
                <SelectItem value="admissionFee">Admission Fee</SelectItem>
                <SelectItem value="mealFee">Meal Fee</SelectItem>
                <SelectItem value="coachingFee">Coaching Fee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Expense Category */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Expense Category
            </Label>
            <Select
              value={filters.expenseCategory}
              onValueChange={(v) => onChange("expenseCategory", v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="stationery">Stationery</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Payment Method
            </Label>
            <Select
              value={filters.paymentMethod}
              onValueChange={(v) => onChange("paymentMethod", v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bkash">bKash</SelectItem>
                <SelectItem value="nagad">Nagad</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Payment Status
            </Label>
            <Select
              value={filters.paymentStatus}
              onValueChange={(v) => onChange("paymentStatus", v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transaction Type */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Transaction Type
            </Label>
            <Select
              value={filters.transactionType}
              onValueChange={(v) => onChange("transactionType", v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="salary">Salary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Period */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Period (YYYY-MM)
            </Label>
            <Input
              className="h-8 text-xs"
              placeholder="e.g. 2025-01"
              value={filters.period}
              onChange={(e) => onChange("period", e.target.value)}
            />
          </div>

          {/* Date From */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Date From</Label>
            <Input
              type="date"
              className="h-8 text-xs"
              value={filters.dateFrom}
              onChange={(e) => onChange("dateFrom", e.target.value)}
            />
          </div>

          {/* Date To */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Date To</Label>
            <Input
              type="date"
              className="h-8 text-xs"
              value={filters.dateTo}
              onChange={(e) => onChange("dateTo", e.target.value)}
            />
          </div>

          {/* Amount Range */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Amount Range
            </Label>
            <div className="flex gap-1">
              <Input
                className="h-8 text-xs"
                type="number"
                placeholder="Min"
                value={filters.amountMin}
                onChange={(e) => onChange("amountMin", e.target.value)}
              />
              <Input
                className="h-8 text-xs"
                type="number"
                placeholder="Max"
                value={filters.amountMax}
                onChange={(e) => onChange("amountMax", e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);

  const setF = (key: keyof DashboardFilters, val: string) =>
    setFilters((f) => ({ ...f, [key]: val }));

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const activeFilterCount = Object.entries(filters).filter(
    ([, v]) => v !== "all" && v !== "",
  ).length;

  // ── Filtered datasets ──
  const filteredFees = useMemo(
    () =>
      FEE_COLLECTIONS.filter((f) => {
        if (filters.session !== "all" && f.sessionId !== filters.session)
          return false;
        if (filters.batch !== "all" && f.batchType !== filters.batch)
          return false;
        if (filters.branch !== "all" && f.branch !== filters.branch)
          return false;
        if (filters.feeType !== "all" && f.feeType !== filters.feeType)
          return false;
        if (
          filters.paymentMethod !== "all" &&
          f.paymentMethod !== filters.paymentMethod
        )
          return false;
        if (
          filters.paymentStatus !== "all" &&
          f.paymentStatus !== filters.paymentStatus
        )
          return false;
        if (filters.period && f.period !== filters.period) return false;
        if (filters.dateFrom && f.paymentDate < filters.dateFrom) return false;
        if (filters.dateTo && f.paymentDate > filters.dateTo) return false;
        if (filters.amountMin && f.receivedAmount < Number(filters.amountMin))
          return false;
        if (filters.amountMax && f.receivedAmount > Number(filters.amountMax))
          return false;
        return true;
      }),
    [filters],
  );

  const filteredExpenses = useMemo(
    () =>
      EXPENSES.filter((e) => {
        if (
          filters.branch !== "all" &&
          !e.branch.includes(filters.branch as Branch)
        )
          return false;
        if (
          filters.expenseCategory !== "all" &&
          e.category !== filters.expenseCategory
        )
          return false;
        if (
          filters.paymentMethod !== "all" &&
          e.paymentMethod !== filters.paymentMethod
        )
          return false;
        if (filters.dateFrom && e.expenseDate < filters.dateFrom) return false;
        if (filters.dateTo && e.expenseDate > filters.dateTo) return false;
        if (filters.amountMin && e.amount < Number(filters.amountMin))
          return false;
        if (filters.amountMax && e.amount > Number(filters.amountMax))
          return false;
        return true;
      }),
    [filters],
  );

  const filteredTx = useMemo(
    () =>
      TRANSACTIONS.filter((tx) => {
        if (
          filters.transactionType !== "all" &&
          tx.type !== filters.transactionType
        )
          return false;
        if (filters.branch !== "all" && tx.branch !== filters.branch)
          return false;
        if (
          filters.paymentMethod !== "all" &&
          tx.method !== filters.paymentMethod
        )
          return false;
        if (filters.dateFrom && tx.date < filters.dateFrom) return false;
        if (filters.dateTo && tx.date > filters.dateTo) return false;
        if (filters.amountMin && tx.amount < Number(filters.amountMin))
          return false;
        if (filters.amountMax && tx.amount > Number(filters.amountMax))
          return false;
        return true;
      }),
    [filters],
  );

  // ── Summary stats ──
  const totalIncome = filteredFees.reduce((s, f) => s + f.receivedAmount, 0);
  const totalDue = FEE_COLLECTIONS.reduce((s, f) => s + f.dueAmount, 0);
  const totalExpense = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const totalSalary = SALARIES.filter((s) => s.status === "paid").reduce(
    (s, sl) => s + sl.netSalary,
    0,
  );
  const netBalance = totalIncome - totalExpense - totalSalary;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ── Header ── */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                ☪
              </div>
              <div>
                <h1 className="text-base font-bold leading-none">
                  Madrasa Management
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Financial Dashboard · 2025
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:block">
                Last updated: Apr 13, 2025
              </span>
              <Button
                variant={showFilter ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilter(!showFilter)}
                className="relative gap-2"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-amber-500 hover:bg-amber-500">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-6 space-y-5">
        {/* ── Filter Panel ── */}
        {showFilter && (
          <FilterPanel
            filters={filters}
            onChange={setF}
            onReset={resetFilters}
            activeCount={activeFilterCount}
          />
        )}

        {/* ── Tabs ── */}
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full max-w-lg grid-cols-5 mb-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="fees">Fee Collection</TabsTrigger>
            <TabsTrigger value="expense">Expenses</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="salary">Salary</TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW ── */}
          <TabsContent value="overview" className="space-y-5 mt-4">
            {/* Primary stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
                label="Total Income"
                value={fmtCurrency(totalIncome)}
                sub="Filtered fee collections"
                variant="success"
                trend={12}
              />
              <StatCard
                icon={<ArrowUpCircle className="w-4 h-4 text-red-500" />}
                label="Total Expense"
                value={fmtCurrency(totalExpense)}
                sub="Filtered expenses"
                variant="danger"
                trend={-5}
              />
              <StatCard
                icon={<Wallet className="w-4 h-4 text-blue-500" />}
                label="Salary Paid"
                value={fmtCurrency(totalSalary)}
                sub="Disbursed salaries"
                variant="info"
                trend={0}
              />
              <StatCard
                icon={
                  netBalance >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )
                }
                label="Net Balance"
                value={fmtCurrency(netBalance)}
                sub="Income − Expense − Salary"
                variant={netBalance >= 0 ? "success" : "danger"}
                trend={8}
              />
            </div>

            {/* Secondary stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<AlertCircle className="w-4 h-4 text-amber-500" />}
                label="Total Due"
                value={fmtCurrency(totalDue)}
                sub={`${FEE_COLLECTIONS.filter((f) => f.dueAmount > 0).length} students`}
                variant="warning"
              />
              <StatCard
                icon={<BookOpen className="w-4 h-4 text-violet-500" />}
                label="Total Students"
                value="48"
                sub="Active enrollment"
                variant="default"
              />
              <StatCard
                icon={<Users className="w-4 h-4 text-teal-500" />}
                label="Staff Members"
                value="12"
                sub="Active staff"
                variant="default"
              />
              <StatCard
                icon={<Building2 className="w-4 h-4 text-orange-500" />}
                label="Branches"
                value="3"
                sub="Main · North · South"
                variant="default"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Card className="lg:col-span-2 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">
                      Monthly Financial Overview
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      2025
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart
                      data={monthlyData}
                      margin={{ top: 5, right: 10, bottom: 5, left: 10 }}
                    >
                      <defs>
                        {[
                          ["income", "#10b981"],
                          ["expense", "#ef4444"],
                          ["salary", "#3b82f6"],
                        ].map(([key, color]) => (
                          <linearGradient
                            key={key}
                            id={`grad_${key}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={color}
                              stopOpacity={0.25}
                            />
                            <stop
                              offset="95%"
                              stopColor={color}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 11 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="income"
                        name="Income"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#grad_income)"
                        dot={{ fill: "#10b981", r: 3 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="expense"
                        name="Expense"
                        stroke="#ef4444"
                        strokeWidth={2}
                        fill="url(#grad_expense)"
                        dot={{ fill: "#ef4444", r: 3 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="salary"
                        name="Salary"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#grad_salary)"
                        dot={{ fill: "#3b82f6", r: 3 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">
                    Fee Type Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={155}>
                    <PieChart>
                      <Pie
                        data={feeTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={68}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {feeTypeData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => fmtCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-1">
                    {feeTypeData.map((d, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: d.color }}
                          />
                          <span className="text-muted-foreground">
                            {d.name}
                          </span>
                        </div>
                        <span className="font-semibold">
                          {fmtCurrency(d.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Expense breakdown + Recent Tx */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">
                    Expense Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart
                      data={expenseCatData}
                      layout="vertical"
                      margin={{ left: 10, right: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        width={65}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="value" name="Amount" radius={[0, 4, 4, 0]}>
                        {expenseCatData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">
                      Recent Transactions
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs h-7">
                      View all →
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {TRANSACTIONS.slice(0, 7).map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${tx.type === "income" ? "bg-emerald-100 text-emerald-700" : tx.type === "salary" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}
                          >
                            {tx.type === "income"
                              ? "↓"
                              : tx.type === "salary"
                                ? "S"
                                : "↑"}
                          </div>
                          <div>
                            <p className="text-sm font-medium leading-tight line-clamp-1">
                              {tx.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {tx.date} · {METHOD_LABEL[tx.method] ?? tx.method}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-sm font-bold tabular-nums ${tx.type === "income" ? "text-emerald-600" : "text-red-500"}`}
                        >
                          {tx.type === "income" ? "+" : "−"}
                          {fmtCurrency(tx.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── FEE COLLECTION ── */}
          <TabsContent value="fees" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {(["paid", "partial", "unpaid"] as PaymentStatus[]).map((s) => {
                const items = filteredFees.filter((f) => f.paymentStatus === s);
                const total = items.reduce(
                  (acc, f) =>
                    acc + (s === "unpaid" ? f.dueAmount : f.receivedAmount),
                  0,
                );
                return (
                  <StatCard
                    key={s}
                    icon={
                      s === "paid" ? (
                        <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
                      ) : s === "partial" ? (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )
                    }
                    label={s.charAt(0).toUpperCase() + s.slice(1)}
                    value={fmtCurrency(total)}
                    sub={`${items.length} receipts`}
                    variant={
                      s === "paid"
                        ? "success"
                        : s === "partial"
                          ? "warning"
                          : "danger"
                    }
                  />
                );
              })}
              <StatCard
                icon={<BookOpen className="w-4 h-4 text-violet-500" />}
                label="Total Records"
                value={`${filteredFees.length}`}
                sub={fmtCurrency(
                  filteredFees.reduce((s, f) => s + f.receivedAmount, 0),
                )}
                variant="default"
              />
            </div>

            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    Fee Collection Records
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {filteredFees.length} records
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="text-xs font-semibold">
                          Receipt No.
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Student
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Fee Type
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Period
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Branch
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-right">
                          Received
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-right">
                          Due
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Method
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Date
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-center">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFees.map((f) => (
                        <TableRow key={f.id}>
                          <TableCell className="font-mono text-xs font-medium text-emerald-700">
                            {f.receiptNumber}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {f.studentName}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {FEE_TYPE_LABEL[f.feeType]}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {f.period}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {BRANCH_LABEL[f.branch]}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-emerald-700 tabular-nums">
                            {fmtCurrency(f.receivedAmount)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-red-500 tabular-nums">
                            {fmtCurrency(f.dueAmount)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {METHOD_LABEL[f.paymentMethod]}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {f.paymentDate}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={statusBadgeVariant[f.paymentStatus]}
                              className="text-xs capitalize"
                            >
                              {f.paymentStatus}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow className="bg-emerald-50 font-bold">
                        <TableCell colSpan={5} className="text-sm">
                          Total ({filteredFees.length} records)
                        </TableCell>
                        <TableCell className="text-right text-emerald-700 tabular-nums">
                          {fmtCurrency(
                            filteredFees.reduce(
                              (s, f) => s + f.receivedAmount,
                              0,
                            ),
                          )}
                        </TableCell>
                        <TableCell className="text-right text-red-600 tabular-nums">
                          {fmtCurrency(
                            filteredFees.reduce((s, f) => s + f.dueAmount, 0),
                          )}
                        </TableCell>
                        <TableCell colSpan={3} />
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── EXPENSES ── */}
          <TabsContent value="expense" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {(
                [
                  "utilities",
                  "maintenance",
                  "stationery",
                  "food",
                ] as ExpenseCategory[]
              ).map((cat) => {
                const items = filteredExpenses.filter(
                  (e) => e.category === cat,
                );
                return (
                  <StatCard
                    key={cat}
                    icon={<ArrowUpCircle className="w-4 h-4 text-orange-500" />}
                    label={CATEGORY_LABEL[cat]}
                    value={fmtCurrency(items.reduce((s, e) => s + e.amount, 0))}
                    sub={`${items.length} vouchers`}
                    variant="warning"
                  />
                );
              })}
            </div>

            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    Expense Records
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {filteredExpenses.length} records ·{" "}
                    {fmtCurrency(
                      filteredExpenses.reduce((s, e) => s + e.amount, 0),
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="text-xs font-semibold">
                          Voucher No.
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Description
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Category
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Branch
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-right">
                          Amount
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Method
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Date
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="font-mono text-xs font-medium text-red-600">
                            {e.voucherNumber}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {e.description}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {CATEGORY_LABEL[e.category] ?? e.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {e.branch.map((b) => BRANCH_LABEL[b]).join(", ")}
                          </TableCell>
                          <TableCell className="text-right font-bold text-red-600 tabular-nums">
                            {fmtCurrency(e.amount)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {METHOD_LABEL[e.paymentMethod]}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {e.expenseDate}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow className="bg-red-50 font-bold">
                        <TableCell colSpan={4} className="text-sm">
                          Total
                        </TableCell>
                        <TableCell className="text-right text-red-700 tabular-nums">
                          {fmtCurrency(
                            filteredExpenses.reduce((s, e) => s + e.amount, 0),
                          )}
                        </TableCell>
                        <TableCell colSpan={2} />
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TRANSACTIONS ── */}
          <TabsContent value="transactions" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                icon={<ArrowDownCircle className="w-4 h-4 text-emerald-600" />}
                label="Total Income"
                value={fmtCurrency(
                  filteredTx
                    .filter((t) => t.type === "income")
                    .reduce((s, t) => s + t.amount, 0),
                )}
                sub={`${filteredTx.filter((t) => t.type === "income").length} entries`}
                variant="success"
              />
              <StatCard
                icon={<ArrowUpCircle className="w-4 h-4 text-red-500" />}
                label="Total Outflow"
                value={fmtCurrency(
                  filteredTx
                    .filter((t) => t.type !== "income")
                    .reduce((s, t) => s + t.amount, 0),
                )}
                sub={`${filteredTx.filter((t) => t.type !== "income").length} entries`}
                variant="danger"
              />
              <StatCard
                icon={<Wallet className="w-4 h-4 text-violet-500" />}
                label="All Transactions"
                value={`${filteredTx.length}`}
                sub={fmtCurrency(filteredTx.reduce((s, t) => s + t.amount, 0))}
                variant="default"
              />
            </div>

            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    Transaction Log
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {filteredTx.length} records
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredTx.map((tx, i) => (
                    <div
                      key={tx.id}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors"
                    >
                      <span className="text-xs text-muted-foreground w-6 text-center tabular-nums">
                        {i + 1}
                      </span>
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${tx.type === "income" ? "bg-emerald-100 text-emerald-700" : tx.type === "salary" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}
                      >
                        {tx.type === "income"
                          ? "↓"
                          : tx.type === "salary"
                            ? "S"
                            : "↑"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {tx.description}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-muted-foreground">
                            {tx.date}
                          </span>
                          <span className="text-muted-foreground/40">·</span>
                          <span className="text-xs text-muted-foreground">
                            {METHOD_LABEL[tx.method] ?? tx.method}
                          </span>
                          <span className="text-muted-foreground/40">·</span>
                          <span className="text-xs text-muted-foreground">
                            {BRANCH_LABEL[tx.branch] ?? tx.branch}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className={`text-sm font-bold tabular-nums ${tx.type === "income" ? "text-emerald-600" : "text-red-500"}`}
                        >
                          {tx.type === "income" ? "+" : "−"}
                          {fmtCurrency(tx.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.ref}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── SALARY ── */}
          <TabsContent value="salary" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<ArrowDownCircle className="w-4 h-4 text-emerald-600" />}
                label="Paid Salary"
                value={fmtCurrency(
                  SALARIES.filter((s) => s.status === "paid").reduce(
                    (s, sl) => s + sl.netSalary,
                    0,
                  ),
                )}
                sub={`${SALARIES.filter((s) => s.status === "paid").length} staff`}
                variant="success"
              />
              <StatCard
                icon={<AlertCircle className="w-4 h-4 text-amber-500" />}
                label="Pending Salary"
                value={fmtCurrency(
                  SALARIES.filter((s) => s.status === "pending").reduce(
                    (s, sl) => s + sl.netSalary,
                    0,
                  ),
                )}
                sub={`${SALARIES.filter((s) => s.status === "pending").length} staff`}
                variant="warning"
              />
              <StatCard
                icon={<Wallet className="w-4 h-4 text-violet-500" />}
                label="Total Bonus"
                value={fmtCurrency(SALARIES.reduce((s, sl) => s + sl.bonus, 0))}
                sub="All staff bonus"
                variant="default"
              />
              <StatCard
                icon={<Users className="w-4 h-4 text-teal-500" />}
                label="Total Staff"
                value={`${SALARIES.length}`}
                sub="This month"
                variant="default"
              />
            </div>

            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  Salary Payment Records
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="text-xs font-semibold">
                          Receipt No.
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Staff Name
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Period
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Branch
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-right">
                          Base Salary
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-right">
                          Bonus
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-right">
                          Net Salary
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Payment Date
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-center">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {SALARIES.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-mono text-xs font-medium text-blue-700">
                            {s.receiptNumber}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {s.staffName}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {s.period}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {BRANCH_LABEL[s.branch]}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground tabular-nums">
                            {fmtCurrency(s.baseSalary)}
                          </TableCell>
                          <TableCell className="text-right text-violet-600 tabular-nums">
                            {fmtCurrency(s.bonus)}
                          </TableCell>
                          <TableCell className="text-right font-bold text-blue-700 tabular-nums">
                            {fmtCurrency(s.netSalary)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {s.paymentDate}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                s.status === "paid" ? "default" : "outline"
                              }
                              className="text-xs capitalize"
                            >
                              {s.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow className="bg-blue-50 font-bold">
                        <TableCell colSpan={4} className="text-sm">
                          Total
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {fmtCurrency(
                            SALARIES.reduce((s, sl) => s + sl.baseSalary, 0),
                          )}
                        </TableCell>
                        <TableCell className="text-right text-violet-700 tabular-nums">
                          {fmtCurrency(
                            SALARIES.reduce((s, sl) => s + sl.bonus, 0),
                          )}
                        </TableCell>
                        <TableCell className="text-right text-blue-700 tabular-nums">
                          {fmtCurrency(
                            SALARIES.reduce((s, sl) => s + sl.netSalary, 0),
                          )}
                        </TableCell>
                        <TableCell colSpan={2} />
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center py-3 text-xs text-muted-foreground border-t">
          Madrasa Management System · All rights reserved © 2025
        </div>
      </div>
    </div>
  );
}
