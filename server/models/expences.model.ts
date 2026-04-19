import {
  Branch,
  ExpenseCategory,
  IExpense,
  PaymentMethod,
} from "@/validations";
import { model, Model, models, Schema } from "mongoose";
import { ImageSchema } from "./blogs.model";

const paidToSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
  },
  { _id: false }, // extra _id avoid করতে
);

const itemSchema = new Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, required: true },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
});

// Expense Model
const ExpenseSchema = new Schema<IExpense & Document>(
  {
    voucherNumber: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: Object.values(ExpenseCategory),
      required: true,
    },
    items: { type: [itemSchema], default: undefined },
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    expenseDate: { type: Date, default: Date.now },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    branch: { type: [String], enum: Object.values(Branch), required: true },
    paidTo: paidToSchema,
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    remarks: { type: String },
    attachments: { type: [ImageSchema] },

    isDeleted: { type: Boolean, default: false },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

ExpenseSchema.index({ category: 1, expenseDate: -1 });


export const Expense: Model<IExpense & Document> =
  models.Expense || model<IExpense & Document>("Expense", ExpenseSchema);
