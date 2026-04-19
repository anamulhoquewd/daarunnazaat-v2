import { dashboardService } from "@/server/services";
import { serverError } from "@/server/error";
import {
  BatchType,
  Branch,
  ExpenseCategory,
  FeeType,
  PaymentMethod,
  PaymentStatus,
} from "@/validations";
import { Context } from "hono";

export const gets = async (c: Context) => {
  const sessionId = c.req.query("sessionId") as string;
  const branch = c.req.query("branch") as Branch;
  const batchType = c.req.query("batchType") as BatchType;
  const feeType = c.req.query("feeType") as FeeType;
  const paymentMethod = c.req.query("paymentMethod") as PaymentMethod;
  const paymentStatus = c.req.query("paymentStatus") as PaymentStatus;
  const expenseCategory = c.req.query("expenseCategory") as ExpenseCategory;
  const salaryStatus = c.req.query("salaryStatus") as
    | "paid"
    | "pending"
    | "partial";
  const period = c.req.query("period") as string;
  const transactionType = c.req.query("transactionType") as
    | "income"
    | "expense"
    | "salary";
  const search = c.req.query("search") as string;
  const fromDate = c.req.query("fromDate") as string;
  const toDate = c.req.query("toDate") as string;
  const minAmount =
    parseInt(c.req.query("minAmount") as string, 10) || undefined;
  const maxAmount =
    parseInt(c.req.query("maxAmount") as string, 10) || undefined;
  const recentLimit =
    parseInt(c.req.query("recentLimit") as string, 10) || undefined;

  const response = await dashboardService.gets({
    sessionId,
    branch,
    batchType,
    feeType,
    paymentMethod,
    paymentStatus,
    expenseCategory,
    salaryStatus,
    period,
    transactionType,
    search,
    recentLimit,
    dateRange: {
      from: fromDate,
      to: toDate,
    },
    amountRange: {
      min: minAmount,
      max: maxAmount,
    },
  });

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};
