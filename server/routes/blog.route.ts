import { Hono } from "hono";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "@/validations";
import { blogController } from "../controllers";

const blogRoutes = new Hono();

// PUBLIC ROUTES - Anyone can access
blogRoutes.get("/", blogController.getPublishedBlogs);
blogRoutes.get("/:slug", blogController.getPublishedBlog);

// USER ROUTES - Authenticated users only
blogRoutes.post("/register", authenticate, (c) => blogController.register(c));
blogRoutes.get("/my-blogs", authenticate, blogController.getUserBlogs);
blogRoutes.patch("/:_id", authenticate, blogController.updateBlog);
blogRoutes.delete("/:_id", authenticate, blogController.deleteBlog);

// ADMIN ROUTES - Admin only
blogRoutes.get(
  "/admin/drafts",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  blogController.getDraftBlogs
);
blogRoutes.get(
  "/admin/:_id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  blogController.getBlogById
);
blogRoutes.patch(
  "/admin/:_id/publish",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  blogController.publishBlog
);
blogRoutes.patch(
  "/admin/:_id/unpublish",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  blogController.unpublishBlog
);

export default blogRoutes;
