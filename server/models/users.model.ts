import bcrypt from "bcrypt";
import crypto from "crypto";
import { Model, Schema, model, models } from "mongoose";
import { IUser, UserRole } from "@/validations";

// User Model
const UserSchema = new Schema<IUser & Document>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    password: { type: String, required: true, select: false },
    alternativePhone: { type: String },
    whatsApp: { type: String },
    role: { type: String, enum: Object.values(UserRole), required: true },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    refreshTokens: [{ type: String, required: false }],
    passwordResetToken: { type: String, select: false },
    ResetTokenExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

UserSchema.methods.generateResetPasswordToken = function (expMinutes = 30) {
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
UserSchema.methods.matchPassword = async function (assword: string) {
  return bcrypt.compare(assword, this.password);
};

// Hash password
UserSchema.pre("save", async function (next) {
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

UserSchema.index({ role: 1 });

export const User: Model<IUser & Document> =
  models.User || model<IUser & Document>("User", UserSchema);
