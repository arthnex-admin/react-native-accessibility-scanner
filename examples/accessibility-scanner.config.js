// accessibility-scanner.config.js
// Place this file in the root of your React Native project.

module.exports = {
  // Path(s) to scan — string or array
  path: "./src",

  // Glob patterns to skip
  ignore: [
    "**/*.stories.tsx",
    "**/*.stories.ts",
    "**/*.test.tsx",
    "**/*.test.ts",
    "**/node_modules/**",
    "**/__mocks__/**",
  ],

  // Exit with code 1 if HIGH issues found (useful for CI)
  failOnHigh: true,

  // Exit with code 1 if MEDIUM or higher issues found
  failOnMedium: false,

  // Platform touch target thresholds
  // iOS recommendation: 44×44pt
  // Android recommendation: 48×48dp
  touchTarget: {
    minWidth: 44,
    minHeight: 44,
  },

  // Disable specific rules if needed
  // Available rule IDs:
  //   missing-label
  //   missing-role
  //   small-touch-target
  //   duplicate-labels
  //   missing-hint
  //   touchable-without-label
  disabledRules: [],
};
