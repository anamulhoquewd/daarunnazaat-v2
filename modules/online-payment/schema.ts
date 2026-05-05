import { Model, model, models, Schema } from "mongoose";
import { auditLogPlugin } from "@/modules/shared/audit-log/plugin";
import { baseFields } from "@/modules/shared/base-schema";
import { OnlinePaymentStatus, OnlinePaymentProvider } from "@/validations";

interface IOnlinePaymentDoc {
  transactionRef: string;       // unique, system-generated
  guardianId: Schema.Types.ObjectId;
  studentId: Schema.Types.ObjectId;
  invoiceIds: Schema.Types.ObjectId[];

  provider: OnlinePaymentProvider; // bkash | nagad
  totalAmount: number;             // paisa — must equal sum of selected invoice dues

  status: OnlinePaymentStatus;     // pending | completed | failed | cancelled

  providerRef?: string;   // bKash/Nagad transaction ID (from dummy callback)
  initiatedAt: Date;
  completedAt?: Date;
  failedAt?: Date;
  failureReason?: string;

  // base fields
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: Schema.Types.ObjectId | null;
  deleteReason: string | null;
  createdBy: Schema.Types.ObjectId;
  updatedBy: Schema.Types.ObjectId;
}

const OnlinePaymentSchema = new Schema<IOnlinePaymentDoc>(
  {
    transactionRef: { type: String, required: true, unique: true },
    guardianId: { type: Schema.Types.ObjectId, ref: "Guardian", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    invoiceIds: [{ type: Schema.Types.ObjectId, ref: "Invoice" }],

    provider: { type: String, enum: Object.values(OnlinePaymentProvider), required: true },
    totalAmount: { type: Number, required: true, min: 1 },

    status: {
      type: String,
      enum: Object.values(OnlinePaymentStatus),
      default: OnlinePaymentStatus.PENDING,
    },

    providerRef: { type: String },
    initiatedAt: { type: Date, required: true, default: Date.now },
    completedAt: { type: Date },
    failedAt: { type: Date },
    failureReason: { type: String },

    ...baseFields,
  },
  { timestamps: true },
);

OnlinePaymentSchema.index({ status: 1, initiatedAt: -1 });

OnlinePaymentSchema.plugin(auditLogPlugin);

export const OnlinePayment: Model<IOnlinePaymentDoc> =
  models.OnlinePayment || model<IOnlinePaymentDoc>("OnlinePayment", OnlinePaymentSchema);
