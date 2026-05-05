import { Counter } from "./schema";

// nextNumber("DN-STU") → "DN-STU-001", "DN-STU-002", …
// nextNumber("DN-INV") → "DN-INV-001", "DN-INV-002", …
export async function nextNumber(prefix: string): Promise<string> {
  const doc = await Counter.findOneAndUpdate(
    { key: prefix },
    { $inc: { seq: 1 } },
    { upsert: true, new: true },
  ) as any;

  return `${prefix}-${String((doc?.seq ?? 1)).padStart(3, "0")}`;
}

// Returns current seq without incrementing (0 if never started).
export async function peekNumber(prefix: string): Promise<number> {
  const doc = (await Counter.findOne({ key: prefix }).lean()) as { seq?: number } | null;
  return doc?.seq ?? 0;
}
