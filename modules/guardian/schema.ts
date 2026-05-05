import { Model, model, models, Schema } from "mongoose";
import { auditLogPlugin } from "@/modules/shared/audit-log/plugin";
import { baseFields } from "@/modules/shared/base-schema";
import { Gender, BloodGroup } from "@/validations";

export interface IGuardianDoc {
  guardianId: string;
  userId: Schema.Types.ObjectId;
  fullName: string;
  gender: Gender;
  bloodGroup?: BloodGroup;
  photo?: string;
  nid?: string;

  phone: string;
  alternativePhone?: string;
  whatsApp?: string;

  occupation?: string;
  monthlyIncome?: number;

  address?: {
    village?: string;
    postOffice?: string;
    upazila?: string;
    district?: string;
    division?: string;
  };

  isActive: boolean;

  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: Schema.Types.ObjectId | null;
  deleteReason: string | null;
  createdBy: Schema.Types.ObjectId;
  updatedBy: Schema.Types.ObjectId;
}

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

const GuardianSchema = new Schema<IGuardianDoc>(
  {
    guardianId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    gender: { type: String, enum: Object.values(Gender), required: true },
    bloodGroup: { type: String, enum: Object.values(BloodGroup) },
    photo: { type: String },
    nid: { type: String, minlength: 10, maxlength: 17, sparse: true },

    phone: { type: String, required: true },
    alternativePhone: { type: String },
    whatsApp: { type: String },

    occupation: { type: String },
    monthlyIncome: { type: Number, min: 0 },

    address: { type: AddressSchema },

    isActive: { type: Boolean, default: true },

    ...baseFields,
  },
  { timestamps: true },
);

// GuardianSchema.index({ isDeleted: 1 });

GuardianSchema.plugin(auditLogPlugin);

export const Guardian: Model<IGuardianDoc> =
  models.Guardian || model<IGuardianDoc>("Guardian", GuardianSchema);
