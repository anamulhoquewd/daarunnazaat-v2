import connectDB from "@/server/config/db";
import { notFound } from "@/server/error";
import adminRoutes from "@/server/routes/admins.route";
import classRoutes from "@/server/routes/classes.route";
import paymentRoutes from "@/server/routes/payment.route";
import studentsRoutes from "@/server/routes/students.route";
import { adminServices } from "@/server/services";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

const app = new Hono().basePath("/api/v1");

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN as string;

app.get("/hello", (c) => {
  return c.json({
    message: "Hello from Hono!",
  });
});

// Config MongoDB
connectDB()
  .then(async () => {
    // Call the Super Admin Service function after connecting to MongoDB
    const result = await adminServices.registerSuperAdmin();

    if (result.success) {
      console.log(result.message || "Super admin created successfully!");
    }
  })
  .catch((error) => {
    console.error("Failed to initialize super admin:", error);
  });

app.use(
  logger(),
  prettyJSON(),
  cors({
    origin: DOMAIN, // Your frontend URL
    credentials: true, // Allow cookies
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Ensure OPTIONS is handled
    allowHeaders: ["Content-Type", "Authorization"], // Allow necessary headers
  })
);

// Health check
app.get("/health", (c) => c.json({ message: "API is healthy!" }));

// Admin routes
app.route("/admins", adminRoutes);

// Class routes
app.route("/classes", classRoutes);

// Students routes
app.route("/students", studentsRoutes);

// Payments routes
app.route("/payments", paymentRoutes);

// Global Error Handler
app.onError((error: any, c) => {
  console.error("error: ", error);
  return c.json(
    {
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === "production" ? null : error.stack,
    },
    500
  );
});

// Not Found Handler
app.notFound((c) => {
  const error = notFound(c);
  return error;
});

// Named exports for HTTP methods
export const GET = async (req: Request) => handle(app)(req);
export const POST = async (req: Request) => handle(app)(req);
export const PUT = async (req: Request) => handle(app)(req);
export const DELETE = async (req: Request) => handle(app)(req);
export const PATCH = async (req: Request) => handle(app)(req);
