import { BloodGroup, Gender, IGuardian } from "@/validations";
import { model, Model, models, Schema } from "mongoose";

// TODO relation ta kar sathe? student guardian er odhine naki guardian student er odhine?
// Guardian Model
const GuardianSchema = new Schema<IGuardian & Document>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    guardianId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    fatherName: { type: String },
    motherName: { type: String },
    gender: { type: String, enum: Object.values(Gender), required: true },
    bloodGroup: { type: String, enum: Object.values(BloodGroup) },
    nidNumber: { type: String },
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
  },
  { timestamps: true }
);

export const Guardian: Model<IGuardian & Document> =
  models.Guardian || model<IGuardian & Document>("Guardian", GuardianSchema);
