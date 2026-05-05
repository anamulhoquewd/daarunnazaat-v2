import mongoose from "mongoose";
import { SalaryV5 } from "./schema";
import { Staff } from "@/server/models/staffs.model";
import { nextNumber } from "@/modules/shared/numbering/service";
import { schemaValidationError } from "@/server/error/index";
import {
  createSalaryZ,
  payoutSalaryZ,
  bulkGenerateZ,
  listSalariesQueryZ,
  type ICreateSalary,
  type IPayoutSalary,
} from "./validation";
import { Branch } from "@/validations";

function computeNet(baseSalary: number, bonus: number, deduction: number): number {
  return Math.max(0, baseSalary + bonus - deduction);
}

export const createSalary = async ({
  body,
  userId,
}: {
  body: ICreateSalary;
  userId: string;
}) => {
  const parsed = createSalaryZ.safeParse(body);
  if (!parsed.success) {
    return { error: schemaValidationError(parsed.error, "Invalid salary data") };
  }
  const data = parsed.data;

  try {
    const staff = await Staff.findById(data.staffId);
    if (!staff || !staff.isActive) {
      return { error: { message: "Staff not found or inactive" } };
    }

    const exists = await SalaryV5.findOne({
      staffId: data.staffId,
      periodYear: data.periodYear,
      periodMonth: data.periodMonth,
      branch: data.branch,
      isDeleted: false,
    });
    if (exists) {
      return { error: { message: "Salary record already exists for this staff and period" } };
    }

    const netSalary = computeNet(data.baseSalary, data.bonus, data.deduction);

    const salary = await SalaryV5.create({
      receiptNumber: null,
      staffId: data.staffId,
      branch: data.branch,
      periodYear: data.periodYear,
      periodMonth: data.periodMonth,
      baseSalary: data.baseSalary,
      bonus: data.bonus,
      deduction: data.deduction,
      netSalary,
      status: "pending",
      paymentDate: null,
      paymentMethod: null,
      paidBy: null,
      notes: data.notes,
      createdBy: new mongoose.Types.ObjectId(userId),
      updatedBy: new mongoose.Types.ObjectId(userId),
    });

    return { success: salary };
  } catch (error: any) {
    if (error.code === 11000) {
      return { error: { message: "Salary record already exists for this staff and period" } };
    }
    return { serverError: { message: error.message } };
  }
};

export const payoutSalary = async ({
  salaryId,
  body,
  userId,
}: {
  salaryId: string;
  body: IPayoutSalary;
  userId: string;
}) => {
  const parsed = payoutSalaryZ.safeParse(body);
  if (!parsed.success) {
    return { error: schemaValidationError(parsed.error, "Invalid payout data") };
  }
  const data = parsed.data;

  try {
    const salary = await SalaryV5.findById(salaryId);
    if (!salary || salary.isDeleted) {
      return { error: { message: "Salary record not found" } };
    }
    if (salary.status === "paid") {
      return { error: { message: "Salary has already been paid out" } };
    }

    const newBonus = data.bonus ?? salary.bonus;
    const newDeduction = data.deduction ?? salary.deduction;
    const netSalary = computeNet(salary.baseSalary, newBonus, newDeduction);

    const receiptNumber = await nextNumber("DN-SAL");

    const updated = await SalaryV5.findByIdAndUpdate(
      salaryId,
      {
        $set: {
          receiptNumber,
          bonus: newBonus,
          deduction: newDeduction,
          netSalary,
          status: "paid",
          paymentDate: data.paymentDate ?? new Date(),
          paymentMethod: data.paymentMethod,
          paidBy: new mongoose.Types.ObjectId(userId),
          notes: data.notes ?? salary.notes,
          updatedBy: new mongoose.Types.ObjectId(userId),
        },
      },
      { new: true },
    );

    return { success: updated };
  } catch (error: any) {
    return { serverError: { message: error.message } };
  }
};

export const bulkGenerateSalaries = async ({
  body,
  userId,
}: {
  body: { periodYear: number; periodMonth: number; branch?: string };
  userId: string;
}) => {
  const parsed = bulkGenerateZ.safeParse(body);
  if (!parsed.success) {
    return { error: schemaValidationError(parsed.error, "Invalid parameters") };
  }
  const { periodYear, periodMonth, branch } = parsed.data;

  try {
    const filter: any = { isActive: true };
    if (branch) filter.branch = { $in: [branch] };

    const staffList = await Staff.find(filter).lean();
    if (staffList.length === 0) {
      return { error: { message: "No active staff found" } };
    }

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const staff of staffList) {
      const staffBranches: string[] = Array.isArray(staff.branch)
        ? staff.branch
        : [staff.branch as string];

      const targetBranches = branch
        ? staffBranches.filter((b) => b === branch)
        : staffBranches;

      for (const b of targetBranches) {
        const exists = await SalaryV5.findOne({
          staffId: staff._id,
          periodYear,
          periodMonth,
          branch: b,
          isDeleted: false,
        });

        if (exists) {
          skipped++;
          continue;
        }

        if ((staff.baseSalary ?? 0) === 0) {
          errors.push(`${staff.fullName} (${staff.staffId}): baseSalary is 0, skipped`);
          skipped++;
          continue;
        }

        try {
          await SalaryV5.create({
            receiptNumber: null,
            staffId: staff._id,
            branch: b as Branch,
            periodYear,
            periodMonth,
            baseSalary: staff.baseSalary,
            bonus: 0,
            deduction: 0,
            netSalary: staff.baseSalary,
            status: "pending",
            paymentDate: null,
            paymentMethod: null,
            paidBy: null,
            createdBy: new mongoose.Types.ObjectId(userId),
            updatedBy: new mongoose.Types.ObjectId(userId),
          });
          created++;
        } catch (err: any) {
          if (err.code === 11000) {
            skipped++;
          } else {
            errors.push(`${staff.fullName}: ${err.message}`);
          }
        }
      }
    }

    return {
      success: {
        created,
        skipped,
        errors: errors.length > 0 ? errors : undefined,
        message: `Generated ${created} salary records, skipped ${skipped} existing`,
      },
    };
  } catch (error: any) {
    return { serverError: { message: error.message } };
  }
};

export const listSalaries = async (rawQuery: Record<string, unknown>) => {
  const parsed = listSalariesQueryZ.safeParse(rawQuery);
  if (!parsed.success) {
    return { error: schemaValidationError(parsed.error, "Invalid query") };
  }
  const q = parsed.data;

  try {
    const filter: any = { isDeleted: false };
    if (q.staffId) filter.staffId = q.staffId;
    if (q.branch) filter.branch = q.branch;
    if (q.status) filter.status = q.status;
    if (q.periodYear) filter.periodYear = q.periodYear;
    if (q.periodMonth) filter.periodMonth = q.periodMonth;

    const skip = (q.page - 1) * q.limit;
    const [data, total] = await Promise.all([
      SalaryV5.find(filter)
        .populate("staffId", "fullName staffId designation branch")
        .populate("paidBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(q.limit)
        .lean(),
      SalaryV5.countDocuments(filter),
    ]);

    return {
      success: {
        data,
        page: q.page,
        limit: q.limit,
        total,
        totalPages: Math.ceil(total / q.limit),
      },
    };
  } catch (error: any) {
    return { serverError: { message: error.message } };
  }
};

export const getSalary = async (id: string) => {
  try {
    const doc = await SalaryV5.findById(id)
      .populate("staffId", "fullName staffId designation branch baseSalary")
      .populate("paidBy", "name email")
      .lean();
    if (!doc || (doc as any).isDeleted) {
      return { error: { message: "Salary record not found" } };
    }
    return { success: doc };
  } catch (error: any) {
    return { serverError: { message: error.message } };
  }
};
