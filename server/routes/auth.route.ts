import { Hono } from "hono";
import { usersController } from "../controllers";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "@/validations";

const authRoutes = new Hono();

authRoutes.post(
  "/register",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => usersController.register(c),
);

authRoutes.patch("/change-password", authenticate, (c) =>
  usersController.changePassword(c),
);

authRoutes.post("/forgot-password", (c) => usersController.forgotPassword(c));

authRoutes.post("/refresh", (c) => usersController.refreshToken(c));

authRoutes.post("/sign-in", (c) => usersController.signIn(c));

authRoutes.post("/sign-out", (c) => usersController.signOut(c));

authRoutes.patch("/reset-password/:resetToken", (c) =>
  usersController.resetPassword(c),
);

authRoutes.patch(
  "/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => usersController.updateUser(c),
);

authRoutes.patch(
  "/:_id/roles",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  (c) => usersController.updateRoles(c),
);

authRoutes.patch(
  "/:_id/block",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => usersController.blockUser(c),
);

authRoutes.patch(
  "/:_id/activate",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => usersController.activateUser(c),
);

authRoutes.patch(
  "/:_id/unblock",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  (c) => usersController.unblockUser(c),
);

authRoutes.patch(
  "/:_id/deactivate",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  (c) => usersController.deactivateUser(c),
);

authRoutes.patch(
  "/:_id/delete",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  (c) => usersController.deleteUser(c),
);

authRoutes.patch(
  "/:_id/restore",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  (c) => usersController.restoreUser(c),
);

authRoutes.delete(
  "/:_id/permanently",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  (c) => usersController.permanentDelete(c),
);

export default authRoutes;
