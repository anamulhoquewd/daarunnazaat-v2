import connectDB from "@/server/config/db";
import { notFoundError } from "@/server/error";
import auditRoutes from "@/modules/shared/audit-log/routes";
import sessionRoutes from "@/modules/session/routes";
import studentRoutes from "@/modules/student/routes";
import enrollmentRoutes from "@/modules/enrollment/routes";
import feeChangeLogRoutes from "@/modules/student-fee-change-log/routes";
import invoiceRoutes from "@/modules/invoice/routes";
import paymentRoutes from "@/modules/payment/routes";
import adjustmentRoutes from "@/modules/adjustment/routes";
import reportRoutes from "@/modules/reports/routes";
import salaryV5Routes from "@/modules/salary/routes";
import promotionRoutes from "@/modules/promotion/routes";
import guardianPortalRoutes from "@/modules/guardian-portal/routes";
import onlinePaymentRoutes from "@/modules/online-payment/routes";
import authRoutes from "@/server/routes/auth.route";
import blogRoutes from "@/server/routes/blog.route";
import classRoutes from "@/modules/class/routes";
import expenseRoutes from "@/server/routes/expense.route";
import dashboardRoutes from "@/server/routes/dashboard.route";
import exportRoutes from "@/server/routes/export.route";
import examRoutes, { myStudentsRoutes } from "@/server/routes/exam.routes";
import feeCollectionRoutes from "@/server/routes/feeCollection.route";
import guardianRoutes from "@/modules/guardian/routes";
import payAdmissionDueRoutes from "@/server/routes/payAdmissionDue.route";
import salaryPaymentRoutes from "@/server/routes/salary.route";
import staffRoutes from "@/modules/staff/routes";
import transactionRoutes from "@/server/routes/transaction.route";
import userRoutes from "@/server/routes/users.route";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { handle } from "hono/vercel";

const app = new Hono().basePath("/api/v1");

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN as string;

app.get("/hello", (c) => {
  return c.json({
    message: "Hello from Hono!",
  });
});

// Config MongoDB
connectDB();

app.use(
  logger(),
  prettyJSON(),
  cors({
    origin: DOMAIN, // Your frontend URL
    credentials: true, // Allow cookies
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Ensure OPTIONS is handled
    allowHeaders: ["Content-Type", "Authorization"], // Allow necessary headers
  }),
);

// Health check
app.get("/health", (c) => c.json({ message: "API is healthy!" }));

// User routes
app.route("/users", userRoutes);

// Auth routes
app.route("/auth", authRoutes);

// Students routes (v5 module)
app.route("/students", studentRoutes);

// Guardian routes
app.route("/guardians", guardianRoutes);

// Class routes
app.route("/classes", classRoutes);

// Session routes (v5 module)
app.route("/sessions", sessionRoutes);

// Enrollment routes (v5 module)
app.route("/enrollments", enrollmentRoutes);

// Student fee change log routes (v5 module)
app.route("/student-fee-change-logs", feeChangeLogRoutes);

// Salaries routes
app.route("/salaries", salaryPaymentRoutes);

// Expenses routes
app.route("/expenses", expenseRoutes);

// Dashboard routes
app.route("/dashboard", dashboardRoutes);

// Staff routes
app.route("/staffs", staffRoutes);

// fees routes
app.route("/fees", feeCollectionRoutes);

// transactions routes
app.route("/transactions", transactionRoutes);

// blogs routes
app.route("/blogs", blogRoutes);

// blogs routes
app.route("/pay-admission-due", payAdmissionDueRoutes);

// blogs routes
app.route("/exports", exportRoutes);

// Exam routes (CRUD + enrollments + fees + results)
app.route("/exams", examRoutes);

// Invoice routes (v5 module)
app.route("/invoices", invoiceRoutes);

// Payment routes (v5 module)
app.route("/payments", paymentRoutes);

// Adjustment routes (v5 module)
app.route("/adjustments", adjustmentRoutes);

// Report routes (v5 module)
app.route("/reports", reportRoutes);

// Salary v5 routes
app.route("/salary-v5", salaryV5Routes);

// Promotion routes (v5 module)
app.route("/promotions", promotionRoutes);

// Guardian portal routes (own student data only)
app.route("/guardian-portal", guardianPortalRoutes);

// Online payment routes (guardian-initiated bKash/Nagad)
app.route("/online-payments", onlinePaymentRoutes);

// Audit log routes (admin only)
app.route("/audit-logs", auditRoutes);

// Guardian-facing student routes (results + fees)
app.route("/my-students", myStudentsRoutes);

// Global Error Handler
app.onError((error: any, c) => {
  console.error("error: ", error);
  return c.json(
    {
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === "production" ? null : error.stack,
    },
    500,
  );
});

// Not Found Handler
app.notFound((c) => {
  const error = notFoundError(c);
  return error;
});

// Named exports for HTTP methods
export const GET = async (req: Request) => handle(app)(req);
export const POST = async (req: Request) => handle(app)(req);
export const PUT = async (req: Request) => handle(app)(req);
export const DELETE = async (req: Request) => handle(app)(req);
export const PATCH = async (req: Request) => handle(app)(req);
