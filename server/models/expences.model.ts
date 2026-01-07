import {
  Branch,
  ExpenseCategory,
  IExpense,
  PaymentMethod,
} from "@/validations";
import { model, Model, models, Schema } from "mongoose";
import { ImageSchema } from "./blogs.model";

// TODO voucher number ki vabe generate hobe?
// Expense Model
const ExpenseSchema = new Schema<IExpense & Document>(
  {
    voucherNumber: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: Object.values(ExpenseCategory),
      required: true,
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    expenseDate: { type: Date, default: Date.now },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    branch: { type: String, enum: Object.values(Branch), required: true },
    paidTo: { type: String },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    remarks: { type: String },
    attachments: [{ type: ImageSchema }],
  },
  { timestamps: true }
);

ExpenseSchema.index({ category: 1, expenseDate: -1 });

export const Expense: Model<IExpense & Document> =
  models.Expense || model<IExpense & Document>("Expense", ExpenseSchema);
