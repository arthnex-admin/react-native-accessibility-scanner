import * as t from "@babel/types";
import type { AccessibilityRule, AccessibilityIssue, RuleContext } from "../types";
import {
  getComponentName,
  extractStyleDimension,
  TOUCHABLE_COMPONENTS,
  getSnippet,
} from "../utils/ast";

export class SmallTouchTargetRule implements AccessibilityRule {
  id = "small-touch-target";
  name = "Small Touch Target";
  description =
    "Interactive elements should meet minimum touch target sizes (44×44pt iOS / 48×48dp Android) for users with motor impairments.";
  severity = "medium" as const;

  run(node: t.Node, context: RuleContext): AccessibilityIssue[] {
    if (!t.isJSXElement(node)) return [];

    const opening = node.openingElement;
    const name = getComponentName(opening);
    if (!name || !TOUCHABLE_COMPONENTS.has(name)) return [];

    const { minWidth, minHeight } = context.config.touchTarget;

    const width = extractStyleDimension(opening, "width");
    const height = extractStyleDimension(opening, "height");

    // We only report when a dimension is explicitly present AND below threshold.
    // Dynamic styles are skipped — we can't statically evaluate them.
    const issues: AccessibilityIssue[] = [];
    const loc = opening.loc?.start ?? { line: 1, column: 0 };

    if (width !== null && width < minWidth) {
      issues.push({
        ruleId: this.id,
        ruleName: this.name,
        message: `<${name}> has width=${width}, which is below the minimum ${minWidth}pt recommendation.`,
        suggestion: `Increase width to at least ${minWidth} (or use minWidth: ${minWidth} with padding instead).`,
        severity: this.severity,
        file: context.filePath,
        line: loc.line,
        column: loc.column + 1,
        codeSnippet: getSnippet(context.sourceCode, loc.line),
      });
    }

    if (height !== null && height < minHeight) {
      issues.push({
        ruleId: this.id,
        ruleName: this.name,
        message: `<${name}> has height=${height}, which is below the minimum ${minHeight}pt recommendation.`,
        suggestion: `Increase height to at least ${minHeight} (or use minHeight: ${minHeight} with padding instead).`,
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
