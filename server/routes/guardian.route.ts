import { Hono } from "hono";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "@/validations";
import { guardianController } from "../controllers";

const guardianRoutes = new Hono();

guardianRoutes.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => guardianController.gets(c)
);

guardianRoutes.post(
  "/register",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => guardianController.register(c)
);

guardianRoutes.get(
  "/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => guardianController.get(c)
);

guardianRoutes.patch("/me", authenticate, authorize(UserRole.GUARDIAN), (c) =>
  guardianController.updateMe(c)
);

guardianRoutes.patch(
  "/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => guardianController.updates(c)
);

guardianRoutes.delete(
  "/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => guardianController.deletes(c)
);

guardianRoutes.patch(
  "/activate/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => guardianController.activate(c)
);

guardianRoutes.patch(
  "/deactivate/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => guardianController.deactivate(c)
);

export default guardianRoutes;
