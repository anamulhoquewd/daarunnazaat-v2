import { Context } from "hono";
import { badRequestError, serverError } from "../error";
import { Student } from "../models/students.model";
import { exportCollection } from "../services/export.service";
import { PipelineStage } from "mongoose";
import { generatePDFService } from "../services";

export const exportStudents = async (c: Context) => {
  
/* =========================
LOOKUPS
========================= */
const pipeline: PipelineStage[] = [];

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

// ← এই stage যোগ করো — nested fields flatten করবে
pipeline.push({
  $project: {
    studentId: 1,
    fullName: 1,
    branch: 1,
    batch: 1,
    dateOfBirth: 1,
    className: "$class.className",
    guardianPhone: "$guardian.user.phone",
    guardianEmail: "$guardian.user.email",
  },
});

const response = await exportCollection(
  Student,
  { isActive: true, isDeleted: false, isBlocked: false },
  {}, // ← খালি রাখো, উপরে pipeline এই projection হয়ে গেছে
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
    
    /* =========================
    LOOKUPS
    ========================= */
    const pipeline: PipelineStage[] = [];
    
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
    
    // ← এই stage যোগ করো — nested fields flatten করবে
    pipeline.push({
      $project: {
        studentId: 1,
        fullName: 1,
        branch: 1,
        batch: 1,
        dateOfBirth: 1,
        className: "$class.className",
        guardianPhone: "$guardian.user.phone",
        guardianEmail: "$guardian.user.email",
      },
    });
  const response = await generatePDFService.generateTablePDF(
    Student,
    {},
    pipeline, // তোমার আগের pipeline
    {
      title: "ছাত্র তালিকা",
      madrasaName: "দারুননাজাত সিদ্দিকীয়া কামিল মাদ্রাসা",
      madrasaAddress: "ডেমরা, ঢাকা-১৩৬১",
      columns: [
        { key: "studentId", label: "ছাত্র আইডি" },
        { key: "fullName", label: "পূর্ণ নাম" },
        { key: "className", label: "শ্রেণী" },
        { key: "branch", label: "শাখা" },
        { key: "guardianPhone", label: "অভিভাবক ফোন" },
      ],
    }
  );

  if (response.error) return badRequestError(c, response.error);
  if (response.serverError) return serverError(c, response.serverError);

  // PDF binary response
  c.header("Content-Type", "application/pdf");
  c.header("Content-Disposition", `attachment; filename="students.pdf"`);
  return c.body(response.success!.pdf);
};