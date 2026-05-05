import { badRequestError, serverError } from "@/server/error";
import { authenticate, authorize } from "@/server/middlewares/auth.middleware";
import { UserRole } from "@/validations";
import { createRouter } from "@/modules/shared/hono";
import {
  getDailyCollectionReport,
  getMonthlyFeeStatusReport,
  getOutstandingReport,
  getPLReport,
} from "./service";

const reportRoutes = createRouter();
const adminOnly = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN);

/**
 * GET /reports/daily-collection?date=YYYY-MM-DD&branch=
 */
reportRoutes.get("/daily-collection", authenticate, adminOnly, async (c) => {
  try {
    const { date, branch } = c.req.query();
    if (!date) return badRequestError(c, { message: "date parameter is required (YYYY-MM-DD)" });

    const result = await getDailyCollectionReport({ date, branch });
    if ("serverError" in result) return serverError(c, result.serverError);
    c.res.headers.set("Cache-Control", "private, max-age=60, stale-while-revalidate=120");
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/**
 * GET /reports/fee-status?periodYear=&periodMonth=&branch=&classId=&onlyDue=
 */
reportRoutes.get("/fee-status", authenticate, adminOnly, async (c) => {
  try {
    const { periodYear, periodMonth, branch, classId, onlyDue } = c.req.query();
    if (!periodYear || !periodMonth) {
      return badRequestError(c, { message: "periodYear and periodMonth are required" });
    }

    const result = await getMonthlyFeeStatusReport({
      periodYear: parseInt(periodYear, 10),
      periodMonth: parseInt(periodMonth, 10),
      branch,
      classId,
      onlyDue: onlyDue === "true",
    });
    if ("serverError" in result) return serverError(c, result.serverError);
    c.res.headers.set("Cache-Control", "private, max-age=120, stale-while-revalidate=300");
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/**
 * GET /reports/outstanding?branch=&asOfDate=YYYY-MM-DD
 */
reportRoutes.get("/outstanding", authenticate, adminOnly, async (c) => {
  try {
    const { branch, asOfDate } = c.req.query();
    const result = await getOutstandingReport({ branch, asOfDate });
    if ("serverError" in result) return serverError(c, result.serverError);
    c.res.headers.set("Cache-Control", "private, max-age=300, stale-while-revalidate=600");
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

/**
 * GET /reports/income-expense?periodYear=&periodMonth=&branch=
 */
reportRoutes.get("/income-expense", authenticate, adminOnly, async (c) => {
  try {
    const { periodYear, periodMonth, branch } = c.req.query();
    if (!periodYear || !periodMonth) {
      return badRequestError(c, { message: "periodYear and periodMonth are required" });
    }

    const result = await getPLReport({
      periodYear: parseInt(periodYear, 10),
      periodMonth: parseInt(periodMonth, 10),
      branch,
    });
    if ("serverError" in result) return serverError(c, result.serverError);
    c.res.headers.set("Cache-Control", "private, max-age=300, stale-while-revalidate=600");
    return c.json(result.success, 200);
  } catch (err: any) {
    return serverError(c, err);
  }
});

export default reportRoutes;
