import { IAdvanceSalary, PaymentMethod } from "@/validations";
import { model, Model, models, Schema } from "mongoose";

// Advance Salary Model
const AdvanceSalarySchema = new Schema<IAdvanceSalary & Document>(
  {
    staffId: { type: Schema.Types.ObjectId, ref: "Staff", required: true },
    amount: { type: Number, required: true, min: 0 },
    requestDate: { type: Date, default: Date.now },
    approvalDate: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    paymentDate: { type: Date },
    paymentMethod: { type: String, enum: Object.values(PaymentMethod) },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "paid"],
      default: "pending",
    },
    adjustmentPlan: { type: String },
    remarks: { type: String },
  },
  { timestamps: true }
);

AdvanceSalarySchema.index({ staffId: 1, status: 1 });

export const AdvanceSalary: Model<IAdvanceSalary & Document> =
  models.AdvanceSalary ||
  model<IAdvanceSalary & Document>("AdvanceSalary", AdvanceSalarySchema);
