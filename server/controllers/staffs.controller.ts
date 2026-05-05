import { Branch, Gender } from "@/validations";
import type { Context } from "hono";
import { badRequestError, serverError } from "../error";
import { staffService } from "../services";

export const register = async (c: Context) => {
  const body = await c.req.json();

  const response = await staffService.createStaff(body);

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
  const sortWith = c.req.query("sortWith") || "name";
  const sortOrder = c.req.query("sortOrder") || "desc";
  const search = c.req.query("search") as string;
  const branch = c.req.query("branch") as Branch;
  const gender = c.req.query("gender") as Gender;
  const minSalary =
    parseInt(c.req.query("minSalary") as string, 10) || undefined;
  const maxSalary =
    parseInt(c.req.query("maxSalary") as string, 10) || undefined;
  const fromDate = c.req.query("fromDate") as string;
  const toDate = c.req.query("toDate") as string;

  const joinDateRange = { from: fromDate, to: toDate };

  const response = await staffService.gets({
    page,
    limit,
    sortWith,
    sortOrder,
    gender,
    search,
    joinDateRange,
    baseSalaryRange: { min: minSalary, max: maxSalary },
    branch,
  });

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

export const getByUser = async (c: Context) => {
  const id = c.req.query("userId") as string;

  const response = await staffService.getByUser(id);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

export const get = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await staffService.get(_id);

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

  const body = await c.req.json();

  const response = await staffService.updates({ _id, body });

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

export const updateMe = async (c: Context) => {
  const user = await c.get("user");

  const body = await c.req.json();

  const response = await staffService.updateMe({ userId: user.profile, body });

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

export const permanentDelete = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await staffService.permanentDelete(_id);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};
