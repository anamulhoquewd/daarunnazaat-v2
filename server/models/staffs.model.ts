import { BloodGroup, Branch, Gender, IStaff } from "@/validations";
import { model, Model, models, Schema } from "mongoose";

// Staff Model
const StaffSchema = new Schema<IStaff & Document>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    staffId: { type: String, required: true, unique: true },
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
      division: { type: String, required: true },
    },
    permanentAddress: {
      village: { type: String },
      postOffice: { type: String },
      upazila: { type: String },
      district: { type: String },
      division: { type: String },
    },
    avatar: { type: String },
    designation: { type: String, required: true },
    department: { type: String },
    joinDate: { type: Date, required: true },
    basicSalary: { type: Number, required: true, min: 0 },
    allowances: { type: Number, default: 0, min: 0 },
    branch: { type: String, enum: Object.values(Branch), required: true },
    isActive: { type: Boolean, default: true },
    resignationDate: { type: Date },
  },
  { timestamps: true }
);

StaffSchema.index({ branch: 1 });

export const Staff: Model<IStaff & Document> =
  models.Staff || model<IStaff & Document>("Staff", StaffSchema);
