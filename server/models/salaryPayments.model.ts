import { Branch, ISalaryPayment, PaymentMethod } from "@/validations";
import { Model, model, models, Schema } from "mongoose";

// Salary Payment Model
const SalarySchema = new Schema<ISalaryPayment & Document>(
  {
    receiptNumber: { type: String, required: true, unique: true },
    staffId: { type: Schema.Types.ObjectId, ref: "Staff", required: true },
    branch: { type: String, enum: Object.values(Branch), required: true },
    period: { type: String, required: true }, // e.g. "2020-03", "2020-12", etc.
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

    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true },
);

SalarySchema.index({ staffId: 1, period: 1 }, { unique: true });

SalarySchema.pre("validate", function (next) {
  const doc = this as any;

  const basicSalary = Number(doc.basicSalary) || 0;
  const bonus = Number(doc.bonus) || 0;

  const netSalary = basicSalary + bonus;

  if (Number.isNaN(netSalary)) {
    return next(new Error("Invalid salary calculation"));
  }

  doc.netSalary = netSalary;
  next();
});

export const Salary: Model<ISalaryPayment & Document> =
  models.Salary || model<ISalaryPayment & Document>("Salary", SalarySchema);
