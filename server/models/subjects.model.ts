import { ISubject } from "@/validations";
import { model, Model, models, Schema } from "mongoose";

const SubjectSchema = new Schema<ISubject & Document>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

SubjectSchema.index({ name: 1 });

export const Subject: Model<ISubject & Document> =
  models.Subject || model<ISubject & Document>("Subject", SubjectSchema);
