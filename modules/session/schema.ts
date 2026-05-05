import { Model, model, models, Schema } from "mongoose";
import { auditLogPlugin } from "@/modules/shared/audit-log/plugin";
import { baseFields } from "@/modules/shared/base-schema";
import { SessionCycleType } from "@/validations";

interface ISessionDoc {
  name: string;
  cycleType: SessionCycleType;
  startDate: Date;
  endDate: Date;
  monthCount: number;
  isActive: boolean;
  // base fields
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: Schema.Types.ObjectId | null;
  deleteReason: string | null;
  createdBy: Schema.Types.ObjectId;
  updatedBy: Schema.Types.ObjectId;
}

const SessionSchema = new Schema<ISessionDoc>(
  {
    name: { type: String, required: true, trim: true },
    cycleType: {
      type: String,
      enum: Object.values(SessionCycleType),
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    monthCount: { type: Number, required: true, min: 1, max: 24 },
    isActive: { type: Boolean, default: false },
    ...baseFields,
  },
  { timestamps: true },
);

SessionSchema.index({ cycleType: 1, isActive: 1 });
SessionSchema.index({ name: 1 });
// SessionSchema.index({ isDeleted: 1 });

SessionSchema.plugin(auditLogPlugin);

export const SessionV5: Model<ISessionDoc> =
  models.Session || model<ISessionDoc>("Session", SessionSchema);
