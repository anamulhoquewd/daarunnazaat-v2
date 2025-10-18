import { Model, model, models, Schema } from "mongoose";
import type { IClass } from "../interfaces";

const ClassSchema = new Schema<IClass>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    teacher: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    opening_date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ✅ Fix: Reuse model if already exists
export const Class: Model<IClass> =
  models.Class || model<IClass>("Class", ClassSchema);
