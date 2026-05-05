import { Schema } from "mongoose";
import { AuditLog } from "./schema";

// ── Config ─────────────────────────────────────────────────────────────────────

/** Fields that are never interesting to log — they're internal bookkeeping. */
const SKIP_FIELDS = new Set([
  "__v",
  "createdAt",
  "updatedAt",
  "isDeleted",
  "deletedAt",
  "deletedBy",
  "deleteReason",
  "updatedBy",
]);

// ── Helpers ────────────────────────────────────────────────────────────────────

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc == null || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

async function writeLog(entry: {
  collectionName: string;
  documentId: unknown;
  action: "create" | "update" | "delete" | "restore";
  changes?: Record<string, { from: unknown; to: unknown }>;
  performedBy: unknown;
}) {
  try {
    await AuditLog.create(entry);
  } catch (err) {
    // Audit failures must NEVER crash the caller
    console.error("[AuditLog] write failed:", err);
  }
}

// ── Plugin ─────────────────────────────────────────────────────────────────────

/**
 * Attach this plugin to any v5 schema to get automatic audit logging.
 *
 * How to pass `performedBy`:
 *   - For `doc.save()`: set `doc.$locals.performedBy = userId` before saving
 *   - For `Model.findOneAndUpdate(filter, update, { performedBy: userId })`
 *   - For `Model.findOneAndDelete(filter, { performedBy: userId })`
 *
 * If `performedBy` is absent (seed / migration context), the log is silently skipped.
 */
export function auditLogPlugin(schema: Schema) {
  // ── save (create + update) ──────────────────────────────────────────────────

  schema.pre("save", async function (next) {
    const performedBy = this.$locals.performedBy;
    if (!performedBy) return next(); // seed / migration — skip

    const modelName: string = (this.constructor as any).modelName ?? "Unknown";

    if (this.isNew) {
      this.$locals._audit = { action: "create", modelName };
      return next();
    }

    if (!this.isModified()) return next();

    // Snapshot original doc to get "from" values
    const original = (await (this.constructor as any)
      .findById(this._id)
      .lean()) as Record<string, unknown> | null;

    const changes: Record<string, { from: unknown; to: unknown }> = {};
    for (const path of this.modifiedPaths({ includeChildren: false })) {
      if (SKIP_FIELDS.has(path)) continue;
      changes[path] = {
        from: original ? getNestedValue(original, path) : undefined,
        to: this.get(path),
      };
    }

    this.$locals._audit = { action: "update", modelName, changes };
    next();
  });

  schema.post("save", async function (doc) {
    const performedBy = doc.$locals.performedBy;
    const audit = doc.$locals._audit as
      | {
          action: "create" | "update";
          modelName: string;
          changes?: Record<string, { from: unknown; to: unknown }>;
        }
      | undefined;

    if (!performedBy || !audit) return;

    await writeLog({
      collectionName: audit.modelName,
      documentId: doc._id,
      action: audit.action,
      changes: audit.changes,
      performedBy,
    });
  });

  // ── findOneAndUpdate ────────────────────────────────────────────────────────

  schema.pre("findOneAndUpdate", async function () {
    const performedBy = (this as any).options.performedBy;
    if (!performedBy) return;

    // Snapshot before update
    const original = await this.model
      .findOne(this.getFilter())
      .lean<Record<string, unknown>>();
    (this as any)._auditOriginal = original;
  });

  schema.post("findOneAndUpdate", async function (doc: any) {
    const performedBy = (this as any).options.performedBy;
    if (!performedBy || !doc) return;

    const original = (this as any)._auditOriginal as
      | Record<string, unknown>
      | null;
    const update = this.getUpdate() as Record<string, unknown> | null;
    const $set = (update as any)?.$set ?? update ?? {};

    const changes: Record<string, { from: unknown; to: unknown }> = {};
    for (const [key, newValue] of Object.entries($set)) {
      if (SKIP_FIELDS.has(key)) continue;
      changes[key] = {
        from: original ? getNestedValue(original, key) : undefined,
        to: newValue,
      };
    }

    await writeLog({
      collectionName: this.model.modelName,
      documentId: doc._id,
      action: "update",
      changes,
      performedBy,
    });
  });

  // ── findOneAndDelete ────────────────────────────────────────────────────────

  schema.pre("findOneAndDelete", async function () {
    const performedBy = (this as any).options.performedBy;
    if (!performedBy) return;

    const doc = await this.model.findOne(this.getFilter()).lean();
    (this as any)._auditDocBeforeDelete = doc;
  });

  schema.post("findOneAndDelete", async function (doc: any) {
    const performedBy = (this as any).options.performedBy;
    if (!performedBy || !doc) return;

    await writeLog({
      collectionName: this.model.modelName,
      documentId: doc._id,
      action: "delete",
      performedBy,
    });
  });

  // ── deleteOne (on document instance) ───────────────────────────────────────

  schema.pre("deleteOne", { document: true, query: false }, async function () {
    const performedBy = (this as any).$locals?.performedBy;
    if (!performedBy) return;
    (this as any).$locals._auditDocId = (this as any)._id;
    (this as any).$locals._auditModelName = (this.constructor as any).modelName;
  });

  schema.post(
    "deleteOne",
    { document: true, query: false },
    async function () {
      const performedBy = (this as any).$locals?.performedBy;
      const docId = (this as any).$locals?._auditDocId;
      const modelName = (this as any).$locals?._auditModelName;
      if (!performedBy || !docId) return;

      await writeLog({
        collectionName: modelName ?? "Unknown",
        documentId: docId,
        action: "delete",
        performedBy,
      });
    },
  );
}
