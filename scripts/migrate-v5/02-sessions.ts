/**
 * Step 02 — Backfill v5 fields on Session documents
 *
 * v4 sessions had: batchType ("January December" | "Ramadan Ramadan"), sessionName?
 * v5 sessions need: cycleType ("JAN_DEC" | "RAMADAN"), name, monthCount
 *
 * Idempotent: tracks processed doc IDs in _v5_migration_log (step "02-sessions").
 */
import mongoose from "mongoose";
import * as L from "./utils/log";
import { isDone, markDone } from "./utils/migration-log";

const STEP = "02-sessions";

const BATCH_TYPE_MAP: Record<string, string> = {
  "January December": "JAN_DEC",
  "Ramadan Ramadan": "RAMADAN",
};

function diffMonths(start: Date, end: Date): number {
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) +
    1; // inclusive
  return Math.max(1, Math.min(24, months));
}

function deriveName(cycleType: string, startDate: Date): string {
  const y = startDate.getFullYear();
  if (cycleType === "JAN_DEC") return `${y} Session`;
  if (cycleType === "RAMADAN") return `Ramadan ${y}`;
  return `Session ${y}`;
}

export async function migrateSessions(dryRun: boolean): Promise<void> {
  L.log(STEP, "start");

  const col = mongoose.connection.db!.collection("sessions");
  const cursor = col.find({ isDeleted: { $ne: true } });

  let processed = 0;
  let skipped = 0;

  for await (const doc of cursor) {
    const id = doc._id.toString();

    if (await isDone(STEP, id)) {
      skipped++;
      continue;
    }

    // Already migrated (v5 fields present)
    if (doc.cycleType && doc.name && doc.monthCount) {
      await markDone({ step: STEP, v4Id: id, dryRun: false });
      skipped++;
      continue;
    }

    const rawBatchType: string | undefined = doc.batchType;
    const cycleType: string =
      (rawBatchType && BATCH_TYPE_MAP[rawBatchType]) ??
      (rawBatchType?.includes("Ramadan") ? "RAMADAN" : "JAN_DEC");

    const startDate: Date = doc.startDate ?? new Date();
    const endDate: Date = doc.endDate ?? new Date();

    const name: string =
      doc.sessionName?.trim() ||
      doc.name?.trim() ||
      deriveName(cycleType, startDate);

    const monthCount = diffMonths(startDate, endDate);

    const $set: Record<string, unknown> = { cycleType, name, monthCount };
    const $unset: Record<string, 1> = {};
    if (doc.batchType !== undefined) $unset.batchType = 1;
    if (doc.sessionName !== undefined) $unset.sessionName = 1;

    L.log(STEP, "patch", id, { cycleType, name, monthCount });

    if (!dryRun) {
      await col.updateOne(
        { _id: doc._id },
        { $set, ...( Object.keys($unset).length ? { $unset } : {}) },
      );
    }

    await markDone({ step: STEP, v4Id: id, dryRun });
    processed++;
  }

  L.log(STEP, `done — patched ${processed}, skipped ${skipped}`);
}
