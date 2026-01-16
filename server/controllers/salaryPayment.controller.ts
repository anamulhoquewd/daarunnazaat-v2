import { PaymentMethod } from "@/validations";
import { Context } from "hono";
import { badRequestError, serverError } from "../error";
import { salaryService } from "../services";

export const register = async (c: Context) => {
  const body = await c.req.json();

  // logged in user
  const authUser = await c.get("user");

  const response = await salaryService.register({
    ...body,
    paidBy: authUser._id,
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
  const month = c.req.query("month") as string;
  const year = c.req.query("year") as string;
  const paymentMethod = c.req.query("paymentMethod") as PaymentMethod;
  const paidBy = c.req.query("paidBy") as string;
  const staffId = c.req.query("staffId") as string;
  const fromDate = c.req.query("fromDate") as string;
  const toDate = c.req.query("toDate") as string;

  const paymentDateRange = { from: fromDate, to: toDate };

  const minSalary = parseInt(c.req.query("minSalary") as string, 10) || 0;
  const maxSalary = parseInt(c.req.query("maxSalary") as string, 10) || 100000;

  const response = await salaryService.gets({
    page,
    limit,
    sortBy,
    sortType,

    search,
    month,
    year,
    paymentMethod,
    netSalaryRange: { max: maxSalary, min: minSalary },
    paidBy,
    staffId,
    paymentDateRange,
  });

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

export const get = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await salaryService.get(_id);

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

  const response = await salaryService.updates({ _id, body, updatedByUserId });

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

export const deletes = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await salaryService.deletes(_id);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};
