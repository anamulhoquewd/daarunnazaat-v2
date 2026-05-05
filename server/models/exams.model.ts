import { ExamCategory, ExamStatus, IExam } from "@/validations";
import { model, Model, models, Schema } from "mongoose";

const ExamSchema = new Schema<IExam & Document>(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: Object.values(ExamCategory),
      required: true,
    },
    academicYear: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    schedule: [
      {
        classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
        subjectId: {
          type: Schema.Types.ObjectId,
          ref: "Subject",
          required: true,
        },
        date: { type: Date, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        room: { type: String },
      },
    ],
    classFees: [
      {
        classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
        fee: { type: Number, required: true, min: 0 },
      },
    ],
    applicableClasses: [{ type: Schema.Types.ObjectId, ref: "Class" }],
    subjectsByClass: [
      {
        classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
        subjects: [
          {
            subjectId: {
              type: Schema.Types.ObjectId,
              ref: "Subject",
              required: true,
            },
            fullMarks: { type: Number, required: true, min: 1 },
            passMarks: { type: Number, required: true, min: 0 },
          },
        ],
      },
    ],
    status: {
      type: String,
      enum: Object.values(ExamStatus),
      default: ExamStatus.DRAFT,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

ExamSchema.index({ academicYear: 1, type: 1 });
ExamSchema.index({ status: 1 });

export const Exam: Model<IExam & Document> =
  models.Exam || model<IExam & Document>("Exam", ExamSchema);
