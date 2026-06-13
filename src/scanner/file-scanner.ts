import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import type { AccessibilityIssue, FileScanResult, RuleContext, ScannerConfig } from "../types";
import { getAllRules, duplicateLabelsRule } from "../rules";

/**
 * Parses a single TSX/JSX/TS/JS file and runs all registered accessibility rules.
 */
export function scanFile(filePath: string, sourceCode: string, config: ScannerConfig): FileScanResult {
  const context: RuleContext = { filePath, sourceCode, config };
  const rules = getAllRules().filter((r) => !config.disabledRules.includes(r.id));

  // Reset stateful rules for this file
  duplicateLabelsRule.reset();

  let ast: ReturnType<typeof parser.parse>;
  try {
    ast = parser.parse(sourceCode, {
      sourceType: "module",
      plugins: ["jsx", "typescript", "decorators-legacy", "classProperties"],
      errorRecovery: true,
    });
  } catch {
    // If parsing fails completely, skip the file silently
    return { filePath, issues: [] };
  }

  const issues: AccessibilityIssue[] = [];

  traverse(ast, {
    enter(path) {
      for (const rule of rules) {
        try {
          const ruleIssues = rule.run(path.node, context);
          issues.push(...ruleIssues);
        } catch {
          // Swallow per-rule errors — don't let one rule crash the whole scan
        }
      }
    },
  });

  // Collect issues from post-traversal (file-level) rules
  const duplicateIssues = duplicateLabelsRule.collectIssues(context);
  issues.push(...duplicateIssues);

  return { filePath, issues };
}
