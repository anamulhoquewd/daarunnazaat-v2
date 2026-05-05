import mongoose from "mongoose";
import { Payment } from "@/modules/payment/schema";
import { Invoice } from "@/modules/invoice/schema";
import { Student } from "@/modules/student/schema";
import { InvoiceStatus, Branch, PaymentMethod } from "@/validations";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function dayRange(dateStr: string): { start: Date; end: Date } {
  const d = new Date(dateStr);
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  return { start, end };
}

function monthRange(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999); // last day of month
  return { start, end };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Daily Collection Report
// ─────────────────────────────────────────────────────────────────────────────

export interface DailyCollectionReport {
  date: string;
  branch?: string;
  totalAmount: number;          // paisa
  paymentCount: number;
  byMethod: Partial<Record<PaymentMethod, number>>;
  byFeeType: Record<string, number>;
  unallocatedTotal: number;     // paisa — advances added to creditBalance
}

export const getDailyCollectionReport = async (params: {
  date: string;
  branch?: string;
}): Promise<{ success: DailyCollectionReport } | { serverError: any }> => {
  try {
    const { start, end } = dayRange(params.date);
    const matchFilter: any = {
      isDeleted: false,
      paymentDate: { $gte: start, $lte: end },
    };
    if (params.branch) matchFilter.branch = params.branch;

    // Total + by method
    const summaryAgg = await Payment.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$paymentMethod",
          total: { $sum: "$totalPaid" },
          count: { $sum: 1 },
          unallocated: { $sum: "$unallocatedAmount" },
        },
      },
    ]);

    const byMethod: Partial<Record<PaymentMethod, number>> = {};
    let totalAmount = 0;
    let paymentCount = 0;
    let unallocatedTotal = 0;

    for (const row of summaryAgg) {
      byMethod[row._id as PaymentMethod] = row.total;
      totalAmount += row.total;
      paymentCount += row.count;
      unallocatedTotal += row.unallocated;
    }

    // feeType breakdown via proportional allocation
    const feeTypeAgg = await Payment.aggregate([
      { $match: matchFilter },
      { $unwind: { path: "$allocations", preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: "invoices",
          localField: "allocations.invoiceId",
          foreignField: "_id",
          as: "invoice",
        },
      },
      { $unwind: "$invoice" },
      { $unwind: "$invoice.lineItems" },
      {
        $addFields: {
          proportionalAmount: {
            $cond: [
              { $gt: ["$invoice.netPayable", 0] },
              {
                $multiply: [
                  "$allocations.allocatedAmount",
                  { $divide: ["$invoice.lineItems.net", "$invoice.netPayable"] },
                ],
              },
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id: "$invoice.lineItems.feeType",
          total: { $sum: "$proportionalAmount" },
        },
      },
    ]);

    const byFeeType: Record<string, number> = {};
    for (const row of feeTypeAgg) {
      byFeeType[row._id] = Math.round(row.total);
    }
    if (unallocatedTotal > 0) {
      byFeeType["advance"] = unallocatedTotal;
    }

    return {
      success: {
        date: params.date,
        branch: params.branch,
        totalAmount,
        paymentCount,
        byMethod,
        byFeeType,
        unallocatedTotal,
      },
    };
  } catch (error: any) {
    return { serverError: { message: error.message } };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Monthly Fee Status Report
// ─────────────────────────────────────────────────────────────────────────────

export interface FeeStatusRow {
  studentId: string;
  studentName: string;
  className: string;
  branch: string;
  invoiceId: string;
  invoiceNumber: string;
  netPayable: number;
  paidAmount: number;
  dueAmount: number;
  status: InvoiceStatus;
}

export interface FeeStatusReport {
  periodYear: number;
  periodMonth: number;
  data: FeeStatusRow[];
  summary: {
    total: number;
    paid: number;
    partial: number;
    unpaid: number;
    totalNetPayable: number;
    totalPaid: number;
    totalDue: number;
  };
}

export const getMonthlyFeeStatusReport = async (params: {
  periodYear: number;
  periodMonth: number;
  branch?: string;
  classId?: string;
  onlyDue?: boolean;
}): Promise<{ success: FeeStatusReport } | { serverError: any }> => {
  try {
    const filter: any = {
      invoiceType: "monthly",
      periodYear: params.periodYear,
      periodMonth: params.periodMonth,
      isDeleted: false,
    };
    if (params.branch) filter.branch = params.branch;
    if (params.onlyDue) filter.status = { $in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIAL] };

    const invoices = await Invoice.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "classes",
          localField: "student.classId",
          foreignField: "_id",
          as: "class",
        },
      },
      { $unwind: { path: "$class", preserveNullAndEmptyArrays: true } },
      ...(params.classId
        ? [{ $match: { "student.classId": new mongoose.Types.ObjectId(params.classId) } }]
        : []),
      {
        $project: {
          invoiceId: "$_id",
          invoiceNumber: 1,
          studentId: 1,
          studentName: "$student.fullName",
          className: "$class.className",
          branch: 1,
          netPayable: 1,
          paidAmount: 1,
          dueAmount: 1,
          status: 1,
        },
      },
      { $sort: { studentName: 1 } },
    ]);

    const data: FeeStatusRow[] = invoices.map((inv: any) => ({
      studentId: inv.studentId?.toString() ?? "",
      studentName: inv.studentName ?? "Unknown",
      className: inv.className ?? "Unknown",
      branch: inv.branch,
      invoiceId: inv.invoiceId?.toString() ?? "",
      invoiceNumber: inv.invoiceNumber,
      netPayable: inv.netPayable,
      paidAmount: inv.paidAmount,
      dueAmount: inv.dueAmount,
      status: inv.status,
    }));

    const summary = data.reduce(
      (acc, row) => {
        acc.total++;
        if (row.status === InvoiceStatus.PAID) acc.paid++;
        else if (row.status === InvoiceStatus.PARTIAL) acc.partial++;
        else if (row.status === InvoiceStatus.UNPAID) acc.unpaid++;
        acc.totalNetPayable += row.netPayable;
        acc.totalPaid += row.paidAmount;
        acc.totalDue += Math.max(0, row.dueAmount);
        return acc;
      },
      { total: 0, paid: 0, partial: 0, unpaid: 0, totalNetPayable: 0, totalPaid: 0, totalDue: 0 },
    );

    return {
      success: { periodYear: params.periodYear, periodMonth: params.periodMonth, data, summary },
    };
  } catch (error: any) {
    return { serverError: { message: error.message } };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Outstanding / Due List
// ─────────────────────────────────────────────────────────────────────────────

export interface OutstandingRow {
  invoiceId: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  branch: string;
  className: string;
  invoiceType: string;
  periodYear: number | null;
  periodMonth: number | null;
  netPayable: number;
  paidAmount: number;
  dueAmount: number;
  daysOverdue: number;
  dueDate: Date | null;
  status: InvoiceStatus;
}

export const getOutstandingReport = async (params: {
  branch?: string;
  asOfDate?: string;
}): Promise<{ success: { data: OutstandingRow[]; totalDue: number } } | { serverError: any }> => {
  try {
    const asOf = params.asOfDate ? new Date(params.asOfDate) : new Date();
    const filter: any = {
      status: { $in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIAL] },
      isDeleted: false,
    };
    if (params.branch) filter.branch = params.branch;

    const invoices = await Invoice.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "classes",
          localField: "student.classId",
          foreignField: "_id",
          as: "class",
        },
      },
      { $unwind: { path: "$class", preserveNullAndEmptyArrays: true } },
      { $sort: { dueAmount: -1, createdAt: 1 } },
    ]);

    const data: OutstandingRow[] = invoices.map((inv: any) => {
      const dueDate = inv.dueDate ? new Date(inv.dueDate) : null;
      const daysOverdue = dueDate
        ? Math.max(0, Math.floor((asOf.getTime() - dueDate.getTime()) / 86_400_000))
        : 0;

      return {
        invoiceId: inv._id?.toString() ?? "",
        invoiceNumber: inv.invoiceNumber,
        studentId: inv.studentId?.toString() ?? "",
        studentName: inv.student?.fullName ?? "Unknown",
        branch: inv.branch,
        className: inv.class?.className ?? "Unknown",
        invoiceType: inv.invoiceType,
        periodYear: inv.periodYear,
        periodMonth: inv.periodMonth,
        netPayable: inv.netPayable,
        paidAmount: inv.paidAmount,
        dueAmount: inv.dueAmount,
        daysOverdue,
        dueDate,
        status: inv.status,
      };
    });

    const totalDue = data.reduce((s, r) => s + Math.max(0, r.dueAmount), 0);
    return { success: { data, totalDue } };
  } catch (error: any) {
    return { serverError: { message: error.message } };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Income vs Expense (P&L)
// ─────────────────────────────────────────────────────────────────────────────
// NOTE: Payment amounts are stored in paisa (v5 model).
//       Expense.amount and Salary.netSalary are stored in taka (old models)
//       → multiply old-model values × 100 to convert to paisa.

export interface PLReport {
  periodYear: number;
  periodMonth: number;
  branch?: string;
  income: number;       // paisa
  expense: number;      // paisa
  net: number;          // paisa
  incomeByFeeType: Record<string, number>;
  expenseByCategory: Record<string, number>;
  salaryExpense: number;
}

export const getPLReport = async (params: {
  periodYear: number;
  periodMonth: number;
  branch?: string;
}): Promise<{ success: PLReport } | { serverError: any }> => {
  try {
    const { start, end } = monthRange(params.periodYear, params.periodMonth);

    // ── Income: v5 Payment model (paisa) ──
    const paymentMatch: any = {
      isDeleted: false,
      paymentDate: { $gte: start, $lte: end },
    };
    if (params.branch) paymentMatch.branch = params.branch;

    const [incomeAgg, feeTypeAgg] = await Promise.all([
      Payment.aggregate([
        { $match: paymentMatch },
        { $group: { _id: null, total: { $sum: "$totalPaid" } } },
      ]),

      // feeType breakdown (same proportional logic as daily-collection)
      Payment.aggregate([
        { $match: paymentMatch },
        { $unwind: { path: "$allocations", preserveNullAndEmptyArrays: false } },
        {
          $lookup: {
            from: "invoices",
            localField: "allocations.invoiceId",
            foreignField: "_id",
            as: "invoice",
          },
        },
        { $unwind: "$invoice" },
        { $unwind: "$invoice.lineItems" },
        {
          $addFields: {
            proportionalAmount: {
              $cond: [
                { $gt: ["$invoice.netPayable", 0] },
                {
                  $multiply: [
                    "$allocations.allocatedAmount",
                    { $divide: ["$invoice.lineItems.net", "$invoice.netPayable"] },
                  ],
                },
                0,
              ],
            },
          },
        },
        { $group: { _id: "$invoice.lineItems.feeType", total: { $sum: "$proportionalAmount" } } },
      ]),
    ]);

    const income = incomeAgg[0]?.total ?? 0;
    const incomeByFeeType: Record<string, number> = {};
    for (const row of feeTypeAgg) incomeByFeeType[row._id] = Math.round(row.total);

    // ── Expense: old Expense model (taka → ×100 → paisa) ──
    const expenseMatch: any = {
      isDeleted: false,
      expenseDate: { $gte: start, $lte: end },
    };
    if (params.branch) {
      // branch is an array on the old model
      expenseMatch.branch = { $in: [params.branch] };
    }

    const { Expense: expenseModel } = await import("@/server/models/expences.model");
    const expenseDocs = await (expenseModel as any).aggregate([
      { $match: expenseMatch },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
    ]);

    const expenseByCategory: Record<string, number> = {};
    let expenseTotal = 0;
    for (const row of expenseDocs) {
      const paisa = Math.round(row.total * 100);
      expenseByCategory[row._id] = paisa;
      expenseTotal += paisa;
    }

    // ── Salary: old Salary model (taka → ×100 → paisa) ──
    const periodStr = `${params.periodYear}-${String(params.periodMonth).padStart(2, "0")}`;
    const salaryMatch: any = { isDeleted: false, period: periodStr, status: "paid" };
    if (params.branch) salaryMatch.branch = params.branch;

    const { Salary } = await import("@/server/models/salaryPayments.model");
    const salaryAgg = await (Salary as any).aggregate([
      { $match: salaryMatch },
      { $group: { _id: null, total: { $sum: "$netSalary" } } },
    ]);

    const salaryExpense = Math.round((salaryAgg[0]?.total ?? 0) * 100);
    expenseByCategory["salary"] = salaryExpense;
    const expense = expenseTotal + salaryExpense;

    return {
      success: {
        periodYear: params.periodYear,
        periodMonth: params.periodMonth,
        branch: params.branch,
        income,
        expense,
        net: income - expense,
        incomeByFeeType,
        expenseByCategory,
        salaryExpense,
      },
    };
  } catch (error: any) {
    return { serverError: { message: error.message } };
  }
};
