import { describe, it, expect } from "vitest";
import { JsonReporter } from "../../src/reporters/json-reporter";
import { MarkdownReporter } from "../../src/reporters/markdown-reporter";
import type { ScanReport } from "../../src/types";

const MOCK_REPORT: ScanReport = {
  summary: {
    totalFiles: 3,
    scannedFiles: 3,
    totalIssues: 2,
    highIssues: 1,
    mediumIssues: 1,
    lowIssues: 0,
    durationMs: 42,
  },
  results: [],
  issues: [
    {
      ruleId: "missing-label",
      ruleName: "Missing accessibilityLabel",
      message: "TouchableOpacity has no label",
      suggestion: 'Add accessibilityLabel="Action"',
      severity: "high",
      file: "HomeScreen.tsx",
      line: 12,
      column: 5,
      codeSnippet: "<TouchableOpacity onPress={...} />",
    },
    {
      ruleId: "missing-role",
      ruleName: "Missing accessibilityRole",
      message: "TouchableOpacity has no role",
      suggestion: 'Add accessibilityRole="button"',
      severity: "medium",
      file: "HomeScreen.tsx",
      line: 20,
      column: 5,
    },
  ],
};

const EMPTY_REPORT: ScanReport = {
  summary: { totalFiles: 5, scannedFiles: 5, totalIssues: 0, highIssues: 0, mediumIssues: 0, lowIssues: 0, durationMs: 10 },
  results: [],
  issues: [],
};

// ─── JsonReporter ─────────────────────────────────────────────────────────────

describe("JsonReporter", () => {
  it("produces valid JSON", () => {
    const output = new JsonReporter().report(MOCK_REPORT) as string;
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it("includes summary and issues keys", () => {
    const output = new JsonReporter().report(MOCK_REPORT) as string;
    const data = JSON.parse(output);
    expect(data).toHaveProperty("summary");
    expect(data).toHaveProperty("issues");
    expect(data.issues).toHaveLength(2);
  });

  it("preserves severity values", () => {
    const output = new JsonReporter().report(MOCK_REPORT) as string;
    const data = JSON.parse(output);
    expect(data.issues[0].severity).toBe("high");
    expect(data.issues[1].severity).toBe("medium");
  });

  it("handles empty report", () => {
    const output = new JsonReporter().report(EMPTY_REPORT) as string;
    const data = JSON.parse(output);
    expect(data.issues).toHaveLength(0);
    expect(data.summary.totalIssues).toBe(0);
  });
});

// ─── MarkdownReporter ─────────────────────────────────────────────────────────

describe("MarkdownReporter", () => {
  it("includes a heading", () => {
    const output = new MarkdownReporter().report(MOCK_REPORT) as string;
    expect(output).toContain("# ♿");
  });

  it("includes severity sections", () => {
    const output = new MarkdownReporter().report(MOCK_REPORT) as string;
    expect(output).toContain("High Severity");
    expect(output).toContain("Medium Severity");
  });

  it("includes file references", () => {
    const output = new MarkdownReporter().report(MOCK_REPORT) as string;
    expect(output).toContain("HomeScreen.tsx");
  });

  it("shows no-issues message for clean report", () => {
    const output = new MarkdownReporter().report(EMPTY_REPORT) as string;
    expect(output).toContain("No Issues Found");
  });

  it("includes fix suggestions", () => {
    const output = new MarkdownReporter().report(MOCK_REPORT) as string;
    expect(output).toContain("💡 Fix");
  });
});
