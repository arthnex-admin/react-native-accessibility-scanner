/**
 * example-api-usage.ts
 *
 * Demonstrates using react-native-accessibility-scanner programmatically.
 * Run: npx ts-node example-api-usage.ts
 */

import {
  AccessibilityScanner,
  ConsoleReporter,
  JsonReporter,
  MarkdownReporter,
  computeScore,
  scoreEmoji,
  registerRule,
} from "react-native-accessibility-scanner";
import type { AccessibilityRule, AccessibilityIssue, RuleContext } from "react-native-accessibility-scanner";
import * as t from "@babel/types";
import { writeFileSync } from "fs";

// ── Basic scan ─────────────────────────────────────────────────────────────────

async function basicScan() {
  console.log("Running basic scan...\n");

  const report = await AccessibilityScanner.scan({
    path: "./src",
    failOnHigh: false,
  });

  // Console output
  new ConsoleReporter().report(report);

  // Score
  const score = computeScore(report);
  console.log(`\nOverall Score: ${scoreEmoji(score.overall)} ${score.overall}/100`);
}

// ── Save reports to disk ───────────────────────────────────────────────────────

async function saveReports() {
  const report = await AccessibilityScanner.scan({ path: "./src" });

  writeFileSync("accessibility-report.json", new JsonReporter().report(report) as string);
  writeFileSync("accessibility-report.md", new MarkdownReporter().report(report) as string);

  console.log("Reports saved: accessibility-report.json + accessibility-report.md");
}

// ── Custom rule example ────────────────────────────────────────────────────────

class NoImportantAccessibilityRule implements AccessibilityRule {
  id = "no-important-a11y-override";
  name = "No importantForAccessibility='no-hide-descendants'";
  description = "Avoid hiding entire subtrees from screen readers unless intentional.";
  severity = "medium" as const;

  run(node: t.Node, _context: RuleContext): AccessibilityIssue[] {
    if (!t.isJSXElement(node)) return [];
    const opening = node.openingElement;
    const attr = opening.attributes.find(
      (a): a is t.JSXAttribute =>
        t.isJSXAttribute(a) &&
        t.isJSXIdentifier(a.name) &&
        a.name.name === "importantForAccessibility"
    );
    if (!attr) return [];
    const val = attr.value;
    const isHideDescendants =
      (t.isStringLiteral(val) && val.value === "no-hide-descendants") ||
      (t.isJSXExpressionContainer(val) &&
        t.isStringLiteral(val.expression) &&
        val.expression.value === "no-hide-descendants");

    if (!isHideDescendants) return [];
    const loc = opening.loc?.start ?? { line: 1, column: 0 };
    return [
      {
        ruleId: this.id,
        ruleName: this.name,
        message: 'importantForAccessibility="no-hide-descendants" hides all children from screen readers.',
        suggestion: "Only use this if the subtree is genuinely decorative. Add a comment explaining why.",
        severity: this.severity,
        file: _context.filePath,
        line: loc.line,
        column: loc.column + 1,
      },
    ];
  }
}

async function customRuleScan() {
  // Register a custom rule alongside the built-ins
  registerRule(new NoImportantAccessibilityRule());

  const report = await AccessibilityScanner.scan({ path: "./src" });
  new ConsoleReporter().report(report);
}

// ── CI-style exit code ─────────────────────────────────────────────────────────

async function ciScan() {
  const report = await AccessibilityScanner.scan({
    path: "./src",
    ignore: ["**/*.stories.tsx"],
  });

  const score = computeScore(report);
  const EXIT_SCORE_THRESHOLD = 80;

  if (score.overall < EXIT_SCORE_THRESHOLD) {
    console.error(`❌ Accessibility score ${score.overall} is below required ${EXIT_SCORE_THRESHOLD}.`);
    process.exit(1);
  }

  if (report.summary.highIssues > 0) {
    console.error(`❌ ${report.summary.highIssues} HIGH severity issue(s) found.`);
    process.exit(1);
  }

  console.log(`✅ Accessibility check passed. Score: ${score.overall}/100`);
}

// Uncomment to run:
basicScan().catch(console.error);
// saveReports().catch(console.error);
// customRuleScan().catch(console.error);
// ciScan().catch(console.error);
