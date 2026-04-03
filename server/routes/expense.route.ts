import { Hono } from "hono";
import { authenticate, authorize } from "@/server/middlewares/auth.middleware";
import { UserRole } from "@/validations";
import { expenseController } from "@/server/controllers";

const expenseRoutes = new Hono();

expenseRoutes.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => expenseController.gets(c),
);

expenseRoutes.post("/register", authenticate, authorize(UserRole.ADMIN), (c) =>
  expenseController.register(c),
);

expenseRoutes.get("/:_id", authenticate, authorize(UserRole.ADMIN), (c) =>
  expenseController.get(c),
);

expenseRoutes.patch("/:_id", authenticate, authorize(UserRole.ADMIN), (c) =>
  expenseController.updates(c),
);

expenseRoutes.patch(
  "/:_id/delete",
  authenticate,
  authorize(UserRole.ADMIN),
  (c) => expenseController.deleteFlag(c),
);

expenseRoutes.patch(
  "/:_id/restore",
  authenticate,
  authorize(UserRole.ADMIN),
  (c) => expenseController.restoreExpense(c),
);

expenseRoutes.delete(
  "/:_id/permanently",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => expenseController.permanentDelete(c),
);
export default expenseRoutes;
