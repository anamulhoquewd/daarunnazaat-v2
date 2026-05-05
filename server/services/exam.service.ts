import {
  examZ,
  examUpdateZ,
  mongoIdZ,
  subjectZ,
  subjectUpdateZ,
  ExamStatus,
} from "@/validations";
import { calcPositions, calcResult } from "@/lib/grading";
import mongoose from "mongoose";
import { schemaValidationError } from "../error";
import { ExamEnrollment } from "../models/examEnrollments.model";
import { Exam } from "../models/exams.model";
import { Result } from "../models/results.model";
import { Student } from "../models/students.model";
import { Subject } from "../models/subjects.model";
import pagination from "../utils/pagination";

// ── Subjects ──────────────────────────────────────────────────────────────────

export const createSubject = async (body: any) => {
  const validation = subjectZ.safeParse(body);
  if (!validation.success)
    return { error: schemaValidationError(validation.error, "Invalid request body") };

  try {
    const exists = await Subject.findOne({ name: validation.data.name });
    if (exists) return { error: { message: "A subject with this name already exists" } };

    const subject = await new Subject(validation.data).save();
    return { success: { success: true, message: "Subject created successfully", data: subject } };
  } catch (error: any) {
    return { serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack } };
  }
};

export const getSubjects = async (includeInactive = false) => {
  try {
    const subjects = await Subject.find(includeInactive ? {} : { isActive: true }).sort({ name: 1 });
    return { success: { success: true, message: "Subjects fetched successfully", data: subjects } };
  } catch (error: any) {
    return { serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack } };
  }
};

export const updateSubject = async (_id: string, body: any) => {
  const idV = mongoIdZ.safeParse({ _id });
  if (!idV.success) return { error: schemaValidationError(idV.error, "Invalid ID") };

  const bodyV = subjectUpdateZ.safeParse(body);
  if (!bodyV.success) return { error: schemaValidationError(bodyV.error, "Invalid request body") };

  try {
    const subject = await Subject.findById(idV.data._id);
    if (!subject) return { error: { message: "Subject not found" } };

    Object.assign(subject, bodyV.data);
    const saved = await subject.save();
    return { success: { success: true, message: "Subject updated successfully", data: saved } };
  } catch (error: any) {
    return { serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack } };
  }
};

// ── Exam CRUD ─────────────────────────────────────────────────────────────────

async function autoEnrollClass(
  examId: string,
  classId: string,
  fee: number,
  enrolledBy: string,
) {
  const students = await Student.find({
    classId: new mongoose.Types.ObjectId(classId),
    isActive: true,
    isDeleted: { $ne: true },
  }).select("_id");

  if (!students.length) return 0;

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
  return inserted.length;
}

export const createExam = async (body: any, userId: string) => {
  const validation = examZ.safeParse(body);
  if (!validation.success)
    return { error: schemaValidationError(validation.error, "Invalid request body") };

  try {
    const data = validation.data;

    const feeMap = new Map(data.classFees.map((cf: any) => [cf.classId, cf.fee]));
    for (const classId of data.applicableClasses) {
      if (!feeMap.has(classId))
        return { error: { message: `Missing exam fee for class ID: ${classId}` } };
    }

    const exam = await new Exam({ ...data, createdBy: userId }).save();

    let totalEnrolled = 0;
    for (const classId of data.applicableClasses) {
      totalEnrolled += await autoEnrollClass(
        exam._id.toString(),
        classId,
        (feeMap.get(classId) as number) ?? 0,
        userId,
      );
    }

    return {
      success: {
        success: true,
        message: `Exam created. ${totalEnrolled} students auto-enrolled.`,
        data: exam,
      },
    };
  } catch (error: any) {
    return { serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack } };
  }
};

export const getExams = async (params: {
  page: number;
  limit: number;
  academicYear?: string;
  type?: string;
  status?: string;
  classId?: string;
}) => {
  try {
    const query: any = {};
    if (params.academicYear) query.academicYear = params.academicYear;
    if (params.type) query.type = params.type;
    if (params.status) query.status = params.status;
    if (params.classId && mongoose.Types.ObjectId.isValid(params.classId))
      query.applicableClasses = new mongoose.Types.ObjectId(params.classId);

    const [exams, total, totalDocs] = await Promise.all([
      Exam.find(query)
        .sort({ createdAt: -1 })
        .skip((params.page - 1) * params.limit)
        .limit(params.limit)
        .populate("applicableClasses", "className")
        .populate("createdBy", "phone"),
      Exam.countDocuments(query),
      Exam.countDocuments(),
    ]);

    return {
      success: {
        success: true,
        message: "Exams fetched successfully",
        data: exams,
        pagination: pagination({ page: params.page, limit: params.limit, total, totalDocs }),
      },
    };
  } catch (error: any) {
    return { serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack } };
  }
};

export const getExam = async (_id: string) => {
  const idV = mongoIdZ.safeParse({ _id });
  if (!idV.success) return { error: schemaValidationError(idV.error, "Invalid ID") };

  try {
    const exam = await Exam.findById(idV.data._id)
      .populate("applicableClasses", "className")
      .populate("subjectsByClass.classId", "className")
      .populate("subjectsByClass.subjects.subjectId", "name code")
      .populate("schedule.classId", "className")
      .populate("schedule.subjectId", "name code")
      .populate("createdBy", "phone");

    if (!exam) return { error: { message: "Exam not found" } };

    const [enrollmentCount, feeAgg] = await Promise.all([
      ExamEnrollment.countDocuments({ examId: idV.data._id }),
      ExamEnrollment.aggregate([
        { $match: { examId: new mongoose.Types.ObjectId(_id) } },
        { $group: { _id: null, totalExpected: { $sum: "$feeAmount" }, totalCollected: { $sum: "$feePaid" } } },
      ]),
    ]);

    return {
      success: {
        success: true,
        message: "Exam fetched successfully",
        data: {
          ...exam.toObject(),
          enrollmentCount,
          totalExpectedFee: feeAgg[0]?.totalExpected ?? 0,
          totalCollectedFee: feeAgg[0]?.totalCollected ?? 0,
        },
      },
    };
  } catch (error: any) {
    return { serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack } };
  }
};

export const updateExam = async (_id: string, body: any) => {
  const idV = mongoIdZ.safeParse({ _id });
  if (!idV.success) return { error: schemaValidationError(idV.error, "Invalid ID") };

  const bodyV = examUpdateZ.safeParse(body);
  if (!bodyV.success) return { error: schemaValidationError(bodyV.error, "Invalid request body") };

  try {
    const exam = await Exam.findById(idV.data._id);
    if (!exam) return { error: { message: "Exam not found" } };

    if (exam.status === ExamStatus.RESULTS_PUBLISHED)
      return { error: { message: "Cannot edit an exam with published results" } };

    Object.assign(exam, bodyV.data);
    const saved = await exam.save();
    return { success: { success: true, message: "Exam updated successfully", data: saved } };
  } catch (error: any) {
    return { serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack } };
  }
};

export const deleteExam = async (_id: string) => {
  const idV = mongoIdZ.safeParse({ _id });
  if (!idV.success) return { error: schemaValidationError(idV.error, "Invalid ID") };

  try {
    const exam = await Exam.findById(idV.data._id);
    if (!exam) return { error: { message: "Exam not found" } };

    const hasPayments = await ExamEnrollment.exists({
      examId: idV.data._id,
      feePaid: { $gt: 0 },
    });
    if (hasPayments)
      return { error: { message: "Cannot delete an exam with recorded payments" } };

    await Promise.all([
      ExamEnrollment.deleteMany({ examId: idV.data._id }),
      Result.deleteMany({ examId: idV.data._id }),
    ]);
    await exam.deleteOne();

    return { success: { success: true, message: "Exam deleted successfully" } };
  } catch (error: any) {
    return { serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack } };
  }
};

export const publishResults = async (_id: string) => {
  const idV = mongoIdZ.safeParse({ _id });
  if (!idV.success) return { error: schemaValidationError(idV.error, "Invalid ID") };

  try {
    const exam = await Exam.findById(idV.data._id);
    if (!exam) return { error: { message: "Exam not found" } };

    if (exam.status === ExamStatus.RESULTS_PUBLISHED)
      return { error: { message: "Results are already published" } };

    const publishedAt = new Date();
    const classIds = (exam.applicableClasses as any[]).map((c) => c.toString());

    for (const classId of classIds) {
      const results = await Result.find({
        examId: idV.data._id,
        classId: new mongoose.Types.ObjectId(classId),
      });
      if (!results.length) continue;

      const rankedInputs: { studentId: string; totalMarks: number }[] = [];

      for (const result of results) {
        const calc = calcResult(
          (result.subjectMarks as any[]).map((sm) => ({
            marksObtained: sm.marksObtained,
            fullMarks: sm.fullMarks,
            passMarks: sm.passMarks,
            isAbsent: sm.isAbsent,
          })),
        );

        rankedInputs.push({ studentId: result.studentId.toString(), totalMarks: calc.totalMarks });

        await Result.findByIdAndUpdate(result._id, {
          totalMarks: calc.totalMarks,
          totalFullMarks: calc.totalFullMarks,
          percentage: calc.percentage,
          grade: calc.grade,
          isPassed: calc.isPassed,
          isPublished: true,
          publishedAt,
        });
      }

      const positions = calcPositions(rankedInputs);
      await Promise.all(
        positions.map((p) =>
          Result.findOneAndUpdate(
            { examId: idV.data._id, studentId: new mongoose.Types.ObjectId(p.studentId) },
            { position: p.position },
          ),
        ),
      );
    }

    (exam as any).status = ExamStatus.RESULTS_PUBLISHED;
    await exam.save();

    return { success: { success: true, message: "Results published successfully" } };
  } catch (error: any) {
    return { serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack } };
  }
};
