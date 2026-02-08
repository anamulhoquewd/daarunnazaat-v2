import { Branch, ITransactionLog, TransactionType } from "@/validations";
import { model, Model, models, Schema } from "mongoose";

// Transaction Log Model
const TransactionLogSchema = new Schema<ITransactionLog & Document>(
  {
    transactionType: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "referenceModel",
    },
    referenceModel: {
      type: String,
      enum: ["FeeCollection", "SalaryPayment", "Expense"],
      required: true,
    },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    branch: { type: String, enum: Object.values(Branch), required: true },

    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true },
);

TransactionLogSchema.index({ transactionType: 1, createdAt: -1 });
TransactionLogSchema.index({ referenceId: 1, referenceModel: 1 });

export const TransactionLog: Model<ITransactionLog & Document> =
  models.TransactionLog ||
  model<ITransactionLog & Document>("TransactionLog", TransactionLogSchema);
