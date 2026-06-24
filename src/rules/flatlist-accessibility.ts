import * as t from "@babel/types";
import type { AccessibilityRule, AccessibilityIssue, RuleContext } from "../types";
import { getComponentName, hasNonEmptyAttribute, getSnippet } from "../utils/ast";

/**
 * FlatList and SectionList components need accessibility props so screen
 * readers can announce list context ("Products list, 12 items") instead
 * of just reading each item in isolation with no context.
 *
 * Checks for:
 *   - accessibilityLabel  — describes what the list contains
 *   - accessible={true}   — marks the list as an accessible element
 */

const LIST_COMPONENTS = new Set([
  "FlatList",
  "SectionList",
  "ScrollView",
  "VirtualizedList",
]);

const SUGGESTED_LABELS: Record<string, string> = {
  FlatList: "List of items",
  SectionList: "Sectioned list",
  ScrollView: "Scrollable content",
  VirtualizedList: "List of items",
};

export class FlatListAccessibilityRule implements AccessibilityRule {
  id = "flatlist-missing-accessibility";
  name = "FlatList Missing Accessibility";
  description =
    "FlatList, SectionList and ScrollView components should have accessibilityLabel and accessible={true} so screen readers can announce list context.";
  severity = "medium" as const;

  run(node: t.Node, context: RuleContext): AccessibilityIssue[] {
    if (!t.isJSXElement(node)) return [];

    const opening = node.openingElement;
    const name = getComponentName(opening);
    if (!name || !LIST_COMPONENTS.has(name)) return [];

    const issues: AccessibilityIssue[] = [];
    const loc = opening.loc?.start ?? { line: 1, column: 0 };
    const suggested = SUGGESTED_LABELS[name] ?? "List of items";

    // Check 1 — missing accessibilityLabel
    if (!hasNonEmptyAttribute(opening, "accessibilityLabel")) {
      issues.push({
        ruleId: this.id,
        ruleName: this.name,
        message: `<${name}> is missing accessibilityLabel. Screen readers will have no context about what this list contains.`,
        suggestion: `Add accessibilityLabel="${suggested}" to describe what the list contains (e.g. "Products list", "Search results", "Notifications").`,
        severity: this.severity,
        file: context.filePath,
        line: loc.line,
        column: loc.column + 1,
        codeSnippet: getSnippet(context.sourceCode, loc.line),
      });
    }

    // Check 2 — missing accessible={true}
    if (!hasNonEmptyAttribute(opening, "accessible")) {
      issues.push({
        ruleId: this.id,
        ruleName: this.name,
        message: `<${name}> is missing accessible={true}. Without this, VoiceOver and TalkBack may not treat the list as a navigable element.`,
        suggestion: `Add accessible={true} to <${name}> so screen readers can navigate it as a grouped list.`,
        severity: "low" as const,
        file: context.filePath,
        line: loc.line,
        column: loc.column + 1,
        codeSnippet: getSnippet(context.sourceCode, loc.line),
      });
    }

    return issues;
  }
}
