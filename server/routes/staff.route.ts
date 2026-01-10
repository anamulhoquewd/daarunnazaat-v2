import { Hono } from "hono";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "@/validations";
import { staffController } from "../controllers";

const staffRoutes = new Hono();

staffRoutes.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => staffController.gets(c)
);

staffRoutes.post(
  "/register",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => staffController.register(c)
);

staffRoutes.get(
  "/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => staffController.get(c)
);

staffRoutes.patch(
  "/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => staffController.updates(c)
);

staffRoutes.delete(
  "/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => staffController.deletes(c)
);

staffRoutes.patch(
  "/activate/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => staffController.activate(c)
);

staffRoutes.patch(
  "/deactivate/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => staffController.deactivate(c)
);

export default staffRoutes;
