import { UserRole } from "@/validations";
import { Hono } from "hono";
import { usersController } from "../controllers";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const userRoutes = new Hono();

userRoutes.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => usersController.getUsers(c),
);

userRoutes.get("/me", authenticate, (c) => usersController.getMe(c));

userRoutes.get(
  "/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => usersController.get(c),
);

export default userRoutes;
