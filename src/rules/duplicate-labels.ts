import * as t from "@babel/types";
import type { AccessibilityRule, AccessibilityIssue, RuleContext } from "../types";
import {
  getComponentName,
  getStringAttributeValue,
  INTERACTIVE_COMPONENTS,
  getSnippet,
} from "../utils/ast";

/**
 * Duplicate Labels Rule
 *
 * Unlike other rules which run per-node, this rule is designed to be run
 * once per file: call it with the Program node (root) after all other nodes
 * are processed, passing the collected label map.
 *
 * The scanner calls this rule's `runOnFile` method after traversal.
 * The `run` method handles per-node label collection (returns empty array
 * since duplicate detection requires the full file scan).
 */
export class DuplicateLabelsRule implements AccessibilityRule {
  id = "duplicate-labels";
  name = "Duplicate Accessibility Labels";
  description =
    "Multiple interactive elements on the same screen sharing identical accessibilityLabel values may confuse screen reader users.";
  severity = "low" as const;

  // Accumulates per-file during traversal
  private labelMap = new Map<string, Array<{ line: number; column: number; file: string }>>();

  reset() {
    this.labelMap = new Map();
  }

  run(node: t.Node, context: RuleContext): AccessibilityIssue[] {
    if (!t.isJSXElement(node)) return [];

    const opening = node.openingElement;
    const name = getComponentName(opening);
    if (!name || !INTERACTIVE_COMPONENTS.has(name)) return [];

    const label = getStringAttributeValue(opening, "accessibilityLabel");
    if (!label) return [];

    const loc = opening.loc?.start ?? { line: 1, column: 0 };
    const entry = { line: loc.line, column: loc.column + 1, file: context.filePath };

    if (!this.labelMap.has(label)) {
      this.labelMap.set(label, [entry]);
    } else {
      this.labelMap.get(label)!.push(entry);
    }

    return [];
  }

  /** Call after traversal to collect duplicate label issues */
  collectIssues(context: RuleContext): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    for (const [label, occurrences] of this.labelMap.entries()) {
      if (occurrences.length > 1) {
        // Report all but the first occurrence
        for (const occ of occurrences.slice(1)) {
          issues.push({
            ruleId: this.id,
            ruleName: this.name,
            message: `Duplicate accessibilityLabel "${label}" found ${occurrences.length} times in this file. Screen readers may confuse these elements.`,
            suggestion: `Use unique labels like "${label} (1)", "${label} (2)", or add context: "${label} in header".`,
            severity: this.severity,
            file: occ.file,
            line: occ.line,
            column: occ.column,
            codeSnippet: getSnippet(context.sourceCode, occ.line),
          });
        }
      }
    }
    return issues;
  }
}
