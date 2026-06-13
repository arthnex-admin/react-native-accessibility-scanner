import * as t from "@babel/types";
import type { AccessibilityRule, AccessibilityIssue, RuleContext } from "../types";
import {
  getComponentName,
  hasNonEmptyAttribute,
  INTERACTIVE_COMPONENTS,
  getSnippet,
} from "../utils/ast";

/** Maps component names to their sensible default role suggestion */
const SUGGESTED_ROLES: Record<string, string> = {
  TouchableOpacity: "button",
  TouchableHighlight: "button",
  TouchableNativeFeedback: "button",
  TouchableWithoutFeedback: "button",
  Pressable: "button",
  Button: "button",
};

export class MissingRoleRule implements AccessibilityRule {
  id = "missing-role";
  name = "Missing accessibilityRole";
  description =
    "Interactive elements should declare their accessibilityRole to help assistive technologies communicate purpose.";
  severity = "medium" as const;

  run(node: t.Node, context: RuleContext): AccessibilityIssue[] {
    if (!t.isJSXElement(node)) return [];

    const opening = node.openingElement;
    const name = getComponentName(opening);
    if (!name || !INTERACTIVE_COMPONENTS.has(name)) return [];

    if (hasNonEmptyAttribute(opening, "accessibilityRole")) return [];

    const suggestedRole = SUGGESTED_ROLES[name] ?? "button";
    const loc = opening.loc?.start ?? { line: 1, column: 0 };
    return [
      {
        ruleId: this.id,
        ruleName: this.name,
        message: `<${name}> is missing accessibilityRole. Screen readers may not correctly announce the element type.`,
        suggestion: `Add accessibilityRole="${suggestedRole}" to the <${name}>.`,
        severity: this.severity,
        file: context.filePath,
        line: loc.line,
        column: loc.column + 1,
        codeSnippet: getSnippet(context.sourceCode, loc.line),
      },
    ];
  }
}
