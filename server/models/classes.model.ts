import { IClass } from "@/validations";
import { model, Model, models, Schema } from "mongoose";

// Class Model
const ClassSchema = new Schema<IClass & Document>(
  {
    className: { type: String, required: true },
    description: { type: String },
    monthlyFee: { type: Number, required: true, min: 0 },
    capacity: { type: Number, min: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Class: Model<IClass & Document> =
  models.Class || model<IClass & Document>("Class", ClassSchema);
