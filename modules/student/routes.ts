import { createRouter } from "@/modules/shared/hono";
import { authenticate, authorize } from "@/server/middlewares/auth.middleware";
import { UserRole, type IUser } from "@/validations";
import { badRequestError, serverError } from "@/server/error/index";
import {
  createStudent,
  listStudents,
  getStudent,
  updateStudent,
  activate,
  deactivate,
  block,
  unblock,
  softDelete,
  restore,
  deleteStudent,
} from "./service";

const studentRoutes = createRouter();
const adminOnly    = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN);
const adminOrStaff = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF);

// ── Helper ─────────────────────────────────────────────────────────────────────

function handleResult(c: any, result: any, status = 200) {
  if (result.error)       return badRequestError(c, result.error);
  if (result.serverError) return serverError(c, result.serverError);
  return c.json(result.success, status);
}

// ── List & Create ──────────────────────────────────────────────────────────────

studentRoutes.get("/", authenticate, adminOrStaff, async (c) => {
  return handleResult(c, await listStudents(c.req.query() as any));
});

studentRoutes.post("/", authenticate, adminOnly, async (c) => {
  const body = await c.req.json();
  const user = c.get("user") as IUser;
  return handleResult(c, await createStudent({ body, userId: (user as any)._id.toString() }), 201);
});

// ── Status mutations (must come before /:id to avoid conflict) ─────────────────

studentRoutes.patch("/:id/activate", authenticate, adminOnly, async (c) => {
  return handleResult(c, await activate(c.req.param("id")));
});

studentRoutes.patch("/:id/deactivate", authenticate, adminOnly, async (c) => {
  return handleResult(c, await deactivate(c.req.param("id")));
});

studentRoutes.patch("/:id/block", authenticate, adminOnly, async (c) => {
  return handleResult(c, await block(c.req.param("id")));
});

studentRoutes.patch("/:id/unblock", authenticate, adminOnly, async (c) => {
  return handleResult(c, await unblock(c.req.param("id")));
});

studentRoutes.patch("/:id/delete", authenticate, adminOnly, async (c) => {
  return handleResult(c, await softDelete(c.req.param("id")));
});

studentRoutes.patch("/:id/restore", authenticate, adminOnly, async (c) => {
  return handleResult(c, await restore(c.req.param("id")));
});

studentRoutes.delete("/:id/permanently", authenticate, adminOnly, async (c) => {
  return handleResult(c, await deleteStudent(c.req.param("id")));
});

// ── Single student CRUD ────────────────────────────────────────────────────────

studentRoutes.get("/:id", authenticate, adminOrStaff, async (c) => {
  return handleResult(c, await getStudent(c.req.param("id")));
});

studentRoutes.patch("/:id", authenticate, adminOnly, async (c) => {
  const body = await c.req.json();
  const user = c.get("user") as IUser;
  return handleResult(c, await updateStudent({ id: c.req.param("id"), body, userId: (user as any)._id.toString() }));
});

export default studentRoutes;
