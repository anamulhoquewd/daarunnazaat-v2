import { Hono } from "hono";
import { salaryController } from "../controllers";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "@/validations";

const salaryPaymentRoutes = new Hono();

salaryPaymentRoutes.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => salaryController.gets(c)
);

salaryPaymentRoutes.post(
  "/register",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => salaryController.register(c)
);

salaryPaymentRoutes.get(
  "/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => salaryController.get(c)
);

salaryPaymentRoutes.patch(
  "/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => salaryController.updates(c)
);

salaryPaymentRoutes.delete(
  "/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => salaryController.deletes(c)
);

export default salaryPaymentRoutes;
