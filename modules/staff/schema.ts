import { Model, model, models, Schema } from "mongoose";
import { auditLogPlugin } from "@/modules/shared/audit-log/plugin";
import { baseFields } from "@/modules/shared/base-schema";
import { Branch, Gender, BloodGroup } from "@/validations";

const AddressSchema = new Schema(
  {
    village: { type: String },
    postOffice: { type: String },
    upazila: { type: String },
    district: { type: String },
    division: { type: String },
  },
  { _id: false },
);

const QualificationSchema = new Schema(
  {
    degree: { type: String, required: true },
    subject: { type: String },
    institution: { type: String },
    year: { type: Number },
    grade: { type: String },
  },
  { _id: false },
);

export interface IStaffDoc {
  staffId: string;
  userId: Schema.Types.ObjectId;
  fullName: string;
  dateOfBirth?: Date;
  gender: Gender;
  bloodGroup?: BloodGroup;
  avatar?: string;
  nid?: string;

  designation: string;
  department?: string;
  branches: Branch[];
  baseSalary: number; // paisa

  joinDate: Date;
  resignationDate?: Date;
  isActive: boolean;

  address?: {
    village?: string;
    postOffice?: string;
    upazila?: string;
    district?: string;
    division?: string;
  };
  permanentAddress?: {
    village?: string;
    postOffice?: string;
    upazila?: string;
    district?: string;
    division?: string;
  };

  alternativePhone?: string;
  whatsApp?: string;

  qualifications: { degree: string; subject?: string; institution?: string; year?: number; grade?: string }[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
    address?: string;
  };

  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: Schema.Types.ObjectId | null;
  deleteReason: string | null;
  createdBy: Schema.Types.ObjectId;
  updatedBy: Schema.Types.ObjectId;
}

const StaffSchema = new Schema<IStaffDoc>(
  {
    staffId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: Object.values(Gender), required: true },
    bloodGroup: { type: String, enum: Object.values(BloodGroup) },
    avatar: { type: String },
    nid: { type: String, sparse: true },

    designation: { type: String, required: true },
    department: { type: String },
    branches: { type: [String], enum: Object.values(Branch), required: true },
    baseSalary: { type: Number, required: true, min: 0, default: 0 },

    joinDate: { type: Date, required: true },
    resignationDate: { type: Date },
    isActive: { type: Boolean, default: true },

    address: { type: AddressSchema },
    permanentAddress: { type: AddressSchema },

    alternativePhone: { type: String },
    whatsApp: { type: String },

    qualifications: { type: [QualificationSchema], default: [] },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relationship: { type: String },
      address: { type: String },
    },

    ...baseFields,
  },
  { timestamps: true },
);

StaffSchema.index({ branches: 1, isActive: 1 });
// StaffSchema.index({ isDeleted: 1 });

StaffSchema.plugin(auditLogPlugin);

export const Staff: Model<IStaffDoc> =
  models.Staff || model<IStaffDoc>("Staff", StaffSchema);
