import { Context } from "hono";
import { badRequestError, serverError } from "../error";
import { payAdmissionDueService } from "../services";

export const payAdmissionDue = async (c: Context) => {
  const body = await c.req.json();

  // logged in user
  const authUser = await c.get("user");

  const response = await payAdmissionDueService.payAdmissionDue({
    body: body,
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
