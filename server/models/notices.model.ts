import {
  INotice,
  NoticeAudience,
  NoticePriority,
  NoticeType,
} from "@/validations";
import { model, Model, models, Schema } from "mongoose";

const NoticeSchema = new Schema<INotice & Document>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    type: {
      type: String,
      enum: Object.values(NoticeType),
      required: true,
    },
    priority: {
      type: String,
      enum: Object.values(NoticePriority),
      default: NoticePriority.MEDIUM,
    },
    audience: {
      type: String,
      enum: Object.values(NoticeAudience),
      default: NoticeAudience.ALL,
    },

    targetClasses: [{ type: String }],
    targetBranches: [{ type: String }],

    publishedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    publisherName: { type: String, required: true },
    publisherRole: { type: String, required: true },
    publisherAvatar: { type: String },

    attachments: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, required: true },
      },
    ],

    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    expiresAt: { type: Date },

    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
NoticeSchema.index({ isPublished: 1, publishedAt: -1 });
NoticeSchema.index({ audience: 1, isPublished: 1 });
NoticeSchema.index({ type: 1, isPublished: 1 });
NoticeSchema.index({ isPinned: 1, publishedAt: -1 });
NoticeSchema.index({ expiresAt: 1 });

export const Notice: Model<INotice & Document> =
  models.Notice || model<INotice & Document>("Notice", NoticeSchema);
