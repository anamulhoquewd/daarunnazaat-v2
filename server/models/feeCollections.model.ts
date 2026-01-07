import {
  FeeType,
  IFeeCollection,
  PaymentMethod,
  PaymentStatus,
  UserRole,
} from "@/validations";
import { model, Model, models, Schema } from "mongoose";

// TODO receipt number ta ki vabe generate hobe?
// Fee Collection Model
const FeeCollectionSchema = new Schema<IFeeCollection & Document>(
  {
    receiptNumber: { type: String, required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
    month: { type: Number, min: 1, max: 12 },
    year: { type: Number, min: 2000, required: true },
    feeType: { type: String, enum: Object.values(FeeType), required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    paidAmount: { type: Number, required: true, min: 0 },
    dueAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    paymentDate: { type: Date, default: Date.now },
    paidBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Who paid: student or guardian
    paidByRole: { type: String, enum: Object.values(UserRole), required: true }, // Role of payer
    collectedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Staff who collected
    remarks: { type: String },
  },
  { timestamps: true }
);

FeeCollectionSchema.index({ studentId: 1, month: 1, year: 1 });
FeeCollectionSchema.index({ paymentDate: -1 }); // TODO -1 mane ki?
FeeCollectionSchema.index({ paidBy: 1, paidByRole: 1 }); // Query payment history by payer

export const FeeCollection: Model<IFeeCollection & Document> =
  models.FeeCollection ||
  model<IFeeCollection & Document>("FeeCollection", FeeCollectionSchema);
