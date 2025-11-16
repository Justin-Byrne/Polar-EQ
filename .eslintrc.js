// .eslintrc.js
module.exports =
{
  parser: "@typescript-eslint/parser", // works for JS/TS
  plugins: [ "styleguide" ],
  extends:
  [
    // your existing configs...
    "plugin:styleguide:recommended"
  ],
  rules:
  {
    // tweak severity or disable any:
    "styleguide/arrays-brackets-spacing": "error",
    "styleguide/functions-declarations-spacing": "error",
    "styleguide/functions-calls-spacing": "error",
    "styleguide/expressions-operators-spacing": "error"
  }
};
