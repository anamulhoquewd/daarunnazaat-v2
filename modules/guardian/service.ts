import { nextNumber } from "@/modules/shared/numbering/service";
import { schemaValidationError } from "@/server/error/index";
import { User } from "@/server/models/users.model";
import pagination from "@/server/utils/pagination";
import mongoose from "mongoose";
import z from "zod";
import { createGuardianZ } from "../zod/guardian";
import { Guardian } from "./schema";

// ── Validation ─────────────────────────────────────────────────────────────────

export const updateGuardianZ = createGuardianZ
  .partial()
  .omit({ userId: true, guardianId: true });

const zBoolString = z.enum(["true", "false"]).transform((v) => v === "true");

export const listGuardiansQueryZ = z.object({
  search: z.string().optional(),
  isActive: zBoolString.optional(),
  isDeleted: zBoolString.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortWith: z
    .enum([
      "fullName",
      "guardianId",
      "phone",
      "email",
      "createdAt",
      "updatedAt",
    ])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),

  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export type ICreateGuardian = z.infer<typeof createGuardianZ>;

// ── Services ───────────────────────────────────────────────────────────────────

export const createGuardian = async ({
  body,
  userId,
}: {
  body: ICreateGuardian;
  userId: string;
}) => {
  const parsed = createGuardianZ.safeParse(body);
  if (!parsed.success)
    return {
      error: schemaValidationError(parsed.error, "Invalid guardian data"),
    };
  const data = parsed.data;

  try {
    const user = await User.findById(data.userId);
    if (!user) return { error: { message: "Associated user not found" } };

    const guardianId = await nextNumber("DN-GRD");
    const doc = await Guardian.create({
      guardianId,
      userId: user._id,
      fullName: data.fullName,
      gender: data.gender,
      bloodGroup: data.bloodGroup,
      avatar: data.avatar,
      nid: data.nid,
      phone: user.phone || data.phone,
      alternativePhone: data.alternativePhone,
      whatsApp: data.whatsApp,
      occupation: data.occupation,
      monthlyIncome: data.monthlyIncome,
      address: data.address,
      isActive: true,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      deleteReason: null,
      createdBy: new mongoose.Types.ObjectId(userId),
      updatedBy: new mongoose.Types.ObjectId(userId),
    });
    return { success: doc };
  } catch (err: any) {
    console.error("Error creating guardian:", err);
    if (err.code === 11000)
      return { error: { message: "Guardian already exists for this user" } };
    return { serverError: { message: err.message } };
  }
};

export const listGuardians = async (rawQuery: Record<string, unknown>) => {
  const parsed = listGuardiansQueryZ.safeParse(rawQuery);
  if (!parsed.success)
    return { error: schemaValidationError(parsed.error, "Invalid query") };
  const q = parsed.data;

  console.log("Parsed Query: ", q);
  const sort: Record<string, 1 | -1> = {};
  if (q.sortWith) sort[q.sortWith] = q.sortOrder === "desc" ? -1 : 1;

  try {
    // Build filter based on query
    const filter: any = { isDeleted: false }; // default filter to exclude deleted records
    if (q.isActive !== undefined) filter.isActive = q.isActive;
    // if user wants to include deleted records, we don't filter by isDeleted at all
    if (q.isDeleted !== undefined) filter.isDeleted = q.isDeleted;
    if (q.search)
      filter.$or = [
        { fullName: { $regex: q.search, $options: "i" } },
        { guardianId: { $regex: q.search, $options: "i" } },
        { phone: { $regex: q.search, $options: "i" } },
        { email: { $regex: q.search, $options: "i" } },
      ];
    // Date range filter
    if (q.fromDate || q.toDate) {
      filter.createdAt = {};
      if (q.fromDate) filter.createdAt.$gte = new Date(q.fromDate);
      if (q.toDate) filter.createdAt.$lte = new Date(q.toDate);
    }
    console.log("Sort: ", sort);

    const skip = (q.page - 1) * q.limit;
    const [data, total] = await Promise.all([
      Guardian.find(filter)
        .populate("userId", "email phone")
        .sort(sort)
        .skip(skip)
        .limit(q.limit)
        .lean(),
      Guardian.countDocuments(filter),
    ]);

    const p = pagination({
      page: q.page,
      limit: q.limit,
      total,
    });

    return {
      success: {
        data,
        pagination: p,
        message: "Guardians retrieved successfully",
      },
    };
  } catch (err: any) {
    return { serverError: { message: err.message } };
  }
};

export const getGuardian = async (id: string) => {
  try {
    const doc = await Guardian.findById(id)
      .populate("userId", "email phone")
      .lean();
    if (!doc || (doc as any).isDeleted)
      return { error: { message: "Guardian not found" } };
    return {
      success: {
        data: doc,
        message: "Guardian retrieved successfully",
      },
    };
  } catch (err: any) {
    return { serverError: { message: err.message } };
  }
};

export const getMyGuardianProfile = async (userId: string) => {
  try {
    const doc = await Guardian.findOne({ userId, isDeleted: false }).lean();
    if (!doc) return { error: { message: "Guardian profile not found" } };
    return { success: doc };
  } catch (err: any) {
    return { serverError: { message: err.message } };
  }
};

export const updateGuardian = async ({
  id,
  body,
  userId,
}: {
  id: string;
  body: any;
  userId: string;
}) => {
  const parsed = updateGuardianZ.safeParse(body);

  if (!parsed.success)
    return {
      error: schemaValidationError(parsed.error, "Invalid update data"),
    };

  try {
    const doc = await Guardian.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        $set: {
          ...parsed.data,
          updatedBy: new mongoose.Types.ObjectId(userId),
        },
      },
      { new: true },
    )
      .populate("userId", "email phone")
      .lean();
    console.log("Updated Guardian: ", doc);
    if (!doc) return { error: { message: "Guardian not found" } };
    return { success: { data: doc, message: "Guardian updated successfully" } };
  } catch (err: any) {
    return { serverError: { message: err.message } };
  }
};

export const softDelete = async ({
  id,
  reason,
  userId,
}: {
  id: string;
  reason: string;
  userId: string;
}) => {
  try {
    const doc = await Guardian.findOneAndUpdate(
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
    )
      .populate("userId", "email phone")
      .lean();
    if (!doc) return { error: { message: "Guardian not found" } };
    return {
      success: { data: doc, message: "Guardian deactivated successfully" },
    };
  } catch (err: any) {
    return { serverError: { message: err.message } };
  }
};

export const restoreGuardian = async ({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) => {
  try {
    const doc = await Guardian.findOneAndUpdate(
      { _id: id, isDeleted: true },
      {
        $set: {
          isDeleted: false,
          deletedAt: null,
          deletedBy: null,
          deleteReason: null,
          updatedBy: new mongoose.Types.ObjectId(userId),
        },
      },
      { new: true },
    )
      .populate("userId", "email phone")
      .lean();
    if (!doc)
      return { error: { message: "Guardian not found or not deleted" } };
    return {
      success: { data: doc, message: "Guardian restored successfully" },
    };
  } catch (err: any) {
    return { serverError: { message: err.message } };
  }
};

export const updateOwnProfile = async ({
  userId,
  body,
}: {
  userId: string;
  body: any;
}) => {
  const allowed = updateGuardianZ.pick({
    avatar: true,
    phone: true,
    alternativePhone: true,
    whatsApp: true,
    occupation: true,
    address: true,
  });
  const parsed = allowed.safeParse(body);
  if (!parsed.success)
    return {
      error: schemaValidationError(parsed.error, "Invalid profile data"),
    };

  try {
    const doc = await Guardian.findOneAndUpdate(
      { userId, isDeleted: false },
      {
        $set: {
          ...parsed.data,
          updatedBy: new mongoose.Types.ObjectId(userId),
        },
      },
      { new: true },
    ).lean();
    if (!doc) return { error: { message: "Guardian profile not found" } };
    return { success: doc };
  } catch (err: any) {
    return { serverError: { message: err.message } };
  }
};

/** Return all students belonging to a guardian */
export const getGuardianStudents = async (guardianId: string) => {
  try {
    const { Student } = await import("@/modules/student/schema");
    const students = await Student.find({ guardianId, isDeleted: false })
      .populate("classId", "name order")
      .populate("currentSessionId", "name")
      .lean();
    return { success: students };
  } catch (err: any) {
    return { serverError: { message: err.message } };
  }
};
