import wideband from "eslint-plugin-wideband";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: [ "**/*.ts", "**/*.js" ],
    languageOptions: { parser: tsParser, },
    plugins: { wideband, },
    rules:
    {
      "wideband/arrays-brackets-spacing": "error",
      "wideband/functions-declarations-spacing": "error",
      "wideband/functions-calls-spacing": "error",
      "wideband/expressions-operators-spacing": "error",
    },
  },
];
