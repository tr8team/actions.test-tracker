module.exports = {
  env: {
    browser: false,
    es2021: true,
  },
  extends: [
    "plugin:github/recommended",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  overrides: [],
  ignorePatterns: ["**/*.spec.ts"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 9,
    sourceType: "module",
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "i18n-text/no-en": "off",
    "eslint-comments/no-use": "off",
    "import/no-namespace": "off",
  },
};
