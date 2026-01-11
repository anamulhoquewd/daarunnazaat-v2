import { Hono } from "hono";
import { feeCollectionController } from "../controllers";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "@/validations";

const feeCollectionRoutes = new Hono();

feeCollectionRoutes.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => feeCollectionController.gets(c)
);

feeCollectionRoutes.post(
  "/register",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => feeCollectionController.register(c)
);

feeCollectionRoutes.get(
  "/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => feeCollectionController.get(c)
);

feeCollectionRoutes.patch(
  "/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => feeCollectionController.updates(c)
);

feeCollectionRoutes.delete(
  "/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => feeCollectionController.deletes(c)
);

export default feeCollectionRoutes;
