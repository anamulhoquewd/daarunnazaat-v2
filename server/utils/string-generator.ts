import { Expense } from "../models/expences.model";
import { FeeCollection } from "../models/feeCollections.model";
import { Guardian } from "../models/guardians.model";
import { SalaryPayment } from "../models/salaryPayments.model";
import { Staff } from "../models/staffs.model";
import { Student } from "../models/students.model";

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
        Math.floor(Math.random() * possibleCharactersLength)
      );
      output += generateToken;
    }
    return output;
  } else {
    throw new Error(
      "Invalid string length provided. Must be a positive number."
    );
  }
}

// utils/numberGenerator.ts

/**
 * Generate Receipt Number for Fee Collection
 * Format: FEE-YYYY-NNNNNN
 * Example: FEE-2024-000001, FEE-2024-000002
 */
export async function generateReceiptNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `FEE-${year}-`;

  // Find last receipt number for current year
  const lastReceipt = await FeeCollection.findOne({
    receiptNumber: { $regex: `^${prefix}` },
  }).sort({ receiptNumber: -1 });

  let nextNumber = 1;

  if (lastReceipt) {
    // Extract number from last receipt (FEE-2024-000001 -> 000001)
    const lastNumber = parseInt(lastReceipt.receiptNumber.split("-")[2]);
    nextNumber = lastNumber + 1;
  }

  // Pad with zeros (6 digits)
  const paddedNumber = nextNumber.toString().padStart(6, "0");

  return `${prefix}${paddedNumber}`;
}

/**
 * Generate Voucher Number for Expense
 * Format: EXP-YYYY-NNNNNN
 * Example: EXP-2024-000001, EXP-2024-000002
 */
export async function generateVoucherNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `EXP-${year}-`;

  const lastVoucher = await Expense.findOne({
    voucherNumber: { $regex: `^${prefix}` },
  }).sort({ voucherNumber: -1 });

  let nextNumber = 1;

  if (lastVoucher) {
    const lastNumber = parseInt(lastVoucher.voucherNumber.split("-")[2]);
    nextNumber = lastNumber + 1;
  }

  const paddedNumber = nextNumber.toString().padStart(6, "0");

  return `${prefix}${paddedNumber}`;
}

/**
 * Generate Salary Receipt Number
 * Format: SAL-YYYY-NNNNNN
 * Example: SAL-2024-000001
 */
export async function generateSalaryReceiptNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `SAL-${year}-`;

  const lastReceipt = await SalaryPayment.findOne({
    receiptNumber: { $regex: `^${prefix}` },
  }).sort({ receiptNumber: -1 });

  let nextNumber = 1;

  if (lastReceipt) {
    const lastNumber = parseInt(lastReceipt.receiptNumber.split("-")[2]);
    nextNumber = lastNumber + 1;
  }

  const paddedNumber = nextNumber.toString().padStart(6, "0");

  return `${prefix}${paddedNumber}`;
}

/**
 * Generate Student ID
 * Format: STU-YYYY-NNNN
 * Example: STU-2024-0001
 */
export async function generateStudentId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `STU-${year}-`;

  const lastStudent = await Student.findOne({
    studentId: { $regex: `^${prefix}` },
  }).sort({ studentId: -1 });

  let nextNumber = 1;

  if (lastStudent) {
    const lastNumber = parseInt(lastStudent.studentId.split("-")[2]);
    nextNumber = lastNumber + 1;
  }

  const paddedNumber = nextNumber.toString().padStart(4, "0");

  return `${prefix}${paddedNumber}`;
}

/**
 * Generate Guardian ID
 * Format: GRD-YYYY-NNNN
 * Example: GRD-2024-0001
 */
export async function generateGuardianId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `GRD-${year}-`;

  const lastGuardian = await Guardian.findOne({
    guardianId: { $regex: `^${prefix}` },
  }).sort({ guardianId: -1 });

  let nextNumber = 1;

  if (lastGuardian) {
    const lastNumber = parseInt(lastGuardian.guardianId.split("-")[2]);
    nextNumber = lastNumber + 1;
  }

  const paddedNumber = nextNumber.toString().padStart(4, "0");

  return `${prefix}${paddedNumber}`;
}

/**
 * Generate Staff ID
 * Format: STF-YYYY-NNNN
 * Example: STF-2024-0001
 */
export async function generateStaffId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `STF-${year}-`;

  const lastStaff = await Staff.findOne({
    staffId: { $regex: `^${prefix}` },
  }).sort({ staffId: -1 });

  let nextNumber = 1;

  if (lastStaff) {
    const lastNumber = parseInt(lastStaff.staffId.split("-")[2]);
    nextNumber = lastNumber + 1;
  }

  const paddedNumber = nextNumber.toString().padStart(4, "0");

  return `${prefix}${paddedNumber}`;
}
