import { Hono } from "hono";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "@/validations";
import { studentController } from "../controllers";

const studentRoutes = new Hono();

studentRoutes.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => studentController.gets(c)
);

studentRoutes.post(
  "/register",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => studentController.register(c)
);

studentRoutes.patch("/:_id", authenticate, (c) => studentController.updates(c));

studentRoutes.get("/:_id", authenticate, (c) => studentController.get(c));

studentRoutes.delete(
  "/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => studentController.deletes(c)
);

studentRoutes.patch(
  "/activate/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => studentController.activate(c)
);

studentRoutes.patch(
  "/deactivate/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => studentController.deactivate(c)
);

export default studentRoutes;
