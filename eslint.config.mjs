import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores(["dist/**", "node_modules/**", "coverage/**", "jest.config.js"]),
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.eslint.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "off",
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[property.name='_id']",
          message:
            "'_id' est un détail Mongo, interdit hors de src/infrastructure. Utilisez 'id'.",
        },
        {
          selector: "Literal[value='_id']",
          message:
            "'_id' est un détail Mongo, interdit hors de src/infrastructure. Utilisez 'id'.",
        },
        {
          selector: "Property[key.name='_id']",
          message:
            "'_id' est un détail Mongo, interdit hors de src/infrastructure. Utilisez 'id'.",
        },
      ],
    },
  },
  {
    files: [
      "src/infrastructure/**/*.ts",
      "__tests__/infrastructure/**/*.ts",
      "scripts/**/*.ts",
    ],
    rules: {
      "no-restricted-syntax": "off",
    },
  }
);
