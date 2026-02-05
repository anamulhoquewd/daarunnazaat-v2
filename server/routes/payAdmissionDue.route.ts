import { UserRole } from "@/validations";
import { Hono } from "hono";
import { payAdmissionDueController } from "../controllers";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const payAdmissionDueRoutes = new Hono();

payAdmissionDueRoutes.post(
  "/pay",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => payAdmissionDueController.payAdmissionDue(c),
);

export default payAdmissionDueRoutes;
