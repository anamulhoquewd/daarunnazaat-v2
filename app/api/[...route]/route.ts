import connectDB from "@/server/config/db";
import { notFoundError } from "@/server/error";
import authRoutes from "@/server/routes/auth.route";
import blogRoutes from "@/server/routes/blog.route";
import classRoutes from "@/server/routes/classes.route";
import expenseRoutes from "@/server/routes/expense.route";
import dashboardRoutes from "@/server/routes/dashboard.route";
import exportRoutes from "@/server/routes/export.route";
import feeCollectionRoutes from "@/server/routes/feeCollection.route";
import guardianRoutes from "@/server/routes/guardian.route";
import payAdmissionDueRoutes from "@/server/routes/payAdmissionDue.route";
import salaryPaymentRoutes from "@/server/routes/salary.route";
import sessionRoute from "@/server/routes/session.route";
import staffRoutes from "@/server/routes/staff.route";
import studentRoutes from "@/server/routes/students.route";
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

// Studetns routes
app.route("/students", studentRoutes);

// Guardian routes
app.route("/guardians", guardianRoutes);

// Class routes
app.route("/classes", classRoutes);

// Session routes
app.route("/sessions", sessionRoute);

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
