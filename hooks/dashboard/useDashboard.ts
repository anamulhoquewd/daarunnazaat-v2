import api from "@/axios/intercepter";
import { useDebounce } from "@/hooks/common/useDebounce";
import { buildQuery, handleAxiosError } from "@/lib/utils";
import {
  BatchType,
  Branch,
  ExpenseCategory,
  FeeType,
  PaymentMethod,
  PaymentStatus,
} from "@/validations";
import { useCallback, useEffect, useMemo, useState } from "react";

export type DashboardFilterState = {
  sessionId: string;
  batchType: "all" | BatchType;
  branch: "all" | Branch;
  feeType: "all" | FeeType;
  expenseCategory: "all" | ExpenseCategory;
  paymentMethod: "all" | PaymentMethod;
  paymentStatus: "all" | PaymentStatus;
  salaryStatus: "all" | "paid" | "pending" | "partial";
  transactionType: "all" | "income" | "expense" | "salary";
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  period: string;
  search: string;
  recentLimit: string;
};

export type DashboardOverview = {
  totalStudents: number;
  totalStaff: number;
  totalCollection: number;
  totalPayable: number;
  totalDue: number;
  totalAdvance: number;
  totalExpenses: number;
  totalSalary: number;
  paidSalaryOutflow: number;
  netBalance: number;
  totalTransactions: number;
};

export type DashboardChartItem = {
  key: string;
  label: string;
  amount?: number;
  due?: number;
  count?: number;
  value?: number;
  income?: number;
  expense?: number;
  salary?: number;
  total?: number;
  net?: number;
};

export type DashboardTransaction = {
  id: string;
  type: "income" | "expense" | "salary";
  date?: string;
  amount: number;
  branch?: string;
  method?: string;
  reference: string;
  description: string;
  subType: string;
};

export type DashboardFeeRecord = {
  _id: string;
  receiptNumber: string;
  feeType: string;
  period?: string;
  branch: string;
  receivedAmount: number;
  dueAmount: number;
  payableAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  paymentDate?: string;
  studentId?: {
    fullName?: string;
    batchType?: string;
    branch?: string;
  };
  sessionId?: {
    _id: string;
    sessionName?: string;
    batchType?: string;
  };
};

export type DashboardExpenseRecord = {
  _id: string;
  voucherNumber: string;
  category: string;
  description: string;
  amount: number;
  expenseDate?: string;
  paymentMethod: string;
  branch: string[];
};

export type DashboardSalaryRecord = {
  _id: string;
  receiptNumber: string;
  period: string;
  baseSalary: number;
  bonus: number;
  netSalary: number;
  status: "paid" | "pending" | "partial";
  paymentDate?: string;
  paymentMethod: string;
  branch: string;
  staffId?: {
    fullName?: string;
    designation?: string;
  };
};

export type DashboardSession = {
  _id: string;
  sessionName: string;
  batchType: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
};

export type DashboardResponseData = {
  filtersApplied: Record<string, unknown>;
  overview: DashboardOverview;
  charts: {
    cashFlowTrend: Array<{
      label: string;
      income: number;
      expense: number;
      salary: number;
      net: number;
    }>;
    feeCollectionByType: DashboardChartItem[];
    expenseByCategory: DashboardChartItem[];
    paymentMethodBreakdown: DashboardChartItem[];
    branchWiseOverview: DashboardChartItem[];
    feeStatusBreakdown: DashboardChartItem[];
  };
  records: {
    fees: DashboardFeeRecord[];
    expenses: DashboardExpenseRecord[];
    salaries: DashboardSalaryRecord[];
    transactions: DashboardTransaction[];
  };
  meta: {
    counts: {
      fees: number;
      expenses: number;
      salaries: number;
      sessions: number;
    };
    sessions: DashboardSession[];
  };
};

export const DEFAULT_DASHBOARD_FILTERS: DashboardFilterState = {
  sessionId: "all",
  batchType: "all",
  branch: "all",
  feeType: "all",
  expenseCategory: "all",
  paymentMethod: "all",
  paymentStatus: "all",
  salaryStatus: "all",
  transactionType: "all",
  dateFrom: "",
  dateTo: "",
  amountMin: "",
  amountMax: "",
  period: "",
  search: "",
  recentLimit: "10",
};

function useDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<DashboardFilterState>(
    DEFAULT_DASHBOARD_FILTERS,
  );
  const [dashboard, setDashboard] = useState<DashboardResponseData | null>(null);

  const debouncedSearch = useDebounce(filters.search, 500);

  const fetchDashboard = useCallback(
    async (currentFilters: DashboardFilterState) => {
      setIsLoading(true);

      try {
        const query = buildQuery({
          sessionId:
            currentFilters.sessionId === "all"
              ? undefined
              : currentFilters.sessionId,
          batchType:
            currentFilters.batchType === "all"
              ? undefined
              : currentFilters.batchType,
          branch:
            currentFilters.branch === "all" ? undefined : currentFilters.branch,
          feeType:
            currentFilters.feeType === "all"
              ? undefined
              : currentFilters.feeType,
          expenseCategory:
            currentFilters.expenseCategory === "all"
              ? undefined
              : currentFilters.expenseCategory,
          paymentMethod:
            currentFilters.paymentMethod === "all"
              ? undefined
              : currentFilters.paymentMethod,
          paymentStatus:
            currentFilters.paymentStatus === "all"
              ? undefined
              : currentFilters.paymentStatus,
          salaryStatus:
            currentFilters.salaryStatus === "all"
              ? undefined
              : currentFilters.salaryStatus,
          transactionType:
            currentFilters.transactionType === "all"
              ? undefined
              : currentFilters.transactionType,
          fromDate: currentFilters.dateFrom || undefined,
          toDate: currentFilters.dateTo || undefined,
          minAmount: currentFilters.amountMin || undefined,
          maxAmount: currentFilters.amountMax || undefined,
          period: currentFilters.period || undefined,
          search: currentFilters.search || undefined,
          recentLimit: currentFilters.recentLimit || undefined,
        });

        const response = await api.get(`/dashboard?${query}`);

        if (!response.data.success) {
          throw new Error(
            response.data.error?.message || "Failed to fetch dashboard data",
          );
        }

        setDashboard(response.data.data);
      } catch (error) {
        handleAxiosError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchDashboard({
      ...filters,
      search: debouncedSearch,
    });
  }, [debouncedSearch, fetchDashboard, filters]);

  const setFilter = useCallback(
    (key: keyof DashboardFilterState, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_DASHBOARD_FILTERS);
  }, []);

  const activeFilterCount = useMemo(
    () =>
      Object.entries(filters).filter(([key, value]) => {
        if (key === "recentLimit") return false;
        return value !== "" && value !== "all";
      }).length,
    [filters],
  );

  return {
    dashboard,
    filters,
    setFilters,
    setFilter,
    resetFilters,
    activeFilterCount,
    isLoading,
    refetch: () =>
      fetchDashboard({
        ...filters,
        search: debouncedSearch,
      }),
  };
}

export default useDashboard;
