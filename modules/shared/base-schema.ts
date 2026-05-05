import { Schema } from "mongoose";

/**
 * Common fields for all v5 Mongoose schemas.
 * Spread into your schema definition before passing to `new Schema(...)`.
 *
 * Usage:
 *   const MySchema = new Schema({ ...myFields, ...baseFields }, { timestamps: true });
 */
export const baseFields = {
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date, default: null },
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  deleteReason: { type: String, default: null },

  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
} as const;
