import { badRequestError, serverError } from "@/server/error";
import { authenticate, authorize } from "@/server/middlewares/auth.middleware";
import { EnrollmentStatus, UserRole } from "@/validations";
import { createRouter } from "@/modules/shared/hono";
import { completeEnrollment, enrollStudent, listEnrollmentsByClassSession } from "./service";

const enrollmentRoutes = createRouter();
const adminOnly = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN);

/** GET /enrollments */
enrollmentRoutes.get("/", authenticate, adminOnly, async (c) => {
  try {
    const { sessionId, classId, studentId, status, page, limit } = c.req.query();

    const result = await listEnrollmentsByClassSession({
      sessionId,
      classId,
      studentId,
      status: status as EnrollmentStatus,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 100) : 20,
    });

    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/** POST /enrollments */
enrollmentRoutes.post("/", authenticate, adminOnly, async (c) => {
  try {
    const body = await c.req.json();
    const user = c.get("user") as any;
    const result = await enrollStudent(body, user._id.toString());

    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 201);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/** PATCH /enrollments/:id/complete */
enrollmentRoutes.patch("/:id/complete", authenticate, adminOnly, async (c) => {
  try {
    const { status, promotionMeta } = await c.req.json();
    const user = c.get("user") as any;
    const result = await completeEnrollment(
      c.req.param("id"),
      status,
      user._id.toString(),
      promotionMeta,
    );

    if (result.error) return badRequestError(c, result.error);
    if (result.serverError) return serverError(c, result.serverError);
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

export default enrollmentRoutes;
