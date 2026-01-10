import connectDB from "@/server/config/db";
import { notFoundError } from "@/server/error";
import authRoutes from "@/server/routes/auth.route";
import classRoutes from "@/server/routes/classes.route";
import guardianRoutes from "@/server/routes/guardian.route";
import sessionRoute from "@/server/routes/session.route";
import staffRoutes from "@/server/routes/staff.route";
import studentRoutes from "@/server/routes/students.route";
import userRoutes from "@/server/routes/users.route";
import { userServices } from "@/server/services";
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
connectDB()
  .then(async () => {
    // Call the Super Admin Service function after connecting to MongoDB
    const result = await userServices.registerSuperAdmin();

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

// Staff routes
app.route("/staffs", staffRoutes);

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
  const error = notFoundError(c);
  return error;
});

// Named exports for HTTP methods
export const GET = async (req: Request) => handle(app)(req);
export const POST = async (req: Request) => handle(app)(req);
export const PUT = async (req: Request) => handle(app)(req);
export const DELETE = async (req: Request) => handle(app)(req);
export const PATCH = async (req: Request) => handle(app)(req);
