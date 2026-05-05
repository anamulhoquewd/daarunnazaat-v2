/**
 * Step 03 — Remove stale v4 fields from Student documents
 *
 * Fields to $unset: feeBalance, sessionHistory, batchType, receivedAmount
 * (receivedAmount was the old admission payment field — value already migrated
 *  to an Invoice in step 05; the field does not exist in the v5 Student schema)
 *
 * Also ensures creditBalance defaults to 0 if absent.
 *
 * Idempotent: tracks processed doc IDs in _v5_migration_log (step "03-students").
 */
import mongoose from "mongoose";
import * as L from "./utils/log";
import { isDone, markDone } from "./utils/migration-log";

const STEP = "03-students";

const STALE_FIELDS = [
  "feeBalance",
  "sessionHistory",
  "batchType",
  "receivedAmount",
  "currentClass",     // old embedded class name — v5 uses classId ref
  "feeStatus",        // old computed field
] as const;

export async function cleanStudents(dryRun: boolean): Promise<void> {
  L.log(STEP, "start");

  const col = mongoose.connection.db!.collection("students");
  const cursor = col.find({ isDeleted: { $ne: true } });

  let processed = 0;
  let skipped = 0;

  for await (const doc of cursor) {
    const id = doc._id.toString();

    if (await isDone(STEP, id)) {
      skipped++;
      continue;
    }

    const $unset: Record<string, 1> = {};
    for (const field of STALE_FIELDS) {
      if (doc[field] !== undefined) $unset[field] = 1;
    }

    const $set: Record<string, unknown> = {};
    if (doc.creditBalance == null) $set.creditBalance = 0;

    const hasWork = Object.keys($unset).length > 0 || Object.keys($set).length > 0;

    if (hasWork) {
      L.log(STEP, "clean", id, {
        unset: Object.keys($unset),
        set: Object.keys($set),
      });

      if (!dryRun) {
        const update: Record<string, unknown> = {};
        if (Object.keys($unset).length) update.$unset = $unset;
        if (Object.keys($set).length) update.$set = $set;
        await col.updateOne({ _id: doc._id }, update);
      }
      processed++;
    } else {
      skipped++;
    }

    await markDone({ step: STEP, v4Id: id, dryRun: hasWork ? dryRun : false });
  }

  L.log(STEP, `done — cleaned ${processed}, skipped ${skipped}`);
}
