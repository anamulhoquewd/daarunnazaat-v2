import { serverError } from "@/server/error";
import { authenticate, authorize } from "@/server/middlewares/auth.middleware";
import { UserRole } from "@/validations";
import { Hono } from "hono";
import { StudentFeeChangeLog } from "./schema";

const feeChangeLogRoutes = new Hono();
const adminOnly = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN);

/** GET /student-fee-change-logs?studentId=... */
feeChangeLogRoutes.get("/", authenticate, adminOnly, async (c) => {
  try {
    const { studentId, page, limit } = c.req.query();
    const filter: Record<string, unknown> = {};
    if (studentId) filter.studentId = studentId;

    const p = page ? parseInt(page, 10) : 1;
    const l = Math.min(limit ? parseInt(limit, 10) : 20, 100);

    const [logs, total] = await Promise.all([
      StudentFeeChangeLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((p - 1) * l)
        .limit(l)
        .populate("changedBy", "name email")
        .lean(),
      StudentFeeChangeLog.countDocuments(filter),
    ]);

    return c.json({ success: true, data: logs, total, page: p, limit: l }, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

export default feeChangeLogRoutes;
