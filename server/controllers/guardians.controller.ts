import { Gender } from "@/validations";
import type { Context } from "hono";
import { badRequestError, serverError } from "@/server/error";
import { guardanService } from "@/server/services";
import { Guardian } from "@/server/models/guardians.model";

export const register = async (c: Context) => {
  const body = await c.req.json();

  const response = await guardanService.createGuardian(body);

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
  const gender = c.req.query("gender") as Gender;
  const profile = c.req.query("profile");

  const response = await guardanService.gets({
    page,
    limit,
    sortBy,
    sortType,
    gender,
    search,
  });

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

export const get = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await guardanService.get(_id);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

export const getByUser = async (c: Context) => {
  const id = c.req.query("userId") as string;

  const response = await guardanService.getByUser(id);

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

  const response = await guardanService.updates({ _id, body });

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

  const guardian = await Guardian.findOne({ userId: user._id });

  if (!guardian) {
    return badRequestError(c, {
      message: "Guardian not found for the user",
    });
  }

  const response = await guardanService.updates({
    _id: guardian._id,
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

export const deletes = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await guardanService.deletes(_id);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

// deactivate
export const deactivateGuardian = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await guardanService.deactivateGuardian(_id);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

// activate
export const activateGuardian = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await guardanService.activateGuardian(_id);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};
