import { BlogStatus, IBlog } from "@/validations";
import { Model, model, models, Schema } from "mongoose";

// Image Model (shearable)
export const ImageSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);
// Blog Model
const BlogSchema = new Schema<IBlog & Document>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String },
    featuredImage: { type: ImageSchema },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    publishedBy: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: Object.values(BlogStatus),
      default: BlogStatus.DRAFT,
    },
    tags: [{ type: String }],
    views: { type: Number, default: 0 },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

BlogSchema.index({ status: 1, publishedAt: -1 });
BlogSchema.index({ authorId: 1 });

export const Blog: Model<IBlog & Document> =
  models.Blog || model<IBlog & Document>("Blog", BlogSchema);
