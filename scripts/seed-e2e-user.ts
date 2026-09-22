import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../src/infrastructure/persistence/schemas/User.schema";

const isLocalMongoUri = (uri: string): boolean =>
  /localhost|127\.0\.0\.1|\/\/mongo[:/]/.test(uri);

async function seedE2eUser() {
  const mongoUri = process.env.E2E_MONGODB_URI;
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;
  const username = process.env.E2E_USER_USERNAME;

  if (!mongoUri || !email || !password || !username) {
    throw new Error(
      "E2E_MONGODB_URI, E2E_USER_EMAIL, E2E_USER_PASSWORD, and E2E_USER_USERNAME must be set"
    );
  }

  if (!isLocalMongoUri(mongoUri)) {
    throw new Error(
      "seed:e2e-user only targets local MongoDB (docker-compose). Set E2E_MONGODB_URI=mongodb://localhost:27017/leafymap"
    );
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");

  const hashedPassword = await bcrypt.hash(password, 10);
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    existingUser.password = hashedPassword;
    existingUser.username = username;
    existingUser.role = "user";
    existingUser.userType = "guest";
    existingUser.emailVerified = true;
    existingUser.acceptedAt = existingUser.acceptedAt ?? new Date();
    existingUser.deleted = false;
    existingUser.bannedAt = undefined;
    existingUser.banReason = undefined;
    existingUser.banExpiresAt = undefined;
    await existingUser.save();
    console.log(`Updated e2e user ${email}`);
    return;
  }

  await User.create({
    email,
    username,
    password: hashedPassword,
    role: "user",
    userType: "guest",
    acceptedAt: new Date(),
    emailVerified: true,
    deleted: false,
    followers: 0,
  });

  console.log(`Created e2e user ${email}`);
}

seedE2eUser()
  .catch((error) => {
    console.error("Seed e2e user failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
