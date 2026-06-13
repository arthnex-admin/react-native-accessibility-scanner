#!/usr/bin/env node
import { Command } from "commander";
import { writeFileSync } from "fs";
import path from "path";
import chalk from "chalk";
import { AccessibilityScanner } from "../scanner";
import { ConsoleReporter } from "../reporters/console-reporter";
import { JsonReporter } from "../reporters/json-reporter";
import { MarkdownReporter } from "../reporters/markdown-reporter";
import { computeScore, scoreEmoji } from "../scanner/scorer";
import type { ScanOptions } from "../types";

const program = new Command();

program
  .name("react-native-accessibility-scan")
  .description("Accessibility auditing for React Native apps.")
  .version("0.1.1")
  .argument("[path]", "Path to scan (default: ./src)", "./src")
  .option("--json", "Output results as JSON to stdout")
  .option("--markdown", "Output results as Markdown to stdout")
  .option("--output <file>", "Write report to a file (auto-detects format from extension)")
  .option("--fail-on-high", "Exit with code 1 if any HIGH severity issues are found")
  .option("--fail-on-medium", "Exit with code 1 if any MEDIUM or HIGH issues are found")
  .option("--ignore <patterns...>", "Glob patterns to ignore (space-separated)")
  .option("--disable-rules <rules...>", "Rule IDs to disable")
  .option("--min-width <n>", "Minimum touch target width (default: 44)", "44")
  .option("--min-height <n>", "Minimum touch target height (default: 44)", "44")
  .option("--score", "Show accessibility score breakdown")
  .action(async (scanPath: string, opts) => {
    const options: ScanOptions = {
      path: scanPath,
      failOnHigh: opts.failOnHigh ?? false,
      failOnMedium: opts.failOnMedium ?? false,
      ignore: opts.ignore,
      disabledRules: opts.disableRules,
      touchTarget: {
        minWidth: parseInt(opts.minWidth, 10),
        minHeight: parseInt(opts.minHeight, 10),
      },
    };

    let report;
    try {
      report = await AccessibilityScanner.scan(options);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(chalk.red(`\n✖ Scanner error: ${message}\n`));
      process.exit(2);
    }

    // ── Output format ──────────────────────────────────────────────────────────
    if (opts.json) {
      const output = new JsonReporter().report(report);
      console.log(output);
    } else if (opts.markdown) {
      const output = new MarkdownReporter().report(report);
      console.log(output);
    } else {
      new ConsoleReporter().report(report);
    }

    // ── Score display ──────────────────────────────────────────────────────────
    if (opts.score || (!opts.json && !opts.markdown)) {
      const score = computeScore(report);
      if (!opts.json && !opts.markdown) {
        printScore(score);
      }
    }

    // ── Write to file ──────────────────────────────────────────────────────────
    if (opts.output) {
      const outPath = path.resolve(opts.output);
      const ext = path.extname(outPath).toLowerCase();
      let content: string;
      if (ext === ".json") {
        content = new JsonReporter().report(report) as string;
      } else if (ext === ".md") {
        content = new MarkdownReporter().report(report) as string;
      } else {
        content = new JsonReporter().report(report) as string;
      }
      writeFileSync(outPath, content, "utf-8");
      console.log(chalk.dim(`\n📄 Report saved to ${outPath}`));
    }

    // ── Exit code ──────────────────────────────────────────────────────────────
    const { summary } = report;
    if (options.failOnHigh && summary.highIssues > 0) {
      process.exit(1);
    }
    if (options.failOnMedium && (summary.highIssues > 0 || summary.mediumIssues > 0)) {
      process.exit(1);
    }
  });

function printScore(score: ReturnType<typeof computeScore>) {
  console.log(chalk.bold("\n♿ Accessibility Readiness Score\n"));
  const bar = makeBar(score.overall);
  console.log(`   Overall       ${scoreEmoji(score.overall)} ${chalk.bold(score.overall)}/100  ${bar}`);
  console.log(chalk.dim("   ─────────────────────────────────────────────────"));
  console.log(`   Labels        ${scoreEmoji(score.breakdown.labels)} ${score.breakdown.labels}/100`);
  console.log(`   Roles         ${scoreEmoji(score.breakdown.roles)} ${score.breakdown.roles}/100`);
  console.log(`   Touch Targets ${scoreEmoji(score.breakdown.touchTargets)} ${score.breakdown.touchTargets}/100`);
  console.log(`   Hints         ${scoreEmoji(score.breakdown.hints)} ${score.breakdown.hints}/100`);

  if (score.screens.length > 1) {
    console.log(chalk.bold("\n📱 Screen Scores\n"));
    const sorted = [...score.screens].sort((a, b) => a.score - b.score);
    for (const s of sorted) {
      const icon = scoreEmoji(s.score);
      const name = s.displayName.padEnd(32, " ");
      console.log(`   ${icon} ${chalk.white(name)} ${chalk.bold(s.score)}/100  (${s.issueCount} issues)`);
    }
  }
  console.log();
}

function makeBar(score: number): string {
  const filled = Math.round(score / 5);
  const empty = 20 - filled;
  const bar = "█".repeat(filled) + "░".repeat(empty);
  if (score >= 90) return chalk.green(bar);
  if (score >= 70) return chalk.yellow(bar);
  if (score >= 50) return chalk.hex("#FFA500")(bar);
  return chalk.red(bar);
}

program.parse(process.argv);
