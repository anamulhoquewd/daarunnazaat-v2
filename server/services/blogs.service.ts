import { BlogStatus, blogUpdateZ, blogZ, IBlog, mongoIdZ } from "@/validations";
import mongoose from "mongoose";
import { schemaValidationError } from "../error";
import { Blog } from "../models/blogs.model";
import pagination from "../utils/pagination";

export const register = async ({
  body,
  authorId,
}: {
  body: IBlog;
  authorId: string;
}) => {
  // Safe Parse for better error handling
  const validData = blogZ.safeParse(body);

  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  try {
    // Create blog
    const blog = new Blog({
      ...validData.data,
      authorId,
      status: BlogStatus.DRAFT,
    });

    // Save Blog
    const docs = await blog.save();

    return {
      success: {
        success: true,
        message: "Blog created successfully",
        data: docs,
      },
    };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

// Get all published blogs (public route)
export const gets = async (queryParams: {
  page: number;
  limit: number;
  sortBy: string;
  sortType: string;

  dateRange: { from: Date | string; to: Date | string };
  date: Date | string;
  search: string;
}) => {
  try {
    // Build query
    const query: any = { status: BlogStatus.PUBLISHED };

    if (queryParams.search) {
      query.$or = [{ title: { $regex: queryParams.search, $options: "i" } }];

      if (mongoose.Types.ObjectId.isValid(queryParams.search)) {
        query.$or.push({
          _id: new mongoose.Types.ObjectId(queryParams.search),
        });
      }
    }
    // Date filters: createdAt between fromDate and toDate
    if (queryParams.dateRange?.from && queryParams.dateRange?.to) {
      // Length should be 2
      query.publishedAt = {};
      if (queryParams.dateRange.from)
        query.publishedAt.$gte = new Date(queryParams.dateRange.from);
      if (queryParams.dateRange.to)
        query.publishedAt.$lte = new Date(queryParams.dateRange.to);
      if (Object.keys(query.publishedAt).length === 0) delete query.publishedAt;
    }

    // Date filter
    if (queryParams.date) {
      const date = new Date(queryParams.date);

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      query.publishedAt = {
        $gte: date,
        $lt: nextDate,
      };
    }

    // Allowable sort fields
    const sortField = ["createdAt", "updatedAt", "title"].includes(
      queryParams.sortBy
    )
      ? queryParams.sortBy
      : "createdAt";
    const sortDirection =
      queryParams.sortType.toLocaleLowerCase() === "asc" ? 1 : -1;

    // Fetch blogs
    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate({
          path: "authorId",
          select: "email phone whatsApp role profile",
          populate: {
            path: "profile",
            select: "firstName lastName avatar",
          },
        })
        .sort({ [sortField]: sortDirection })
        .skip((queryParams.page - 1) * queryParams.limit)
        .limit(queryParams.limit)
        .exec(),
      Blog.countDocuments(query),
    ]);

    console.log("Query: ", query);

    // Pagination
    const createPagination = pagination({
      page: queryParams.page,
      limit: queryParams.limit,
      total,
    });

    return {
      success: {
        success: true,
        message: "blogs fetched successfully!",
        data: blogs,
        pagination: createPagination,
      },
    };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

// Get single published blog by slug (public route)
export const get = async (slug: string) => {
  try {
    // Check if blog exists
    const blog = await Blog.findOne({
      slug,
      status: BlogStatus.PUBLISHED,
    }).populate({
      path: "authorId",
      select: "email phone whatsApp role profile",
      populate: {
        path: "profile",
        select: "firstName lastName avatar",
      },
    });

    if (!blog) {
      return {
        error: {
          message: `Blog not found with provided ID!`,
        },
      };
    }

    return {
      success: {
        success: true,
        message: `Blog fetched successfully!`,
        data: blog,
      },
    };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

// Get all draft blogs (admin only)
export const getDrafts = async (queryParams: {
  page: number;
  limit: number;
  sortBy: string;
  sortType: string;

  dateRange: { from: Date | string; to: Date | string };
  date: Date | string;
  search: string;
}) => {
  try {
    // Build query
    const query: any = { status: BlogStatus.DRAFT };

    if (queryParams.search) {
      query.$or = [{ title: { $regex: queryParams.search, $options: "i" } }];

      if (mongoose.Types.ObjectId.isValid(queryParams.search)) {
        query.$or.push({
          _id: new mongoose.Types.ObjectId(queryParams.search),
        });
      }
    }
    // Date filters: createdAt between fromDate and toDate
    if (queryParams.dateRange?.from && queryParams.dateRange?.to) {
      // Length should be 2
      query.publishedAt = {};
      if (queryParams.dateRange.from)
        query.publishedAt.$gte = new Date(queryParams.dateRange.from);
      if (queryParams.dateRange.to)
        query.publishedAt.$lte = new Date(queryParams.dateRange.to);
      if (Object.keys(query.publishedAt).length === 0) delete query.publishedAt;
    }

    // Date filter
    if (queryParams.date) {
      const date = new Date(queryParams.date);

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      query.publishedAt = {
        $gte: date,
        $lt: nextDate,
      };
    }

    // Allowable sort fields
    const sortField = ["createdAt", "updatedAt", "title"].includes(
      queryParams.sortBy
    )
      ? queryParams.sortBy
      : "createdAt";
    const sortDirection =
      queryParams.sortType.toLocaleLowerCase() === "asc" ? 1 : -1;

    // Fetch blogs
    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate({
          path: "authorId",
          select: "email phone whatsApp role profile",
          populate: {
            path: "profile",
            select: "firstName lastName avatar",
          },
        })
        .sort({ [sortField]: sortDirection })
        .skip((queryParams.page - 1) * queryParams.limit)
        .limit(queryParams.limit)
        .exec(),
      Blog.countDocuments(query),
    ]);

    console.log("Query: ", query);

    // Pagination
    const createPagination = pagination({
      page: queryParams.page,
      limit: queryParams.limit,
      total,
    });

    return {
      success: {
        success: true,
        message: "blogs fetched successfully!",
        data: blogs,
        pagination: createPagination,
      },
    };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

// Get single blog by ID (admin only - for draft review)
export const getBlogById = async (_id: string) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  try {
    // Check if blog exists
    const blog = await Blog.findById(idValidation.data._id).populate({
      path: "authorId",
      select: "email phone whatsApp role profile",
      populate: {
        path: "profile",
        select: "firstName lastName avatar",
      },
    });

    if (!blog) {
      return {
        error: {
          message: `Blog not found with provided ID!`,
        },
      };
    }

    return {
      success: {
        success: true,
        message: `Blog fetched successfully!`,
        data: blog,
      },
    };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

// Publish blog (admin only)
export const publishBlog = async ({
  _id,
  adminId,
}: {
  _id: string;
  adminId: string;
}) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  try {
    const blog = await Blog.findById(idValidation.data._id);

    if (!blog) {
      return {
        error: {
          message: `Blog not found with provided ID!`,
        },
      };
    }

    if (blog.status === BlogStatus.PUBLISHED) {
      return {
        error: {
          message: `Blog is already published`,
        },
      };
    }

    blog.status = BlogStatus.PUBLISHED;
    blog.publishedAt = new Date();
    blog.publishedBy = adminId;

    await blog.save();

    return {
      success: {
        success: true,
        data: blog,
        message: "Blog published successfully",
      },
    };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

// Unpublish blog (admin only - move back to draft)
export const unpublishBlog = async (_id: string) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  try {
    const blog = await Blog.findById(idValidation.data._id);

    if (!blog) {
      return {
        error: {
          message: `Blog not found with provided ID!`,
        },
      };
    }

    blog.status = BlogStatus.DRAFT;

    await blog.save();

    return {
      success: { success: true, message: "Blog moved to draft" },
    };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

// Update blog (keeps status as is)
export const updateBlog = async ({
  _id,
  body,
  userId,
}: {
  _id: string;
  body: IBlog;
  userId: string;
}) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  // Validate Body
  const validData = blogUpdateZ.safeParse(body);
  if (!validData.success) {
    return {
      error: schemaValidationError(validData.error, "Invalid request body"),
    };
  }

  try {
    const blog = await Blog.findById(idValidation.data._id);

    if (!blog) {
      return {
        error: {
          message: `Blog not found with provided ID!`,
        },
      };
    }

    // Check if user is author or admin
    if (blog.authorId.toString() !== userId.toString()) {
      return {
        error: {
          message: `Unauthorized to update this blog!`,
        },
      };
    }

    // Check if all fields are empty
    if (Object.keys(validData.data).length === 0) {
      return {
        success: {
          success: true,
          message: "No updates provided, returning existing user",

          data: blog,
        },
      };
    }

    Object.assign(blog, validData.data);

    await blog.save();

    return {
      success: true,
      data: blog,
      message: "Blog updated successfully",
    };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

// Delete blog
export const deletes = async ({
  _id,
  isAdmin = false,
  authorId,
}: {
  _id: string;
  authorId: string;
  isAdmin: boolean;
}) => {
  // Validate ID
  const idValidation = mongoIdZ.safeParse({ _id: _id });
  if (!idValidation.success) {
    return { error: schemaValidationError(idValidation.error, "Invalid ID") };
  }

  try {
    const blog = await Blog.findById(idValidation.data._id);

    if (!blog) {
      return {
        error: {
          message: `Blog not found with provided ID!`,
        },
      };
    }

    // Check if user is author or admin
    if (!isAdmin && blog.authorId.toString() !== authorId.toString()) {
      return {
        error: {
          message: `Unauthorized to delete this blog!`,
        },
      };
    }

    // Delete Blog
    await blog.deleteOne();

    // Response
    return {
      success: {
        success: true,
        message: `Blog deleted successfully!`,
      },
    };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};

// Get user's own blogs (both draft and published)
export const getUserBlogs = async ({
  queryParams,
  authorId,
}: {
  authorId: string;
  queryParams: {
    page: number;
    limit: number;
    sortBy: string;
    sortType: string;

    dateRange: { from: Date | string; to: Date | string };
    date: Date | string;
    search: string;
  };
}) => {
  try {
    // Build query
    const query: any = { authorId };

    if (queryParams.search) {
      query.$or = [{ title: { $regex: queryParams.search, $options: "i" } }];

      if (mongoose.Types.ObjectId.isValid(queryParams.search)) {
        query.$or.push({
          _id: new mongoose.Types.ObjectId(queryParams.search),
        });
      }
    }
    // Date filters: createdAt between fromDate and toDate
    if (queryParams.dateRange?.from && queryParams.dateRange?.to) {
      // Length should be 2
      query.publishedAt = {};
      if (queryParams.dateRange.from)
        query.publishedAt.$gte = new Date(queryParams.dateRange.from);
      if (queryParams.dateRange.to)
        query.publishedAt.$lte = new Date(queryParams.dateRange.to);
      if (Object.keys(query.publishedAt).length === 0) delete query.publishedAt;
    }

    // Date filter
    if (queryParams.date) {
      const date = new Date(queryParams.date);

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      query.publishedAt = {
        $gte: date,
        $lt: nextDate,
      };
    }

    // Allowable sort fields
    const sortField = ["createdAt", "updatedAt", "title"].includes(
      queryParams.sortBy
    )
      ? queryParams.sortBy
      : "createdAt";
    const sortDirection =
      queryParams.sortType.toLocaleLowerCase() === "asc" ? 1 : -1;

    // Fetch blogs
    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate({
          path: "authorId",
          select: "email phone whatsApp role profile",
          populate: {
            path: "profile",
            select: "firstName lastName avatar",
          },
        })
        .sort({ [sortField]: sortDirection })
        .skip((queryParams.page - 1) * queryParams.limit)
        .limit(queryParams.limit)
        .exec(),
      Blog.countDocuments(query),
    ]);

    console.log("Query: ", query);

    // Pagination
    const createPagination = pagination({
      page: queryParams.page,
      limit: queryParams.limit,
      total,
    });

    return {
      success: {
        success: true,
        message: "blogs fetched successfully!",
        data: blogs,
        pagination: createPagination,
      },
    };
  } catch (error: any) {
    return {
      serverError: {
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      },
    };
  }
};
