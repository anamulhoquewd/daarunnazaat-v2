/**
 * Per-document migration tracking in MongoDB.
 * Enables idempotent re-runs: checking before touching a document.
 */
import mongoose from "mongoose";

const COLLECTION = "_v5_migration_log";

export interface MigrationEntry {
  step: string;
  v4Id: string;     // original document ObjectId as string
  v5Id?: string;    // new document ObjectId (if a new doc was created)
  v5Ids?: string[]; // multiple new docs (e.g. Invoice + Payment pair)
  doneAt: Date;
  dryRun: boolean;
}

function col() {
  return mongoose.connection.db!.collection<MigrationEntry>(COLLECTION);
}

export async function isDone(step: string, v4Id: string): Promise<boolean> {
  const doc = await col().findOne({ step, v4Id, dryRun: false });
  return !!doc;
}

export async function markDone(entry: Omit<MigrationEntry, "doneAt">): Promise<void> {
  await col().updateOne(
    { step: entry.step, v4Id: entry.v4Id },
    { $set: { ...entry, doneAt: new Date() } },
    { upsert: true },
  );
}

export async function countDone(step: string): Promise<number> {
  return col().countDocuments({ step, dryRun: false });
}

export async function clearStep(step: string): Promise<void> {
  await col().deleteMany({ step });
}
