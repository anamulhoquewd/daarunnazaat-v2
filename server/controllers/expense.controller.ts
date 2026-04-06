import { Branch, ExpenseCategory, PaymentMethod } from "@/validations";
import { Context } from "hono";
import { badRequestError, serverError } from "@/server/error";
import { expenseService } from "@/server/services";

export const register = async (c: Context) => {
  const body = await c.req.json();

  // logged in user
  const authUser = await c.get("user");

  const response = await expenseService.register({
    ...body,
    createdBy: authUser._id,
  });

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 201);
};

export const gets = async (c: Context) => {
  const page = parseInt(c.req.query("page") as string, 10) || 1;
  const limit = parseInt(c.req.query("limit") as string, 10) || 10;
  const sortBy = c.req.query("sortBy") || "createdAt";
  const sortType = c.req.query("sortType") || "desc";
  const search = c.req.query("search") as string;
  const category = c.req.query("category") as ExpenseCategory;
  const paymentMethod = c.req.query("paymentMethod") as PaymentMethod;
  const createdBy = c.req.query("createdBy") as string;
  const fromDate = c.req.query("fromDate") as string;
  const toDate = c.req.query("toDate") as string;
  const branch = c.req.query("branch") as Branch;

  const expenseDateRange = { from: fromDate, to: toDate };

  const minAmount = parseInt(c.req.query("minAmount") as string, 10) || 0;
  const maxAmount =
    parseInt(c.req.query("maxAmount") as string, 10) || 10000000;

  const response = await expenseService.gets({
    page,
    limit,
    sortBy,
    sortType,

    search,
    category,
    paymentMethod,
    amountRange: { max: maxAmount, min: minAmount },
    createdBy,
    expenseDateRange,
    branch,
  });

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

export const get = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await expenseService.get(_id);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

export const updates = async (c: Context) => {
  const _id = c.req.param("_id");
  const updatedByUserId = await c.get("user");
  const body = await c.req.json();

  const response = await expenseService.updates({ _id, body, updatedByUserId });

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

export const deleteFlag = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await expenseService.deleteFlag(_id);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

// Restore expense
export const restoreExpense = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await expenseService.restoreExpense(_id);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

// Delete fee
export const permanentDelete = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await expenseService.permanentDelete(_id);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};
