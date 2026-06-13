import chalk from "chalk";
import type { Reporter, ScanReport, AccessibilityIssue, Severity } from "../types";

const SEVERITY_LABEL: Record<Severity, string> = {
  high: chalk.bgRed.white.bold(" HIGH "),
  medium: chalk.bgYellow.black.bold(" MED  "),
  low: chalk.bgBlue.white.bold(" LOW  "),
};

const SEVERITY_COLOR: Record<Severity, chalk.Chalk> = {
  high: chalk.red,
  medium: chalk.yellow,
  low: chalk.blue,
};

export class ConsoleReporter implements Reporter {
  report(scan: ScanReport): void {
    const { summary, issues } = scan;

    console.log("\n" + chalk.bold.cyan("═══════════════════════════════════════════════════════"));
    console.log(chalk.bold.cyan("   React Native Accessibility Scanner"));
    console.log(chalk.bold.cyan("═══════════════════════════════════════════════════════\n"));

    // Summary
    console.log(chalk.bold("📊 Summary"));
    console.log(`   Scanned : ${chalk.white(summary.scannedFiles)} files`);
    console.log(`   Issues  : ${chalk.white(summary.totalIssues)} total`);
    console.log(
      `   ${chalk.red(`■ HIGH ${summary.highIssues}`)}   ${chalk.yellow(`■ MEDIUM ${summary.mediumIssues}`)}   ${chalk.blue(`■ LOW ${summary.lowIssues}`)}`
    );
    console.log(`   Duration: ${summary.durationMs}ms\n`);

    if (issues.length === 0) {
      console.log(chalk.green("✅  No accessibility issues found! Great work.\n"));
      return;
    }

    // Group by severity
    const grouped: Record<Severity, AccessibilityIssue[]> = {
      high: issues.filter((i) => i.severity === "high"),
      medium: issues.filter((i) => i.severity === "medium"),
      low: issues.filter((i) => i.severity === "low"),
    };

    for (const severity of ["high", "medium", "low"] as Severity[]) {
      const group = grouped[severity];
      if (group.length === 0) continue;

      console.log(chalk.bold(`\n${SEVERITY_LABEL[severity]}  ${group.length} issue${group.length > 1 ? "s" : ""}`));
      console.log(chalk.dim("─".repeat(55)));

      for (const issue of group) {
        const color = SEVERITY_COLOR[severity];
        const location = `${issue.file}:${issue.line}:${issue.column}`;
        console.log(`\n  ${color.bold(issue.ruleName)}`);
        console.log(`  ${chalk.dim(location)}`);
        console.log(`  ${chalk.white(issue.message)}`);
        if (issue.codeSnippet) {
          console.log(`\n  ${chalk.dim("Code:")} ${chalk.gray(issue.codeSnippet)}`);
        }
        console.log(`  ${chalk.green("Fix:")}  ${chalk.greenBright(issue.suggestion)}`);
      }
    }

    console.log("\n" + chalk.dim("─".repeat(55)));

    // Exit hint
    if (summary.highIssues > 0) {
      console.log(chalk.red(`\n⚠️  ${summary.highIssues} HIGH severity issue${summary.highIssues > 1 ? "s" : ""} found.`));
    }
    console.log(chalk.dim("\nTip: Run with --json to output machine-readable results.\n"));
  }
}
