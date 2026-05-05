/**
 * Step 07 — Post-migration integrity verification
 *
 * Checks:
 *   [A] All sessions have cycleType, name, monthCount
 *   [B] No student doc has stale v4 fields (feeBalance, sessionHistory, batchType)
 *   [C] Every active student has at least one Enrollment
 *   [D] Every Invoice has at least one line item
 *   [E] Payment.totalPaid >= sum(allocations.allocatedAmount) for each payment
 *   [F] Student.creditBalance matches sum of their Payment.unallocatedAmount
 *
 * Exits with code 1 if any check fails.
 */
import mongoose from "mongoose";
import * as L from "./utils/log";

const STEP = "07-verify";

interface CheckResult {
  name: string;
  passed: boolean;
  details?: string;
}

async function checkSessions(db: mongoose.mongo.Db): Promise<CheckResult> {
  const col = db.collection("sessions");
  const missing = await col.countDocuments({
    isDeleted: { $ne: true },
    $or: [
      { cycleType: { $exists: false } },
      { name: { $exists: false } },
      { monthCount: { $exists: false } },
    ],
  });
  return {
    name: "[A] Sessions — all have cycleType, name, monthCount",
    passed: missing === 0,
    details: missing > 0 ? `${missing} sessions missing v5 fields` : undefined,
  };
}

async function checkStudentStaleFields(db: mongoose.mongo.Db): Promise<CheckResult> {
  const col = db.collection("students");
  const count = await col.countDocuments({
    isDeleted: { $ne: true },
    $or: [
      { feeBalance: { $exists: true } },
      { sessionHistory: { $exists: true } },
      { batchType: { $exists: true } },
    ],
  });
  return {
    name: "[B] Students — no stale v4 fields",
    passed: count === 0,
    details: count > 0 ? `${count} students still have stale fields` : undefined,
  };
}

async function checkStudentEnrollments(db: mongoose.mongo.Db): Promise<CheckResult> {
  const students = db.collection("students");
  const enrollments = db.collection("enrollments");

  const activeStudents = await students
    .find({ isDeleted: { $ne: true }, isActive: true }, { projection: { _id: 1 } })
    .toArray();

  let missing = 0;
  for (const s of activeStudents) {
    const count = await enrollments.countDocuments({
      studentId: s._id,
      isDeleted: { $ne: true },
    });
    if (count === 0) missing++;
  }

  return {
    name: "[C] Enrollments — every active student has at least one",
    passed: missing === 0,
    details: missing > 0 ? `${missing} active students have no enrollment` : undefined,
  };
}

async function checkInvoiceLineItems(db: mongoose.mongo.Db): Promise<CheckResult> {
  const col = db.collection("invoices");
  const empty = await col.countDocuments({
    isDeleted: { $ne: true },
    $or: [{ lineItems: { $size: 0 } }, { lineItems: { $exists: false } }],
  });
  return {
    name: "[D] Invoices — all have at least one line item",
    passed: empty === 0,
    details: empty > 0 ? `${empty} invoices have no line items` : undefined,
  };
}

async function checkPaymentAllocations(db: mongoose.mongo.Db): Promise<CheckResult> {
  const payments = await db
    .collection("payments")
    .find({ isDeleted: { $ne: true } }, { projection: { totalPaid: 1, allocations: 1, unallocatedAmount: 1 } })
    .toArray();

  let invalid = 0;
  for (const p of payments) {
    const allocSum = (p.allocations ?? []).reduce(
      (s: number, a: any) => s + (a.allocatedAmount ?? 0),
      0,
    );
    const expected = allocSum + (p.unallocatedAmount ?? 0);
    // Allow ±1 paisa rounding tolerance
    if (Math.abs(expected - p.totalPaid) > 1) invalid++;
  }

  return {
    name: "[E] Payments — totalPaid = allocations + unallocatedAmount",
    passed: invalid === 0,
    details: invalid > 0 ? `${invalid} payments have mismatched totals` : undefined,
  };
}

async function checkCreditBalances(db: mongoose.mongo.Db): Promise<CheckResult> {
  const agg = await db
    .collection("payments")
    .aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: "$studentId", total: { $sum: "$unallocatedAmount" } } },
    ])
    .toArray();

  const students = db.collection("students");
  let mismatches = 0;

  for (const row of agg) {
    const student = await students.findOne(
      { _id: row._id, isDeleted: { $ne: true } },
      { projection: { creditBalance: 1 } },
    );
    if (!student) continue;
    const stored = student.creditBalance ?? 0;
    if (Math.abs(stored - row.total) > 1) mismatches++;
  }

  return {
    name: "[F] Student.creditBalance matches Payment.unallocatedAmount sum",
    passed: mismatches === 0,
    details: mismatches > 0 ? `${mismatches} students have mismatched creditBalance` : undefined,
  };
}

export async function runVerification(): Promise<void> {
  L.log(STEP, "start");

  const db = mongoose.connection.db!;

  const checks = await Promise.all([
    checkSessions(db),
    checkStudentStaleFields(db),
    checkStudentEnrollments(db),
    checkInvoiceLineItems(db),
    checkPaymentAllocations(db),
    checkCreditBalances(db),
  ]);

  let allPassed = true;

  for (const check of checks) {
    const icon = check.passed ? "\x1b[32m✔\x1b[0m" : "\x1b[31m✘\x1b[0m";
    console.log(`  ${icon}  ${check.name}`);
    if (check.details) {
      console.log(`       \x1b[33m→ ${check.details}\x1b[0m`);
    }
    if (!check.passed) allPassed = false;
  }

  if (!allPassed) {
    L.log(STEP, "FAILED — one or more verification checks did not pass");
    console.error("\n\x1b[31mMigration verification FAILED. Review the issues above before going live.\x1b[0m\n");
    process.exit(1);
  }

  L.log(STEP, "all checks passed");
  console.log("\n\x1b[32mAll verification checks passed.\x1b[0m\n");
}
