import { Context } from "hono";
import { feeCollectionsService } from "../services";
import { badRequestError, serverError } from "../error";
import { Branch, FeeType, PaymentMethod, PaymentSource } from "@/validations";

export const register = async (c: Context) => {
  const body = await c.req.json();

  // logged in user
  const authUser = await c.get("user");

  const response = await feeCollectionsService.register({
    body,
    authUser,
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
  const sortWith = c.req.query("sortWith") || "createdAt";
  const sortOrder = c.req.query("sortOrder") || "desc";
  const search = c.req.query("search") as string;
  const period = c.req.query("period") as string;
  const branch = c.req.query("branch") as Branch;
  const paymentMethod = c.req.query("paymentMethod") as PaymentMethod;
  const studentId = c.req.query("studentId") as string;
  const collectedBy = c.req.query("collectedBy") as string;
  const feeType = c.req.query("feeType") as FeeType;
  const sessionId = c.req.query("sessionId") as string;
  const paymentSource = c.req.query("paymentSource") as PaymentSource;

  const minFee = parseInt(c.req.query("minFee") as string, 10) || undefined;
  const maxFee = parseInt(c.req.query("maxFee") as string, 10) || undefined;

  const fromDate = c.req.query("fromDate") as string;
  const toDate = c.req.query("toDate") as string;

  const response = await feeCollectionsService.gets({
    page,
    limit,
    sortWith,
    sortOrder,

    search,
    period,
    paymentMethod,
    feeRange: { max: maxFee, min: minFee },
    branch,
    studentId,
    collectedBy,
    feeType,
    paymentDate: { from: fromDate, to: toDate },
    paymentSource,
    sessionId,
  });

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

export const get = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await feeCollectionsService.get(_id);

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

  const response = await feeCollectionsService.updates({
    _id,
    body,
    updatedByUserId,
  });

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

  const response = await feeCollectionsService.deleteFlag(_id);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

// Restore fee
export const restoreFee = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await feeCollectionsService.restoreFee(_id);

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

  const response = await feeCollectionsService.permanentDelete(_id);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};
