import { Hono } from "hono";
import { classController } from "../controllers";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "@/validations";

const classRoutes = new Hono();

classRoutes.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => classController.gets(c)
);

classRoutes.post(
  "/register",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => classController.register(c)
);

classRoutes.get(
  "/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => classController.get(c)
);

classRoutes.patch(
  "/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => classController.updates(c)
);

classRoutes.patch(
  "/:_id/activate",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => classController.activate(c),
);

classRoutes.patch(
  "/:_id/deactivate",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => classController.deactivate(c),
);

classRoutes.delete(
  "/:_id",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  (c) => classController.permanentlyDelete(c),
);

export default classRoutes;
