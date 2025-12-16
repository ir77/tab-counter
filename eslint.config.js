import js from "@eslint/js";
import tseslint from "typescript-eslint";
import vitest from "eslint-plugin-vitest";

export default tseslint.config(
  {
    ignores: ["dist", "reports", "node_modules"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        sourceType: "module",
      },
    },
    rules: {
      "no-console": "warn",
    },
  },
  {
    files: [
      "src/**/*_test.ts",
      "src/**/*.test.ts",
      "src/**/*.spec.ts",
    ],
    plugins: {
      vitest,
    },
    rules: {
      "vitest/no-disabled-tests": "warn",
      "vitest/no-focused-tests": "error",
    },
    languageOptions: {
      globals: vitest.environments.env.globals,
    },
  },
);
