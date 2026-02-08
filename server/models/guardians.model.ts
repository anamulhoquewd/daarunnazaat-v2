import { BloodGroup, Gender, IGuardian } from "@/validations";
import { model, Model, models, Schema } from "mongoose";

// Guardian Model
const GuardianSchema = new Schema<IGuardian & Document>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    alternativePhone: { type: String },
    whatsApp: { type: String },
    guardianId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, enum: Object.values(Gender), required: true },
    bloodGroup: { type: String, enum: Object.values(BloodGroup) },
    nid: { type: String, unique: true, required: false, sparse: true },
    birthCertificateNumber: { type: String },
    presentAddress: {
      village: { type: String, required: true },
      postOffice: { type: String, required: true },
      upazila: { type: String, required: true },
      district: { type: String, required: true },
      division: { type: String },
    },
    permanentAddress: {
      village: { type: String },
      postOffice: { type: String },
      upazila: { type: String },
      district: { type: String },
      division: { type: String },
    },
    avatar: { type: String },
    occupation: { type: String },
    monthlyIncome: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Guardian: Model<IGuardian & Document> =
  models.Guardian || model<IGuardian & Document>("Guardian", GuardianSchema);
