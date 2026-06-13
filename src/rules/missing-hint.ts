import * as t from "@babel/types";
import type { AccessibilityRule, AccessibilityIssue, RuleContext } from "../types";
import {
  getComponentName,
  hasNonEmptyAttribute,
  getStringAttributeValue,
  INTERACTIVE_COMPONENTS,
  CRITICAL_ACTION_KEYWORDS,
  getSnippet,
} from "../utils/ast";

/**
 * Flags critical-action buttons that have an accessibilityLabel mentioning
 * words like "Delete", "Purchase", "Checkout" etc. but no accessibilityHint.
 */
export class MissingHintRule implements AccessibilityRule {
  id = "missing-hint";
  name = "Missing accessibilityHint on Critical Action";
  description =
    "Critical actions (delete, purchase, checkout, submit) should provide an accessibilityHint describing what will happen.";
  severity = "low" as const;

  run(node: t.Node, context: RuleContext): AccessibilityIssue[] {
    if (!t.isJSXElement(node)) return [];

    const opening = node.openingElement;
    const name = getComponentName(opening);
    if (!name || !INTERACTIVE_COMPONENTS.has(name)) return [];

    if (hasNonEmptyAttribute(opening, "accessibilityHint")) return [];

    const label = getStringAttributeValue(opening, "accessibilityLabel") ?? "";
    const isCritical = CRITICAL_ACTION_KEYWORDS.some((kw) =>
      label.toLowerCase().includes(kw)
    );
    if (!isCritical) return [];

    const loc = opening.loc?.start ?? { line: 1, column: 0 };
    const keyword = CRITICAL_ACTION_KEYWORDS.find((kw) =>
      label.toLowerCase().includes(kw)
    );
    const examples: Record<string, string> = {
      delete: "Permanently removes this item",
      remove: "Removes this item from the list",
      purchase: "Completes your purchase",
      checkout: "Proceeds to payment",
      submit: "Submits the form",
      payment: "Processes your payment",
      pay: "Completes your payment",
      buy: "Purchases the item",
      confirm: "Confirms the action",
      cancel: "Cancels and discards changes",
    };
    const exampleHint = keyword ? examples[keyword] : "Describes what will happen";

    return [
      {
        ruleId: this.id,
        ruleName: this.name,
        message: `<${name}> with label "${label}" is a critical action but has no accessibilityHint.`,
        suggestion: `Add accessibilityHint="${exampleHint}" to help screen reader users understand the consequence.`,
        severity: this.severity,
        file: context.filePath,
        line: loc.line,
        column: loc.column + 1,
        codeSnippet: getSnippet(context.sourceCode, loc.line),
      },
    ];
  }
}
