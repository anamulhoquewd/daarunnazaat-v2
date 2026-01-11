import { Branch, ISalaryPayment, PaymentMethod } from "@/validations";
import { Model, model, models, Schema } from "mongoose";

// Salary Payment Model
const SalaryPaymentSchema = new Schema<ISalaryPayment & Document>(
  {
    receiptNumber: { type: String, required: true, unique: true },
    staffId: { type: Schema.Types.ObjectId, ref: "Staff", required: true },
    branch: { type: String, enum: Object.values(Branch), required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2000 },
    basicSalary: { type: Number, required: true, min: 0 },
    bonus: { type: Number, default: 0, min: 0 },
    netSalary: {
      type: Number,
      required: true,
      min: 0,
      // immutable: true,
    },
    status: {
      type: String,
      enum: ["paid", "reversed", "adjusted"],
      default: "paid",
    },
    paymentDate: { type: Date, default: Date.now },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    paidBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    remarks: { type: String },
  },
  { timestamps: true }
);

SalaryPaymentSchema.index({ staffId: 1, month: 1, year: 1 }, { unique: true });

SalaryPaymentSchema.pre("validate", function (next) {
  const doc = this as any;

  const basicSalary = doc.basicSalary || 0;
  const bonus = doc.bonus || 0;

  doc.netSalary = basicSalary + bonus;

  next();
});

export const SalaryPayment: Model<ISalaryPayment & Document> =
  models.SalaryPayment ||
  model<ISalaryPayment & Document>("SalaryPayment", SalaryPaymentSchema);
