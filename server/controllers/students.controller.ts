import { BatchType, Branch, Gender } from "@/validations";
import type { Context } from "hono";
import { badRequestError, serverError } from "../error";
import { studentService } from "../services";

export const register = async (c: Context) => {
  const body = await c.req.json();

  // logged in user
  const authUser = await c.get("user");

  const response = await studentService.createStudent({ body, authUser });

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
  const sortBy = c.req.query("sortBy") || "name";
  const sortType = c.req.query("sortType") || "desc";
  const search = c.req.query("search") as string;
  const classId = c.req.query("classId") as string;
  const branch = c.req.query("branch") as Branch;
  const gender = c.req.query("gender") as Gender;
  const isResidentialRaw = c.req.query("isResidential") as string;
  const guardianId = c.req.query("guardianId") as string;
  const batchType = c.req.query("batchType") as BatchType;
  const currentSessionId = c.req.query("currentSessionId") as string;
  const fromDate = c.req.query("fromDate") as string;
  const toDate = c.req.query("toDate") as string;

  const admissionDateRange = { from: fromDate, to: toDate };

  let isResidential: boolean | undefined = undefined;

  if (isResidentialRaw === "true") isResidential = true;
  if (isResidentialRaw === "false") isResidential = false;

  const response = await studentService.gets({
    page,
    limit,
    sortBy,
    sortType,
    search,
    classId,
    branch,
    gender,
    isResidential,
    guardianId,
    sessionId: currentSessionId,
    currentSessionId,
    batchType,
    admissionDateRange,
  });

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

export const get = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await studentService.get(_id);

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

  const response = await studentService.updateMe({
    userId: user.profile,
    body,
  });

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

  const response = await studentService.updates({ _id, body });

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

export const promote = async (c: Context) => {
  const _id = c.req.param("_id");

  const body = await c.req.json();

  const response = await studentService.promote({ _id, body });

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

  const response = await studentService.deletes(_id);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

export const deactivate = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await studentService.deactivate(_id);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

export const activate = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await studentService.activate(_id);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};
