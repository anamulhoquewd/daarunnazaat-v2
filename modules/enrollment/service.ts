import { schemaValidationError } from "@/server/error";
import { EnrollmentStatus } from "@/validations";
import mongoose, { Types } from "mongoose";
import { z } from "zod";
import { Enrollment } from "./schema";

const promoteZ = z.object({
  studentId: z.string().min(1),
  newSessionId: z.string().min(1),
  newClassId: z.string().min(1),
  branch: z.string().min(1),
});

export const enrollStudent = async (
  data: {
    studentId: string;
    sessionId: string;
    classId: string;
    branch: string;
    enrollmentDate?: Date;
  },
  performedBy: string,
) => {
  try {
    const existing = await Enrollment.findOne({
      studentId: data.studentId,
      sessionId: data.sessionId,
      status: EnrollmentStatus.ONGOING,
      isDeleted: false,
    });

    if (existing)
      return { error: { message: "Student already has an active enrollment for this session" } };

    const doc = new Enrollment({
      ...data,
      enrollmentDate: data.enrollmentDate ?? new Date(),
      status: EnrollmentStatus.ONGOING,
      createdBy: performedBy,
    });
    doc.$locals.performedBy = performedBy;
    const saved = await doc.save();

    return { success: { success: true, message: "Enrollment created", data: saved } };
  } catch (error: any) {
    return {
      serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack },
    };
  }
};

export const listEnrollmentsByClassSession = async (params: {
  sessionId?: string;
  classId?: string;
  studentId?: string;
  status?: EnrollmentStatus;
  page: number;
  limit: number;
}) => {
  try {
    const filter: Record<string, unknown> = { isDeleted: false };
    if (params.sessionId) filter.sessionId = new Types.ObjectId(params.sessionId);
    if (params.classId) filter.classId = new Types.ObjectId(params.classId);
    if (params.studentId) filter.studentId = new Types.ObjectId(params.studentId);
    if (params.status) filter.status = params.status;

    const [docs, total] = await Promise.all([
      Enrollment.find(filter)
        .sort({ enrollmentDate: -1 })
        .skip((params.page - 1) * params.limit)
        .limit(params.limit)
        .populate("studentId", "fullName studentId")
        .populate("sessionId", "name cycleType")
        .populate("classId", "name")
        .lean(),
      Enrollment.countDocuments(filter),
    ]);

    return {
      success: {
        success: true,
        message: "Enrollments fetched",
        data: docs,
        total,
        page: params.page,
        limit: params.limit,
      },
    };
  } catch (error: any) {
    return {
      serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack },
    };
  }
};

export const completeEnrollment = async (
  enrollmentId: string,
  status: EnrollmentStatus,
  performedBy: string,
  promotionMeta?: {
    fromClassId?: string;
    toClassId?: string;
  },
) => {
  if (!mongoose.isValidObjectId(enrollmentId))
    return { error: { message: "Invalid enrollment ID" } };

  const terminalStatuses = [
    EnrollmentStatus.PROMOTED,
    EnrollmentStatus.REPEATED,
    EnrollmentStatus.DROPPED,
    EnrollmentStatus.GRADUATED,
  ];

  if (!terminalStatuses.includes(status))
    return { error: { message: `Status must be one of: ${terminalStatuses.join(", ")}` } };

  try {
    const doc = await Enrollment.findOne({ _id: enrollmentId, isDeleted: false });
    if (!doc) return { error: { message: "Enrollment not found" } };
    if (doc.status !== EnrollmentStatus.ONGOING)
      return { error: { message: "Only ongoing enrollments can be completed" } };

    doc.status = status;
    doc.completionDate = new Date();
    if (promotionMeta) {
      doc.promotionMeta = {
        ...(promotionMeta.fromClassId && { fromClassId: new Types.ObjectId(promotionMeta.fromClassId) as any }),
        ...(promotionMeta.toClassId && { toClassId: new Types.ObjectId(promotionMeta.toClassId) as any }),
        promotedAt: new Date(),
        promotedBy: new Types.ObjectId(performedBy) as any,
      };
    }
    doc.$locals.performedBy = performedBy;
    const saved = await doc.save();

    return { success: { success: true, message: "Enrollment completed", data: saved } };
  } catch (error: any) {
    return {
      serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack },
    };
  }
};
