import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactHooks from "eslint-plugin-react-hooks";

const eslintConfig = defineConfig([
  // 1. Global Ignores
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },

  // 2. Base Next.js and TypeScript Configs
  ...nextVitals,
  ...nextTs,

  // 3. Your Custom Rules & Hooks Configuration
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      // Hooks Rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Other High-Utility Rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "react/prop-types": "off",
      "react/self-closing-comp": "error",
    },
  },
]);

export default eslintConfig;
