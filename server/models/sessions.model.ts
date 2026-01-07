import { BatchType, ISession } from "@/validations";
import { Model, model, models, Schema } from "mongoose";

// Session Model
const SessionSchema = new Schema<ISession & Document>(
  {
    sessionName: { type: String, required: true },
    batchType: { type: String, enum: Object.values(BatchType), required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SessionSchema.index({ batchType: 1, isActive: 1 });

export const Session: Model<ISession & Document> =
  models.Session || model<ISession & Document>("Session", SessionSchema);
