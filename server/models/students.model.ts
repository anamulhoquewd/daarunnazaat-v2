import { Model, Schema, model, models } from "mongoose";
import {
  BatchType,
  BloodGroup,
  Branch,
  Gender,
  GuardianRelation,
  IStudent,
} from "@/validations";

// TODO guardian er relation koi?
// Student Model
const StudentSchema = new Schema<IStudent & Document>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    studentId: { type: String, required: true, unique: true },
    guardianId: {
      type: Schema.Types.ObjectId,
      ref: "Guardian",
      required: true,
    },
    guardianRelation: {
      type: String,
      required: true,
      enum: Object.values(GuardianRelation),
    },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    branch: { type: String, enum: Object.values(Branch), required: true },
    batchType: { type: String, enum: Object.values(BatchType), required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    fatherName: { type: String },
    motherName: { type: String },
    dateOfBirth: { type: Date, required: true },
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
    admissionDate: { type: Date, required: true },
    isResidential: { type: Boolean, default: false },
    isMealIncluded: { type: Boolean, default: false },
    admissionFee: { type: Number, required: true, min: 0 },
    admissionDiscount: { type: Number, default: 0, min: 0 },
    monthlyFee: { type: Number, required: true, min: 0 },
    monthlyDiscount: { type: Number, default: 0, min: 0 },
    residentialFee: { type: Number, min: 0 },
    mealFee: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true },
    passoutDate: { type: Date },
  },
  { timestamps: true }
);

StudentSchema.index({ guardianId: 1 });
StudentSchema.index({ classId: 1 });
StudentSchema.index({ branch: 1, batchType: 1 });

export const Student: Model<IStudent & Document> =
  models.Student || model<IStudent & Document>("Student", StudentSchema);
