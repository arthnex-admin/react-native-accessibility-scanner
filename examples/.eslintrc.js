// .eslintrc.js for a React Native project using the accessibility scanner plugin

module.exports = {
  root: true,
  extends: [
    "@react-native",
    // Optionally use the recommended config from the plugin:
    // "plugin:react-native-accessibility-scanner/recommended",
  ],
  plugins: [
    "react-native-accessibility-scanner",
  ],
  rules: {
    // 🔴 ERROR — missing label blocks screen reader access entirely
    "react-native-accessibility-scanner/missing-label": "error",

    // 🟡 WARN — missing role reduces context for screen reader users
    "react-native-accessibility-scanner/missing-role": "warn",

    // 🟡 WARN — small touch targets hurt users with motor impairments
    "react-native-accessibility-scanner/small-touch-target": [
      "warn",
      {
        minWidth: 44,
        minHeight: 44,
      },
    ],
  },
};
