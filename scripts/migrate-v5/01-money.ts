/**
 * Step 01 — Convert money fields from taka (Number) to paisa (integer × 100)
 *
 * Affected collections:
 *   students     — admissionFee, monthlyFee, residentialFee?, mealFee?,
 *                  coachingFee?, daycareFee?
 *   feecollections — baseAmount, payableAmount, receivedAmount, dueAmount, advanceAmount
 *
 * Idempotent: tracks processed doc IDs in _v5_migration_log (step "01-money-students",
 *             "01-money-fees").
 */
import mongoose from "mongoose";
import * as L from "./utils/log";
import { isDone, markDone } from "./utils/migration-log";

const STEP_STU = "01-money-students";
const STEP_FEE = "01-money-fees";

// Money fields on Student that must be converted × 100
const STUDENT_MONEY_FIELDS = [
  "admissionFee",
  "receivedAmount", // old admission received-at-time-of-admission
  "monthlyFee",
  "residentialFee",
  "mealFee",
  "coachingFee",
  "daycareFee",
] as const;

function paisaOf(taka: unknown): number {
  if (typeof taka !== "number" || isNaN(taka)) return 0;
  return Math.round(taka * 100);
}

function buildStudentUpdate(doc: any): Record<string, number> {
  const update: Record<string, number> = {};
  for (const field of STUDENT_MONEY_FIELDS) {
    if (doc[field] != null) {
      update[field] = paisaOf(doc[field]);
    }
  }
  return update;
}

export async function migrateMoneyFields(dryRun: boolean): Promise<void> {
  L.log(STEP_STU, "start");

  const students = mongoose.connection.db!.collection("students");
  const cursor = students.find({ isDeleted: { $ne: true } });

  let processed = 0;
  let skipped = 0;

  for await (const doc of cursor) {
    const id = doc._id.toString();

    if (await isDone(STEP_STU, id)) {
      skipped++;
      continue;
    }

    const $set = buildStudentUpdate(doc);

    if (Object.keys($set).length === 0) {
      await markDone({ step: STEP_STU, v4Id: id, dryRun });
      skipped++;
      continue;
    }

    L.log(STEP_STU, "convert", id, $set);

    if (!dryRun) {
      await students.updateOne({ _id: doc._id }, { $set });
      await markDone({ step: STEP_STU, v4Id: id, dryRun: false });
    } else {
      await markDone({ step: STEP_STU, v4Id: id, dryRun: true });
    }
    processed++;
  }

  L.log(STEP_STU, `done — converted ${processed}, skipped ${skipped}`);

  // ── FeeCollection ──────────────────────────────────────────────────────────
  L.log(STEP_FEE, "start");

  const fees = mongoose.connection.db!.collection("feecollections");
  const feeCursor = fees.find({ isDeleted: { $ne: true } });

  let fProcessed = 0;
  let fSkipped = 0;

  for await (const doc of feeCursor) {
    const id = doc._id.toString();

    if (await isDone(STEP_FEE, id)) {
      fSkipped++;
      continue;
    }

    const $set: Record<string, number> = {};
    for (const field of ["baseAmount", "payableAmount", "receivedAmount", "dueAmount", "advanceAmount"] as const) {
      if (doc[field] != null) {
        $set[field] = paisaOf(doc[field]);
      }
    }

    L.log(STEP_FEE, "convert", id, $set);

    if (!dryRun) {
      await fees.updateOne({ _id: doc._id }, { $set });
      await markDone({ step: STEP_FEE, v4Id: id, dryRun: false });
    } else {
      await markDone({ step: STEP_FEE, v4Id: id, dryRun: true });
    }
    fProcessed++;
  }

  L.log(STEP_FEE, `done — converted ${fProcessed}, skipped ${fSkipped}`);
}
