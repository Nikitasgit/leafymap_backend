import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../models/User";

async function createAdmin() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!mongoUri) throw new Error("MONGODB_URI is not defined");
  if (!email) throw new Error("ADMIN_EMAIL is not defined");
  if (!password) throw new Error("ADMIN_PASSWORD is not defined");

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    existingUser.role = "admin";
    existingUser.emailVerified = true;
    existingUser.deleted = false;
    await existingUser.save();
    console.log(`Promoted existing user ${email} to admin`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    email,
    password: hashedPassword,
    role: "admin",
    userType: "guest",
    acceptedCGU: true,
    acceptedAt: new Date(),
    emailVerified: true,
    deleted: false,
  });

  console.log(`Created admin user ${email}`);
}

createAdmin()
  .catch((error) => {
    console.error("Create admin failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
