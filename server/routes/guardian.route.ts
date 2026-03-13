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
  "/by",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => guardianController.getByUser(c),
);

guardianRoutes.get(
  "/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => guardianController.get(c)
);

guardianRoutes.patch("/me", authenticate, authorize(UserRole.GUARDIAN), (c) =>
  guardianController.updateMe(c),
);

guardianRoutes.patch(
  "/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => guardianController.updates(c)
);

// Guardian deletion is not allowed as it may cause data inconsistency. Instead, we can deactivate the guardian account.
// guardianRoutes.delete(
//   "/:_id",
//   authenticate,
//   authorize(UserRole.SUPER_ADMIN),
//   (c) => guardianController.deletes(c)
// );



export default guardianRoutes;
