import { Model, model, models, Schema } from "mongoose";
import { auditLogPlugin } from "@/modules/shared/audit-log/plugin";
import { baseFields } from "@/modules/shared/base-schema";
import { Branch, PaymentMethod } from "@/validations";

export type SalaryStatus = "pending" | "paid";

interface ISalaryDoc {
  receiptNumber: string | null;
  staffId: Schema.Types.ObjectId;
  branch: Branch;
  periodYear: number;
  periodMonth: number; // 1–12
  baseSalary: number;  // paisa
  bonus: number;       // paisa
  deduction: number;   // paisa
  netSalary: number;   // paisa = baseSalary + bonus - deduction
  status: SalaryStatus;
  paymentDate: Date | null;
  paymentMethod: PaymentMethod | null;
  paidBy: Schema.Types.ObjectId | null;
  notes?: string;
  // base fields
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: Schema.Types.ObjectId | null;
  deleteReason: string | null;
  createdBy: Schema.Types.ObjectId;
  updatedBy: Schema.Types.ObjectId;
}

const SalaryV5Schema = new Schema<ISalaryDoc>(
  {
    receiptNumber: { type: String, default: null, unique: true, sparse: true },
    staffId: { type: Schema.Types.ObjectId, ref: "Staff", required: true, index: true },
    branch: { type: String, enum: Object.values(Branch), required: true },
    periodYear: { type: Number, required: true },
    periodMonth: { type: Number, required: true, min: 1, max: 12 },
    baseSalary: { type: Number, required: true, min: 0 },
    bonus: { type: Number, default: 0, min: 0 },
    deduction: { type: Number, default: 0, min: 0 },
    netSalary: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["pending", "paid"], default: "pending" },
    paymentDate: { type: Date, default: null },
    paymentMethod: { type: String, enum: Object.values(PaymentMethod), default: null },
    paidBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    notes: { type: String },
    ...baseFields,
  },
  { timestamps: true },
);

// One pending+paid record per staff per period per branch
SalaryV5Schema.index(
  { staffId: 1, periodYear: 1, periodMonth: 1, branch: 1 },
  // { unique: true, partialFilterExpression: { isDeleted: false } },
);
SalaryV5Schema.index({ status: 1, periodYear: 1, periodMonth: 1 });
SalaryV5Schema.index({ branch: 1, status: 1 });
// SalaryV5Schema.index({ isDeleted: 1 });

SalaryV5Schema.plugin(auditLogPlugin);

export const SalaryV5: Model<ISalaryDoc> =
  models.SalaryV5 || model<ISalaryDoc>("SalaryV5", SalaryV5Schema);
