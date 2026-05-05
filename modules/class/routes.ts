import { createRouter } from "@/modules/shared/hono";
import { authenticate, authorize } from "@/server/middlewares/auth.middleware";
import { UserRole, type IUser } from "@/validations";
import { badRequestError, serverError } from "@/server/error/index";
import { createClass, listClasses, getClass, updateClass, deleteClass } from "./service";

const classRoutes = createRouter();
const adminOnly = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN);
const anyAuth = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF, UserRole.GUARDIAN);

classRoutes.get("/", authenticate, anyAuth, async (c) => {
  try {
    const result = await listClasses(c.req.query() as any);
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) { return serverError(c, err); }
});

classRoutes.post("/", authenticate, adminOnly, async (c) => {
  try {
    const body = await c.req.json();
    const user = c.get("user") as IUser;
    const result = await createClass({ body, userId: (user as any)._id.toString() });
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 201);
  } catch (err: any) { return serverError(c, err); }
});

classRoutes.get("/:id", authenticate, anyAuth, async (c) => {
  try {
    const result = await getClass(c.req.param("id"));
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) { return serverError(c, err); }
});

classRoutes.patch("/:id", authenticate, adminOnly, async (c) => {
  try {
    const body = await c.req.json();
    const user = c.get("user") as IUser;
    const result = await updateClass({ id: c.req.param("id"), body, userId: (user as any)._id.toString() });
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) { return serverError(c, err); }
});

classRoutes.delete("/:id", authenticate, adminOnly, async (c) => {
  try {
    const user = c.get("user") as IUser;
    const { reason } = await c.req.json().catch(() => ({ reason: "No reason provided" }));
    const result = await deleteClass({ id: c.req.param("id"), reason, userId: (user as any)._id.toString() });
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) { return serverError(c, err); }
});

export default classRoutes;
