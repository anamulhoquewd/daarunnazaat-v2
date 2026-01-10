import { Hono } from "hono";
import { usersController } from "../controllers";
import {
  authenticate,
  authorize,
  checkOwnership,
} from "../middlewares/auth.middleware";
import { UserRole } from "@/validations";

const userRoutes = new Hono();

userRoutes.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => usersController.getUsers(c)
);

userRoutes.get("/me", authenticate, (c) => usersController.getMe(c));

userRoutes.patch("/me", authenticate, (c) => usersController.updateMe(c));

userRoutes.get(
  "/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => usersController.get(c)
);

export default userRoutes;
