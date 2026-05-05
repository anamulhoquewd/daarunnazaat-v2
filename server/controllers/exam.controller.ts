import { IUser } from "@/validations";
import type { Context } from "hono";
import { badRequestError, serverError } from "../error";
import * as examService from "../services/exam.service";
import * as enrollmentService from "../services/examEnrollment.service";
import * as resultService from "../services/examResult.service";

// ── Subjects ──────────────────────────────────────────────────────────────────

export const createSubject = async (c: Context) => {
  const body = await c.req.json();
  const res = await examService.createSubject(body);
  if (res.error) return badRequestError(c, res.error);
  if (res.serverError) return serverError(c, res.serverError);
  return c.json(res.success, 201);
};

export const getSubjects = async (c: Context) => {
  const includeInactive = c.req.query("includeInactive") === "true";
  const res = await examService.getSubjects(includeInactive);
  if (res.serverError) return serverError(c, res.serverError);
  return c.json(res.success, 200);
};

export const updateSubject = async (c: Context) => {
  const _id = c.req.param("_id");
  const body = await c.req.json();
  const res = await examService.updateSubject(_id, body);
  if (res.error) return badRequestError(c, res.error);
  if (res.serverError) return serverError(c, res.serverError);
  return c.json(res.success, 200);
};

// ── Exam CRUD ─────────────────────────────────────────────────────────────────

export const createExam = async (c: Context) => {
  const user = c.get("user") as IUser;
  const body = await c.req.json();
  const res = await examService.createExam(body, (user as any)._id.toString());
  if (res.error) return badRequestError(c, res.error);
  if (res.serverError) return serverError(c, res.serverError);
  return c.json(res.success, 201);
};

export const getExams = async (c: Context) => {
  const page = parseInt(c.req.query("page") as string, 10) || 1;
  const limit = parseInt(c.req.query("limit") as string, 10) || 10;
  const res = await examService.getExams({
    page,
    limit,
    academicYear: c.req.query("academicYear"),
    type: c.req.query("type"),
    status: c.req.query("status"),
    classId: c.req.query("classId"),
  });
  if (res.serverError) return serverError(c, res.serverError);
  return c.json(res.success, 200);
};

export const getExam = async (c: Context) => {
  const _id = c.req.param("_id");
  const res = await examService.getExam(_id);
  if (res.error) return badRequestError(c, res.error);
  if (res.serverError) return serverError(c, res.serverError);
  return c.json(res.success, 200);
};

export const updateExam = async (c: Context) => {
  const _id = c.req.param("_id");
  const body = await c.req.json();
  const res = await examService.updateExam(_id, body);
  if (res.error) return badRequestError(c, res.error);
  if (res.serverError) return serverError(c, res.serverError);
  return c.json(res.success, 200);
};

export const deleteExam = async (c: Context) => {
  const _id = c.req.param("_id");
  const res = await examService.deleteExam(_id);
  if (res.error) return badRequestError(c, res.error);
  if (res.serverError) return serverError(c, res.serverError);
  return c.json(res.success, 200);
};

export const publishResults = async (c: Context) => {
  const _id = c.req.param("_id");
  const res = await examService.publishResults(_id);
  if (res.error) return badRequestError(c, res.error);
  if (res.serverError) return serverError(c, res.serverError);
  return c.json(res.success, 200);
};

// ── Enrollments ───────────────────────────────────────────────────────────────

export const enrollClass = async (c: Context) => {
  const user = c.get("user") as IUser;
  const examId = c.req.param("_id");
  const classId = c.req.param("classId");
  const res = await enrollmentService.enrollClass(examId, classId, (user as any)._id.toString());
  if (res.error) return badRequestError(c, res.error);
  if (res.serverError) return serverError(c, res.serverError);
  return c.json(res.success, 200);
};

export const enrollStudent = async (c: Context) => {
  const user = c.get("user") as IUser;
  const examId = c.req.param("_id");
  const body = await c.req.json();
  const res = await enrollmentService.enrollStudent(examId, body, (user as any)._id.toString());
  if (res.error) return badRequestError(c, res.error);
  if (res.serverError) return serverError(c, res.serverError);
  return c.json(res.success, 201);
};

export const removeEnrollment = async (c: Context) => {
  const enrollmentId = c.req.param("enrollmentId");
  const res = await enrollmentService.removeEnrollment(enrollmentId);
  if (res.error) return badRequestError(c, res.error);
  if (res.serverError) return serverError(c, res.serverError);
  return c.json(res.success, 200);
};

export const getEnrollments = async (c: Context) => {
  const examId = c.req.param("_id");
  const page = parseInt(c.req.query("page") as string, 10) || 1;
  const limit = parseInt(c.req.query("limit") as string, 10) || 10;
  const res = await enrollmentService.getEnrollments(examId, {
    page,
    limit,
    classId: c.req.query("classId"),
    feeStatus: c.req.query("feeStatus"),
    search: c.req.query("search"),
  });
  if (res.error) return badRequestError(c, res.error);
  if (res.serverError) return serverError(c, res.serverError);
  return c.json(res.success, 200);
};

// ── Fees ──────────────────────────────────────────────────────────────────────

export const addPayment = async (c: Context) => {
  const user = c.get("user") as IUser;
  const enrollmentId = c.req.param("enrollmentId");
  const body = await c.req.json();
  const res = await enrollmentService.addPayment(enrollmentId, body, (user as any)._id.toString());
  if (res.error) return badRequestError(c, res.error);
  if (res.serverError) return serverError(c, res.serverError);
  return c.json(res.success, 201);
};

export const getFeesSummary = async (c: Context) => {
  const examId = c.req.param("_id");
  const res = await enrollmentService.getFeesSummary(examId);
  if (res.error) return badRequestError(c, res.error);
  if (res.serverError) return serverError(c, res.serverError);
  return c.json(res.success, 200);
};

export const getPaymentHistory = async (c: Context) => {
  const enrollmentId = c.req.param("enrollmentId");
  const res = await enrollmentService.getPaymentHistory(enrollmentId);
  if (res.error) return badRequestError(c, res.error);
  if (res.serverError) return serverError(c, res.serverError);
  return c.json(res.success, 200);
};

// ── Results ───────────────────────────────────────────────────────────────────

export const submitResultsBulk = async (c: Context) => {
  const user = c.get("user") as IUser;
  const examId = c.req.param("_id");
  const body = await c.req.json();
  const res = await resultService.submitResultsBulk(examId, body, (user as any)._id.toString());
  if (res.error) return badRequestError(c, res.error);
  if (res.serverError) return serverError(c, res.serverError);
  return c.json(res.success, 200);
};

export const updateResult = async (c: Context) => {
  const user = c.get("user") as IUser;
  const resultId = c.req.param("resultId");
  const body = await c.req.json();
  const res = await resultService.updateResult(resultId, body, (user as any)._id.toString());
  if (res.error) return badRequestError(c, res.error);
  if (res.serverError) return serverError(c, res.serverError);
  return c.json(res.success, 200);
};

export const getResults = async (c: Context) => {
  const user = c.get("user") as IUser;
  const examId = c.req.param("_id");
  const page = parseInt(c.req.query("page") as string, 10) || 1;
  const limit = parseInt(c.req.query("limit") as string, 10) || 20;
  const res = await resultService.getResults(
    examId,
    { page, limit, classId: c.req.query("classId") },
    { roles: (user as any).roles, _id: (user as any)._id.toString() },
  );
  if (res.error) return badRequestError(c, res.error);
  if (res.serverError) return serverError(c, res.serverError);
  return c.json(res.success, 200);
};

export const recalculatePositions = async (c: Context) => {
  const examId = c.req.param("_id");
  const classId = c.req.query("classId");
  const res = await resultService.recalculatePositions(examId, classId);
  if (res.error) return badRequestError(c, res.error);
  if (res.serverError) return serverError(c, res.serverError);
  return c.json(res.success, 200);
};

// ── Guardian-facing ───────────────────────────────────────────────────────────

export const getStudentResults = async (c: Context) => {
  const user = c.get("user") as IUser;
  const studentId = c.req.param("studentId");
  const res = await resultService.getStudentResults(
    studentId,
    (user as any)._id.toString(),
    (user as any).roles,
  );
  if (res.error) return badRequestError(c, res.error);
  if (res.serverError) return serverError(c, res.serverError);
  return c.json(res.success, 200);
};

export const getStudentFees = async (c: Context) => {
  const user = c.get("user") as IUser;
  const studentId = c.req.param("studentId");
  const res = await resultService.getStudentFees(
    studentId,
    (user as any)._id.toString(),
    (user as any).roles,
  );
  if (res.error) return badRequestError(c, res.error);
  if (res.serverError) return serverError(c, res.serverError);
  return c.json(res.success, 200);
};
