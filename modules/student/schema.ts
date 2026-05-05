import { Model, model, models, Schema } from "mongoose";
import { auditLogPlugin } from "@/modules/shared/audit-log/plugin";
import { baseFields } from "@/modules/shared/base-schema";
import { Branch, Gender, BloodGroup } from "@/validations";

const AddressSchema = new Schema(
  {
    village: { type: String, required: true },
    postOffice: { type: String, required: true },
    upazila: { type: String, required: true },
    district: { type: String, required: true },
    division: { type: String },
  },
  { _id: false },
);

export interface IStudentDoc {
  studentId: string;
  fullName: string;
  dateOfBirth?: Date;
  gender: Gender;
  bloodGroup?: BloodGroup;
  photo?: string;

  branch: Branch;
  classId: Schema.Types.ObjectId;
  currentSessionId: Schema.Types.ObjectId;
  guardianId: Schema.Types.ObjectId;

  admissionDate: Date;
  isActive: boolean;
  passoutDate?: Date;

  address: {
    village: string;
    postOffice: string;
    upazila: string;
    district: string;
    division?: string;
  };
  permanentAddress?: {
    village?: string;
    postOffice?: string;
    upazila?: string;
    district?: string;
    division?: string;
  };

  // Fee settings — all paisa
  admissionFee: number;
  monthlyFee: number;
  isResidential: boolean;
  residentialFee: number;
  isMealIncluded: boolean;
  mealFee: number;
  needsCoaching: boolean;
  coachingFee: number;
  isDaycare: boolean;
  daycareFee: number;

  // Overpayment credit
  creditBalance: number;

  isBlocked?: boolean;
  blockedAt?: Date | null;

  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: Schema.Types.ObjectId | null;
  deleteReason: string | null;
  createdBy: Schema.Types.ObjectId;
  updatedBy: Schema.Types.ObjectId;
}

const StudentSchema = new Schema<IStudentDoc>(
  {
    studentId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: Object.values(Gender), required: true },
    bloodGroup: { type: String, enum: Object.values(BloodGroup) },
    photo: { type: String },

    branch: { type: String, enum: Object.values(Branch), required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    currentSessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
    guardianId: { type: Schema.Types.ObjectId, ref: "Guardian", required: true },

    admissionDate: { type: Date, required: true, default: Date.now },
    isActive: { type: Boolean, default: true },
    passoutDate: { type: Date },

    address: { type: AddressSchema, required: true },
    permanentAddress: { type: AddressSchema },

    admissionFee: { type: Number, required: true, min: 0 },
    monthlyFee: { type: Number, required: true, min: 0 },
    isResidential: { type: Boolean, default: false },
    residentialFee: { type: Number, default: 0, min: 0 },
    isMealIncluded: { type: Boolean, default: false },
    mealFee: { type: Number, default: 0, min: 0 },
    needsCoaching: { type: Boolean, default: false },
    coachingFee: { type: Number, default: 0, min: 0 },
    isDaycare: { type: Boolean, default: false },
    daycareFee: { type: Number, default: 0, min: 0 },

    creditBalance: { type: Number, default: 0, min: 0 },

    ...baseFields,
  },
  { timestamps: true },
);

StudentSchema.index({ branch: 1, isActive: 1 });
StudentSchema.index({ classId: 1, currentSessionId: 1 });
StudentSchema.index({ guardianId: 1 });
// StudentSchema.index({ isDeleted: 1 });

StudentSchema.plugin(auditLogPlugin);

export const Student: Model<IStudentDoc> =
  models.Student || model<IStudentDoc>("Student", StudentSchema);
