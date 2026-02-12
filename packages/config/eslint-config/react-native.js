/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "./base.js",
  ],
  env: {
    "react-native/react-native": true,
  },
  plugins: ["react-native"],
  rules: {
    "react-native/no-unused-styles": "warn",
    "react-native/no-inline-styles": "warn",
  },
};
