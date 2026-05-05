import { Model, model, models, Schema } from "mongoose";
import { auditLogPlugin } from "@/modules/shared/audit-log/plugin";
import { baseFields } from "@/modules/shared/base-schema";
import { AdjustmentType } from "@/validations";

interface IAdjustmentDoc {
  invoiceId: Schema.Types.ObjectId;
  studentId: Schema.Types.ObjectId;

  type: AdjustmentType;
  amount: number;   // signed paisa — negative = reduces due, positive = increases due
  reason: string;

  appliedBy: Schema.Types.ObjectId;

  isVoided: boolean;
  voidedAt?: Date;
  voidReason?: string;
  voidedBy?: Schema.Types.ObjectId;

  // base fields
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: Schema.Types.ObjectId | null;
  deleteReason: string | null;
  createdBy: Schema.Types.ObjectId;
  updatedBy: Schema.Types.ObjectId;
}

const AdjustmentSchema = new Schema<IAdjustmentDoc>(
  {
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: Object.values(AdjustmentType),
      required: true,
    },
    amount: { type: Number, required: true }, // signed — no min/max
    reason: { type: String, required: true, minlength: 10 },

    appliedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    isVoided: { type: Boolean, default: false },
    voidedAt: { type: Date },
    voidReason: { type: String },
    voidedBy: { type: Schema.Types.ObjectId, ref: "User" },

    ...baseFields,
  },
  { timestamps: true },
);

AdjustmentSchema.index({ invoiceId: 1, isVoided: 1 });
AdjustmentSchema.index({ studentId: 1, createdAt: -1 });
// AdjustmentSchema.index({ isDeleted: 1 });

AdjustmentSchema.plugin(auditLogPlugin);

export const Adjustment: Model<IAdjustmentDoc> =
  models.Adjustment || model<IAdjustmentDoc>("Adjustment", AdjustmentSchema);
