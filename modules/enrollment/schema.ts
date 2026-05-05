import { Model, model, models, Schema } from "mongoose";
import { auditLogPlugin } from "@/modules/shared/audit-log/plugin";
import { baseFields } from "@/modules/shared/base-schema";
import { Branch, EnrollmentStatus } from "@/validations";

interface IEnrollmentDoc {
  studentId: Schema.Types.ObjectId;
  sessionId: Schema.Types.ObjectId;
  classId: Schema.Types.ObjectId;
  branch: Branch;
  enrollmentDate: Date;
  completionDate: Date | null;
  status: EnrollmentStatus;
  promotionMeta?: {
    fromClassId?: Schema.Types.ObjectId;
    toClassId?: Schema.Types.ObjectId;
    promotedAt?: Date;
    promotedBy?: Schema.Types.ObjectId;
  };
  // base fields
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: Schema.Types.ObjectId | null;
  deleteReason: string | null;
  createdBy: Schema.Types.ObjectId;
  updatedBy: Schema.Types.ObjectId;
}

const EnrollmentSchema = new Schema<IEnrollmentDoc>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    branch: { type: String, enum: Object.values(Branch), required: true },
    enrollmentDate: { type: Date, required: true, default: Date.now },
    completionDate: { type: Date, default: null },
    status: {
      type: String,
      enum: Object.values(EnrollmentStatus),
      default: EnrollmentStatus.ONGOING,
    },
    promotionMeta: {
      fromClassId: { type: Schema.Types.ObjectId, ref: "Class" },
      toClassId: { type: Schema.Types.ObjectId, ref: "Class" },
      promotedAt: { type: Date },
      promotedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    ...baseFields,
  },
  { timestamps: true },
);

EnrollmentSchema.index({ studentId: 1, status: 1 });
EnrollmentSchema.index({ sessionId: 1, classId: 1, status: 1 });
// EnrollmentSchema.index({ isDeleted: 1 });

EnrollmentSchema.plugin(auditLogPlugin);

export const Enrollment: Model<IEnrollmentDoc> =
  models.Enrollment || model<IEnrollmentDoc>("Enrollment", EnrollmentSchema);
