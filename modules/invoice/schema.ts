import { Model, model, models, Schema } from "mongoose";
import { auditLogPlugin } from "@/modules/shared/audit-log/plugin";
import { baseFields } from "@/modules/shared/base-schema";
import { Branch, InvoiceStatus } from "@/validations";

export type InvoiceType = "monthly" | "admission" | "exam_fee" | "other";

export interface ILineItem {
  feeType: string;
  label: string;
  amount: number;    // paisa — base amount
  discount: number;  // paisa — discount on this line (default 0)
  net: number;       // paisa — amount - discount
}

interface IInvoiceDoc {
  invoiceNumber: string;
  studentId: Schema.Types.ObjectId;
  sessionId: Schema.Types.ObjectId;
  branch: Branch;

  invoiceType: InvoiceType;
  periodYear: number | null;
  periodMonth: number | null; // 1–12 for monthly, null for one-off

  lineItems: ILineItem[];
  subtotal: number;         // paisa — sum(lineItems.amount)
  totalDiscount: number;    // paisa — sum(lineItems.discount)
  netPayable: number;       // paisa — subtotal - totalDiscount
  adjustmentAmount: number; // paisa — signed; negative = waiver/discount, positive = late fee

  paidAmount: number;  // paisa — accumulated from payments
  dueAmount: number;   // paisa — (netPayable + adjustmentAmount) - paidAmount; can be negative (credit)

  status: InvoiceStatus;
  isLocked: boolean;      // true after first payment; blocks lineItem edits

  dueDate?: Date;
  examId?: Schema.Types.ObjectId;

  voidedAt?: Date;
  voidReason?: string;
  voidedBy?: Schema.Types.ObjectId;

  // base fields
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: Schema.Types.ObjectId | null;
  deleteReason: string | null;
  createdBy: Schema.Types.ObjectId;
  updatedBy: Schema.Types.ObjectId;
}

const LineItemSchema = new Schema<ILineItem>(
  {
    feeType: { type: String, required: true },
    label: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    net: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const InvoiceSchema = new Schema<IInvoiceDoc>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
    branch: { type: String, enum: Object.values(Branch), required: true },

    invoiceType: {
      type: String,
      enum: ["monthly", "admission", "exam_fee", "other"],
      required: true,
    },
    periodYear: { type: Number, default: null },
    periodMonth: { type: Number, default: null, min: 1, max: 12 },

    lineItems: { type: [LineItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    totalDiscount: { type: Number, default: 0, min: 0 },
    netPayable: { type: Number, required: true, min: 0 },
    adjustmentAmount: { type: Number, default: 0 }, // signed — no min constraint

    paidAmount: { type: Number, default: 0, min: 0 },
    dueAmount: { type: Number, required: true }, // signed — no min (negative = credit)

    status: {
      type: String,
      enum: Object.values(InvoiceStatus),
      default: InvoiceStatus.UNPAID,
    },
    isLocked: { type: Boolean, default: false },

    dueDate: { type: Date },
    examId: { type: Schema.Types.ObjectId, ref: "Exam" },

    voidedAt: { type: Date },
    voidReason: { type: String },
    voidedBy: { type: Schema.Types.ObjectId, ref: "User" },

    ...baseFields,
  },
  { timestamps: true },
);

// Protect against duplicate monthly invoices per student
InvoiceSchema.index(
  { studentId: 1, periodYear: 1, periodMonth: 1, invoiceType: 1 },
  {
    unique: true,
    partialFilterExpression: {
      // isDeleted: false,
      periodMonth: { $ne: null },
    },
  },
);

InvoiceSchema.index({ studentId: 1, status: 1 });
InvoiceSchema.index({ sessionId: 1, periodYear: 1, periodMonth: 1 });
InvoiceSchema.index({ branch: 1, status: 1 });
// InvoiceSchema.index({ isDeleted: 1 });

InvoiceSchema.plugin(auditLogPlugin);

export const Invoice: Model<IInvoiceDoc> =
  models.Invoice || model<IInvoiceDoc>("Invoice", InvoiceSchema);
