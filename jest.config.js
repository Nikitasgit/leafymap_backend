module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  collectCoverageFrom: [
    "actions/**/*.ts",
    "controllers/**/*.ts",
    "repositories/**/*.ts",
    "services/**/*.ts",
    "!**/*.d.ts",
    "!**/__tests__/**",
    "!**/node_modules/**",
  ],
  moduleFileExtensions: ["ts", "js", "json"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testTimeout: 10000,
};
