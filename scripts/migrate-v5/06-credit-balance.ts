/**
 * Step 06 — Sync Student.creditBalance from migrated Payment.unallocatedAmount
 *
 * For each student, sum all Payment.unallocatedAmount (non-deleted) and
 * write it to Student.creditBalance. This step must run after step 05.
 *
 * Idempotent: always overwrites creditBalance (safe — step 05 is the only
 * source of truth for unallocatedAmount at migration time).
 */
import mongoose from "mongoose";
import * as L from "./utils/log";
import { isDone, markDone } from "./utils/migration-log";

const STEP = "06-credit-balance";

export async function migrateCreditBalances(dryRun: boolean): Promise<void> {
  L.log(STEP, "start");

  const db = mongoose.connection.db!;
  const payments = db.collection("payments");
  const students = db.collection("students");

  // Aggregate unallocatedAmount per student from Payment collection
  const agg = await payments
    .aggregate([
      { $match: { isDeleted: { $ne: true }, unallocatedAmount: { $gt: 0 } } },
      { $group: { _id: "$studentId", totalUnallocated: { $sum: "$unallocatedAmount" } } },
    ])
    .toArray();

  L.log(STEP, `${agg.length} students have unallocated credit`);

  let updated = 0;
  let skipped = 0;

  for (const row of agg) {
    const studentId = row._id.toString();

    if (await isDone(STEP, studentId)) {
      skipped++;
      continue;
    }

    const creditBalance: number = row.totalUnallocated;

    L.log(STEP, "set-credit", studentId, { creditBalance });

    if (!dryRun) {
      await students.updateOne(
        { _id: row._id },
        { $set: { creditBalance } },
      );
    }

    await markDone({ step: STEP, v4Id: studentId, dryRun });
    updated++;
  }

  // Students with no unallocated payments → ensure creditBalance = 0
  const cursor = students.find({
    isDeleted: { $ne: true },
    _id: { $nin: agg.map((r) => r._id) },
  });

  let zeroed = 0;
  for await (const doc of cursor) {
    const id = doc._id.toString();
    if (await isDone(STEP, id)) continue;

    if ((doc.creditBalance ?? 0) !== 0) {
      L.log(STEP, "zero-credit", id);
      if (!dryRun) {
        await students.updateOne({ _id: doc._id }, { $set: { creditBalance: 0 } });
      }
      zeroed++;
    }

    await markDone({ step: STEP, v4Id: id, dryRun });
  }

  L.log(STEP, `done — updated ${updated}, zeroed ${zeroed}, skipped ${skipped}`);
}
