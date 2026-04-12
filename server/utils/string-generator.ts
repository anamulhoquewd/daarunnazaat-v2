import { Expense } from "../models/expences.model";
import { FeeCollection } from "../models/feeCollections.model";
import { Guardian } from "../models/guardians.model";
import { Salary } from "../models/salaryPayments.model";
import { Staff } from "../models/staffs.model";
import { Student } from "../models/students.model";

/**
 * Generate String for user password
 * Format: asS4LseI
 * Example: asS4LseI
 */
export function stringGenerator(strLength: number) {
  // Ensure the length is a valid number
  const length = typeof strLength === "number" && strLength > 0 ? strLength : 0;
  // If the length is valid, proceed to generate the ID
  if (length) {
    const possibleCharacters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const possibleCharactersLength = possibleCharacters.length;
    let output = "";
    for (let i = 0; i < length; i++) {
      const generateToken = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharactersLength),
      );
      output += generateToken;
    }
    return output;
  } else {
    throw new Error(
      "Invalid string length provided. Must be a positive number.",
    );
  }
}

/**
 * Generate Receipt Number for Fee Collection
 * Format: FEE-YYYY-NNN
 * Example: FEE-2024-001
 */
export async function generateFeeReceiptNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `FEE-${year}-`;

  const result = await FeeCollection.aggregate([
    { $match: { receiptNumber: { $regex: `^${prefix}` } } },
    {
      $addFields: {
        numericPart: {
          $toInt: { $arrayElemAt: [{ $split: ["$receiptNumber", "-"] }, 2] },
        },
      },
    },
    { $sort: { numericPart: -1 } },
    { $limit: 1 },
  ]);

  const lastNumber = result.length > 0 ? result[0].numericPart : 0;
  return `${prefix}${(lastNumber + 1).toString().padStart(3, "0")}`;
}

/**
 * Generate Voucher Number for Expense
 * Format: EXP-YYYY-NNN
 * Example: EXP-2024-001
 */
export async function generateVoucherNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `EXP-${year}-`;

  const result = await Expense.aggregate([
    { $match: { voucherNumber: { $regex: `^${prefix}` } } },
    {
      $addFields: {
        numericPart: {
          $toInt: { $arrayElemAt: [{ $split: ["$voucherNumber", "-"] }, 2] },
        },
      },
    },
    { $sort: { numericPart: -1 } },
    { $limit: 1 },
  ]);

  const lastNumber = result.length > 0 ? result[0].numericPart : 0;
  return `${prefix}${(lastNumber + 1).toString().padStart(3, "0")}`;
}

/**
 * Generate Salary Receipt Number
 * Format: SAL-YYYY-NNN
 * Example: SAL-2024-001
 */
export async function generateSalaryReceiptNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `SAL-${year}-`;

  const result = await Salary.aggregate([
    { $match: { receiptNumber: { $regex: `^${prefix}` } } },
    {
      $addFields: {
        numericPart: {
          $toInt: { $arrayElemAt: [{ $split: ["$receiptNumber", "-"] }, 2] },
        },
      },
    },
    { $sort: { numericPart: -1 } },
    { $limit: 1 },
  ]);

  const lastNumber = result.length > 0 ? result[0].numericPart : 0;
  return `${prefix}${(lastNumber + 1).toString().padStart(3, "0")}`;
}

/**
 * Generate Student ID
 * Format: STU-YYYY-NNN
 * Example: STU-2024-001
 */
export async function generateStudentId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `STU-${year}-`;

  const result = await Student.aggregate([
    { $match: { studentId: { $regex: `^${prefix}` } } },
    {
      $addFields: {
        numericPart: {
          $toInt: { $arrayElemAt: [{ $split: ["$studentId", "-"] }, 2] },
        },
      },
    },
    { $sort: { numericPart: -1 } },
    { $limit: 1 },
  ]);

  const lastNumber = result.length > 0 ? result[0].numericPart : 0;
  return `${prefix}${(lastNumber + 1).toString().padStart(3, "0")}`;
}

/**
 * Generate Guardian ID
 * Format: GRD-NNN
 * Example: GRD-001
 */
export async function generateGuardianId(): Promise<string> {
  const prefix = `GRD-`;

  const result = await Guardian.aggregate([
    { $match: { guardianId: { $regex: `^${prefix}` } } },
    {
      $addFields: {
        numericPart: {
          $toInt: { $arrayElemAt: [{ $split: ["$guardianId", "-"] }, 1] },
        },
      },
    },
    { $sort: { numericPart: -1 } },
    { $limit: 1 },
  ]);

  const lastNumber = result.length > 0 ? result[0].numericPart : 0;
  return `${prefix}${(lastNumber + 1).toString().padStart(3, "0")}`;
}

/**
 * Generate Staff ID
 * Format: STF-NNN
 * Example: STF-001
 */
export async function generateStaffId(): Promise<string> {
  const prefix = `STF-`;

  const result = await Staff.aggregate([
    { $match: { staffId: { $regex: `^${prefix}` } } },
    {
      $addFields: {
        numericPart: {
          $toInt: { $arrayElemAt: [{ $split: ["$staffId", "-"] }, 1] },
        },
      },
    },
    { $sort: { numericPart: -1 } },
    { $limit: 1 },
  ]);

  const lastNumber = result.length > 0 ? result[0].numericPart : 0;
  return `${prefix}${(lastNumber + 1).toString().padStart(3, "0")}`;
}
