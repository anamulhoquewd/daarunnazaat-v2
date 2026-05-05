import { createRouter } from "@/modules/shared/hono";
import { authenticate, authorize } from "@/server/middlewares/auth.middleware";
import { UserRole, type IUser } from "@/validations";
import { badRequestError, serverError } from "@/server/error/index";
import { promoteStudent, bulkPromote } from "./service";

const promotionRoutes = createRouter();
const adminOnly = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN);

/** POST /promotions/promote — promote a single student */
promotionRoutes.post("/promote", authenticate, adminOnly, async (c) => {
  try {
    const body = await c.req.json();
    const user = c.get("user") as IUser;
    const result = await promoteStudent({ body, userId: (user as any)._id.toString() });
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/** POST /promotions/bulk — promote multiple students at once */
promotionRoutes.post("/bulk", authenticate, adminOnly, async (c) => {
  try {
    const body = await c.req.json();
    const user = c.get("user") as IUser;
    const result: any = await bulkPromote({ body, userId: (user as any)._id.toString() });
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

export default promotionRoutes;
