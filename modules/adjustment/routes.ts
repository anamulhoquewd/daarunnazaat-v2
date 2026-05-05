import { badRequestError, serverError } from "@/server/error";
import { authenticate, authorize } from "@/server/middlewares/auth.middleware";
import { UserRole, type IUser } from "@/validations";
import { createRouter } from "@/modules/shared/hono";
import { createAdjustment, voidAdjustment, listAdjustments } from "./service";

const adjustmentRoutes = createRouter();
const adminOnly = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN);

/** GET /adjustments?invoiceId=&studentId=&isVoided= */
adjustmentRoutes.get("/", authenticate, adminOnly, async (c) => {
  try {
    const result = await listAdjustments(c.req.query() as any);
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/** POST /adjustments */
adjustmentRoutes.post("/", authenticate, adminOnly, async (c) => {
  try {
    const body = await c.req.json();
    const user = c.get("user") as IUser;
    const result = await createAdjustment({ body, userId: (user as any)._id.toString() });
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 201);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/** DELETE /adjustments/:id — void (soft) */
adjustmentRoutes.delete("/:id", authenticate, adminOnly, async (c) => {
  try {
    const user = c.get("user") as IUser;
    const { reason } = await c.req.json().catch(() => ({ reason: "" }));
    const result = await voidAdjustment({
      adjustmentId: c.req.param("id"),
      userId: (user as any)._id.toString(),
      reason: reason ?? "",
    });
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

export default adjustmentRoutes;
