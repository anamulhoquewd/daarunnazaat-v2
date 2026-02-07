import {
  Branch,
  FeeType,
  IFeeCollection,
  PaymentMethod,
  PaymentSource,
  PaymentStatus,
} from "@/validations";
import { model, Model, models, Schema } from "mongoose";

// Fee Collection Model
const FeeCollectionSchema = new Schema<IFeeCollection & Document>(
  {
    receiptNumber: { type: String, unique: true },

    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
    branch: { type: String, enum: Object.values(Branch), required: true },

    feeType: { type: String, enum: Object.values(FeeType), required: true },
    month: { type: Number, min: 0, max: 11 },
    year: { type: Number, min: 2000 },

    baseAmount: { type: Number, required: true },
    payableAmount: { type: Number, required: true },
    receivedAmount: { type: Number, required: true },

    dueAmount: { type: Number, default: 0 },
    advanceAmount: { type: Number, default: 0 },

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
    paymentSource: {
      type: String,
      enum: Object.values(PaymentSource),
      required: true,
    },

    paymentDate: { type: Date, default: Date.now },
    remarks: String,

    collectedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },

    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true },
);

FeeCollectionSchema.index({ studentId: 1, month: 1, year: 1 });
FeeCollectionSchema.index({ paymentDate: -1 }); // -1 = descending order

FeeCollectionSchema.index(
  {
    studentId: 1,
    sessionId: 1,
    feeType: 1,
    month: 1,
    year: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
      month: { $exists: true },
      year: { $exists: true },
    },
  },
);

export const FeeCollection: Model<IFeeCollection & Document> =
  models.FeeCollection ||
  model<IFeeCollection & Document>("FeeCollection", FeeCollectionSchema);
