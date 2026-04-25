import { BatchType, Branch, Gender } from "@/validations";
import { Context } from "hono";
import mongoose, { PipelineStage } from "mongoose";
import { badRequestError, serverError } from "../error";
import { Student } from "../models/students.model";
import { generatePDFService } from "../services";
import { exportCollection } from "../services/export.service";

export const exportStudentsSheet = async (c: Context) => {
   // queries
  const sortBy = c.req.query("sortBy") || "createdAt";
  const sortType = c.req.query("sortType") || "desc";
  const search = c.req.query("search") as string;
  const classId = c.req.query("classId") as string;
  const branch = c.req.query("branch") as Branch;
  const gender = c.req.query("gender") as Gender;
  const isResidentialRaw = c.req.query("isResidential") as string;
  const guardianId = c.req.query("guardianId") as string;
  const batchType = c.req.query("batchType") as BatchType;
  const sessionId = c.req.query("currentSessionId") as string;
  const fromDate = c.req.query("fromDate") as string;
  const toDate = c.req.query("toDate") as string;

  let isResidential: boolean | undefined = undefined;
  if (isResidentialRaw === "true") isResidential = true;
  if (isResidentialRaw === "false") isResidential = false;

  const pipeline: PipelineStage[] = [];

  
  /* =========================
     MATCH (FILTERS)
  ========================= */

  const matchStage: any = {
    isActive: true,
    isDeleted: false,
    isBlocked: false,
  };

  if (classId) matchStage.classId = new mongoose.Types.ObjectId(classId);
  if (branch) matchStage.branch = branch;
  if (sessionId)
    matchStage.currentSessionId = new mongoose.Types.ObjectId(sessionId);
  if (guardianId)
    matchStage.guardianId = new mongoose.Types.ObjectId(guardianId);
  if (batchType) matchStage.batchType = batchType;
  if (gender) matchStage.gender = gender;
  if (typeof isResidential === "boolean")
    matchStage.isResidential = isResidential;

  if (fromDate && toDate) {
    matchStage.admissionDate = {
      $gte: new Date(fromDate),
      $lte: new Date(toDate),
    };
  }

  if (search) {
    matchStage.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { studentId: { $regex: search, $options: "i" } },
      { nid: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  pipeline.push({ $match: matchStage });

  /* =========================
     SORT
  ========================= */

  const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "fullName",
    "studentId",
    "admissionDate",
  ];
  const finalSortField = allowedSortFields.includes(sortBy)
    ? sortBy
    : "createdAt";
  const sortDirection = sortType?.toLowerCase() === "asc" ? 1 : -1;

  pipeline.push({ $sort: { [finalSortField]: sortDirection } });

  // class
  pipeline.push({
    $lookup: {
      from: "classes",
      localField: "classId",
      foreignField: "_id",
      as: "class",
    },
  });

  pipeline.push({
    $unwind: { path: "$class", preserveNullAndEmptyArrays: true },
  });

  // guardian
  pipeline.push({
    $lookup: {
      from: "guardians",
      let: { guardianId: "$guardianId" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$guardianId"] },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true,
          },
        },
      ],
      as: "guardian",
    },
  });

  pipeline.push({
    $unwind: {
      path: "$guardian",
      preserveNullAndEmptyArrays: true,
    },
  });

  pipeline.push({
  $project: {
    _id: 0,
    studentId: 1,
    fullName: 1,
    fatherName: 1,
    dateOfBirth: 1,
    bloodGroup: { $ifNull: ["$bloodGroup", "_"] }, // ← if null "_"
    className: "$class.className",
    guardianPhone: "$guardian.user.phone",
  },
});

  const response = await exportCollection(
    Student,
    { isActive: true, isDeleted: false, isBlocked: false },
    {}, // projection
    "Students",
    pipeline,
  );

  if (response.error) {
    return badRequestError(c, response.error);
  }

  if (response.serverError) {
    return serverError(c, response.serverError);
  }

  return c.json(response.success, 200);
};

export const exportStudentsPDF = async (c: Context) => {
  // queries
  const sortBy = c.req.query("sortBy") || "createdAt";
  const sortType = c.req.query("sortType") || "desc";
  const search = c.req.query("search") as string;
  const classId = c.req.query("classId") as string;
  const branch = c.req.query("branch") as Branch;
  const gender = c.req.query("gender") as Gender;
  const isResidentialRaw = c.req.query("isResidential") as string;
  const guardianId = c.req.query("guardianId") as string;
  const batchType = c.req.query("batchType") as BatchType;
  const sessionId = c.req.query("currentSessionId") as string;
  const fromDate = c.req.query("fromDate") as string;
  const toDate = c.req.query("toDate") as string;

  let isResidential: boolean | undefined = undefined;
  if (isResidentialRaw === "true") isResidential = true;
  if (isResidentialRaw === "false") isResidential = false;

  const pipeline: PipelineStage[] = [];

  /* =========================
     MATCH (FILTERS)
  ========================= */

  const matchStage: any = {
    isActive: true,
    isDeleted: false,
    isBlocked: false,
  };

  if (classId) matchStage.classId = new mongoose.Types.ObjectId(classId);
  if (branch) matchStage.branch = branch;
  if (sessionId)
    matchStage.currentSessionId = new mongoose.Types.ObjectId(sessionId);
  if (guardianId)
    matchStage.guardianId = new mongoose.Types.ObjectId(guardianId);
  if (batchType) matchStage.batchType = batchType;
  if (gender) matchStage.gender = gender;
  if (typeof isResidential === "boolean")
    matchStage.isResidential = isResidential;

  if (fromDate && toDate) {
    matchStage.admissionDate = {
      $gte: new Date(fromDate),
      $lte: new Date(toDate),
    };
  }

  if (search) {
    matchStage.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { studentId: { $regex: search, $options: "i" } },
      { nid: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  pipeline.push({ $match: matchStage });

  /* =========================
     SORT
  ========================= */

  const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "fullName",
    "studentId",
    "admissionDate",
  ];
  const finalSortField = allowedSortFields.includes(sortBy)
    ? sortBy
    : "createdAt";
  const sortDirection = sortType?.toLowerCase() === "asc" ? 1 : -1;

  pipeline.push({ $sort: { [finalSortField]: sortDirection } });

  /* =========================
     LOOKUPS
  ========================= */

  pipeline.push({
    $lookup: {
      from: "classes",
      localField: "classId",
      foreignField: "_id",
      as: "class",
    },
  });

  pipeline.push({
    $unwind: { path: "$class", preserveNullAndEmptyArrays: true },
  });

  pipeline.push({
    $lookup: {
      from: "guardians",
      let: { guardianId: "$guardianId" },
      pipeline: [
        { $match: { $expr: { $eq: ["$_id", "$$guardianId"] } } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      ],
      as: "guardian",
    },
  });

  pipeline.push({
    $unwind: { path: "$guardian", preserveNullAndEmptyArrays: true },
  });

  /* =========================
     PROJECT (flatten nested)
  ========================= */

  pipeline.push({
    $project: {
      _id: 0,
      studentId: 1,
      fullName: 1,
      fatherName: 1,
      dateOfBirth: 1,
      branch: 1,
      batch: 1,
      bloodGroup: 1,
      className: "$class.className",
      guardianPhone: "$guardian.user.phone",
      guardianEmail: "$guardian.user.email",
    },
  });

  const response = await generatePDFService.generateTablePDF(
    Student,
    {}, // filter already applied in pipeline
    pipeline,
    {
      title: "ছাত্র/ছাত্রী তালিকা",
      madrasaName: "দারুন নাজাত আদর্শ বালিকা মাদরাসা",
      madrasaAddress: "কাওলার, জমিদার বাড়ী, দক্ষিণখান, ঢাকা-১২২৯",
      columns: [
        { key: "studentId", label: "ছাত্র আইডি" },
        { key: "fullName", label: "পূর্ণ নাম" },
        { key: "fatherName", label: "পিতার নাম" },
        { key: "dateOfBirth", label: "জন্ম তারিখ" },
        { key: "bloodGroup", label: "রক্তের গ্রুপ" },
        { key: "className", label: "শ্রেণী" },
        { key: "guardianPhone", label: "অভিভাবক ফোন" },
      ],
    },
  );

  if (response.error) return badRequestError(c, response.error);
  if (response.serverError) return serverError(c, response.serverError);

  c.header("Content-Type", "application/pdf");
  c.header("Content-Disposition", `attachment; filename="students.pdf"`);
  return c.body(new Uint8Array(response.success!.pdf));
};
