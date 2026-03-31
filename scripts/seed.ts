import { User } from "@/server/models/users.model";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { toast } from "sonner";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const registerSuperAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI!);
    console.log("MongoDB connected for seed.");

    // Check if super admin already exists
    const existing = await User.findOne({ roles: "super_admin" });
    if (existing) {
      console.log("Super admin already exists. Seed skipped.");
      return process.exit(0);
    }

    // Create super admin
    const user = new User({
      email: process.env.ADMIN_EMAIL,
      phone: process.env.ADMIN_PHONE,
      password: process.env.ADMIN_PASSWORD,
      roles: ["super_admin"],
    });

    await user.save();
    toast.success("Super admin created successfully!");
    process.exit(0);
  } catch (err: any) {
    console.error("Seed error:", err);
    toast.error("Failed to create super admin.");
    process.exit(1);
  }
};

// Run seed
registerSuperAdmin();
