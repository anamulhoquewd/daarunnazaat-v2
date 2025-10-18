import type { Context } from "hono";
import { studentService } from "../services";
import { badRequestHandler, serverErrorHandler } from "../error";

export const register = async (c: Context) => {
  const body = await c.req.json();

  const response = await studentService.register(body);

  if (response.error) {
    return badRequestHandler(c, response.error);
  }

  if (response.serverError) {
    return serverErrorHandler(c, response.serverError);
  }

  return c.json(response.success, 201);
};

// Get all admins
export const gets = async (c: Context) => {
  const page = parseInt(c.req.query("page") as string, 10) || 1;
  const limit = parseInt(c.req.query("limit") as string, 10) || 10;
  const sortBy = c.req.query("sortBy") || "name";
  const sortType = c.req.query("sortType") || "desc";
  const search = c.req.query("search") as string;
  const class_id = c.req.query("class_id") as string;
  const gender = c.req.query("gender") as "male" | "female";

  const response = await studentService.gets({
    page,
    limit,
    sortBy,
    sortType,

    search,
    class_id,
    gender,
  });

  if (response.serverError) {
    return serverErrorHandler(c, response.serverError);
  }

  return c.json(response.success, 200);
};

export const get = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await studentService.get(_id);

  if (response.error) {
    return badRequestHandler(c, response.error);
  }

  if (response.serverError) {
    return serverErrorHandler(c, response.serverError);
  }

  return c.json(response.success, 200);
};

// Update profile
export const updates = async (c: Context) => {
  const _id = c.req.param("_id");

  const body = await c.req.json();

  const response = await studentService.updates({ _id, body });

  if (response.error) {
    return badRequestHandler(c, response.error);
  }

  if (response.serverError) {
    return serverErrorHandler(c, response.serverError);
  }

  return c.json(response.success, 200);
};

// Delete admin
export const deletes = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await studentService.deletes(_id);

  if (response.error) {
    return badRequestHandler(c, response.error);
  }

  if (response.serverError) {
    return serverErrorHandler(c, response.serverError);
  }

  return c.json(response.success, 200);
};
