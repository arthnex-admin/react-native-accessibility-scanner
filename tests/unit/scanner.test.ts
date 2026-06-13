import { describe, it, expect } from "vitest";
import { scanFile } from "../../src/scanner/file-scanner";
import { computeScore, scoreFile } from "../../src/scanner/scorer";
import { DEFAULT_CONFIG } from "../../src/types";

const GOOD_CODE = `
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
export function GoodBtn() {
  return (
    <TouchableOpacity
      accessibilityLabel="Search"
      accessibilityRole="button"
      style={{ width: 48, height: 48 }}
      onPress={() => {}}
    >
      <Text>Search</Text>
    </TouchableOpacity>
  );
}
`;

const BAD_CODE = `
import React from 'react';
import { TouchableOpacity, Pressable } from 'react-native';
export function BadBtn() {
  return (
    <TouchableOpacity onPress={() => {}} />
  );
}
`;

const SMALL_TARGET_CODE = `
import React from 'react';
import { TouchableOpacity } from 'react-native';
export function SmallBtn() {
  return (
    <TouchableOpacity
      accessibilityLabel="Close"
      accessibilityRole="button"
      style={{ width: 20, height: 20 }}
      onPress={() => {}}
    />
  );
}
`;

// ─── scanFile ─────────────────────────────────────────────────────────────────

describe("scanFile", () => {
  it("returns no issues for good code", () => {
    const result = scanFile("Good.tsx", GOOD_CODE, DEFAULT_CONFIG);
    expect(result.issues).toHaveLength(0);
  });

  it("detects missing label and role for bad code", () => {
    const result = scanFile("Bad.tsx", BAD_CODE, DEFAULT_CONFIG);
    const ruleIds = result.issues.map((i) => i.ruleId);
    expect(ruleIds).toContain("missing-label");
    expect(ruleIds).toContain("missing-role");
  });

  it("detects small touch target", () => {
    const result = scanFile("Small.tsx", SMALL_TARGET_CODE, DEFAULT_CONFIG);
    const ruleIds = result.issues.map((i) => i.ruleId);
    expect(ruleIds).toContain("small-touch-target");
  });

  it("handles malformed JS gracefully (returns empty issues)", () => {
    const result = scanFile("Bad.tsx", "this is not javascript !@#$%", DEFAULT_CONFIG);
    expect(result.issues).toHaveLength(0);
  });

  it("respects disabledRules config", () => {
    const config = { ...DEFAULT_CONFIG, disabledRules: ["missing-label", "missing-role", "touchable-without-label"] };
    const result = scanFile("Bad.tsx", BAD_CODE, config);
    const ruleIds = result.issues.map((i) => i.ruleId);
    expect(ruleIds).not.toContain("missing-label");
    expect(ruleIds).not.toContain("missing-role");
  });

  it("attaches the correct file path", () => {
    const result = scanFile("src/screens/HomeScreen.tsx", BAD_CODE, DEFAULT_CONFIG);
    expect(result.issues[0].file).toBe("src/screens/HomeScreen.tsx");
  });
});

// ─── computeScore ─────────────────────────────────────────────────────────────

describe("computeScore", () => {
  it("returns 100 overall for a file with no issues", () => {
    const report = {
      summary: { totalFiles: 1, scannedFiles: 1, totalIssues: 0, highIssues: 0, mediumIssues: 0, lowIssues: 0, durationMs: 1 },
      results: [{ filePath: "Good.tsx", issues: [] }],
      issues: [],
    };
    const score = computeScore(report);
    expect(score.overall).toBe(100);
  });

  it("returns lower score when high issues exist", () => {
    const result = scanFile("Bad.tsx", BAD_CODE, DEFAULT_CONFIG);
    const report = {
      summary: {
        totalFiles: 1, scannedFiles: 1,
        totalIssues: result.issues.length,
        highIssues: result.issues.filter(i => i.severity === "high").length,
        mediumIssues: result.issues.filter(i => i.severity === "medium").length,
        lowIssues: result.issues.filter(i => i.severity === "low").length,
        durationMs: 1,
      },
      results: [result],
      issues: result.issues,
    };
    const score = computeScore(report);
    expect(score.overall).toBeLessThan(100);
  });

  it("clamps score to 0 minimum", () => {
    const badResult = scanFile("VeryBad.tsx", BAD_CODE, DEFAULT_CONFIG);
    // Artificially inflate issues
    const manyIssues = Array(20).fill(null).flatMap(() => badResult.issues);
    const report = {
      summary: { totalFiles: 1, scannedFiles: 1, totalIssues: manyIssues.length, highIssues: 20, mediumIssues: 0, lowIssues: 0, durationMs: 1 },
      results: [{ filePath: "VeryBad.tsx", issues: manyIssues }],
      issues: manyIssues,
    };
    const score = computeScore(report);
    expect(score.overall).toBeGreaterThanOrEqual(0);
  });
});

describe("scoreFile", () => {
  it("scores 100 for a clean file", () => {
    const s = scoreFile({ filePath: "Clean.tsx", issues: [] });
    expect(s.score).toBe(100);
  });

  it("uses filename as displayName", () => {
    const s = scoreFile({ filePath: "src/screens/HomeScreen.tsx", issues: [] });
    expect(s.displayName).toBe("HomeScreen.tsx");
  });
});
