/**
 * Step 05 — Merge v4 FeeCollection → v5 Invoice + Payment
 *
 * Grouping strategy:
 *   "monthly" fee types (monthlyFee, coachingFee, daycareFee, mealFee,
 *   residentialFee) that share the same (studentId, period) are merged into
 *   one Invoice with multiple line items + one Payment.
 *
 *   "admissionFee" → one Invoice (invoiceType: "admission") per FeeCollection.
 *   "utilityFee", "otherFee" → one Invoice (invoiceType: "other") per FeeCollection.
 *
 * Money fields are already in paisa (from step 01).
 * Migrated FeeCollections are archived to _archived_FeeCollection_v4 after
 * their Invoice + Payment have been created.
 *
 * Idempotent: group key used as v4Id in migration log.
 */
import mongoose from "mongoose";
import * as L from "./utils/log";
import { isDone, markDone } from "./utils/migration-log";
import { nextNumber } from "@/modules/shared/numbering/service";

const STEP = "05-fee-split";

const MIGRATION_USER = new mongoose.Types.ObjectId("000000000000000000000000");

const MONTHLY_FEE_TYPES = new Set([
  "monthlyFee",
  "coachingFee",
  "daycareFee",
  "mealFee",
  "residentialFee",
]);

const FEE_TYPE_LABEL: Record<string, string> = {
  monthlyFee: "Monthly Fee",
  coachingFee: "Coaching Fee",
  daycareFee: "Daycare Fee",
  mealFee: "Meal Fee",
  residentialFee: "Residential Fee",
  admissionFee: "Admission Fee",
  utilityFee: "Utility Fee",
  otherFee: "Other Fee",
};

function computeStatus(paidAmount: number, netPayable: number): string {
  if (netPayable <= 0) return "paid";
  if (paidAmount <= 0) return "unpaid";
  if (paidAmount >= netPayable) return "paid";
  return "partial";
}

function parsePeriod(period: string): { year: number; month: number } | null {
  // Expected format: "2024-03"
  const match = period.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;
  return { year: parseInt(match[1]), month: parseInt(match[2]) };
}

export async function migrateFeeCollections(dryRun: boolean): Promise<void> {
  L.log(STEP, "start");

  const db = mongoose.connection.db!;
  const feeCols = db.collection("feecollections");
  const invoiceCol = db.collection("invoices");
  const paymentCol = db.collection("payments");
  const archiveCol = db.collection("_archived_FeeCollection_v4");

  // ── Load all non-deleted FeeCollections ──────────────────────────────────────
  const allFees = await feeCols
    .find({ isDeleted: { $ne: true } })
    .sort({ paymentDate: 1 })
    .toArray();

  L.log(STEP, `loaded ${allFees.length} fee collections`);

  // ── Group by key ─────────────────────────────────────────────────────────────
  type FeeGroup = { key: string; docs: any[] };
  const groups = new Map<string, any[]>();

  for (const doc of allFees) {
    const feeType: string = doc.feeType ?? "otherFee";
    let key: string;

    if (MONTHLY_FEE_TYPES.has(feeType) && doc.period) {
      key = `monthly:${doc.studentId}:${doc.period}`;
    } else if (feeType === "admissionFee") {
      key = `admission:${doc._id}`;
    } else {
      key = `other:${doc._id}`;
    }

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(doc);
  }

  L.log(STEP, `${groups.size} invoice groups to process`);

  let processed = 0;
  let skipped = 0;

  for (const [key, docs] of groups) {
    if (await isDone(STEP, key)) {
      skipped++;
      continue;
    }

    const first = docs[0];
    const studentId = first.studentId;
    const sessionId = first.sessionId;
    const branch = first.branch;

    // ── Derive invoice type + period ─────────────────────────────────────────
    let invoiceType: string;
    let periodYear: number | null = null;
    let periodMonth: number | null = null;

    if (key.startsWith("monthly:")) {
      invoiceType = "monthly";
      const parsed = parsePeriod(first.period);
      if (parsed) {
        periodYear = parsed.year;
        periodMonth = parsed.month;
      }
    } else if (key.startsWith("admission:")) {
      invoiceType = "admission";
    } else {
      invoiceType = "other";
    }

    // ── Build line items ─────────────────────────────────────────────────────
    const lineItems = docs.map((d) => {
      const feeType: string = d.feeType ?? "otherFee";
      const amount: number = d.baseAmount ?? d.payableAmount ?? 0; // paisa
      const discount: number = Math.max(0, amount - (d.payableAmount ?? amount));
      const net: number = d.payableAmount ?? amount;
      return {
        feeType,
        label: FEE_TYPE_LABEL[feeType] ?? feeType,
        amount,
        discount,
        net: Math.max(0, net),
      };
    });

    const subtotal = lineItems.reduce((s, li) => s + li.amount, 0);
    const totalDiscount = lineItems.reduce((s, li) => s + li.discount, 0);
    const netPayable = lineItems.reduce((s, li) => s + li.net, 0);

    const totalReceived = docs.reduce((s, d) => s + (d.receivedAmount ?? 0), 0);
    const paidAmount = Math.min(totalReceived, netPayable);
    const unallocatedAmount = Math.max(0, totalReceived - netPayable);
    const dueAmount = netPayable - paidAmount;
    const status = computeStatus(paidAmount, netPayable);

    // ── Generate numbers ─────────────────────────────────────────────────────
    const paymentDate: Date = first.paymentDate ?? new Date();
    const py = paymentDate.getFullYear();
    const pm = paymentDate.getMonth() + 1;

    const invoiceNumber = await nextNumber("INV-MIG", py, pm);
    const receiptNumber = await nextNumber("RCP-MIG", py, pm);

    const now = new Date();
    const invoiceId = new mongoose.Types.ObjectId();
    const paymentId = new mongoose.Types.ObjectId();

    const invoiceDoc = {
      _id: invoiceId,
      invoiceNumber,
      studentId,
      sessionId,
      branch,
      invoiceType,
      periodYear,
      periodMonth,
      lineItems,
      subtotal,
      totalDiscount,
      netPayable,
      adjustmentAmount: 0,
      paidAmount,
      dueAmount,
      status,
      isLocked: paidAmount > 0,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      deleteReason: null,
      createdBy: MIGRATION_USER,
      updatedBy: MIGRATION_USER,
      createdAt: now,
      updatedAt: now,
    };

    const allocations =
      paidAmount > 0 ? [{ invoiceId, allocatedAmount: paidAmount }] : [];

    const paymentDoc = {
      _id: paymentId,
      receiptNumber,
      studentId,
      sessionId,
      branch,
      paymentDate,
      paymentMethod: first.paymentMethod ?? "cash",
      paidBy: first.collectedBy ?? MIGRATION_USER,
      totalPaid: totalReceived,
      allocations,
      unallocatedAmount,
      canDeleteUntil: new Date(0), // permanently expired (no 5-min undo for migrated)
      notes: `Migrated from v4 FeeCollection (${docs.length} record${docs.length > 1 ? "s" : ""})`,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      deleteReason: null,
      createdBy: MIGRATION_USER,
      updatedBy: MIGRATION_USER,
      createdAt: now,
      updatedAt: now,
    };

    L.log(STEP, "create", key, {
      invoiceType,
      lineItems: lineItems.length,
      netPayable,
      paidAmount,
      status,
    });

    if (!dryRun) {
      // Insert invoice first, then payment
      await invoiceCol.insertOne(invoiceDoc);

      if (totalReceived > 0) {
        await paymentCol.insertOne(paymentDoc);
      }

      // Archive the source FeeCollection documents
      for (const d of docs) {
        await archiveCol.insertOne({ ...d, _archivedAt: now, _migratedInvoiceId: invoiceId });
        await feeCols.updateOne({ _id: d._id }, { $set: { isDeleted: true, deletedAt: now } });
      }
    }

    await markDone({ step: STEP, v4Id: key, v5Id: invoiceId.toString(), dryRun });
    processed++;
  }

  L.log(STEP, `done — created ${processed} invoices, skipped ${skipped}`);
}
