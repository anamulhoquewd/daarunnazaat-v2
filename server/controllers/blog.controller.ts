import { UserRole } from "@/validations";
import { Context } from "hono";
import { badRequestError, serverError } from "../error";
import { blogService } from "../services";

// Create new blog (goes to draft)
export const register = async (c: Context) => {
  const body = await c.req.json();

  const authorId = await c.get("user");

  const response = await blogService.register({ body, authorId });

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 201);
};

// PUBLIC ROUTES
// Get all published blogs
export const getPublishedBlogs = async (c: Context) => {
  const page = parseInt(c.req.query("page") as string, 10) || 1;
  const limit = parseInt(c.req.query("limit") as string, 10) || 10;
  const sortBy = c.req.query("sortBy") || "createdAt";
  const sortType = c.req.query("sortType") || "desc";
  const search = c.req.query("search") as string;
  const date = c.req.query("date") as string;
  const publishDateFrom = c.req.query("publishDateFrom") as string;
  const publishDateTo = c.req.query("publishDateTo") as string;

  const response = await blogService.gets({
    page,
    limit,
    sortBy,
    sortType,

    search,
    date,
    dateRange: { from: publishDateFrom, to: publishDateTo },
  });

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

// Get single published blog by slug
export const getPublishedBlog = async (c: Context) => {
  const slug = c.req.param("slug");

  const response = await blogService.get(slug);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

// USER ROUTES (authenticated users)
// Get user's own blogs
export const getUserBlogs = async (c: Context) => {
  const page = parseInt(c.req.query("page") as string, 10) || 1;
  const limit = parseInt(c.req.query("limit") as string, 10) || 10;
  const sortBy = c.req.query("sortBy") || "createdAt";
  const sortType = c.req.query("sortType") || "desc";
  const search = c.req.query("search") as string;
  const date = c.req.query("date") as string;
  const publishDateFrom = c.req.query("publishDateFrom") as string;
  const publishDateTo = c.req.query("publishDateTo") as string;

  const authorId = await c.get("user");

  const response = await blogService.getUserBlogs({
    authorId,
    queryParams: {
      page,
      limit,
      sortBy,
      sortType,

      search,
      date,
      dateRange: { from: publishDateFrom, to: publishDateTo },
    },
  });

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

// Update own blog
export const updateBlog = async (c: Context) => {
  const _id = c.req.param("_id");
  const body = await c.req.json();

  const userId = await c.get("user");

  const response = await blogService.updateBlog({ _id, userId, body });

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

// Delete own blog
export const deleteBlog = async (c: Context) => {
  const _id = c.req.param("_id");

  const author = await c.get("user");
  const isAdmin = author.role === (UserRole.ADMIN || UserRole.SUPER_ADMIN);

  const response = await blogService.deletes({
    _id,
    authorId: author._id,
    isAdmin,
  });

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

// ADMIN ROUTES
// Get all draft blogs
export const getDraftBlogs = async (c: Context) => {
  const page = parseInt(c.req.query("page") as string, 10) || 1;
  const limit = parseInt(c.req.query("limit") as string, 10) || 10;
  const sortBy = c.req.query("sortBy") || "createdAt";
  const sortType = c.req.query("sortType") || "desc";
  const search = c.req.query("search") as string;
  const date = c.req.query("date") as string;
  const publishDateFrom = c.req.query("publishDateFrom") as string;
  const publishDateTo = c.req.query("publishDateTo") as string;

  const response = await blogService.getDrafts({
    page,
    limit,
    sortBy,
    sortType,

    search,
    date,
    dateRange: { from: publishDateFrom, to: publishDateTo },
  });

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

// Get single blog by ID (for review)
export const getBlogById = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await blogService.getBlogById(_id);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

// Publish blog
export const publishBlog = async (c: Context) => {
  const _id = c.req.param("_id");

  const admin = await c.get("user");

  const response = await blogService.publishBlog({ _id, adminId: admin._id });

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

// Unpublish blog (move back to draft)
export const unpublishBlog = async (c: Context) => {
  const _id = c.req.param("_id");

  const response = await blogService.unpublishBlog(_id);

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};
