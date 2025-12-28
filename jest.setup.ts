// Setup file for Jest tests
// This file runs before each test file

import mongoose from "mongoose";

// Close MongoDB connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});
