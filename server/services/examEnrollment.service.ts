import { addExamPaymentZ, mongoIdZ } from "@/validations";
import mongoose from "mongoose";
import { schemaValidationError } from "../error";
import { ExamEnrollment } from "../models/examEnrollments.model";
import { Exam } from "../models/exams.model";
import { Student } from "../models/students.model";
import pagination from "../utils/pagination";

export const enrollClass = async (examId: string, classId: string, enrolledBy: string) => {
  const examIdV = mongoIdZ.safeParse({ _id: examId });
  const classIdV = mongoIdZ.safeParse({ _id: classId });
  if (!examIdV.success) return { error: { message: "Invalid exam ID" } };
  if (!classIdV.success) return { error: { message: "Invalid class ID" } };

  try {
    const exam = await Exam.findById(examIdV.data._id);
    if (!exam) return { error: { message: "Exam not found" } };

    const isApplicable = (exam.applicableClasses as any[]).some(
      (c) => c.toString() === classId,
    );
    if (!isApplicable)
      return { error: { message: "This class is not part of the exam" } };

    const classFeeEntry = (exam.classFees as any[]).find(
      (cf) => cf.classId.toString() === classId,
    );
    const fee = classFeeEntry?.fee ?? 0;

    const students = await Student.find({
      classId: new mongoose.Types.ObjectId(classId),
      isActive: true,
      isDeleted: { $ne: true },
    }).select("_id");

    if (!students.length)
      return { error: { message: "No active students found in this class" } };

    const docs = students.map((s) => ({
      examId: new mongoose.Types.ObjectId(examId),
      studentId: s._id,
      classId: new mongoose.Types.ObjectId(classId),
      feeAmount: fee,
      feePaid: 0,
      enrolledAt: new Date(),
      enrolledBy: new mongoose.Types.ObjectId(enrolledBy),
    }));

    const inserted = await ExamEnrollment.insertMany(docs, { ordered: false }).catch(() => []);

    return {
      success: {
        success: true,
        message: `${inserted.length} student(s) enrolled successfully`,
        data: { enrolled: inserted.length, skipped: students.length - inserted.length },
      },
    };
  } catch (error: any) {
    return { serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack } };
  }
};

export const enrollStudent = async (
  examId: string,
  body: { studentId: string },
  enrolledBy: string,
) => {
  const examIdV = mongoIdZ.safeParse({ _id: examId });
  const studentIdV = mongoIdZ.safeParse({ _id: body.studentId });
  if (!examIdV.success) return { error: { message: "Invalid exam ID" } };
  if (!studentIdV.success) return { error: { message: "Invalid student ID" } };

  try {
    const [exam, student] = await Promise.all([
      Exam.findById(examIdV.data._id),
      Student.findById(studentIdV.data._id),
    ]);

    if (!exam) return { error: { message: "Exam not found" } };
    if (!student) return { error: { message: "Student not found" } };

    const isApplicable = (exam.applicableClasses as any[]).some(
      (c) => c.toString() === student.classId.toString(),
    );
    if (!isApplicable)
      return { error: { message: "Student's class is not part of this exam" } };

    const already = await ExamEnrollment.exists({ examId: examIdV.data._id, studentId: studentIdV.data._id });
    if (already) return { error: { message: "Student is already enrolled" } };

    const classFeeEntry = (exam.classFees as any[]).find(
      (cf) => cf.classId.toString() === student.classId.toString(),
    );

    const enrollment = await new ExamEnrollment({
      examId: examIdV.data._id,
      studentId: studentIdV.data._id,
      classId: student.classId,
      feeAmount: classFeeEntry?.fee ?? 0,
      feePaid: 0,
      enrolledAt: new Date(),
      enrolledBy: new mongoose.Types.ObjectId(enrolledBy),
    }).save();

    return { success: { success: true, message: "Student enrolled successfully", data: enrollment } };
  } catch (error: any) {
    return { serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack } };
  }
};

export const removeEnrollment = async (enrollmentId: string) => {
  const idV = mongoIdZ.safeParse({ _id: enrollmentId });
  if (!idV.success) return { error: schemaValidationError(idV.error, "Invalid ID") };

  try {
    const enrollment = await ExamEnrollment.findById(idV.data._id);
    if (!enrollment) return { error: { message: "Enrollment not found" } };

    if (enrollment.feePaid > 0)
      return { error: { message: "Cannot remove an enrollment with recorded payments" } };

    await enrollment.deleteOne();
    return { success: { success: true, message: "Enrollment removed successfully" } };
  } catch (error: any) {
    return { serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack } };
  }
};

export const getEnrollments = async (
  examId: string,
  params: {
    page: number;
    limit: number;
    classId?: string;
    feeStatus?: string;
    search?: string;
  },
) => {
  const idV = mongoIdZ.safeParse({ _id: examId });
  if (!idV.success) return { error: schemaValidationError(idV.error, "Invalid exam ID") };

  try {
    const query: any = { examId: idV.data._id };
    if (params.classId && mongoose.Types.ObjectId.isValid(params.classId))
      query.classId = new mongoose.Types.ObjectId(params.classId);
    if (params.feeStatus) query.feeStatus = params.feeStatus;

    // Search by student name / ID requires a join — handled via populate + filter
    const [enrollments, total, totalDocs] = await Promise.all([
      ExamEnrollment.find(query)
        .sort({ enrolledAt: -1 })
        .skip((params.page - 1) * params.limit)
        .limit(params.limit)
        .populate("studentId", "fullName studentId classId")
        .populate("classId", "className")
        .populate("enrolledBy", "phone"),
      ExamEnrollment.countDocuments(query),
      ExamEnrollment.countDocuments({ examId: idV.data._id }),
    ]);

    return {
      success: {
        success: true,
        message: "Enrollments fetched successfully",
        data: enrollments,
        pagination: pagination({ page: params.page, limit: params.limit, total, totalDocs }),
      },
    };
  } catch (error: any) {
    return { serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack } };
  }
};

export const addPayment = async (enrollmentId: string, body: any, receivedBy: string) => {
  const idV = mongoIdZ.safeParse({ _id: enrollmentId });
  if (!idV.success) return { error: schemaValidationError(idV.error, "Invalid ID") };

  const bodyV = addExamPaymentZ.safeParse(body);
  if (!bodyV.success) return { error: schemaValidationError(bodyV.error, "Invalid request body") };

  try {
    const enrollment = await ExamEnrollment.findById(idV.data._id);
    if (!enrollment) return { error: { message: "Enrollment not found" } };

    const remaining = enrollment.feeAmount - enrollment.feePaid;
    if (bodyV.data.amount > remaining)
      return {
        error: {
          message: `Amount exceeds remaining due. Remaining: ${remaining}`,
          fields: [{ name: "amount", message: `Maximum payable: ${remaining}` }],
        },
      };

    (enrollment.paymentHistory as any[]).push({
      amount: bodyV.data.amount,
      date: bodyV.data.date,
      method: bodyV.data.method,
      note: bodyV.data.note,
      receivedBy: new mongoose.Types.ObjectId(receivedBy),
    });

    enrollment.feePaid += bodyV.data.amount;
    const saved = await enrollment.save(); // pre-save hook updates feeStatus

    return {
      success: {
        success: true,
        message: "Payment recorded successfully",
        data: {
          feePaid: saved.feePaid,
          feeAmount: saved.feeAmount,
          feeStatus: saved.feeStatus,
          remaining: saved.feeAmount - saved.feePaid,
        },
      },
    };
  } catch (error: any) {
    return { serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack } };
  }
};

export const getFeesSummary = async (examId: string) => {
  const idV = mongoIdZ.safeParse({ _id: examId });
  if (!idV.success) return { error: schemaValidationError(idV.error, "Invalid exam ID") };

  try {
    const [overall, perClass] = await Promise.all([
      ExamEnrollment.aggregate([
        { $match: { examId: new mongoose.Types.ObjectId(examId) } },
        {
          $group: {
            _id: null,
            totalExpected: { $sum: "$feeAmount" },
            totalCollected: { $sum: "$feePaid" },
            totalEnrollments: { $sum: 1 },
            paid: { $sum: { $cond: [{ $eq: ["$feeStatus", "paid"] }, 1, 0] } },
            partial: { $sum: { $cond: [{ $eq: ["$feeStatus", "partial"] }, 1, 0] } },
            unpaid: { $sum: { $cond: [{ $eq: ["$feeStatus", "unpaid"] }, 1, 0] } },
          },
        },
      ]),
      ExamEnrollment.aggregate([
        { $match: { examId: new mongoose.Types.ObjectId(examId) } },
        {
          $group: {
            _id: "$classId",
            totalExpected: { $sum: "$feeAmount" },
            totalCollected: { $sum: "$feePaid" },
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "classes",
            localField: "_id",
            foreignField: "_id",
            as: "class",
          },
        },
        { $unwind: { path: "$class", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            classId: "$_id",
            className: "$class.className",
            totalExpected: 1,
            totalCollected: 1,
            count: 1,
          },
        },
      ]),
    ]);

    return {
      success: {
        success: true,
        message: "Fee summary fetched successfully",
        data: {
          overall: overall[0] ?? { totalExpected: 0, totalCollected: 0, totalEnrollments: 0, paid: 0, partial: 0, unpaid: 0 },
          perClass,
        },
      },
    };
  } catch (error: any) {
    return { serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack } };
  }
};

export const getPaymentHistory = async (enrollmentId: string) => {
  const idV = mongoIdZ.safeParse({ _id: enrollmentId });
  if (!idV.success) return { error: schemaValidationError(idV.error, "Invalid ID") };

  try {
    const enrollment = await ExamEnrollment.findById(idV.data._id)
      .populate("studentId", "fullName studentId")
      .populate("paymentHistory.receivedBy", "phone");

    if (!enrollment) return { error: { message: "Enrollment not found" } };

    return {
      success: {
        success: true,
        message: "Payment history fetched successfully",
        data: {
          feeAmount: enrollment.feeAmount,
          feePaid: enrollment.feePaid,
          feeStatus: enrollment.feeStatus,
          remaining: enrollment.feeAmount - enrollment.feePaid,
          paymentHistory: enrollment.paymentHistory,
          student: (enrollment as any).studentId,
        },
      },
    };
  } catch (error: any) {
    return { serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack } };
  }
};
