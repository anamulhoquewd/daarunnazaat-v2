import { BefaqGrade, IResult } from "@/validations";
import { model, Model, models, Schema } from "mongoose";

const ResultSchema = new Schema<IResult & Document>(
  {
    examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    subjectMarks: [
      {
        subjectId: {
          type: Schema.Types.ObjectId,
          ref: "Subject",
          required: true,
        },
        marksObtained: { type: Number, required: true, min: 0 },
        fullMarks: { type: Number, required: true, min: 1 },
        passMarks: { type: Number, required: true, min: 0 },
        isAbsent: { type: Boolean, default: false },
      },
    ],
    totalMarks: { type: Number, min: 0 },
    totalFullMarks: { type: Number, min: 0 },
    percentage: { type: Number, min: 0, max: 100 },
    grade: { type: String, enum: Object.values(BefaqGrade) },
    position: { type: Number, min: 1 },
    isPassed: { type: Boolean },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    enteredBy: { type: Schema.Types.ObjectId, ref: "User" },
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

ResultSchema.index({ examId: 1, studentId: 1 }, { unique: true });
ResultSchema.index({ examId: 1, classId: 1 });
ResultSchema.index({ studentId: 1, isPublished: 1 });

export const Result: Model<IResult & Document> =
  models.Result || model<IResult & Document>("Result", ResultSchema);
