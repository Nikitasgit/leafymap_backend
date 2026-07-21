module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"],
  // Default run: unit tests. Integration: `npm run test:integration`.
  testPathIgnorePatterns: [
    "/node_modules/",
    "/__tests__/.*/infrastructure/",
  ],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!**/*.d.ts",
    "!**/__tests__/**",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      statements: 32,
      branches: 27,
      lines: 33,
    },
  },
  moduleFileExtensions: ["ts", "js", "json"],
  moduleNameMapper: {
    "^@src/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testTimeout: 10000,
};
