import { Model, Schema, model, models } from "mongoose";
import type { IPayment } from "../interfaces";

const PaymentSchema = new Schema<IPayment>(
  {
    student_id: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    admin_id: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    amount: { type: Number, required: true, min: 0 },
    month: {
      type: String,
      enum: [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ],
      required: true,
    },
    year: { type: Number, required: true },
    paid_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ✅ Fix: Reuse model if already exists
export const Payment: Model<IPayment> =
  models.Payment || model<IPayment>("Payment", PaymentSchema);
