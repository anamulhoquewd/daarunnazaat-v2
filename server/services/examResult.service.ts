import { mongoIdZ, submitResultsBulkZ, UserRole } from "@/validations";
import { calcPositions, calcResult } from "@/lib/grading";
import mongoose from "mongoose";
import { schemaValidationError } from "../error";
import { ExamEnrollment } from "../models/examEnrollments.model";
import { Exam } from "../models/exams.model";
import { Guardian } from "../models/guardians.model";
import { Result } from "../models/results.model";
import { Student } from "../models/students.model";
import pagination from "../utils/pagination";

export const submitResultsBulk = async (examId: string, body: any, userId: string) => {
  const examIdV = mongoIdZ.safeParse({ _id: examId });
  if (!examIdV.success) return { error: schemaValidationError(examIdV.error, "Invalid exam ID") };

  const bodyV = submitResultsBulkZ.safeParse(body);
  if (!bodyV.success) return { error: schemaValidationError(bodyV.error, "Invalid request body") };

  try {
    const exam = await Exam.findById(examIdV.data._id);
    if (!exam) return { error: { message: "Exam not found" } };

    const classId = bodyV.data.classId;

    // Build a lookup of subjectId → { fullMarks, passMarks } from the exam config
    const classSubjectEntry = (exam.subjectsByClass as any[]).find(
      (entry) => entry.classId.toString() === classId,
    );
    if (!classSubjectEntry)
      return { error: { message: "This class has no subject configuration in the exam" } };

    const subjectDefs = new Map<string, { fullMarks: number; passMarks: number }>(
      classSubjectEntry.subjects.map((s: any) => [
        s.subjectId.toString(),
        { fullMarks: s.fullMarks, passMarks: s.passMarks },
      ]),
    );

    let saved = 0;
    const errors: string[] = [];

    for (const entry of bodyV.data.results) {
      const { studentId, subjectMarks } = entry;

      // Validate and merge marks with exam config
      const mergedMarks: {
        subjectId: any;
        marksObtained: number;
        fullMarks: number;
        passMarks: number;
        isAbsent: boolean;
      }[] = [];

      let validationFailed = false;
      for (const sm of subjectMarks) {
        const def = subjectDefs.get(sm.subjectId);
        if (!def) {
          errors.push(`Subject ${sm.subjectId} not found in exam config for student ${studentId}`);
          validationFailed = true;
          break;
        }
        if (!sm.isAbsent && sm.marksObtained > def.fullMarks) {
          errors.push(
            `marksObtained (${sm.marksObtained}) exceeds fullMarks (${def.fullMarks}) for subject ${sm.subjectId}`,
          );
          validationFailed = true;
          break;
        }
        mergedMarks.push({
          subjectId: new mongoose.Types.ObjectId(sm.subjectId),
          marksObtained: sm.isAbsent ? 0 : sm.marksObtained,
          fullMarks: def.fullMarks,
          passMarks: def.passMarks,
          isAbsent: sm.isAbsent,
        });
      }

      if (validationFailed) continue;

      const calc = calcResult(mergedMarks);

      await Result.findOneAndUpdate(
        {
          examId: new mongoose.Types.ObjectId(examId),
          studentId: new mongoose.Types.ObjectId(studentId),
        },
        {
          $set: {
            classId: new mongoose.Types.ObjectId(classId),
            subjectMarks: mergedMarks,
            totalMarks: calc.totalMarks,
            totalFullMarks: calc.totalFullMarks,
            percentage: calc.percentage,
            grade: calc.grade,
            isPassed: calc.isPassed,
            enteredBy: new mongoose.Types.ObjectId(userId),
            lastUpdatedBy: new mongoose.Types.ObjectId(userId),
          },
        },
        { upsert: true, new: true },
      );

      saved++;
    }

    return {
      success: {
        success: true,
        message: `Marks saved for ${saved} student(s)${errors.length ? `. ${errors.length} skipped.` : ""}`,
        data: { saved, skipped: errors.length, errors },
      },
    };
  } catch (error: any) {
    return { serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack } };
  }
};

export const updateResult = async (resultId: string, body: any, userId: string) => {
  const idV = mongoIdZ.safeParse({ _id: resultId });
  if (!idV.success) return { error: schemaValidationError(idV.error, "Invalid ID") };

  try {
    const result = await Result.findById(idV.data._id);
    if (!result) return { error: { message: "Result not found" } };

    // Merge incoming subjectMarks with existing ones
    if (body.subjectMarks) {
      const existing = new Map(
        (result.subjectMarks as any[]).map((sm) => [sm.subjectId.toString(), sm]),
      );
      for (const sm of body.subjectMarks) {
        existing.set(sm.subjectId, { ...existing.get(sm.subjectId), ...sm });
      }
      (result as any).subjectMarks = Array.from(existing.values());
    }

    const calc = calcResult(
      (result.subjectMarks as any[]).map((sm) => ({
        marksObtained: sm.marksObtained,
        fullMarks: sm.fullMarks,
        passMarks: sm.passMarks,
        isAbsent: sm.isAbsent,
      })),
    );

    result.totalMarks = calc.totalMarks as any;
    result.totalFullMarks = calc.totalFullMarks as any;
    result.percentage = calc.percentage as any;
    (result as any).grade = calc.grade;
    result.isPassed = calc.isPassed as any;
    (result as any).lastUpdatedBy = new mongoose.Types.ObjectId(userId);

    const saved = await result.save();

    // Recalculate positions for this class
    await recalculatePositions(result.examId.toString(), result.classId.toString());

    return { success: { success: true, message: "Result updated successfully", data: saved } };
  } catch (error: any) {
    return { serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack } };
  }
};

export const getResults = async (
  examId: string,
  params: { page: number; limit: number; classId?: string },
  user: { roles: string[]; _id: string },
) => {
  const idV = mongoIdZ.safeParse({ _id: examId });
  if (!idV.success) return { error: schemaValidationError(idV.error, "Invalid exam ID") };

  try {
    const query: any = { examId: idV.data._id };

    if (params.classId && mongoose.Types.ObjectId.isValid(params.classId))
      query.classId = new mongoose.Types.ObjectId(params.classId);

    // Guardians only see published results for their own children
    if (user.roles.includes(UserRole.GUARDIAN) && !user.roles.includes(UserRole.ADMIN) && !user.roles.includes(UserRole.SUPER_ADMIN)) {
      const guardian = await Guardian.findOne({ userId: new mongoose.Types.ObjectId(user._id) });
      if (!guardian) return { error: { message: "Guardian profile not found" } };

      const children = await Student.find({ guardianId: guardian._id }).select("_id");
      query.studentId = { $in: children.map((c) => c._id) };
      query.isPublished = true;
    }

    const [results, total, totalDocs] = await Promise.all([
      Result.find(query)
        .sort({ position: 1, createdAt: -1 })
        .skip((params.page - 1) * params.limit)
        .limit(params.limit)
        .populate("studentId", "fullName studentId")
        .populate("classId", "className")
        .populate("subjectMarks.subjectId", "name code"),
      Result.countDocuments(query),
      Result.countDocuments({ examId: idV.data._id }),
    ]);

    return {
      success: {
        success: true,
        message: "Results fetched successfully",
        data: results,
        pagination: pagination({ page: params.page, limit: params.limit, total, totalDocs }),
      },
    };
  } catch (error: any) {
    return { serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack } };
  }
};

export const recalculatePositions = async (examId: string, classId?: string) => {
  const idV = mongoIdZ.safeParse({ _id: examId });
  if (!idV.success) return { error: schemaValidationError(idV.error, "Invalid exam ID") };

  try {
    const query: any = { examId: idV.data._id };
    if (classId && mongoose.Types.ObjectId.isValid(classId))
      query.classId = new mongoose.Types.ObjectId(classId);

    // Group distinct classIds affected
    const classIds: string[] = classId
      ? [classId]
      : (await Result.distinct("classId", { examId: idV.data._id })).map((c) => c.toString());

    for (const cId of classIds) {
      const results = await Result.find({
        examId: idV.data._id,
        classId: new mongoose.Types.ObjectId(cId),
      }).select("_id studentId totalMarks");

      if (!results.length) continue;

      const positions = calcPositions(
        results.map((r) => ({ studentId: r.studentId.toString(), totalMarks: (r as any).totalMarks ?? 0 })),
      );

      await Promise.all(
        positions.map((p) =>
          Result.findOneAndUpdate(
            { examId: idV.data._id, studentId: new mongoose.Types.ObjectId(p.studentId) },
            { position: p.position },
          ),
        ),
      );
    }

    return { success: { success: true, message: "Positions recalculated successfully" } };
  } catch (error: any) {
    return { serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack } };
  }
};

// ── Guardian-facing ───────────────────────────────────────────────────────────

export const getStudentResults = async (studentId: string, userId: string, roles: string[]) => {
  const idV = mongoIdZ.safeParse({ _id: studentId });
  if (!idV.success) return { error: schemaValidationError(idV.error, "Invalid student ID") };

  try {
    const student = await Student.findById(idV.data._id);
    if (!student) return { error: { message: "Student not found" } };

    // Guardians must own the student
    if (roles.includes(UserRole.GUARDIAN) && !roles.includes(UserRole.ADMIN) && !roles.includes(UserRole.SUPER_ADMIN)) {
      const guardian = await Guardian.findOne({ userId: new mongoose.Types.ObjectId(userId) });
      if (!guardian || guardian._id.toString() !== student.guardianId.toString())
        return { error: { message: "Access denied" } };
    }

    const isGuardian = roles.includes(UserRole.GUARDIAN) && !roles.includes(UserRole.ADMIN);

    const results = await Result.find({
      studentId: idV.data._id,
      ...(isGuardian ? { isPublished: true } : {}),
    })
      .populate("examId", "name type academicYear startDate endDate")
      .populate("subjectMarks.subjectId", "name code")
      .sort({ createdAt: -1 });

    return {
      success: {
        success: true,
        message: "Results fetched successfully",
        data: results,
      },
    };
  } catch (error: any) {
    return { serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack } };
  }
};

export const getStudentFees = async (studentId: string, userId: string, roles: string[]) => {
  const idV = mongoIdZ.safeParse({ _id: studentId });
  if (!idV.success) return { error: schemaValidationError(idV.error, "Invalid student ID") };

  try {
    const student = await Student.findById(idV.data._id);
    if (!student) return { error: { message: "Student not found" } };

    if (roles.includes(UserRole.GUARDIAN) && !roles.includes(UserRole.ADMIN) && !roles.includes(UserRole.SUPER_ADMIN)) {
      const guardian = await Guardian.findOne({ userId: new mongoose.Types.ObjectId(userId) });
      if (!guardian || guardian._id.toString() !== student.guardianId.toString())
        return { error: { message: "Access denied" } };
    }

    const enrollments = await ExamEnrollment.find({ studentId: idV.data._id })
      .populate("examId", "name type academicYear status")
      .sort({ createdAt: -1 });

    return {
      success: {
        success: true,
        message: "Fee history fetched successfully",
        data: enrollments,
      },
    };
  } catch (error: any) {
    return { serverError: { success: false, message: error.message, stack: process.env.NODE_ENV === "production" ? null : error.stack } };
  }
};
