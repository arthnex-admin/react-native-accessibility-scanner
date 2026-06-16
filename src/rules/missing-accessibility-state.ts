import * as t from "@babel/types";
import type { AccessibilityRule, AccessibilityIssue, RuleContext } from "../types";
import {
  getComponentName,
  findAttribute,
  hasNonEmptyAttribute,
  INTERACTIVE_COMPONENTS,
  getSnippet,
} from "../utils/ast";

/**
 * Props that carry visual state but ALSO need an accessibilityState equivalent.
 *
 * Pattern: { jsProp, a11yStatKey, description }
 *   jsProp      — the React Native prop name  (e.g. "disabled")
 *   a11yStateKey — the key expected inside accessibilityState  (e.g. "disabled")
 *   description  — human-readable explanation
 */
const STATE_PROP_MAP = [
  {
    jsProp: "disabled",
    a11yStateKey: "disabled",
    description: "disabled state",
    example: "accessibilityState={{ disabled: true }}",
  },
  {
    jsProp: "selected",
    a11yStateKey: "selected",
    description: "selected state",
    example: "accessibilityState={{ selected: true }}",
  },
] as const;

/**
 * Checks whether an `accessibilityState` prop object contains a specific key.
 * Handles:
 *   accessibilityState={{ disabled: true }}
 *   accessibilityState={{ disabled: someVar }}
 */
function accessibilityStateHasKey(
  node: t.JSXOpeningElement,
  key: string
): boolean {
  const attr = findAttribute(node, "accessibilityState");
  if (!attr || !attr.value) return false;

  // accessibilityState={{ ... }}
  if (
    t.isJSXExpressionContainer(attr.value) &&
    t.isObjectExpression(attr.value.expression)
  ) {
    return attr.value.expression.properties.some(
      (p) =>
        t.isObjectProperty(p) &&
        ((t.isIdentifier(p.key) && p.key.name === key) ||
          (t.isStringLiteral(p.key) && p.key.value === key))
    );
  }

  // accessibilityState={someVariable} — dynamic, assume it's handled
  if (t.isJSXExpressionContainer(attr.value)) return true;

  return false;
}

export class MissingAccessibilityStateRule implements AccessibilityRule {
  id = "missing-accessibility-state";
  name = "Missing accessibilityState";
  description =
    "Interactive elements that use props like `disabled` or `selected` must also set `accessibilityState` so screen readers announce the state change.";
  severity = "medium" as const;

  run(node: t.Node, context: RuleContext): AccessibilityIssue[] {
    if (!t.isJSXElement(node)) return [];

    const opening = node.openingElement;
    const name = getComponentName(opening);
    if (!name || !INTERACTIVE_COMPONENTS.has(name)) return [];

    const issues: AccessibilityIssue[] = [];
    const loc = opening.loc?.start ?? { line: 1, column: 0 };

    for (const { jsProp, a11yStateKey, description, example } of STATE_PROP_MAP) {
      // Only flag when the visual prop is explicitly present
      const hasProp = hasNonEmptyAttribute(opening, jsProp);
      if (!hasProp) continue;

      // Check if accessibilityState already covers this key
      if (accessibilityStateHasKey(opening, a11yStateKey)) continue;

      issues.push({
        ruleId: this.id,
        ruleName: this.name,
        message: `<${name}> has \`${jsProp}\` prop but no matching \`accessibilityState={{ ${a11yStateKey}: ... }}\`. Screen readers won't announce the ${description}.`,
        suggestion: `Add ${example} to <${name}> so VoiceOver/TalkBack announces "${description}" correctly.`,
        severity: this.severity,
        file: context.filePath,
        line: loc.line,
        column: loc.column + 1,
        codeSnippet: getSnippet(context.sourceCode, loc.line),
      });
    }

    return issues;
  }
}
