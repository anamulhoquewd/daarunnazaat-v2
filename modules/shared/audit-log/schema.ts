import { model, models, Schema } from "mongoose";

// ── Types ──────────────────────────────────────────────────────────────────────

export type AuditAction = "create" | "update" | "delete" | "restore";

export interface IAuditLog {
  collectionName: string;
  documentId: Schema.Types.ObjectId;
  action: AuditAction;
  /** { fieldName: { from: oldValue, to: newValue } } */
  changes?: Record<string, { from: unknown; to: unknown }>;
  performedBy: Schema.Types.ObjectId;
  ip?: string;
  userAgent?: string;
  createdAt?: Date;
}

// ── Schema ─────────────────────────────────────────────────────────────────────

const AuditLogSchema = new Schema<IAuditLog>(
  {
    collectionName: { type: String, required: true, index: true },
    documentId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ["create", "update", "delete", "restore"],
      required: true,
    },
    changes: { type: Schema.Types.Mixed },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ip: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

AuditLogSchema.index({ collectionName: 1, documentId: 1, createdAt: -1 });
AuditLogSchema.index({ performedBy: 1, createdAt: -1 });

// ── Model ──────────────────────────────────────────────────────────────────────

export const AuditLog = models.AuditLog || model<IAuditLog>("AuditLog", AuditLogSchema);
