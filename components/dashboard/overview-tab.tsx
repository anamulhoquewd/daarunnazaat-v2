import {
  BRANCH_LABEL,
  FEE_TYPE_LABEL,
  PAYMENT_METHOD_LABEL,
} from "@/components/dashboard/filter-panel";
import StatCard from "@/components/dashboard/stateCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import {
  AlertCircle,
  ArrowUpCircle,
  BookOpen,
  Building2,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
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
import {
  DashboardOverview,
  DashboardResponseData,
} from "@/hooks/dashboard/useDashboard";
import {
  fmtCurrency,
  formatDate,
  prettify,
} from "@/components/dashboard/salary-tab";
import { Branch } from "@/validations";
import { useMemo } from "react";

const PIE_COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#06b6d4",
  "#84cc16",
];

function OverviewTab({
  dashboard,
}: {
  dashboard: DashboardResponseData | null;
}) {
  const overview = dashboard?.overview;
  const chartData = dashboard?.charts;

  const records = dashboard?.records;
  const sessions = dashboard?.meta.sessions || [];

  const feeStatusCards = chartData?.feeStatusBreakdown || [];
  const recentTransactions = records?.transactions || [];

  const chartTooltipFormatter = (
    value: number | string | readonly (number | string)[] | undefined,
  ) =>
    fmtCurrency(
      typeof value === "number"
        ? value
        : Array.isArray(value)
          ? Number(value[0] || 0)
          : Number(value || 0),
    );

  const feePieData = useMemo(
    () =>
      (chartData?.feeCollectionByType || [])
        .filter((item) => (item.amount || 0) > 0)
        .map((item, index) => ({
          ...item,
          value: item.amount || 0,
          color: PIE_COLORS[index % PIE_COLORS.length],
        })),
    [chartData?.feeCollectionByType],
  );

  const expenseBarData = useMemo(
    () =>
      (chartData?.expenseByCategory || [])
        .filter((item) => (item.amount || 0) > 0)
        .map((item, index) => ({
          ...item,
          value: item.amount || 0,
          color: PIE_COLORS[index % PIE_COLORS.length],
        })),
    [chartData?.expenseByCategory],
  );

  return (
    <TabsContent value="overview" className="mt-4 space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Collection"
          value={fmtCurrency(overview?.totalCollection || 0)}
          sub={`${dashboard?.meta.counts.fees || 0} fee records`}
          icon={<DollarSign className="h-4 w-4 text-emerald-600" />}
          variant="success"
        />
        <StatCard
          label="Total Expenses"
          value={fmtCurrency(overview?.totalExpenses || 0)}
          sub={`${dashboard?.meta.counts.expenses || 0} expense records`}
          icon={<ArrowUpCircle className="h-4 w-4 text-red-500" />}
          variant="danger"
        />
        <StatCard
          label="Salary Outflow"
          value={fmtCurrency(overview?.paidSalaryOutflow || 0)}
          sub={`${dashboard?.meta.counts.salaries || 0} salary records`}
          icon={<Wallet className="h-4 w-4 text-blue-500" />}
          variant="info"
        />
        <StatCard
          label="Net Balance"
          value={fmtCurrency(overview?.netBalance || 0)}
          sub="Collection - expenses - paid salary"
          icon={
            (overview?.netBalance || 0) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )
          }
          variant={(overview?.netBalance || 0) >= 0 ? "success" : "danger"}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Due"
          value={fmtCurrency(overview?.totalDue || 0)}
          sub={`${feeStatusCards.find((item) => item.key === "due")?.count || 0} due records`}
          icon={<AlertCircle className="h-4 w-4 text-amber-500" />}
          variant="warning"
        />
        <StatCard
          label="Active Students"
          value={`${overview?.totalStudents || 0}`}
          sub="Filtered student count"
          icon={<BookOpen className="h-4 w-4 text-violet-500" />}
        />
        <StatCard
          label="Active Staff"
          value={`${overview?.totalStaff || 0}`}
          sub="Filtered staff count"
          icon={<Users className="h-4 w-4 text-teal-500" />}
        />
        <StatCard
          label="Branches"
          value={`${Object.values(Branch).length}`}
          sub={Object.values(Branch)
            .map((branch) => BRANCH_LABEL[branch])
            .join(" · ")}
          icon={<Building2 className="h-4 w-4 text-orange-500" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Cash Flow Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData?.cashFlowTrend || []}>
                <defs>
                  <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="salaryFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                />
                <Tooltip formatter={chartTooltipFormatter} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  fill="url(#incomeFill)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  fill="url(#expenseFill)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="salary"
                  stroke="#3b82f6"
                  fill="url(#salaryFill)"
                  strokeWidth={2}
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
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={feePieData}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={50}
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {feePieData.map((entry, index) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={chartTooltipFormatter} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {feePieData.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">
                      {FEE_TYPE_LABEL[item.key] || prettify(item.label)}
                    </span>
                  </div>
                  <span className="font-semibold">
                    {fmtCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={expenseBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  width={90}
                />
                <Tooltip formatter={chartTooltipFormatter} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {expenseBarData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentTransactions.length ? (
                recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${
                          transaction.type === "income"
                            ? "bg-emerald-100 text-emerald-700"
                            : transaction.type === "salary"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {transaction.type === "income"
                          ? "↓"
                          : transaction.type === "salary"
                            ? "S"
                            : "↑"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.date)} ·{" "}
                          {PAYMENT_METHOD_LABEL[transaction.method || ""] ||
                            prettify(transaction.method)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${
                          transaction.type === "income"
                            ? "text-emerald-600"
                            : "text-red-500"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {fmtCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.reference}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-sm text-muted-foreground">
                  No transaction data found for the current filters.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}

export default OverviewTab;
