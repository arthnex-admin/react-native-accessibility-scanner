import * as t from "@babel/types";
import type { AccessibilityRule, AccessibilityIssue, RuleContext } from "../types";
import {
  getComponentName,
  hasNonEmptyAttribute,
  hasTextChild,
  TOUCHABLE_COMPONENTS,
  getSnippet,
} from "../utils/ast";

/**
 * Detects touchable elements that have neither:
 * - an accessibilityLabel
 * - a direct Text child
 *
 * This means screen readers will have nothing to announce.
 */
export class TouchableWithoutLabelRule implements AccessibilityRule {
  id = "touchable-without-label";
  name = "Touchable Without Label or Text";
  description =
    "A touchable with no accessibilityLabel and no Text child cannot be described by screen readers.";
  severity = "high" as const;

  run(node: t.Node, context: RuleContext): AccessibilityIssue[] {
    if (!t.isJSXElement(node)) return [];

    const opening = node.openingElement;
    const name = getComponentName(opening);
    if (!name || !TOUCHABLE_COMPONENTS.has(name)) return [];

    const hasLabel = hasNonEmptyAttribute(opening, "accessibilityLabel");
    const hasText = hasTextChild(node);

    if (hasLabel || hasText) return [];

    const loc = opening.loc?.start ?? { line: 1, column: 0 };
    return [
      {
        ruleId: this.id,
        ruleName: this.name,
        message: `<${name}> has no accessibilityLabel and no Text child — screen readers cannot describe it.`,
        suggestion: `Add accessibilityLabel="Describe action" OR wrap content in a <Text> component.`,
        severity: this.severity,
        file: context.filePath,
        line: loc.line,
        column: loc.column + 1,
        codeSnippet: getSnippet(context.sourceCode, loc.line),
      },
    ];
  }
}
