import { AttendanceStatus, IAttendance } from "@/validations";
import { model, Model, models, Schema } from "mongoose";

// Attendance Model
const AttendanceSchema = new Schema<IAttendance & Document>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(AttendanceStatus),
      required: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },

    remarks: { type: String },
    markedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

AttendanceSchema.index({ studentId: 1, date: -1 });
AttendanceSchema.index({ classId: 1, date: -1 });

export const Attendance: Model<IAttendance & Document> =
  models.Attendance ||
  model<IAttendance & Document>("Attendance", AttendanceSchema);
