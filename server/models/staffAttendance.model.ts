import { AttendanceStatus, IStaffAttendance } from "@/validations";
import { model, Model, models, Schema } from "mongoose";

// Staff Attendance Model
const StaffAttendanceSchema = new Schema<IStaffAttendance & Document>(
  {
    staffId: { type: Schema.Types.ObjectId, ref: "Staff", required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(AttendanceStatus),
      required: true,
    },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    remarks: { type: String },
    markedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

StaffAttendanceSchema.index({ staffId: 1, date: -1 });

export const StaffAttendance: Model<IStaffAttendance & Document> =
  models.StaffAttendance ||
  model<IStaffAttendance & Document>("StaffAttendance", StaffAttendanceSchema);
