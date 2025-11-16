import styleguide from "eslint-plugin-wideband";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: [ "**/*.ts", "**/*.js" ],
    languageOptions: { parser: tsParser, },
    plugins: { styleguide, },
    rules:
    {
      "styleguide/arrays-brackets-spacing": "error",
      "styleguide/functions-declarations-spacing": "error",
      "styleguide/functions-calls-spacing": "error",
      "styleguide/expressions-operators-spacing": "error",
    },
  },
];
