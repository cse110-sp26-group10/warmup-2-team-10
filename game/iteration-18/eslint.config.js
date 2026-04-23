// Structural logic: this config keeps formatting concerns out of ESLint, centralizes reusable quality rules
// in small helpers, and applies one browser-focused rule set across the project so the enforcement stays
// strict, DRY, and easy to extend as the slot machine grows.

import js from "@eslint/js";
import globals from "globals";

/**
 * Builds a readonly rule object from a plain rule map.
 *
 * @param {Record<string, import("eslint").Linter.RuleEntry>} rules
 *   Rule definitions keyed by ESLint rule name.
 * @returns {Readonly<Record<string, import("eslint").Linter.RuleEntry>>}
 *   Frozen rule configuration.
 */
function createRuleSet(rules) {
  return Object.freeze({ ...rules });
}

/**
 * Creates the shared JavaScript quality rule set for the project.
 *
 * @returns {Readonly<Record<string, import("eslint").Linter.RuleEntry>>}
 *   Flat quality-focused ESLint rules with no formatting ownership.
 */
function createQualityRules() {
  return createRuleSet({
    "array-callback-return": ["error", { checkForEach: true }],
    "consistent-return": "error",
    curly: ["error", "all"],
    eqeqeq: ["error", "always"],
    "no-alert": "error",
    "no-console": ["error", { allow: ["warn", "error"] }],
    "no-constant-binary-expression": "error",
    "no-else-return": ["error", { allowElseIf: false }],
    "no-implicit-coercion": "error",
    "no-lonely-if": "error",
    "no-nested-ternary": "error",
    "no-param-reassign": "error",
    "no-unneeded-ternary": "error",
    "object-shorthand": ["error", "always"],
    "prefer-const": "error"
  });
}

/**
 * Creates the shared language options for browser-based source files.
 *
 * @returns {import("eslint").Linter.LanguageOptions}
 *   ECMAScript language options with browser globals enabled.
 */
function createBrowserLanguageOptions() {
  return {
    ecmaVersion: "latest",
    sourceType: "module",
    globals: globals.browser
  };
}

/** @type {import("eslint").Linter.Config[]} */
const config = [
  {
    ignores: ["node_modules/**"]
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: createBrowserLanguageOptions(),
    rules: createQualityRules()
  }
];

export default config;
