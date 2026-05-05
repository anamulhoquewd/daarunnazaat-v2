import { Model, model, models, Schema } from "mongoose";
import { auditLogPlugin } from "@/modules/shared/audit-log/plugin";
import { baseFields } from "@/modules/shared/base-schema";

export interface IClassDoc {
  name: string;
  description?: string;
  order: number; // for sorting: Class 1=1, Class 2=2 …

  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: Schema.Types.ObjectId | null;
  deleteReason: string | null;
  createdBy: Schema.Types.ObjectId;
  updatedBy: Schema.Types.ObjectId;
}

const ClassSchema = new Schema<IClassDoc>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    order: { type: Number, default: 0 },
    ...baseFields,
  },
  { timestamps: true },
);

// ClassSchema.index({ isDeleted: 1, order: 1 });

ClassSchema.plugin(auditLogPlugin);

export const Class: Model<IClassDoc> =
  models.Class || model<IClassDoc>("Class", ClassSchema);
