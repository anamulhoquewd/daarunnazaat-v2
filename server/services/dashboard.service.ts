import { Expense } from "@/server/models/expences.model";
import { FeeCollection } from "@/server/models/feeCollections.model";
import { Salary } from "@/server/models/salaryPayments.model";
import { Session } from "@/server/models/sessions.model";
import { Staff } from "@/server/models/staffs.model";
import { Student } from "@/server/models/students.model";
import {
  BatchType,
  Branch,
  ExpenseCategory,
  FeeType,
  PaymentMethod,
  PaymentStatus,
} from "@/validations";
import mongoose from "mongoose";

type DashboardDateRange = {
  from?: string | Date;
  to?: string | Date;
};

type DashboardAmountRange = {
  min?: number;
  max?: number;
};

export type DashboardFilters = {
  branch?: Branch;
  sessionId?: string;
  batchType?: BatchType;
  feeType?: FeeType;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  expenseCategory?: ExpenseCategory;
  salaryStatus?: "paid" | "pending" | "partial";
  period?: string;
  transactionType?: "income" | "expense" | "salary";
  dateRange?: DashboardDateRange;
  amountRange?: DashboardAmountRange;
  search?: string;
  recentLimit?: number;
};

type ChartPoint = {
  label: string;
  income: number;
  expense: number;
  salary: number;
  net: number;
};

const isValidObjectId = (value?: string) =>
  !!value && mongoose.Types.ObjectId.isValid(value);

const normalizeDate = (value?: string | Date, endOfDay = false) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }

  return date;
};

const inNumberRange = (value: number, range?: DashboardAmountRange) => {
  if (range?.min !== undefined && value < range.min) return false;
  if (range?.max !== undefined && value > range.max) return false;
  return true;
};

const monthKey = (value: Date | string) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const monthLabel = (key: string) => {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleString("en-BD", {
    month: "short",
    year: "numeric",
  });
};

const buildDateQuery = (field: string, range?: DashboardDateRange) => {
  const from = normalizeDate(range?.from);
  const to = normalizeDate(range?.to, true);

  if (!from && !to) return null;

  const query: Record<string, Date> = {};
  if (from) query.$gte = from;
  if (to) query.$lte = to;

  return { [field]: query };
};

const getTimestamp = (value?: string | Date | null) => {
  if (!value) return 0;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

export const gets = async (filters: DashboardFilters = {}) => {
  try {
    const recentLimit = Math.min(Math.max(filters.recentLimit || 10, 1), 50);

    const feeQuery: any = { isDeleted: false };
    const expenseQuery: any = { isDeleted: false };
    const salaryQuery: any = { isDeleted: false };
    const studentQuery: any = { isDeleted: false, isActive: true };
    const staffQuery: any = { isActive: true };

    if (filters.branch) {
      feeQuery.branch = filters.branch;
      expenseQuery.branch = { $in: [filters.branch] };
      salaryQuery.branch = filters.branch;
      studentQuery.branch = filters.branch;
      staffQuery.branch = filters.branch;
    }

    if (filters.sessionId && isValidObjectId(filters.sessionId)) {
      feeQuery.sessionId = new mongoose.Types.ObjectId(filters.sessionId);
      studentQuery.currentSessionId = new mongoose.Types.ObjectId(
        filters.sessionId,
      );
    }

    if (filters.batchType) {
      studentQuery.batchType = filters.batchType;
    }

    if (filters.feeType) {
      feeQuery.feeType = filters.feeType;
    }

    if (filters.paymentMethod) {
      feeQuery.paymentMethod = filters.paymentMethod;
      expenseQuery.paymentMethod = filters.paymentMethod;
      salaryQuery.paymentMethod = filters.paymentMethod;
    }

    if (filters.paymentStatus) {
      feeQuery.paymentStatus = filters.paymentStatus;
    }

    if (filters.expenseCategory) {
      expenseQuery.category = filters.expenseCategory;
    }

    if (filters.salaryStatus) {
      salaryQuery.status = filters.salaryStatus;
    }

    if (filters.period) {
      feeQuery.period = filters.period;
      salaryQuery.period = filters.period;
    }

    const feeDateQuery = buildDateQuery("paymentDate", filters.dateRange);
    const expenseDateQuery = buildDateQuery("expenseDate", filters.dateRange);
    const salaryDateQuery = buildDateQuery("paymentDate", filters.dateRange);

    if (feeDateQuery) Object.assign(feeQuery, feeDateQuery);
    if (expenseDateQuery) Object.assign(expenseQuery, expenseDateQuery);
    if (salaryDateQuery) Object.assign(salaryQuery, salaryDateQuery);

    if (filters.search?.trim()) {
      const regex = new RegExp(filters.search.trim(), "i");
      feeQuery.$or = [{ receiptNumber: regex }];
      expenseQuery.$or = [{ voucherNumber: regex }, { description: regex }];
      salaryQuery.$or = [{ receiptNumber: regex }];
    }

    const [fees, expenses, salaries, studentsCount, staffCount, sessions] =
      await Promise.all([
        FeeCollection.find(feeQuery)
          .populate("studentId", "fullName branch batchType currentSessionId")
          .populate("sessionId", "sessionName batchType")
          .sort({ paymentDate: -1 })
          .lean(),
        Expense.find(expenseQuery).sort({ expenseDate: -1 }).lean(),
        Salary.find(salaryQuery)
          .populate("staffId", "fullName designation branch baseSalary")
          .sort({ paymentDate: -1 })
          .lean(),
        Student.countDocuments(studentQuery),
        Staff.countDocuments(staffQuery),
        Session.find({})
          .select("_id sessionName batchType isActive startDate endDate")
          .sort({ startDate: -1 })
          .lean(),
      ]);

    const searchValue = filters.search?.trim().toLowerCase();

    const filteredFees = fees.filter((fee) => {
      const student = fee.studentId as any;
      const session = fee.sessionId as any;

      if (
        filters.batchType &&
        student?.batchType !== filters.batchType &&
        session?.batchType !== filters.batchType
      ) {
        return false;
      }

      if (searchValue) {
        const searchable = [
          fee.receiptNumber,
          fee.period,
          fee.feeType,
          student?.fullName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(searchValue)) return false;
      }

      return (
        inNumberRange(fee.receivedAmount || 0, filters.amountRange) ||
        inNumberRange(fee.payableAmount || 0, filters.amountRange) ||
        inNumberRange(fee.dueAmount || 0, filters.amountRange)
      );
    });

    const filteredExpenses = expenses.filter((expense) => {
      if (searchValue) {
        const searchable = [
          expense.voucherNumber,
          expense.description,
          expense.category,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(searchValue)) return false;
      }

      return inNumberRange(expense.amount || 0, filters.amountRange);
    });

    const filteredSalaries = salaries.filter((salary) => {
      const staff = salary.staffId as any;

      if (searchValue) {
        const searchable = [
          salary.receiptNumber,
          salary.period,
          salary.status,
          staff?.fullName,
          staff?.designation,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(searchValue)) return false;
      }

      return inNumberRange(salary.netSalary || 0, filters.amountRange);
    });

    const paidSalaryOutflow = filteredSalaries
      .filter((salary) => salary.status === "paid")
      .reduce((sum, salary) => sum + (salary.netSalary || 0), 0);

    const totalCollection = filteredFees.reduce(
      (sum, fee) => sum + (fee.receivedAmount || 0),
      0,
    );
    const totalPayable = filteredFees.reduce(
      (sum, fee) => sum + (fee.payableAmount || 0),
      0,
    );
    const totalDue = filteredFees.reduce(
      (sum, fee) => sum + (fee.dueAmount || 0),
      0,
    );
    const totalAdvance = filteredFees.reduce(
      (sum, fee) => sum + (fee.advanceAmount || 0),
      0,
    );
    const totalExpenses = filteredExpenses.reduce(
      (sum, expense) => sum + (expense.amount || 0),
      0,
    );
    const totalSalary = filteredSalaries.reduce(
      (sum, salary) => sum + (salary.netSalary || 0),
      0,
    );
    const netBalance = totalCollection - totalExpenses - paidSalaryOutflow;

    const monthlyMap = new Map<string, ChartPoint>();

    const ensureMonth = (date?: string | Date | null) => {
      if (!date) return null;
      const key = monthKey(date);
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, {
          label: monthLabel(key),
          income: 0,
          expense: 0,
          salary: 0,
          net: 0,
        });
      }
      return monthlyMap.get(key)!;
    };

    filteredFees.forEach((fee) => {
      const point = ensureMonth(fee.paymentDate);
      if (!point) return;
      point.income += fee.receivedAmount || 0;
    });

    filteredExpenses.forEach((expense) => {
      const point = ensureMonth(expense.expenseDate);
      if (!point) return;
      point.expense += expense.amount || 0;
    });

    filteredSalaries
      .filter((salary) => salary.status === "paid")
      .forEach((salary) => {
        const point = ensureMonth(salary.paymentDate);
        if (!point) return;
        point.salary += salary.netSalary || 0;
      });

    const cashFlowTrend = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, point]) => ({
        ...point,
        net: point.income - point.expense - point.salary,
      }));

    const feeCollectionByType = Object.values(FeeType).map((feeType) => {
      const items = filteredFees.filter((fee) => fee.feeType === feeType);
      return {
        key: feeType,
        label: feeType,
        amount: items.reduce((sum, fee) => sum + (fee.receivedAmount || 0), 0),
        due: items.reduce((sum, fee) => sum + (fee.dueAmount || 0), 0),
        count: items.length,
      };
    });

    const expenseByCategory = Object.values(ExpenseCategory).map((category) => {
      const items = filteredExpenses.filter(
        (expense) => expense.category === category,
      );
      return {
        key: category,
        label: category,
        amount: items.reduce((sum, expense) => sum + (expense.amount || 0), 0),
        count: items.length,
      };
    });

    const paymentMethodBreakdown = Object.values(PaymentMethod).map((method) => {
      const feeAmount = filteredFees
        .filter((fee) => fee.paymentMethod === method)
        .reduce((sum, fee) => sum + (fee.receivedAmount || 0), 0);

      const expenseAmount = filteredExpenses
        .filter((expense) => expense.paymentMethod === method)
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);

      const salaryAmount = filteredSalaries
        .filter((salary) => salary.paymentMethod === method)
        .reduce((sum, salary) => sum + (salary.netSalary || 0), 0);

      return {
        key: method,
        label: method,
        income: feeAmount,
        expense: expenseAmount,
        salary: salaryAmount,
        total: feeAmount + expenseAmount + salaryAmount,
      };
    });

    const branchValues = Object.values(Branch);

    const branchWiseOverview = branchValues.map((branch) => {
      const feeAmount = filteredFees
        .filter((fee) => fee.branch === branch)
        .reduce((sum, fee) => sum + (fee.receivedAmount || 0), 0);

      const expenseAmount = filteredExpenses
        .filter((expense) => expense.branch?.includes(branch))
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);

      const salaryAmount = filteredSalaries
        .filter((salary) => salary.branch === branch && salary.status === "paid")
        .reduce((sum, salary) => sum + (salary.netSalary || 0), 0);

      return {
        key: branch,
        label: branch,
        income: feeAmount,
        expense: expenseAmount,
        salary: salaryAmount,
        net: feeAmount - expenseAmount - salaryAmount,
      };
    });

    const feeStatusBreakdown = ["paid", "partial", "due", "overdue"].map(
      (status) => {
        const items = filteredFees.filter((fee) => fee.paymentStatus === status);
        return {
          key: status,
          label: status,
          count: items.length,
          amount: items.reduce(
            (sum, fee) => sum + (fee.receivedAmount || 0),
            0,
          ),
          due: items.reduce((sum, fee) => sum + (fee.dueAmount || 0), 0),
        };
      },
    );

    const transactions = [
      ...filteredFees.map((fee) => ({
        id: fee._id,
        type: "income" as const,
        date: fee.paymentDate,
        amount: fee.receivedAmount || 0,
        branch: fee.branch,
        method: fee.paymentMethod,
        reference: fee.receiptNumber,
        description: `${(fee.studentId as any)?.fullName || "Student"} fee collection`,
        subType: fee.feeType,
      })),
      ...filteredExpenses.map((expense) => ({
        id: expense._id,
        type: "expense" as const,
        date: expense.expenseDate,
        amount: expense.amount || 0,
        branch: expense.branch?.[0],
        method: expense.paymentMethod,
        reference: expense.voucherNumber,
        description: expense.description,
        subType: expense.category,
      })),
      ...filteredSalaries
        .filter((salary) => salary.status === "paid")
        .map((salary) => ({
          id: salary._id,
          type: "salary" as const,
          date: salary.paymentDate,
          amount: salary.netSalary || 0,
          branch: salary.branch,
          method: salary.paymentMethod,
          reference: salary.receiptNumber,
          description: `${(salary.staffId as any)?.fullName || "Staff"} salary payment`,
          subType: "salary",
        })),
    ]
      .filter((transaction) =>
        filters.transactionType
          ? transaction.type === filters.transactionType
          : true,
      )
      .sort(
        (a, b) => getTimestamp(b.date) - getTimestamp(a.date),
      );

    return {
      success: {
        success: true,
        message: "Dashboard analytics fetched successfully",
        data: {
          filtersApplied: {
            ...filters,
            dateRange: {
              from: normalizeDate(filters.dateRange?.from)?.toISOString() || null,
              to:
                normalizeDate(filters.dateRange?.to, true)?.toISOString() || null,
            },
          },
          overview: {
            totalStudents: studentsCount,
            totalStaff: staffCount,
            totalCollection,
            totalPayable,
            totalDue,
            totalAdvance,
            totalExpenses,
            totalSalary,
            paidSalaryOutflow,
            netBalance,
            totalTransactions: transactions.length,
          },
          charts: {
            cashFlowTrend,
            feeCollectionByType,
            expenseByCategory,
            paymentMethodBreakdown,
            branchWiseOverview,
            feeStatusBreakdown,
          },
          records: {
            fees: filteredFees.slice(0, recentLimit),
            expenses: filteredExpenses.slice(0, recentLimit),
            salaries: filteredSalaries.slice(0, recentLimit),
            transactions: transactions.slice(0, recentLimit),
          },
          meta: {
            counts: {
              fees: filteredFees.length,
              expenses: filteredExpenses.length,
              salaries: filteredSalaries.length,
              sessions: sessions.length,
            },
            sessions,
          },
        },
      },
    };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};
