import { UserRole } from "@/validations";
import { Hono } from "hono";
import * as examController from "../controllers/exam.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const examRoutes = new Hono();

const adminOnly = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN);
const adminOrStaff = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF);

// ── Subjects ──────────────────────────────────────────────────────────────────
examRoutes.get("/subjects", authenticate, (c) => examController.getSubjects(c));
examRoutes.post("/subjects", authenticate, adminOnly, (c) => examController.createSubject(c));
examRoutes.patch("/subjects/:_id", authenticate, adminOnly, (c) => examController.updateSubject(c));

// ── Exam CRUD ─────────────────────────────────────────────────────────────────
examRoutes.post("/", authenticate, adminOnly, (c) => examController.createExam(c));
examRoutes.get("/", authenticate, adminOrStaff, (c) => examController.getExams(c));
examRoutes.get("/:_id", authenticate, adminOrStaff, (c) => examController.getExam(c));
examRoutes.patch("/:_id", authenticate, adminOnly, (c) => examController.updateExam(c));
examRoutes.delete("/:_id", authenticate, adminOnly, (c) => examController.deleteExam(c));
examRoutes.post("/:_id/publish-results", authenticate, adminOnly, (c) => examController.publishResults(c));

// ── Enrollments ───────────────────────────────────────────────────────────────
examRoutes.get("/:_id/enrollments", authenticate, adminOrStaff, (c) => examController.getEnrollments(c));
examRoutes.post("/:_id/enroll-class/:classId", authenticate, adminOnly, (c) => examController.enrollClass(c));
examRoutes.post("/:_id/enroll-student", authenticate, adminOnly, (c) => examController.enrollStudent(c));
examRoutes.delete("/:_id/enrollments/:enrollmentId", authenticate, adminOnly, (c) => examController.removeEnrollment(c));

// ── Fees ──────────────────────────────────────────────────────────────────────
examRoutes.get("/:_id/fees-summary", authenticate, adminOrStaff, (c) => examController.getFeesSummary(c));
examRoutes.get("/:_id/enrollments/:enrollmentId/payments", authenticate, adminOrStaff, (c) => examController.getPaymentHistory(c));
examRoutes.post("/:_id/enrollments/:enrollmentId/payments", authenticate, adminOrStaff, (c) => examController.addPayment(c));

// ── Results ───────────────────────────────────────────────────────────────────
examRoutes.get("/:_id/results", authenticate, adminOrStaff, (c) => examController.getResults(c));
examRoutes.post("/:_id/results/bulk", authenticate, adminOrStaff, (c) => examController.submitResultsBulk(c));
examRoutes.patch("/:_id/results/:resultId", authenticate, adminOrStaff, (c) => examController.updateResult(c));
examRoutes.post("/:_id/recalculate-positions", authenticate, adminOnly, (c) => examController.recalculatePositions(c));

export default examRoutes;

// ── Guardian-facing (/my-students prefix) ─────────────────────────────────────
export const myStudentsRoutes = new Hono();

myStudentsRoutes.get(
  "/:studentId/exam-results",
  authenticate,
  (c) => examController.getStudentResults(c),
);

myStudentsRoutes.get(
  "/:studentId/exam-fees",
  authenticate,
  (c) => examController.getStudentFees(c),
);
