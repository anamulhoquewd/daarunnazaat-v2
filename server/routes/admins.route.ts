import { Hono } from "hono";
import { adminControllers } from "../controllers";
import { authenticated, authorized } from "../middlewares/auth.middleware";

const adminRoutes = new Hono();

adminRoutes.get("/", authenticated, authorized, (c) =>
  adminControllers.gets(c)
);

adminRoutes.post("/auth/register", authenticated, authorized, (c) =>
  adminControllers.register(c)
);

adminRoutes.patch("/auth/change-password", authenticated, (c) =>
  adminControllers.changePassword(c)
);

adminRoutes.patch("/auth/reset-password/:resetToken", (c) =>
  adminControllers.resetPassword(c)
);

adminRoutes.post("/auth/forgot-password", (c) =>
  adminControllers.forgotPassword(c)
);

adminRoutes.post("/auth/refresh", (c) => adminControllers.refreshToken(c));

adminRoutes.post("/auth/sign-in", (c) => adminControllers.signIn(c));

adminRoutes.post("/auth/sign-out", (c) => adminControllers.signOut(c));

adminRoutes.get("/me", authenticated, (c) => adminControllers.getMe(c));

adminRoutes.patch("/auth/me", authenticated, (c) =>
  adminControllers.updateMe(c)
);

adminRoutes.patch("/auth/:_id", authenticated, authorized, (c) =>
  adminControllers.updates(c)
);

adminRoutes.get("/:_id", authenticated, authorized, (c) =>
  adminControllers.get(c)
);

adminRoutes.delete("/auth/:_id", authenticated, authorized, (c) =>
  adminControllers.deletes(c)
);

export default adminRoutes;
