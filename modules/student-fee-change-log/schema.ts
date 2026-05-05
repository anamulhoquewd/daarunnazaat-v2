import { Model, model, models, Schema } from "mongoose";

interface IFeeChangeLogDoc {
  studentId: Schema.Types.ObjectId;
  feeType: string;
  oldAmount: number; // paisa
  newAmount: number; // paisa
  effectiveFrom: Date;
  reason: string;
  changedBy: Schema.Types.ObjectId;
  createdAt: Date;
}

const FeeChangeLogSchema = new Schema<IFeeChangeLogDoc>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    feeType: { type: String, required: true },
    oldAmount: { type: Number, required: true, min: 0 },
    newAmount: { type: Number, required: true, min: 0 },
    effectiveFrom: { type: Date, required: true },
    reason: { type: String, required: true, minlength: 5 },
    changedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

FeeChangeLogSchema.index({ studentId: 1, createdAt: -1 });

export const StudentFeeChangeLog: Model<IFeeChangeLogDoc> =
  models.StudentFeeChangeLog ||
  model<IFeeChangeLogDoc>("StudentFeeChangeLog", FeeChangeLogSchema);
