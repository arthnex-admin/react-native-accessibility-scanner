import type { ScanReport, FileScanResult, Severity } from "../types";

// ─── Scoring weights ──────────────────────────────────────────────────────────

const SEVERITY_PENALTY: Record<Severity, number> = {
  high: 20,
  medium: 8,
  low: 3,
};

export interface ScreenScore {
  file: string;
  /** Short filename for display (e.g. HomeScreen.tsx) */
  displayName: string;
  score: number;
  issueCount: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
}

export interface AccessibilityScore {
  overall: number;
  screens: ScreenScore[];
  /** Breakdown by category (rule dimension) */
  breakdown: {
    labels: number;
    roles: number;
    touchTargets: number;
    hints: number;
  };
}

// ─── Score calculation ────────────────────────────────────────────────────────

function clamp(val: number): number {
  return Math.max(0, Math.min(100, Math.round(val)));
}

export function scoreFile(result: FileScanResult): ScreenScore {
  const { filePath, issues } = result;
  const displayName = filePath.split("/").pop() ?? filePath;

  const highIssues = issues.filter((i) => i.severity === "high").length;
  const mediumIssues = issues.filter((i) => i.severity === "medium").length;
  const lowIssues = issues.filter((i) => i.severity === "low").length;

  const penalty =
    highIssues * SEVERITY_PENALTY.high +
    mediumIssues * SEVERITY_PENALTY.medium +
    lowIssues * SEVERITY_PENALTY.low;

  return {
    file: filePath,
    displayName,
    score: clamp(100 - penalty),
    issueCount: issues.length,
    highIssues,
    mediumIssues,
    lowIssues,
  };
}

export function computeScore(report: ScanReport): AccessibilityScore {
  const { results, issues } = report;

  // Per-screen scores (only files that had issues, plus all files)
  const screens = results.map(scoreFile);

  // Overall = average of all screen scores (files with no issues score 100)
  const overall =
    screens.length === 0
      ? 100
      : clamp(screens.reduce((sum, s) => sum + s.score, 0) / screens.length);

  // Category breakdown — penalise each category independently
  const labelIssues = issues.filter((i) => ["missing-label", "touchable-without-label"].includes(i.ruleId)).length;
  const roleIssues = issues.filter((i) => i.ruleId === "missing-role").length;
  const touchIssues = issues.filter((i) => i.ruleId === "small-touch-target").length;
  const hintIssues = issues.filter((i) => ["missing-hint", "duplicate-labels"].includes(i.ruleId)).length;

  const breakdown = {
    labels: clamp(100 - labelIssues * SEVERITY_PENALTY.high),
    roles: clamp(100 - roleIssues * SEVERITY_PENALTY.medium),
    touchTargets: clamp(100 - touchIssues * SEVERITY_PENALTY.medium),
    hints: clamp(100 - hintIssues * SEVERITY_PENALTY.low),
  };

  return { overall, screens, breakdown };
}

export function scoreEmoji(score: number): string {
  if (score >= 90) return "🟢";
  if (score >= 70) return "🟡";
  if (score >= 50) return "🟠";
  return "🔴";
}
