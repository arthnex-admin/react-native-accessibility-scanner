# ♿ react-native-accessibility-scanner

> **Accessibility auditing for React Native apps.**

[![npm version](https://badge.fury.io/js/react-native-accessibility-scanner.svg)](https://www.npmjs.com/package/react-native-accessibility-scanner)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16-brightgreen)](https://nodejs.org)

A single tool that scans your React Native codebase for accessibility issues and generates actionable reports — before your users encounter them.

```
npx react-native-accessibility-scan ./src
```

```
═══════════════════════════════════════════════════════
   React Native Accessibility Scanner
═══════════════════════════════════════════════════════

📊 Summary
   Scanned : 12 files
   Issues  : 7 total
   ■ HIGH 2   ■ MEDIUM 3   ■ LOW 2

 HIGH   2 issues
────────────────────────────────────────────────────────────

  Missing accessibilityLabel
  src/screens/HomeScreen.tsx:43:5
  <TouchableOpacity> is interactive but has no accessibilityLabel
  Fix:  Add accessibilityLabel="Describe the action"

♿ Accessibility Readiness Score

   Overall       🟡 72/100  ████████████████░░░░
   ─────────────────────────────────────────────────
   Labels        🔴 40/100
   Roles         🟡 75/100
   Touch Targets 🟢 100/100
   Hints         🟢 94/100
```

---

## Why This Exists

React Native has no single dedicated accessibility linting tool. Existing solutions are either:

- **Web-focused** (not aware of RN-specific components like `Pressable`, `FlatList`, `Modal`)
- **Runtime-only** (can't catch issues at build time)
- **Fragmented** (separate tools for linting, reporting, CI)

This package gives you one unified tool with a CLI, ESLint plugin, GitHub Action, and programmatic API.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [CLI Reference](#cli-reference)
- [Rules](#rules)
- [Accessibility Score](#accessibility-score)
- [ESLint Plugin](#eslint-plugin)
- [GitHub Action](#github-action)
- [Programmatic API](#programmatic-api)
- [Config File](#config-file)
- [Writing Custom Rules](#writing-custom-rules)
- [Roadmap](#roadmap)

---

## Installation

```bash
# npm
npm install --save-dev react-native-accessibility-scanner

# yarn
yarn add --dev react-native-accessibility-scanner

# No install needed for one-off scans:
npx react-native-accessibility-scan ./src
```

---

## Quick Start

```bash
# Scan your src directory
npx react-native-accessibility-scan ./src

# Fail CI on high severity issues
npx react-native-accessibility-scan ./src --fail-on-high

# Output JSON report
npx react-native-accessibility-scan ./src --json > report.json

# Save Markdown report
npx react-native-accessibility-scan ./src --output accessibility-report.md
```

---

## CLI Reference

```
Usage: react-native-accessibility-scan [path] [options]

Arguments:
  path                    Path to scan (default: ./src)

Options:
  --json                  Output results as JSON to stdout
  --markdown              Output results as Markdown to stdout
  --output <file>         Write report to file (.json or .md)
  --fail-on-high          Exit 1 if HIGH severity issues found
  --fail-on-medium        Exit 1 if MEDIUM or higher issues found
  --ignore <patterns...>  Glob patterns to ignore
  --disable-rules <ids>   Rule IDs to disable
  --min-width <n>         Minimum touch target width (default: 44)
  --min-height <n>        Minimum touch target height (default: 44)
  --score                 Show accessibility score breakdown
  -V, --version           Output version number
  -h, --help              Display help
```

---

## Rules

| Rule ID                   | Severity  | Description                                                       |
| ------------------------- | --------- | ----------------------------------------------------------------- |
| `missing-label`           | 🔴 HIGH   | Interactive element missing `accessibilityLabel`                  |
| `touchable-without-label` | 🔴 HIGH   | Touchable with no label and no `Text` child                       |
| `missing-role`            | 🟡 MEDIUM | Interactive element missing `accessibilityRole`                   |
| `small-touch-target`      | 🟡 MEDIUM | Touch target below 44×44pt recommendation                         |
| `missing-hint`            | 🔵 LOW    | Critical action (delete/checkout/pay) missing `accessibilityHint` |
| `duplicate-labels`        | 🔵 LOW    | Multiple elements share the same `accessibilityLabel`             |

### Rule Details

#### `missing-label` 🔴

Detects interactive elements (`TouchableOpacity`, `Pressable`, `Button`, etc.) that have no `accessibilityLabel` and no `Text` child. Screen readers will announce these as "button" with no context.

```tsx
// ❌ Bad
<TouchableOpacity onPress={handleSearch} />

// ✅ Good
<TouchableOpacity
  accessibilityLabel="Search"
  onPress={handleSearch}
/>

// ✅ Also good — Text child acts as label
<TouchableOpacity onPress={handleSearch}>
  <Text>Search</Text>
</TouchableOpacity>
```

#### `missing-role` 🟡

Interactive elements without `accessibilityRole` may be announced incorrectly by VoiceOver/TalkBack.

```tsx
// ❌ Bad
<TouchableOpacity accessibilityLabel="Search" onPress={...} />

// ✅ Good
<TouchableOpacity
  accessibilityLabel="Search"
  accessibilityRole="button"
  onPress={...}
/>
```

#### `small-touch-target` 🟡

Targets smaller than 44×44pt (iOS) or 48×48dp (Android) are hard to activate for users with motor impairments.

```tsx
// ❌ Bad
<TouchableOpacity style={{ width: 20, height: 20 }} />

// ✅ Good
<TouchableOpacity style={{ width: 44, height: 44 }} />
// Or use padding:
<TouchableOpacity style={{ padding: 12 }} />
```

#### `missing-hint` 🔵

Critical actions (containing words like "delete", "checkout", "purchase", "pay") should explain what will happen.

```tsx
// ❌ Bad — user doesn't know what "Delete" will do
<TouchableOpacity accessibilityLabel="Delete account" />

// ✅ Good
<TouchableOpacity
  accessibilityLabel="Delete account"
  accessibilityHint="Permanently removes your account and all data"
/>
```

#### `duplicate-labels` 🔵

When two interactive elements on the same screen share a label, screen reader users cannot distinguish them.

```tsx
// ❌ Bad — which "Edit" is which?
<TouchableOpacity accessibilityLabel="Edit" />
<TouchableOpacity accessibilityLabel="Edit" />

// ✅ Good
<TouchableOpacity accessibilityLabel="Edit profile" />
<TouchableOpacity accessibilityLabel="Edit address" />
```

---

## Accessibility Score

The scanner computes an **Accessibility Readiness Score** — a 0–100 rating for each file and overall.

```bash
npx react-native-accessibility-scan ./src --score
```

```
♿ Accessibility Readiness Score

   Overall       🟡 72/100  ████████████████░░░░
   ─────────────────────────────────────────────────
   Labels        🔴 40/100
   Roles         🟡 75/100
   Touch Targets 🟢 100/100
   Hints         🟢 94/100

📱 Screen Scores

   🔴 CheckoutScreen.tsx              42/100  (5 issues)
   🟡 HomeScreen.tsx                  68/100  (3 issues)
   🟢 ProfileScreen.tsx               96/100  (1 issue)
   🟢 SettingsScreen.tsx             100/100  (0 issues)
```

**Scoring model:**

- HIGH issue: −20 points per issue
- MEDIUM issue: −8 points per issue
- LOW issue: −3 points per issue
- Score is clamped to [0, 100]

Use this in CI to enforce a minimum score:

```ts
const report = await AccessibilityScanner.scan({ path: "./src" });
const score = computeScore(report);

if (score.overall < 80) {
  console.error(`Score ${score.overall} is below required 80`);
  process.exit(1);
}
```

---

## ESLint Plugin

Get inline warnings while you write code.

### Setup

```bash
npm install --save-dev react-native-accessibility-scanner
```

```js
// .eslintrc.js
module.exports = {
  plugins: ["react-native-accessibility-scanner"],
  rules: {
    "react-native-accessibility-scanner/missing-label": "error",
    "react-native-accessibility-scanner/missing-role": "warn",
    "react-native-accessibility-scanner/small-touch-target": "warn",
  },
};
```

Or use the recommended preset:

```js
// .eslintrc.js
module.exports = {
  extends: ["plugin:react-native-accessibility-scanner/recommended"],
};
```

### Import path

```js
// The ESLint plugin is a separate export
const plugin = require("react-native-accessibility-scanner/eslint");
```

---

## GitHub Action

Add to `.github/workflows/accessibility.yml` (copy from `github-action/accessibility.yml` in this repo):

```yaml
name: Accessibility Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - run: npm ci

      - name: Run Accessibility Scanner
        run: npx react-native-accessibility-scan ./src --fail-on-high --output accessibility-report.json

      - name: Upload Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: accessibility-report
          path: accessibility-report.json
```

The Action will:

- Run on every push and pull request
- Post a Markdown summary as a PR comment
- Upload the JSON report as a build artifact
- Fail the build if HIGH severity issues are found

---

## Programmatic API

```ts
import {
  AccessibilityScanner,
  computeScore,
  ConsoleReporter,
} from "react-native-accessibility-scanner";

const report = await AccessibilityScanner.scan({
  path: "./src",
  ignore: ["**/*.stories.tsx"],
  failOnHigh: false,
  touchTarget: { minWidth: 44, minHeight: 44 },
});

// Print to console
new ConsoleReporter().report(report);

// Get score
const score = computeScore(report);
console.log(score.overall); // 72

// Access issues directly
report.issues.forEach((issue) => {
  console.log(
    `${issue.severity}: ${issue.message} (${issue.file}:${issue.line})`,
  );
});
```

### `ScanOptions`

```ts
interface ScanOptions {
  path?: string | string[]; // default: "./src"
  ignore?: string[]; // glob patterns
  failOnHigh?: boolean; // default: false
  failOnMedium?: boolean; // default: false
  touchTarget?: {
    minWidth?: number; // default: 44
    minHeight?: number; // default: 44
  };
  disabledRules?: string[]; // rule IDs to skip
}
```

---

## Config File

Create `accessibility-scanner.config.js` in your project root:

```js
module.exports = {
  path: "./src",
  ignore: ["**/*.stories.tsx", "**/*.test.tsx"],
  failOnHigh: true,
  failOnMedium: false,
  touchTarget: {
    minWidth: 44,
    minHeight: 44,
  },
  disabledRules: [],
};
```

The scanner automatically detects this file. You can also use:

- `.accessibility-scannerrc`
- `.accessibility-scannerrc.json`
- `"accessibility-scanner"` key in `package.json`

---

## Writing Custom Rules

```ts
import { registerRule } from "react-native-accessibility-scanner";
import type {
  AccessibilityRule,
  AccessibilityIssue,
  RuleContext,
} from "react-native-accessibility-scanner";
import * as t from "@babel/types";

class NoHideDescendantsRule implements AccessibilityRule {
  id = "no-hide-descendants";
  name = "No importantForAccessibility no-hide-descendants";
  description = "Avoid hiding subtrees from screen readers.";
  severity = "medium" as const;

  run(node: t.Node, context: RuleContext): AccessibilityIssue[] {
    // Your AST logic here
    return [];
  }
}

// Register before scanning
registerRule(new NoHideDescendantsRule());

const report = await AccessibilityScanner.scan({ path: "./src" });
```

---

## Roadmap

<!-- | Version | Feature |
|---------|---------|
| **v0.1** | ✅ CLI, 6 rules, JSON/Markdown reporters |
| **v0.2** | Touch target detection, duplicate labels, score |
| **v0.3** | ESLint plugin, config file support |
| **v0.4** | GitHub Action, PR comments |
| **v1.0** | Stable API, full docs, test coverage |
| v1.1 | Accessibility score per screen in CI |
| v1.2 | Auto-fix mode (`--fix`) |
| v1.3 | React Navigation screen title checks |
| v1.4 | Modal accessibility checks |
| v1.5 | FlatList / SectionList rules |
| v2.0 | VS Code extension |
| v3.0 | HTML dashboard |
| v4.0 | AI-powered label suggestions | -->

| Version    | Feature                                                    |
| ---------- | ---------------------------------------------------------- |
| **v0.1.0** | ✅ CLI, missing-label rule, missing-role rule, JSON output |
| v0.2.0     | Touch targets, duplicate labels, Accessibility Score       |
| v0.3.0     | ESLint plugin, config file                                 |
| v0.4.0     | GitHub Action, CI integration                              |
| v1.0.0     | Stable release, full docs                                  |

---

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feat/my-rule`
3. Make your changes
4. Add tests in `tests/unit/`
5. Run `npm test` to verify
6. Submit a pull request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

---

## License

MIT © [Arthnex](https://github.com/arthnex-admin)
