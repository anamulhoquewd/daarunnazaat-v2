import mongoose from "mongoose";
import z from "zod";
import { Staff } from "./schema";
import { nextNumber } from "@/modules/shared/numbering/service";
import { schemaValidationError } from "@/server/error/index";
import { moneyInputSchema, optionalMoneyInputSchema } from "@/lib/money";
import { Branch, Gender, BloodGroup, mongoIdStringZ as mongoIdZ } from "@/validations";

// ── Validation ─────────────────────────────────────────────────────────────────

const qualificationSchema = z.object({
  degree: z.string().min(1),
  subject: z.string().optional(),
  institution: z.string().optional(),
  year: z.number().int().optional(),
  grade: z.string().optional(),
});

const emergencyContactSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  relationship: z.string().min(1),
  address: z.string().optional(),
});

const addressSchema = z.object({
  village: z.string().optional(),
  postOffice: z.string().optional(),
  upazila: z.string().optional(),
  district: z.string().optional(),
  division: z.string().optional(),
}).optional();

export const createStaffZ = z.object({
  userId: mongoIdZ,
  fullName: z.string().min(1).trim(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.nativeEnum(Gender),
  bloodGroup: z.nativeEnum(BloodGroup).optional(),
  photo: z.string().url().optional(),
  nid: z.string().optional(),
  designation: z.string().min(1),
  department: z.string().optional(),
  branches: z.array(z.nativeEnum(Branch)).min(1),
  baseSalary: moneyInputSchema,
  joinDate: z.coerce.date(),
  address: addressSchema,
  permanentAddress: addressSchema,
  alternativePhone: z.string().optional(),
  whatsApp: z.string().optional(),
  qualifications: z.array(qualificationSchema).default([]),
  emergencyContact: emergencyContactSchema.optional(),
});

export const updateStaffZ = createStaffZ.partial().omit({ userId: true });

export const listStaffQueryZ = z.object({
  branch: z.nativeEnum(Branch).optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ICreateStaff = z.infer<typeof createStaffZ>;

// ── Services ───────────────────────────────────────────────────────────────────

export const createStaff = async ({ body, userId }: { body: ICreateStaff; userId: string }) => {
  const parsed = createStaffZ.safeParse(body);
  if (!parsed.success)
    return { error: schemaValidationError(parsed.error, "Invalid staff data") };
  const data = parsed.data;

  try {
    const staffId = await nextNumber("DN-STF");
    const doc = await Staff.create({
      staffId,
      userId: new mongoose.Types.ObjectId(data.userId),
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      bloodGroup: data.bloodGroup,
      photo: data.photo,
      nid: data.nid,
      designation: data.designation,
      department: data.department,
      branches: data.branches,
      baseSalary: data.baseSalary,
      joinDate: data.joinDate,
      address: data.address,
      permanentAddress: data.permanentAddress,
      alternativePhone: data.alternativePhone,
      whatsApp: data.whatsApp,
      qualifications: data.qualifications,
      emergencyContact: data.emergencyContact,
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
    if (err.code === 11000) return { error: { message: "Staff already exists for this user" } };
    return { serverError: { message: err.message } };
  }
};

export const listStaff = async (rawQuery: Record<string, unknown>) => {
  const parsed = listStaffQueryZ.safeParse(rawQuery);
  if (!parsed.success)
    return { error: schemaValidationError(parsed.error, "Invalid query") };
  const q = parsed.data;

  try {
    const filter: any = { isDeleted: false };
    if (q.branch) filter.branches = { $in: [q.branch] };
    if (q.isActive !== undefined) filter.isActive = q.isActive;
    if (q.search) filter.fullName = { $regex: q.search, $options: "i" };

    const skip = (q.page - 1) * q.limit;
    const [data, total] = await Promise.all([
      Staff.find(filter)
        .populate("userId", "name email phone")
        .sort({ fullName: 1 })
        .skip(skip)
        .limit(q.limit)
        .lean(),
      Staff.countDocuments(filter),
    ]);
    return { success: { data, page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) } };
  } catch (err: any) {
    return { serverError: { message: err.message } };
  }
};

export const getStaff = async (id: string) => {
  try {
    const doc = await Staff.findById(id).populate("userId", "name email phone").lean();
    if (!doc || (doc as any).isDeleted) return { error: { message: "Staff not found" } };
    return { success: doc };
  } catch (err: any) {
    return { serverError: { message: err.message } };
  }
};

export const getStaffByUserId = async (userId: string) => {
  try {
    const doc = await Staff.findOne({ userId, isDeleted: false }).lean();
    if (!doc) return { error: { message: "Staff not found" } };
    return { success: doc };
  } catch (err: any) {
    return { serverError: { message: err.message } };
  }
};

export const updateStaff = async ({ id, body, userId }: { id: string; body: any; userId: string }) => {
  const parsed = updateStaffZ.safeParse(body);
  if (!parsed.success)
    return { error: schemaValidationError(parsed.error, "Invalid update data") };

  try {
    const doc = await Staff.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { ...parsed.data, updatedBy: new mongoose.Types.ObjectId(userId) } },
      { new: true },
    ).lean();
    if (!doc) return { error: { message: "Staff not found" } };
    return { success: doc };
  } catch (err: any) {
    return { serverError: { message: err.message } };
  }
};

export const updateOwnProfile = async ({ userId, body }: { userId: string; body: any }) => {
  const allowed = updateStaffZ.pick({
    photo: true, alternativePhone: true, whatsApp: true,
    address: true, permanentAddress: true,
    emergencyContact: true,
  });
  const parsed = allowed.safeParse(body);
  if (!parsed.success)
    return { error: schemaValidationError(parsed.error, "Invalid profile data") };

  try {
    const doc = await Staff.findOneAndUpdate(
      { userId, isDeleted: false },
      { $set: { ...parsed.data, updatedBy: new mongoose.Types.ObjectId(userId) } },
      { new: true },
    ).lean();
    if (!doc) return { error: { message: "Staff profile not found" } };
    return { success: doc };
  } catch (err: any) {
    return { serverError: { message: err.message } };
  }
};
