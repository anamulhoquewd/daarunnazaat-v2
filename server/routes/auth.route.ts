import { Hono } from "hono";
import { usersController } from "../controllers";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "@/validations";

const authRoutes = new Hono();

authRoutes.post(
  "/register",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => usersController.register(c)
);

authRoutes.patch("/change-password", (c) => usersController.changePassword(c));

authRoutes.patch("/reset-password/:resetToken", (c) =>
  usersController.resetPassword(c)
);

authRoutes.post("/forgot-password", (c) => usersController.forgotPassword(c));

authRoutes.post("/refresh", (c) => usersController.refreshToken(c));

authRoutes.post("/sign-in", (c) => usersController.signIn(c));

authRoutes.post("/sign-out", (c) => usersController.signOut(c));

authRoutes.patch("/me", (c) => usersController.updateMe(c));

authRoutes.patch("/:_id", (c) => usersController.updateUser(c));

authRoutes.delete("/:_id", (c) => usersController.deleteUser(c));

export default authRoutes;
