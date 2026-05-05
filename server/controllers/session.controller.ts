import type { Context } from "hono";
import { badRequestError, serverError } from "../error";
import { sessionService } from "../services";

export const register = async (c: Context) => {
  const body = await c.req.json();

  const response = await sessionService.register(body);

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
  const isActiveRaw = c.req.query("isActive");

  let isActive: boolean | undefined = undefined;

  if (isActiveRaw === "true") isActive = true;
  if (isActiveRaw === "false") isActive = false;

  const response = await sessionService.gets({
    page,
    limit,
    sortWith,
    sortOrder,
    isActive,
    search,
  });

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

export const get = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await sessionService.get(_id);

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

  const response = await sessionService.updates({ _id, body });

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

  const response = await sessionService.activate(_id);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

// deactivate
export const deactivate = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await sessionService.deactivate(_id);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

export const deleteSession = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await sessionService.deleteSession(_id);
  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};
