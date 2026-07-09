module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"],
  // Le run par défaut n'exécute que les tests unitaires rapides. Les tests
  // d'intégration Mongo (__tests__/repositories) passent par `npm run
  // test:integration`.
  testPathIgnorePatterns: ["/node_modules/", "/__tests__/repositories/"],
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
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^types/(.*)$": "<rootDir>/types/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testTimeout: 10000,
};
