import { createRouter } from "@/modules/shared/hono";
import { authenticate, authorize } from "@/server/middlewares/auth.middleware";
import { UserRole, type IUser } from "@/validations";
import { badRequestError, serverError } from "@/server/error/index";
import {
  createSalary,
  payoutSalary,
  bulkGenerateSalaries,
  listSalaries,
  getSalary,
} from "./service";

const salaryV5Routes = createRouter();
const adminOnly = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN);

/** GET /salary-v5 */
salaryV5Routes.get("/", authenticate, adminOnly, async (c) => {
  try {
    const result = await listSalaries(c.req.query() as any);
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/** POST /salary-v5 — create a single salary record (pending) */
salaryV5Routes.post("/", authenticate, adminOnly, async (c) => {
  try {
    const body = await c.req.json();
    const user = c.get("user") as IUser;
    const result = await createSalary({ body, userId: (user as any)._id.toString() });
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 201);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/** POST /salary-v5/bulk-generate — generate pending records for all active staff */
salaryV5Routes.post("/bulk-generate", authenticate, adminOnly, async (c) => {
  try {
    const body = await c.req.json();
    const user = c.get("user") as IUser;
    const result = await bulkGenerateSalaries({ body, userId: (user as any)._id.toString() });
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/** GET /salary-v5/:id */
salaryV5Routes.get("/:id", authenticate, adminOnly, async (c) => {
  try {
    const result = await getSalary(c.req.param("id"));
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/** POST /salary-v5/:id/payout — mark salary as paid */
salaryV5Routes.post("/:id/payout", authenticate, adminOnly, async (c) => {
  try {
    const body = await c.req.json();
    const user = c.get("user") as IUser;
    const result = await payoutSalary({
      salaryId: c.req.param("id"),
      body,
      userId: (user as any)._id.toString(),
    });
    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

export default salaryV5Routes;
