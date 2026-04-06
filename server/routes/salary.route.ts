import { Hono } from "hono";
import { salaryController } from "../controllers";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "@/validations";

const salaryRoutes = new Hono();

salaryRoutes.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => salaryController.gets(c),
);

salaryRoutes.post("/register", authenticate, authorize(UserRole.ADMIN), (c) =>
  salaryController.register(c),
);

salaryRoutes.get("/:_id", authenticate, authorize(UserRole.ADMIN), (c) =>
  salaryController.get(c),
);

salaryRoutes.get(
  "/staff/:staffId",
  authenticate,
  authorize(UserRole.ADMIN),
  (c) => salaryController.getByStaffId(c),
);

salaryRoutes.patch("/:_id", authenticate, authorize(UserRole.ADMIN), (c) =>
  salaryController.updates(c),
);

salaryRoutes.patch(
  "/:_id/delete",
  authenticate,
  authorize(UserRole.ADMIN),
  (c) => salaryController.deleteFlag(c),
);

salaryRoutes.patch(
  "/:_id/restore",
  authenticate,
  authorize(UserRole.ADMIN),
  (c) => salaryController.restoreSalary(c),
);

salaryRoutes.delete(
  "/:_id/permanently",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => salaryController.permanentDelete(c),
);
export default salaryRoutes;
