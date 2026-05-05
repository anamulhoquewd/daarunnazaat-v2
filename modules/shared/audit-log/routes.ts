import { badRequestError, serverError } from "@/server/error";
import { authenticate, authorize } from "@/server/middlewares/auth.middleware";
import { UserRole } from "@/validations";
import { Hono } from "hono";
import { getAuditLogs, getDocumentHistory } from "./service";

const auditRoutes = new Hono();

const adminOnly = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN);

/**
 * GET /audit-logs
 * Query params: collectionName, documentId, performedBy, action, from, to, page, limit
 */
auditRoutes.get("/", authenticate, adminOnly, async (c) => {
  try {
    const {
      collectionName,
      documentId,
      performedBy,
      action,
      from,
      to,
      page,
      limit,
    } = c.req.query();

    const result = await getAuditLogs({
      collectionName,
      documentId,
      performedBy,
      action,
      from,
      to,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 200) : 50,
    });

    return c.json({ success: true, ...result }, 200);
  } catch (error: any) {
    return serverError(c, error);
  }
});

/**
 * GET /audit-logs/:collection/:documentId
 * Full history for one document — convenient for detail page "History" tabs.
 */
auditRoutes.get("/:collection/:documentId", authenticate, adminOnly, async (c) => {
  try {
    const { collection, documentId } = c.req.param();
    if (!collection || !documentId)
      return badRequestError(c, { message: "collection and documentId are required" });

    const logs = await getDocumentHistory(collection, documentId);
    return c.json({ success: true, data: logs }, 200);
  } catch (error: any) {
    return serverError(c, error);
  }
});

export default auditRoutes;
