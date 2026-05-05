import mongoose from "mongoose";
import z from "zod";
import { Class } from "./schema";
import { schemaValidationError } from "@/server/error/index";

// ── Validation ─────────────────────────────────────────────────────────────────

export const createClassZ = z.object({
  name: z.string().min(1).trim(),
  description: z.string().optional(),
  order: z.coerce.number().int().min(0).default(0),
});

export const updateClassZ = createClassZ.partial();

export const listClassQueryZ = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// ── Services ───────────────────────────────────────────────────────────────────

export const createClass = async ({ body, userId }: { body: unknown; userId: string }) => {
  const parsed = createClassZ.safeParse(body);
  if (!parsed.success)
    return { error: schemaValidationError(parsed.error, "Invalid class data") };
  const data = parsed.data;

  try {
    const doc = await Class.create({
      name: data.name,
      description: data.description,
      order: data.order,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      deleteReason: null,
      createdBy: new mongoose.Types.ObjectId(userId),
      updatedBy: new mongoose.Types.ObjectId(userId),
    });
    return { success: doc };
  } catch (err: any) {
    if (err.code === 11000) return { error: { message: "A class with this name already exists" } };
    return { serverError: { message: err.message } };
  }
};

export const listClasses = async (rawQuery: Record<string, unknown>) => {
  const parsed = listClassQueryZ.safeParse(rawQuery);
  if (!parsed.success)
    return { error: schemaValidationError(parsed.error, "Invalid query") };
  const q = parsed.data;

  try {
    const filter: any = { isDeleted: false };
    if (q.search) filter.name = { $regex: q.search, $options: "i" };

    const skip = (q.page - 1) * q.limit;
    const [data, total] = await Promise.all([
      Class.find(filter).sort({ order: 1, name: 1 }).skip(skip).limit(q.limit).lean(),
      Class.countDocuments(filter),
    ]);
    return { success: { data, page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) } };
  } catch (err: any) {
    return { serverError: { message: err.message } };
  }
};

export const getClass = async (id: string) => {
  try {
    const doc = await Class.findById(id).lean();
    if (!doc || (doc as any).isDeleted) return { error: { message: "Class not found" } };
    return { success: doc };
  } catch (err: any) {
    return { serverError: { message: err.message } };
  }
};

export const updateClass = async ({ id, body, userId }: { id: string; body: unknown; userId: string }) => {
  const parsed = updateClassZ.safeParse(body);
  if (!parsed.success)
    return { error: schemaValidationError(parsed.error, "Invalid update data") };

  try {
    const doc = await Class.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { ...parsed.data, updatedBy: new mongoose.Types.ObjectId(userId) } },
      { new: true },
    ).lean();
    if (!doc) return { error: { message: "Class not found" } };
    return { success: doc };
  } catch (err: any) {
    if (err.code === 11000) return { error: { message: "A class with this name already exists" } };
    return { serverError: { message: err.message } };
  }
};

export const deleteClass = async ({ id, reason, userId }: { id: string; reason: string; userId: string }) => {
  try {
    const doc = await Class.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: new mongoose.Types.ObjectId(userId),
          deleteReason: reason,
          updatedBy: new mongoose.Types.ObjectId(userId),
        },
      },
      { new: true },
    ).lean();
    if (!doc) return { error: { message: "Class not found" } };
    return { success: { message: "Class deleted successfully" } };
  } catch (err: any) {
    return { serverError: { message: err.message } };
  }
};
