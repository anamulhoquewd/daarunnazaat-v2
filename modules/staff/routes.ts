import { createRouter } from "@/modules/shared/hono";
import { authenticate, authorize } from "@/server/middlewares/auth.middleware";
import { UserRole, type IUser } from "@/validations";
import { badRequestError, serverError } from "@/server/error/index";
import { createStaff, listStaff, getStaff, getStaffByUserId, updateStaff, updateOwnProfile } from "./service";

const staffRoutes = createRouter();
const adminOnly = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN);
const adminOrStaff = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF);

staffRoutes.get("/", authenticate, adminOrStaff, async (c) => {
  try {
    const result = await listStaff(c.req.query() as any);
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) { return serverError(c, err); }
});

staffRoutes.post("/", authenticate, adminOnly, async (c) => {
  try {
    const body = await c.req.json();
    const user = c.get("user") as IUser;
    const result = await createStaff({ body, userId: (user as any)._id.toString() });
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 201);
  } catch (err: any) { return serverError(c, err); }
});

/** Staff can update their own profile (limited fields) */
staffRoutes.patch("/me", authenticate, authorize(UserRole.STAFF), async (c) => {
  try {
    const body = await c.req.json();
    const user = c.get("user") as IUser;
    const result = await updateOwnProfile({ userId: (user as any)._id.toString(), body });
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) { return serverError(c, err); }
});

staffRoutes.get("/:id", authenticate, adminOrStaff, async (c) => {
  try {
    const result = await getStaff(c.req.param("id"));
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) { return serverError(c, err); }
});

staffRoutes.patch("/:id", authenticate, adminOnly, async (c) => {
  try {
    const body = await c.req.json();
    const user = c.get("user") as IUser;
    const result = await updateStaff({ id: c.req.param("id"), body, userId: (user as any)._id.toString() });
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) { return serverError(c, err); }
});

export default staffRoutes;
