import { Model, model, models, Schema } from "mongoose";
import { auditLogPlugin } from "@/modules/shared/audit-log/plugin";
import { baseFields } from "@/modules/shared/base-schema";
import { Branch, PaymentMethod } from "@/validations";

interface IAllocation {
  invoiceId: Schema.Types.ObjectId;
  allocatedAmount: number; // paisa
}

interface IPaymentDoc {
  receiptNumber: string;
  studentId: Schema.Types.ObjectId;
  sessionId: Schema.Types.ObjectId;
  branch: Branch;

  paymentDate: Date;
  paymentMethod: PaymentMethod;
  paidBy: Schema.Types.ObjectId; // user who recorded this payment

  totalPaid: number;          // paisa — amount the student handed over
  allocations: IAllocation[];
  unallocatedAmount: number;  // paisa — excess that went to creditBalance

  canDeleteUntil: Date;       // 5 min after creation — undo window
  notes?: string;

  // base fields
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: Schema.Types.ObjectId | null;
  deleteReason: string | null;
  createdBy: Schema.Types.ObjectId;
  updatedBy: Schema.Types.ObjectId;
}

const AllocationSchema = new Schema<IAllocation>(
  {
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", required: true },
    allocatedAmount: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const PaymentSchema = new Schema<IPaymentDoc>(
  {
    receiptNumber: { type: String, required: true, unique: true },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
    branch: { type: String, enum: Object.values(Branch), required: true },

    paymentDate: { type: Date, required: true, default: Date.now },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    paidBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    totalPaid: { type: Number, required: true, min: 0 },
    allocations: { type: [AllocationSchema], default: [] },
    unallocatedAmount: { type: Number, default: 0, min: 0 },

    canDeleteUntil: { type: Date, required: true },
    notes: { type: String },

    ...baseFields,
  },
  { timestamps: true },
);

PaymentSchema.index({ studentId: 1, paymentDate: -1 });
PaymentSchema.index({ sessionId: 1, paymentDate: -1 });
PaymentSchema.index({ branch: 1, paymentDate: -1 });
// PaymentSchema.index({ isDeleted: 1 });

PaymentSchema.plugin(auditLogPlugin);

export const Payment: Model<IPaymentDoc> =
  models.Payment || model<IPaymentDoc>("Payment", PaymentSchema);
