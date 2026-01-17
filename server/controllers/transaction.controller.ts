import { Branch, TransactionType } from "@/validations";
import { Context } from "hono";
import { badRequestError, serverError } from "../error";
import { transactionService } from "../services";

export const gets = async (c: Context) => {
  const page = parseInt(c.req.query("page") as string, 10) || 1;
  const limit = parseInt(c.req.query("limit") as string, 10) || 10;
  const sortBy = c.req.query("sortBy") || "createdAt";
  const sortType = c.req.query("sortType") || "desc";
  const search = c.req.query("search") as string;
  const referenceModel = c.req.query("referenceModel") as string;
  const referenceId = c.req.query("referenceId") as string;
  const transactionType = c.req.query("transactionType") as TransactionType;
  const branch = c.req.query("branch") as Branch;

  const minAmount = parseInt(c.req.query("minAmount") as string, 10);
  const maxAmount = parseInt(c.req.query("maxAmount") as string, 10);

  const fromDate = c.req.query("fromDate") as string;
  const toDate = c.req.query("toDate") as string;

  const response = await transactionService.gets({
    page,
    limit,
    sortBy,
    sortType,
    search,
    transactionType,
    referenceModel,
    amountRange: { max: maxAmount, min: minAmount },
    branch,
    referenceId,
    createdDate: { from: fromDate, to: toDate },
  });

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

export const get = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await transactionService.get(_id);

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

  const response = await transactionService.deletes(_id);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};
