import { UserRole } from "@/validations";
import { Hono } from "hono";
import { studentController } from "../controllers";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const studentRoutes = new Hono();

studentRoutes.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => studentController.gets(c),
);

studentRoutes.post(
  "/register",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => studentController.register(c),
);

studentRoutes.patch(
  "/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => studentController.updates(c),
);

studentRoutes.get("/:_id", authenticate, (c) => studentController.get(c));

studentRoutes.patch(
  "/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => studentController.deleteStudent(c),
);

studentRoutes.patch(
  "/:_id/block",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => studentController.blockStudent(c),
);

studentRoutes.patch(
  "/:_id/unblock",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => studentController.unblockStudent(c),
);

studentRoutes.patch(
  "/:_id/delete",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => studentController.deleteStudent(c),
);

studentRoutes.patch(
  "/:_id/restore",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => studentController.restoreStudent(c),
);

studentRoutes.patch(
  "/:_id/activate",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => studentController.activate(c),
);

studentRoutes.patch(
  "/:_id/deactivate",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => studentController.deactivate(c),
);

// with coation
studentRoutes.delete(
  "/:_id/permanently",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  (c) => studentController.permanentDelete(c),
);

export default studentRoutes;
