import * as t from "@babel/types";
import type { AccessibilityRule, AccessibilityIssue, RuleContext } from "../types";
import {
  getComponentName,
  hasNonEmptyAttribute,
  hasTextChild,
  INTERACTIVE_COMPONENTS,
  getSnippet,
} from "../utils/ast";

export class MissingLabelRule implements AccessibilityRule {
  id = "missing-label";
  name = "Missing accessibilityLabel";
  description =
    "Interactive elements must have an accessibilityLabel so screen readers can announce them.";
  severity = "high" as const;

  run(node: t.Node, context: RuleContext): AccessibilityIssue[] {
    if (!t.isJSXElement(node)) return [];

    const opening = node.openingElement;
    const name = getComponentName(opening);
    if (!name || !INTERACTIVE_COMPONENTS.has(name)) return [];

    // A Text child is considered a valid label substitute for screen readers
    const hasLabel = hasNonEmptyAttribute(opening, "accessibilityLabel");
    const hasText = hasTextChild(node);

    if (hasLabel || hasText) return [];

    const loc = opening.loc?.start ?? { line: 1, column: 0 };
    return [
      {
        ruleId: this.id,
        ruleName: this.name,
        message: `<${name}> is interactive but has no accessibilityLabel or Text child. Screen readers cannot describe this element.`,
        suggestion: `Add accessibilityLabel="Describe the action" to the <${name}>.`,
        severity: this.severity,
        file: context.filePath,
        line: loc.line,
        column: loc.column + 1,
        codeSnippet: getSnippet(context.sourceCode, loc.line),
      },
    ];
  }
}
