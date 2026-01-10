import { IResult } from "@/validations";
import { model, Model, models, Schema } from "mongoose";

// Result Model
const ResultSchema = new Schema<IResult & Document>(
  {
    examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    marks: [
      {
        subjectName: { type: String, required: true },
        obtainedMarks: { type: Number, required: true, min: 0 },
        totalMarks: { type: Number, required: true, min: 0 },
      },
    ],
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },

    totalMarks: { type: Number, required: true, min: 0 },
    obtainedMarks: { type: Number, required: true, min: 0 },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    grade: { type: String },
    position: { type: Number },
    remarks: { type: String },
  },
  { timestamps: true }
);

ResultSchema.index({ examId: 1, studentId: 1 });

export const Result: Model<IResult & Document> =
  models.Result || model<IResult & Document>("Result", ResultSchema);
