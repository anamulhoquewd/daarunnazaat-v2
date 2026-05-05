import { badRequestError, serverError } from "@/server/error";
import { authenticate, authorize } from "@/server/middlewares/auth.middleware";
import { UserRole } from "@/validations";
import { createRouter } from "@/modules/shared/hono";
import {
  activateSession,
  createSession,
  deactivateSession,
  getSession,
  getSessionPeriods,
  listSessions,
  softDeleteSession,
  updateSession,
} from "./service";

const sessionRoutes = createRouter();
const adminOnly = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN);

/** GET /sessions */
sessionRoutes.get("/", authenticate, adminOnly, async (c) => {
  try {
    const { page, limit, sortWith, sortOrder, cycleType, isActive, search } =
      c.req.query();

    const result = await listSessions({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 100) : 10,
      sortWith,
      sortOrder,
      cycleType: cycleType as any,
      isActive:
        isActive === "true" ? true : isActive === "false" ? false : undefined,
      search,
    });

    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/** POST /sessions */
sessionRoutes.post("/", authenticate, adminOnly, async (c) => {
  try {
    const body = await c.req.json();
    const user = c.get("user") as any;
    const result = await createSession(body, user._id.toString());

    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 201);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/** GET /sessions/:_id */
sessionRoutes.get("/:_id", authenticate, adminOnly, async (c) => {
  try {
    const result = await getSession(c.req.param("_id"));
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/** PATCH /sessions/:_id */
sessionRoutes.patch("/:_id", authenticate, adminOnly, async (c) => {
  try {
    const body = await c.req.json();
    const user = c.get("user") as any;
    const result = await updateSession(c.req.param("_id"), body, user._id.toString());

    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/** POST /sessions/:_id/activate */
sessionRoutes.post("/:_id/activate", authenticate, adminOnly, async (c) => {
  try {
    const user = c.get("user") as any;
    const result = await activateSession(c.req.param("_id"), user._id.toString());

    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/** POST /sessions/:_id/deactivate */
sessionRoutes.post("/:_id/deactivate", authenticate, adminOnly, async (c) => {
  try {
    const user = c.get("user") as any;
    const result = await deactivateSession(c.req.param("_id"), user._id.toString());

    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/** DELETE /sessions/:_id */
sessionRoutes.delete("/:_id", authenticate, adminOnly, async (c) => {
  try {
    const user = c.get("user") as any;
    const { reason } = await c.req.json().catch(() => ({ reason: "" }));
    const result = await softDeleteSession(
      c.req.param("_id"),
      user._id.toString(),
      reason || "Deleted by admin",
    );

    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/** GET /sessions/:_id/periods */
sessionRoutes.get("/:_id/periods", authenticate, adminOnly, async (c) => {
  try {
    const result = await getSessionPeriods(c.req.param("_id"));
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

export default sessionRoutes;
