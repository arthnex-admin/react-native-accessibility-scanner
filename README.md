<div align="center">

# ♿ react-native-accessibility-scanner

**Catch accessibility issues before your users do.**

[![npm version](https://img.shields.io/npm/v/react-native-accessibility-scanner?color=brightgreen&label=npm)](https://www.npmjs.com/package/react-native-accessibility-scanner)
[![Weekly Downloads](https://img.shields.io/npm/dw/react-native-accessibility-scanner?color=blue)](https://www.npmjs.com/package/react-native-accessibility-scanner)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

Scan your React Native codebase for accessibility issues in **one command**.\
Get a score. Fix issues. Ship confident.

```bash
npx react-native-accessibility-scan ./src
```

</div>

---

## 🤔 Why does this exist?

Most accessibility tools are built for the web. React Native developers are left with:

- ❌ No dedicated RN accessibility scanner
- ❌ No accessibility score per screen
- ❌ Runtime-only tools that catch issues too late
- ❌ No rules for RN-specific components like FlatList, Modal, SectionList

**This package gives you one unified tool** — CLI, ESLint plugin, GitHub Action, and programmatic API — built specifically for React Native.

---

## ✨ What it looks like

```
═══════════════════════════════════════════════════════
   React Native Accessibility Scanner
═══════════════════════════════════════════════════════

📊 Summary
   Scanned : 12 files      Issues : 11 total
   ■ HIGH 2   ■ MEDIUM 7   ■ LOW 2

 HIGH   2 issues
──────────────────────────────────────────────────────

  Missing accessibilityLabel
  src/screens/HomeScreen.tsx:43:5
  <TouchableOpacity> has no accessibilityLabel or Text child
  Fix:  Add accessibilityLabel="Search"

♿ Accessibility Readiness Score

   Overall       🟡 68/100  █████████████░░░░░░░
   Labels        🔴 40/100
   Roles         🟡 75/100
   Touch Targets 🟢 100/100
   Hints         🟢 94/100
   States        🟡 76/100
   Lists         🟠 60/100

📱 Screen Scores

   🔴 CheckoutScreen.tsx      42/100  (5 issues)
   🟡 HomeScreen.tsx          68/100  (3 issues)
   🟢 ProfileScreen.tsx       96/100  (1 issue)
   🟢 SettingsScreen.tsx     100/100  (0 issues)
```

---

## 🚀 Quick Start

```bash
# No install needed — just run it
npx react-native-accessibility-scan ./src

# With full accessibility score breakdown
npx react-native-accessibility-scan ./src --score

# Fail CI if HIGH issues found
npx react-native-accessibility-scan ./src --fail-on-high

# Save a Markdown report
npx react-native-accessibility-scan ./src --output report.md

# JSON output for custom tooling
npx react-native-accessibility-scan ./src --json
```

---

## 📦 Installation

```bash
npm install --save-dev react-native-accessibility-scanner
# or
yarn add --dev react-native-accessibility-scanner
```

---

## 🔍 Rules

| Rule | Severity | What it catches |
|------|----------|-----------------|
| `missing-label` | 🔴 HIGH | Interactive element with no `accessibilityLabel` or `Text` child |
| `touchable-without-label` | 🔴 HIGH | Touchable that screen readers cannot describe at all |
| `missing-role` | 🟡 MEDIUM | Missing `accessibilityRole` on buttons and links |
| `small-touch-target` | 🟡 MEDIUM | Touch target smaller than 44×44pt |
| `missing-accessibility-state` | 🟡 MEDIUM | `disabled` or `selected` prop without matching `accessibilityState` |
| `flatlist-missing-accessibility` | 🟡 MEDIUM | `FlatList`, `SectionList`, `ScrollView` missing accessibility props ✨ **New in 0.3.0** |
| `missing-hint` | 🔵 LOW | Critical action (delete/pay/checkout) with no `accessibilityHint` |
| `duplicate-labels` | 🔵 LOW | Two elements on the same screen sharing a label |

---

### missing-label 🔴

```tsx
// ❌ Screen reader says: "button" — useless
<TouchableOpacity onPress={handleSearch} />

// ✅ Screen reader says: "Search, button"
<TouchableOpacity
  accessibilityLabel="Search"
  accessibilityRole="button"
  onPress={handleSearch}
/>

// ✅ Text child works as the label too
<TouchableOpacity onPress={handleSearch}>
  <Text>Search</Text>
</TouchableOpacity>
```

---

### missing-role 🟡

```tsx
// ❌ VoiceOver may not announce this as interactive
<TouchableOpacity accessibilityLabel="Search" onPress={...} />

// ✅ Clear role for all screen readers
<TouchableOpacity
  accessibilityLabel="Search"
  accessibilityRole="button"
  onPress={...}
/>
```

---

### small-touch-target 🟡

```tsx
// ❌ Almost impossible to tap for users with motor impairments
<TouchableOpacity style={{ width: 20, height: 20 }} />

// ✅ Apple & Google both recommend 44pt minimum
<TouchableOpacity style={{ width: 44, height: 44 }} />

// ✅ Padding works too
<TouchableOpacity style={{ padding: 12 }} />
```

---

### missing-accessibility-state 🟡

When a button is `disabled` or `selected`, screen readers need to be explicitly told via `accessibilityState`. Without it, VoiceOver users hear "Submit, button" with no idea it is disabled.

```tsx
// ❌ VoiceOver says "Submit, button" — user taps, nothing happens
<TouchableOpacity
  accessibilityLabel="Submit"
  accessibilityRole="button"
  disabled={isLoading}
  onPress={handleSubmit}
/>

// ✅ VoiceOver says "Submit, button, dimmed"
<TouchableOpacity
  accessibilityLabel="Submit"
  accessibilityRole="button"
  disabled={isLoading}
  accessibilityState={{ disabled: isLoading }}
  onPress={handleSubmit}
/>
```

---

### flatlist-missing-accessibility 🟡 ✨ New in 0.3.0

`FlatList`, `SectionList`, and `ScrollView` are React Native-specific components that most web accessibility tools completely ignore. Without `accessibilityLabel` and `accessible={true}`, screen readers have no context about the list — they just read each item in isolation.

```tsx
// ❌ Screen reader reads items with no list context
<FlatList
  data={products}
  renderItem={({ item }) => <Text>{item.name}</Text>}
/>

// ✅ Screen reader announces "Products list" before reading items
<FlatList
  data={products}
  renderItem={({ item }) => <Text>{item.name}</Text>}
  accessible={true}
  accessibilityLabel="Products list"
/>
```

Same applies to `SectionList`:

```tsx
// ❌ No context for screen reader
<SectionList
  sections={sections}
  renderItem={({ item }) => <Text>{item.name}</Text>}
  renderSectionHeader={({ section }) => <Text>{section.title}</Text>}
/>

// ✅ Screen reader knows it's a grouped list
<SectionList
  sections={sections}
  renderItem={({ item }) => <Text>{item.name}</Text>}
  renderSectionHeader={({ section }) => <Text>{section.title}</Text>}
  accessible={true}
  accessibilityLabel="Search results grouped by category"
/>
```

---

### missing-hint 🔵

```tsx
// ❌ User doesn't know what will happen
<TouchableOpacity
  accessibilityLabel="Delete account"
  accessibilityRole="button"
/>

// ✅ Consequence is clear before they tap
<TouchableOpacity
  accessibilityLabel="Delete account"
  accessibilityRole="button"
  accessibilityHint="Permanently removes your account and all data"
/>
```

---

### duplicate-labels 🔵

```tsx
// ❌ Which "Edit" is which? Screen reader users can't tell.
<TouchableOpacity accessibilityLabel="Edit" />
<TouchableOpacity accessibilityLabel="Edit" />

// ✅ Specific and unique
<TouchableOpacity accessibilityLabel="Edit profile photo" />
<TouchableOpacity accessibilityLabel="Edit display name" />
```

---

## ♿ Accessibility Score

Every scan produces a **0–100 Accessibility Readiness Score** — overall and per screen.

```bash
npx react-native-accessibility-scan ./src --score
```

```
♿ Accessibility Readiness Score

   Overall       🟡 68/100  █████████████░░░░░░░
   ─────────────────────────────────────────────────
   Labels        🔴 40/100
   Roles         🟡 75/100
   Touch Targets 🟢 100/100
   Hints         🟢 94/100
   States        🟡 76/100
   Lists         🟠 60/100

📱 Screen Scores

   🔴 CheckoutScreen.tsx      42/100  (5 issues)
   🟡 HomeScreen.tsx          68/100  (3 issues)
   🟢 ProfileScreen.tsx       96/100  (1 issue)
   🟢 SettingsScreen.tsx     100/100  (0 issues)
```

| Score | What it means |
|-------|---------------|
| 🟢 90–100 | Excellent — ship it |
| 🟡 70–89 | Good — a few things to fix |
| 🟠 50–69 | Needs work before release |
| 🔴 0–49 | Significant issues found |

**Scoring model:**
- HIGH issue → −20 points per issue
- MEDIUM issue → −8 points per issue
- LOW issue → −3 points per issue

Use it in CI to enforce a minimum score:

```ts
import { AccessibilityScanner, computeScore } from "react-native-accessibility-scanner";

const report = await AccessibilityScanner.scan({ path: "./src" });
const score = computeScore(report);

if (score.overall < 80) {
  console.error(`❌ Score ${score.overall}/100 is below required 80`);
  process.exit(1);
}
```

---

## ⚙️ CLI Reference

```
Usage: react-native-accessibility-scan [path] [options]

Arguments:
  path                    Path to scan (default: ./src)

Options:
  --score                 Show accessibility score breakdown
  --json                  Output results as JSON
  --markdown              Output results as Markdown
  --output <file>         Write report to file (.json or .md)
  --fail-on-high          Exit 1 if any HIGH issues found
  --fail-on-medium        Exit 1 if any MEDIUM or HIGH issues found
  --ignore <patterns...>  Glob patterns to ignore
  --disable-rules <ids>   Specific rule IDs to skip
  --min-width <n>         Minimum touch target width (default: 44)
  --min-height <n>        Minimum touch target height (default: 44)
  -V, --version           Show version
  -h, --help              Show help
```

---

## 🔧 Config File

Create `accessibility-scanner.config.js` in your project root:

```js
module.exports = {
  path: "./src",
  ignore: ["**/*.stories.tsx", "**/*.test.tsx"],
  failOnHigh: true,
  touchTarget: { minWidth: 44, minHeight: 44 },
  disabledRules: [],
};
```

Auto-detected from:
- `accessibility-scanner.config.js`
- `.accessibility-scannerrc`
- `.accessibility-scannerrc.json`
- `"accessibility-scanner"` key in `package.json`

---

## 🔌 ESLint Plugin

Get warnings **as you type**, without running the CLI.

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
    "react-native-accessibility-scanner/missing-accessibility-state": "warn",
  },
};

// Or use the recommended preset:
module.exports = {
  extends: ["plugin:react-native-accessibility-scanner/recommended"],
};
```

---

## 🤖 GitHub Action

Fail pull requests that introduce accessibility regressions.

```yaml
# .github/workflows/accessibility.yml
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
        run: npx react-native-accessibility-scan ./src --fail-on-high --output report.json
      - name: Upload Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: accessibility-report
          path: report.json
```

---

## 🧩 Programmatic API

```ts
import {
  AccessibilityScanner,
  computeScore,
  ConsoleReporter,
} from "react-native-accessibility-scanner";

const report = await AccessibilityScanner.scan({
  path: "./src",
  ignore: ["**/*.stories.tsx"],
  touchTarget: { minWidth: 44, minHeight: 44 },
});

new ConsoleReporter().report(report);

const score = computeScore(report);
console.log(score.overall);           // 68
console.log(score.breakdown.lists);   // 60  ← new in 0.3.0
console.log(score.screens);           // per-file scores
```

---

## 🛠 Writing Custom Rules

```ts
import { registerRule } from "react-native-accessibility-scanner";
import type { AccessibilityRule, AccessibilityIssue, RuleContext } from "react-native-accessibility-scanner";
import * as t from "@babel/types";

class MyCustomRule implements AccessibilityRule {
  id = "my-rule";
  name = "My Custom Rule";
  description = "Describe what this checks.";
  severity = "medium" as const;

  run(node: t.Node, context: RuleContext): AccessibilityIssue[] {
    // your AST logic here
    return [];
  }
}

registerRule(new MyCustomRule());
const report = await AccessibilityScanner.scan({ path: "./src" });
```

---

## 🗺 Roadmap

| Version | Status | What's included |
|---------|--------|-----------------|
| **0.1.0** | ✅ Released | CLI, 6 rules, Accessibility Score, JSON/Markdown reporters |
| **0.2.0** | ✅ Released | `accessibilityState` rule, States score category |
| **0.3.0** | ✅ Released | `FlatList`, `SectionList`, `ScrollView` accessibility rule, Lists score category |
| **0.4.0** | 🔜 Next | `Modal` accessibility rule |
| **1.0.0** | 📋 Planned | Stable API, HTML report, score badge for README |
| **1.x** | 💡 Future | Auto-fix mode, React Navigation rules, regression detection |
| **2.0** | 💡 Future | VS Code extension |
| **3.0** | 💡 Future | AI-powered label suggestions |

---

## 🤝 Contributing

Contributions are welcome — especially new rules!

```bash
git clone https://github.com/arthnex-admin/react-native-accessibility-scanner
cd react-native-accessibility-scanner
npm install
npm test       # 81 tests

# Add your rule in src/rules/my-rule.ts
# Register it in src/rules/index.ts
# Add tests in tests/unit/rules.test.ts
# Submit a PR!
```

---

## 📄 License

MIT © [Arthnex](https://github.com/arthnex-admin)

---

<div align="center">

Built with ❤️ for the React Native community

⭐ **Found this useful? Star the repo — it helps others discover it!**

[npm](https://www.npmjs.com/package/react-native-accessibility-scanner) · [GitHub](https://github.com/arthnex-admin/react-native-accessibility-scanner) · [Issues](https://github.com/arthnex-admin/react-native-accessibility-scanner/issues)

</div>
