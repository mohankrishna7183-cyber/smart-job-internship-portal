import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/User.js";

dotenv.config();

const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!MONGODB_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error("Set MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD before seeding.");
}
if (ADMIN_PASSWORD.length < 12) {
  throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
}

try {
  await mongoose.connect(MONGODB_URI);
  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    console.log("An account already exists for ADMIN_EMAIL; no changes were made.");
  } else {
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin"
    });
    console.log("Administrator account created.");
  }
} catch (error) {
  console.error("Could not create administrator:", error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
