import type { Reporter, ScanReport, AccessibilityIssue, Severity } from "../types";

const SEVERITY_EMOJI: Record<Severity, string> = {
  high: "🔴",
  medium: "🟡",
  low: "🔵",
};

export class MarkdownReporter implements Reporter {
  report(scan: ScanReport): string {
    const { summary, issues } = scan;
    const date = new Date().toISOString().split("T")[0];
    const lines: string[] = [];

    lines.push("# ♿ React Native Accessibility Report");
    lines.push(`\n> Generated on ${date}`);
    lines.push("\n---\n");

    // Summary table
    lines.push("## 📊 Summary\n");
    lines.push("| Metric | Value |");
    lines.push("| ------ | ----- |");
    lines.push(`| Files Scanned | ${summary.scannedFiles} |`);
    lines.push(`| Total Issues | ${summary.totalIssues} |`);
    lines.push(`| 🔴 High | ${summary.highIssues} |`);
    lines.push(`| 🟡 Medium | ${summary.mediumIssues} |`);
    lines.push(`| 🔵 Low | ${summary.lowIssues} |`);
    lines.push(`| Duration | ${summary.durationMs}ms |`);

    if (issues.length === 0) {
      lines.push("\n---\n");
      lines.push("## ✅ No Issues Found\n");
      lines.push("Great work! Your React Native app passes all accessibility checks.");
      return lines.join("\n");
    }

    // Issues grouped by severity
    for (const severity of ["high", "medium", "low"] as Severity[]) {
      const group = issues.filter((i) => i.severity === severity);
      if (group.length === 0) continue;

      const label = severity.charAt(0).toUpperCase() + severity.slice(1);
      lines.push(`\n---\n\n## ${SEVERITY_EMOJI[severity]} ${label} Severity (${group.length})\n`);

      // Group by rule within severity
      const byRule = new Map<string, AccessibilityIssue[]>();
      for (const issue of group) {
        if (!byRule.has(issue.ruleId)) byRule.set(issue.ruleId, []);
        byRule.get(issue.ruleId)!.push(issue);
      }

      for (const [, ruleIssues] of byRule.entries()) {
        const first = ruleIssues[0];
        lines.push(`### ${first.ruleName}`);
        lines.push(`\n> ${first.message.split(".")[0]}.\n`);

        for (const issue of ruleIssues) {
          lines.push(`**📄 File:** \`${issue.file}\``);
          lines.push(`**📍 Location:** Line ${issue.line}, Column ${issue.column}`);
          if (issue.codeSnippet) {
            lines.push(`\n**Code:**\n\`\`\`tsx\n${issue.codeSnippet}\n\`\`\``);
          }
          lines.push(`\n**💡 Fix:** ${issue.suggestion}\n`);
          lines.push("---\n");
        }
      }
    }

    return lines.join("\n");
  }
}
