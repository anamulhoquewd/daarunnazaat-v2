import { Branch, INotice, NoticeType, UserRole } from "@/validations";
import { model, Model, models, Schema } from "mongoose";
import { ImageSchema } from "./blogs.model";

// Notice Model
const NoticeSchema = new Schema<INotice & Document>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    noticeType: {
      type: String,
      enum: Object.values(NoticeType),
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    targetAudience: [{ type: String, enum: Object.values(UserRole) }],
    branch: [{ type: String, enum: Object.values(Branch) }],
    publishDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    attachments: [{ type: ImageSchema }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

NoticeSchema.index({ publishDate: -1, isActive: 1 });
NoticeSchema.index({ targetAudience: 1 });

export const Notice: Model<INotice & Document> =
  models.Notice || model<INotice & Document>("Notice", NoticeSchema);
