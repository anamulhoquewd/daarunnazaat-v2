/**
 * Step 04 — Extract sessionHistory from Student documents → Enrollment collection
 *
 * v4 students had an embedded sessionHistory array:
 *   [{ sessionId, classId, enrolledAt?, completedAt?, status? }]
 *
 * For each entry, create one Enrollment document (skip if already exists).
 * Also creates an ONGOING enrollment for the student's currentSessionId if
 * no matching ONGOING enrollment exists.
 *
 * Idempotent: tracks processed student IDs in _v5_migration_log (step "04-enrollments").
 */
import mongoose from "mongoose";
import * as L from "./utils/log";
import { isDone, markDone } from "./utils/migration-log";

const STEP = "04-enrollments";

const MIGRATION_USER = new mongoose.Types.ObjectId("000000000000000000000000");

const STATUS_MAP: Record<string, string> = {
  ongoing: "ongoing",
  promoted: "promoted",
  graduated: "graduated",
  dropped: "dropped",
  repeated: "repeated",
  // old v4 labels
  active: "ongoing",
  completed: "graduated",
  pass: "promoted",
  fail: "repeated",
};

function mapStatus(raw: string | undefined): string {
  if (!raw) return "ongoing";
  return STATUS_MAP[raw.toLowerCase()] ?? "ongoing";
}

export async function migrateEnrollments(dryRun: boolean): Promise<void> {
  L.log(STEP, "start");

  const students = mongoose.connection.db!.collection("students");
  const enrollments = mongoose.connection.db!.collection("enrollments");

  const cursor = students.find({ isDeleted: { $ne: true } });

  let processed = 0;
  let skipped = 0;
  let enrollmentsCreated = 0;

  for await (const doc of cursor) {
    const studentId = doc._id.toString();

    if (await isDone(STEP, studentId)) {
      skipped++;
      continue;
    }

    const toInsert: object[] = [];

    // ── Historic sessionHistory entries ────────────────────────────────────────
    const history: any[] = Array.isArray(doc.sessionHistory) ? doc.sessionHistory : [];

    for (const entry of history) {
      if (!entry?.sessionId) continue;

      const existing = await enrollments.findOne({
        studentId: doc._id,
        sessionId: entry.sessionId,
        isDeleted: { $ne: true },
      });
      if (existing) continue;

      toInsert.push({
        studentId: doc._id,
        sessionId: entry.sessionId,
        classId: entry.classId ?? doc.classId,
        branch: doc.branch,
        enrollmentDate: entry.enrolledAt ?? entry.createdAt ?? new Date(),
        completionDate: entry.completedAt ?? entry.passedAt ?? null,
        status: mapStatus(entry.status),
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        deleteReason: null,
        createdBy: MIGRATION_USER,
        updatedBy: MIGRATION_USER,
        createdAt: entry.enrolledAt ?? new Date(),
        updatedAt: new Date(),
      });
    }

    // ── Current session — ensure an ONGOING enrollment exists ──────────────────
    if (doc.currentSessionId) {
      const hasOngoing = await enrollments.findOne({
        studentId: doc._id,
        sessionId: doc.currentSessionId,
        status: "ongoing",
        isDeleted: { $ne: true },
      });

      if (!hasOngoing) {
        const alreadyQueued = toInsert.some(
          (e: any) =>
            e.sessionId?.toString() === doc.currentSessionId?.toString() &&
            e.status === "ongoing",
        );

        if (!alreadyQueued) {
          toInsert.push({
            studentId: doc._id,
            sessionId: doc.currentSessionId,
            classId: doc.classId,
            branch: doc.branch,
            enrollmentDate: doc.admissionDate ?? new Date(),
            completionDate: null,
            status: "ongoing",
            isDeleted: false,
            deletedAt: null,
            deletedBy: null,
            deleteReason: null,
            createdBy: MIGRATION_USER,
            updatedBy: MIGRATION_USER,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    }

    if (toInsert.length > 0) {
      L.log(STEP, "enroll", studentId, { count: toInsert.length });

      if (!dryRun) {
        await enrollments.insertMany(toInsert, { ordered: false });
      }

      enrollmentsCreated += toInsert.length;
      processed++;
    } else {
      skipped++;
    }

    await markDone({ step: STEP, v4Id: studentId, dryRun });
  }

  L.log(STEP, `done — students processed: ${processed}, skipped: ${skipped}, enrollments created: ${enrollmentsCreated}`);
}
