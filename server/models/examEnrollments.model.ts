import { ExamFeeStatus, IExamEnrollment, PaymentMethod } from "@/validations";
import { model, Model, models, Schema } from "mongoose";

const ExamEnrollmentSchema = new Schema<IExamEnrollment & Document>(
  {
    examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    feeAmount: { type: Number, required: true, min: 0 },
    feePaid: { type: Number, default: 0, min: 0 },
    feeStatus: {
      type: String,
      enum: Object.values(ExamFeeStatus),
      default: ExamFeeStatus.UNPAID,
    },
    paymentHistory: [
      {
        amount: { type: Number, required: true, min: 0 },
        date: { type: Date, required: true },
        method: {
          type: String,
          enum: Object.values(PaymentMethod),
          required: true,
        },
        note: { type: String },
        receivedBy: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
    enrolledAt: { type: Date, default: () => new Date() },
    enrolledBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// Auto-derive feeStatus before every save
ExamEnrollmentSchema.pre("save", function (next) {
  if (this.feePaid <= 0) {
    (this as any).feeStatus = ExamFeeStatus.UNPAID;
  } else if (this.feePaid >= this.feeAmount) {
    (this as any).feeStatus = ExamFeeStatus.PAID;
  } else {
    (this as any).feeStatus = ExamFeeStatus.PARTIAL;
  }
  next();
});

ExamEnrollmentSchema.index({ examId: 1, studentId: 1 }, { unique: true });
ExamEnrollmentSchema.index({ examId: 1, classId: 1 });
ExamEnrollmentSchema.index({ studentId: 1 });

export const ExamEnrollment: Model<IExamEnrollment & Document> =
  models.ExamEnrollment ||
  model<IExamEnrollment & Document>("ExamEnrollment", ExamEnrollmentSchema);
