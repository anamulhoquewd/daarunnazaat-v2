import { Model, Schema, model, models } from "mongoose";
import type { IStudent } from "../interfaces";

const StudentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true, trim: true },
    roll: { type: Number },
    monthly_fee: { type: Number, required: true },
    id_card: { type: String },
    class_id: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    guardian_name: { type: String },
    guardian_phone: { type: String },
    address: { type: String },
    admission_date: { type: Date, default: Date.now },
    date_of_birth: { type: Date },
    gender: { type: String, enum: ["male", "female"] },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ✅ Fix: Reuse model if already exists
export const Student: Model<IStudent> =
  models.Student || model<IStudent>("Student", StudentSchema);
