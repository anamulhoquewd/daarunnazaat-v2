import { ExamType, IExam } from "@/validations";
import { model, Model, models, Schema } from "mongoose";

// Exam Model
const ExamSchema = new Schema<IExam & Document>(
  {
    examName: { type: String, required: true },
    examType: { type: String, enum: Object.values(ExamType), required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
    examDate: { type: Date, required: true },
    totalMarks: { type: Number, required: true, min: 0 },
    passingMarks: { type: Number, required: true, min: 0 },
    subjects: [
      {
        subjectName: { type: String, required: true },
        marks: { type: Number, required: true, min: 0 },
      },
    ],
  },
  { timestamps: true }
);

ExamSchema.index({ classId: 1, sessionId: 1, examDate: -1 });

export const Exam: Model<IExam & Document> =
  models.Exam || model<IExam & Document>("Exam", ExamSchema);
