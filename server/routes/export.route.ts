import { Hono } from "hono";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "@/validations";
import { exportController } from "../controllers";

const exportRoutes = new Hono();

exportRoutes.post(
  "/students/sheet",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => exportController.exportStudents(c)
);

exportRoutes.post(
  "/students/pdf",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (c) => exportController.exportStudentsPDF(c)
);

// exportRoutes.post(
//   "/staffs",
//   authenticate,
//   authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
//   (c) => exportController.exportTeachers(c)
// );

export default exportRoutes;