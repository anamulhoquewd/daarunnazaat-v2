import { Hono } from "hono";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "@/validations";
import { sessionController } from "../controllers";

const sessionRoute = new Hono();

sessionRoute.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => sessionController.gets(c)
);

sessionRoute.post(
  "/register",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => sessionController.register(c)
);

sessionRoute.get(
  "/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => sessionController.get(c)
);

sessionRoute.patch(
  "/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => sessionController.updates(c)
);

sessionRoute.delete(
  "/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => sessionController.deletes(c)
);

export default sessionRoute;
