import bcrypt from "bcrypt";
import crypto from "crypto";
import { Model, Schema, model } from "mongoose";
import type { IAdmin } from "../interfaces";
import { models } from "mongoose";

const AdminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    address: { type: String },
    designation: { type: String },
    join_date: { type: Date, default: Date.now },
    is_active: { type: Boolean, default: true },
    role: { type: String, enum: ["admin", "super_admin"], default: "admin" },
    is_blocked: { type: Boolean, default: false },
    blockedAt: { type: Date },

    refresh: { type: String },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpireDate: { type: Date, default: null },
  },
  { timestamps: true }
);

AdminSchema.methods.generateResetPasswordToken = function (expMinutes = 30) {
  let resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the token and save it in the database
  resetToken = this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set token expiration
  this.resetPasswordExpireDate = Date.now() + expMinutes * 60 * 1000; // default 30 minutes

  return resetToken;
};

// Match user entered password to hashed password in database
AdminSchema.methods.matchPassword = async function (assword: string) {
  return bcrypt.compare(assword, this.password);
};

// Hash password
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    // If password is not modified, skip hashing
    next();
  }

  if (!this.password) {
    return next(new Error("Password is required"));
  }

  // Use bcrypt to hash the password
  const salt = await bcrypt.genSalt(10); // Adjust salt rounds as needed
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Fix: Reuse model if already exists
export const Admin: Model<IAdmin> =
  models.Admin || model<IAdmin>("Admin", AdminSchema);
