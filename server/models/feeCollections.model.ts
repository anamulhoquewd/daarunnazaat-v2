import {
  Branch,
  FeeType,
  IFeeCollection,
  PaymentMethod,
  PaymentSource,
  PaymentStatus,
  UserRole,
} from "@/validations";
import { model, Model, models, Schema } from "mongoose";

// Fee Collection Model
const FeeCollectionSchema = new Schema<IFeeCollection & Document>(
  {
    receiptNumber: { type: String, required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
    branch: { type: String, enum: Object.values(Branch), required: true },
    month: { type: Number, min: 1, max: 12 },
    year: { type: Number, min: 2000, required: true },
    feeType: { type: String, enum: Object.values(FeeType), required: true },
    amount: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    paidAmount: { type: Number, required: true, min: 0 },
    dueAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    paymentDate: { type: Date, default: Date.now },
    collectedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Staff who collected
    paymentSource: {
      type: String,
      enum: Object.values(PaymentSource),
      required: true,
    },
    remarks: { type: String },
  },
  { timestamps: true }
);

FeeCollectionSchema.index(
  { studentId: 1, sessionId: 1, feeType: 1 },
  {
    unique: true,
    partialFilterExpression: { feeType: "ADMISSION" },
  }
);

FeeCollectionSchema.index(
  { studentId: 1, sessionId: 1, feeType: 1, month: 1, year: 1 },
  {
    unique: true,
    partialFilterExpression: { feeType: "MONTHLY" },
  }
);

FeeCollectionSchema.index({ studentId: 1, month: 1, year: 1 });
FeeCollectionSchema.index({ paymentDate: -1 }); // -1 = descending order

FeeCollectionSchema.pre("validate", function (next) {
  const payable = this.amount - (this.discount || 0);

  this.dueAmount = Math.max(payable - this.paidAmount, 0);

  this.paymentStatus =
    this.dueAmount === 0 ? PaymentStatus.PAID : PaymentStatus.PARTIAL;

  next();
});

export const FeeCollection: Model<IFeeCollection & Document> =
  models.FeeCollection ||
  model<IFeeCollection & Document>("FeeCollection", FeeCollectionSchema);
