import { dashboardController } from "@/server/controllers";
import { authenticate, authorize } from "@/server/middlewares/auth.middleware";
import { UserRole } from "@/validations";
import { Hono } from "hono";

const dashboardRoutes = new Hono();

dashboardRoutes.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => dashboardController.gets(c),
);

export default dashboardRoutes;
