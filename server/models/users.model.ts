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
    role: { type: String, enum: Object.values(UserRole), required: true },
    profile: {
      type: Schema.Types.ObjectId,
      refPath: "profileModel",
      default: null,
    },
    profileModel: {
      type: String,
      enum: ["Student", "Staff", "Guardian"],
      default: null,
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockedAt: {
      type: Date,
      default: null,
    },
    refreshTokens: [{ type: String, required: false }],
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

UserSchema.methods.generateResetPasswordToken = function (expMinutes = 30) {
  // 1. Generate plain token
  const plainToken = crypto.randomBytes(32).toString("hex");

  // 2. Hash token & store in DB
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(plainToken)
    .digest("hex");

  // 3. Expiration time
  this.passwordResetExpires = new Date(Date.now() + expMinutes * 60 * 1000);

  // 4. Return plain token (email-এ যাবে)
  return plainToken;
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
